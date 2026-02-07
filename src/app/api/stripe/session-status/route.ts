import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // If payment is confirmed, provision the subscription as a backup to the webhook
    if (session.status === 'complete' && session.payment_status === 'paid') {
      const userId = session.metadata?.user_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId && subscriptionId) {
        // Check if already provisioned
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('subscription_tier')
          .eq('user_id', userId)
          .single();

        if (existingUser && existingUser.subscription_tier !== 'premium') {
          console.log(`Session-status: provisioning subscription for user ${userId}`);

          // Get subscription details from Stripe
          const subResponse = await stripe.subscriptions.retrieve(subscriptionId);
          const subData = subResponse as unknown as Record<string, unknown>;

          // Extract timestamps - handle both number and object formats
          const periodStart = subData.current_period_start;
          const periodEnd = subData.current_period_end;
          const startDate = typeof periodStart === 'number'
            ? new Date(periodStart * 1000).toISOString()
            : new Date().toISOString();
          const endDate = typeof periodEnd === 'number'
            ? new Date(periodEnd * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          const items = subData.items as { data: Array<{ price: { id: string } }> } | undefined;
          const priceId = items?.data?.[0]?.price?.id || null;

          // Upsert subscription record
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId,
              status: 'active',
              current_period_start: startDate,
              current_period_end: endDate,
              cancel_at_period_end: subData.cancel_at_period_end === true,
            }, {
              onConflict: 'user_id'
            });

          // Update user to premium
          await supabaseAdmin
            .from('users')
            .update({ subscription_tier: 'premium' })
            .eq('user_id', userId);

          console.log(`Session-status: user ${userId} upgraded to premium`);
        }
      }
    }

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email || null,
    });
  } catch (error) {
    console.error('Session status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session status' },
      { status: 500 }
    );
  }
}
