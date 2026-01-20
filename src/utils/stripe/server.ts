import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Price ID for premium subscription (set in Stripe Dashboard)
export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || '';

// Helper to create or retrieve a Stripe customer
export async function getOrCreateStripeCustomer(
  email: string,
  userId: string,
  existingCustomerId?: string
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      user_id: userId,
    },
  });

  return customer.id;
}

// Create a checkout session for subscription (hosted redirect)
export async function createCheckoutSession(
  customerId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PREMIUM_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
    },
    subscription_data: {
      metadata: {
        user_id: userId,
      },
    },
  });

  return session;
}

// Create an embedded checkout session for subscription
export async function createEmbeddedCheckoutSession(
  customerId: string,
  userId: string,
  returnUrl: string
): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: PREMIUM_PRICE_ID,
        quantity: 1,
      },
    ],
    return_url: returnUrl,
    metadata: {
      user_id: userId,
    },
    subscription_data: {
      metadata: {
        user_id: userId,
      },
    },
  });

  return session;
}

// Retrieve checkout session status
export async function getCheckoutSessionStatus(
  sessionId: string
): Promise<{ status: string; paymentStatus: string; customerEmail: string | null }> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    status: session.status || 'unknown',
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email || null,
  };
}

// Create a customer portal session
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Verify webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
