import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, stripe } from '@/utils/stripe/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role client for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Type for Stripe subscription with all fields we need
interface StripeSubscriptionData {
  id: string;
  status: Stripe.Subscription.Status;
  customer: string;
  items: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  metadata?: {
    user_id?: string;
  };
}

// Type for Stripe invoice with all fields we need
interface StripeInvoiceData {
  customer: string;
  subscription: string | null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Get the type of webhook event sent
  const eventType = event.type;
  const data = event.data;
  const dataObject = data.object;

  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        // Payment is successful and the subscription is created.
        // You should provision the subscription and save the customer ID to your database.
        const session = dataObject as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'invoice.paid': {
        // Continue to provision the subscription as payments continue to be made.
        // Store the status in your database and check when a user accesses your service.
        const invoice = dataObject as unknown as StripeInvoiceData;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        // The payment failed or the customer doesn't have a valid payment method.
        // The subscription becomes past_due. Notify your customer and send them to the
        // customer portal to update their payment information.
        const invoice = dataObject as unknown as StripeInvoiceData;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = dataObject as unknown as StripeSubscriptionData;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = dataObject as unknown as StripeSubscriptionData;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 * Payment is successful and the subscription is created.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error('No user_id in checkout session metadata');
    return;
  }

  console.log(`Checkout completed for user ${userId}`);

  // Get subscription details from Stripe
  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
  const subscription = subscriptionResponse as unknown as StripeSubscriptionData;

  // Upsert subscription record in database
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: subscription.items.data[0]?.price.id,
      status: 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error upserting subscription:', error);
    throw error;
  }

  // Update user subscription tier to premium
  const { error: userError } = await supabaseAdmin
    .from('users')
    .update({ subscription_tier: 'premium' })
    .eq('user_id', userId);

  if (userError) {
    console.error('Error updating user tier:', userError);
    throw userError;
  }

  console.log(`User ${userId} upgraded to premium`);
}

/**
 * Handle invoice.paid event
 * Continue to provision the subscription as payments continue to be made.
 */
async function handleInvoicePaid(invoice: StripeInvoiceData) {
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    // One-time payment, not a subscription
    return;
  }

  console.log(`Invoice paid for subscription ${subscriptionId}`);

  // Find user by customer ID
  const { data: subscriptionData } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!subscriptionData?.user_id) {
    console.error('Could not find user for invoice.paid event');
    return;
  }

  // Get updated subscription details from Stripe
  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
  const subscription = subscriptionResponse as unknown as StripeSubscriptionData;

  // Update subscription record with new period dates
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('user_id', subscriptionData.user_id);

  // Ensure user has premium tier
  await supabaseAdmin
    .from('users')
    .update({ subscription_tier: 'premium' })
    .eq('user_id', subscriptionData.user_id);

  console.log(`Subscription renewed for user ${subscriptionData.user_id}`);
}

/**
 * Handle invoice.payment_failed event
 * The payment failed or the customer doesn't have a valid payment method.
 */
async function handleInvoicePaymentFailed(invoice: StripeInvoiceData) {
  const customerId = invoice.customer;

  console.log(`Payment failed for customer ${customerId}`);

  // Find user by customer ID
  const { data: subscriptionData } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!subscriptionData?.user_id) {
    console.error('Could not find user for invoice.payment_failed event');
    return;
  }

  // Update subscription status to past_due
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('user_id', subscriptionData.user_id);

  console.log(`Payment failed for user ${subscriptionData.user_id}, marked as past_due`);

  // TODO: Send notification to customer to update payment method
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: StripeSubscriptionData) {
  const userId = subscription.metadata?.user_id;
  const customerId = subscription.customer;

  // Try to find user by metadata or customer ID
  let targetUserId = userId;

  if (!targetUserId) {
    const { data } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!data?.user_id) {
      console.error('Could not find user for subscription update');
      return;
    }
    targetUserId = data.user_id;
  }

  console.log(`Subscription updated for user ${targetUserId}`);

  const status = mapSubscriptionStatus(subscription.status);

  // Update subscription record
  await supabaseAdmin
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id,
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('user_id', targetUserId);

  // Update user tier based on subscription status
  const tier = status === 'active' || status === 'trialing' ? 'premium' : 'free';
  await supabaseAdmin
    .from('users')
    .update({ subscription_tier: tier })
    .eq('user_id', targetUserId);

  console.log(`User ${targetUserId} subscription status: ${status}, tier: ${tier}`);
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: StripeSubscriptionData) {
  console.log(`Subscription ${subscription.id} deleted`);

  // Find user by subscription ID
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!data?.user_id) {
    console.error('Could not find user for deleted subscription');
    return;
  }

  // Update subscription status to canceled
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('user_id', data.user_id);

  // Downgrade user to free tier
  await supabaseAdmin
    .from('users')
    .update({ subscription_tier: 'free' })
    .eq('user_id', data.user_id);

  console.log(`User ${data.user_id} subscription canceled, downgraded to free`);
}

/**
 * Map Stripe subscription status to our database status
 */
function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'canceled':
      return 'canceled';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'trialing':
      return 'trialing';
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
    default:
      return 'inactive';
  }
}
