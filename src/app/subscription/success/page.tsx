'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PremiumBadge from '@/components/subscription/PremiumBadge';
import confetti from 'canvas-confetti';
import { useLanguage } from '@/i18n/LanguageContext';

function SuccessContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('success');
      triggerConfetti();
      return;
    }

    fetch(`/api/stripe/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'complete' && data.payment_status === 'paid') {
          setStatus('success');
          triggerConfetti();
        } else if (data.status === 'open') {
          setErrorMessage(t('success.paymentPending'));
          setStatus('error');
        } else {
          setStatus('success');
          triggerConfetti();
        }
      })
      .catch((err) => {
        console.error('Error checking session status:', err);
        setStatus('success');
        triggerConfetti();
      });
  }, [searchParams, t]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#4ECDC4'],
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="bg-white neo-border neo-shadow p-8 max-w-lg w-full text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <h1 className="text-2xl font-bold">{t('success.verifying')}</h1>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="bg-white neo-border neo-shadow p-8 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Problème de paiement</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Link
            href="/subscription"
            className="block w-full bg-[#FFD700] text-black neo-button py-4 font-bold uppercase"
          >
            Réessayer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="bg-white neo-border neo-shadow p-8 max-w-lg w-full text-center">
        <div className="text-6xl mb-4">🎉</div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 uppercase">
          Tu es maintenant Premium !
        </h1>

        <div className="flex justify-center mb-6">
          <PremiumBadge size="lg" />
        </div>

        <p className="text-gray-600 mb-8">
          Merci pour le soutien ! Tu as maintenant accès aux destinations personnalisées selon ton profil voyageur.
        </p>

        <div className="space-y-4">
          <Link
            href="/quiz"
            className="block w-full bg-[#4ECDC4] text-black neo-button py-4 font-bold uppercase"
          >
            Découvrir mon profil voyageur
          </Link>

          <Link
            href="/"
            className="block w-full bg-[#FFD700] text-black neo-button py-4 font-bold uppercase"
          >
            Lancer une roulette personnalisée
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
