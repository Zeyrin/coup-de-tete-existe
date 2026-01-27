import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/api/withAuth';
import { createPortalSession } from '@/utils/stripe/server';

export const POST = withAuth(async ({ user, supabase, request }) => {
  // Get subscription with Stripe customer ID
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (subError || !subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'Aucun abonnement trouvé' },
      { status: 404 }
    );
  }

  // Get base URL for redirect
  const origin = request.headers.get('origin') || 'http://localhost:3000';

  // Create portal session
  const session = await createPortalSession(
    subscription.stripe_customer_id,
    `${origin}/settings`
  );

  return NextResponse.json({ url: session.url });
});
