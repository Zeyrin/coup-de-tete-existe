import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/api/withAuth';
import {
  createCheckoutSession,
  createEmbeddedCheckoutSession,
  getOrCreateStripeCustomer,
  PREMIUM_PRICE_ID,
} from '@/utils/stripe/server';

export const POST = withAuth(async ({ user, supabase, request }) => {
  try {
    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is missing');
      return NextResponse.json(
        { error: 'Configuration Stripe manquante (clé secrète)' },
        { status: 500 }
      );
    }

    if (!PREMIUM_PRICE_ID) {
      console.error('STRIPE_PREMIUM_PRICE_ID is missing');
      return NextResponse.json(
        { error: 'Configuration Stripe manquante (price ID)' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const isEmbedded = body.embedded === true;

    // Get user data including existing stripe customer id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (userError || !userData) {
      console.error('User fetch error:', userError);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Check if already premium
    if (userData.subscription_tier === 'premium') {
      return NextResponse.json(
        { error: 'Vous êtes déjà abonné Premium' },
        { status: 400 }
      );
    }

    // Check for existing subscription record
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      userData.email,
      user.id,
      existingSub?.stripe_customer_id
    );

    // Save customer ID if new
    if (!existingSub) {
      const { error: insertError } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        stripe_customer_id: customerId,
        status: 'inactive',
      });
      if (insertError) {
        console.error('Subscription insert error:', insertError);
      }
    }

    // Get base URL for redirects
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    if (isEmbedded) {
      // Create embedded checkout session
      const session = await createEmbeddedCheckoutSession(
        customerId,
        user.id,
        `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`
      );

      return NextResponse.json({ clientSecret: session.client_secret });
    }

    // Create hosted checkout session (redirect)
    const session = await createCheckoutSession(
      customerId,
      user.id,
      `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${origin}/subscription?canceled=true`
    );

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
});
