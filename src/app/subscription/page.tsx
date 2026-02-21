'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SubscriptionCTA from '@/components/subscription/SubscriptionCTA';
import EmbeddedCheckoutForm from '@/components/subscription/EmbeddedCheckout';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

function SubscriptionContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [showCanceled, setShowCanceled] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      setShowCanceled(true);
    }

    // Check authentication status
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();
  }, [searchParams]);

  if (showCheckout) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="max-w-2xl w-full">
          <button
            onClick={() => setShowCheckout(false)}
            className="inline-block mb-6 text-gray-600 hover:text-black font-bold transition"
          >
            {t('sub.backOffers')}
          </button>

          <div className="bg-white neo-card p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t('sub.checkoutTitle')}
            </h2>
            <EmbeddedCheckoutForm onCancel={() => setShowCheckout(false)} />
          </div>
        </div>
      </div>
    );
  }

  const handleSubscribe = () => {
    if (isAuthenticated) {
      setShowCheckout(true);
    } else {
      // Redirect to login with return URL
      window.location.href = '/login?redirect=/subscription';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full">
        {/* Back button */}
        <Link
          href="/"
          className="inline-block mb-6 text-gray-600 hover:text-black font-bold transition"
        >
          {t('common.backHome')}
        </Link>

        {showCanceled && (
          <div className="bg-yellow-100 neo-card p-4 mb-6">
            <p className="font-bold text-center">
              {t('sub.canceled')}
            </p>
          </div>
        )}

        {/* Auth notice */}
        {isAuthenticated === false && (
          <div className="bg-blue-100 neo-card p-4 mb-6">
            <p className="font-bold text-center">
              {t('sub.authNotice')}
            </p>
          </div>
        )}

        <SubscriptionCTA onSubscribe={handleSubscribe} />
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}
