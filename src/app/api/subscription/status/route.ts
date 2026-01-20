import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        isAuthenticated: false,
        isPremium: false,
        subscription: null,
      });
    }

    // Get user subscription tier
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
    }

    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError);
    }

    const isPremium =
      userData?.subscription_tier === 'premium' ||
      (subscription?.status === 'active' &&
        (!subscription.current_period_end ||
          new Date(subscription.current_period_end) > new Date()));

    return NextResponse.json({
      isAuthenticated: true,
      isPremium,
      tier: userData?.subscription_tier || 'free',
      subscription: subscription
        ? {
            status: subscription.status,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end,
          }
        : null,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'abonnement' },
      { status: 500 }
    );
  }
}
