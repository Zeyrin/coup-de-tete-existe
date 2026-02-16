'use client';

import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

interface SubscriptionCTAProps {
  onSubscribe?: () => void;
}

export default function SubscriptionCTA({ onSubscribe }: SubscriptionCTAProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    // If onSubscribe callback provided, use embedded checkout
    if (onSubscribe) {
      onSubscribe();
      return;
    }

    // Otherwise, redirect to hosted checkout page
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embedded: false }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(t('sub.checkoutError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white neo-card p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{t('sub.title')}</h2>
        <p className="text-gray-600">
          {t('sub.subtitle')}
        </p>
      </div>

      {/* Comparison */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* Free */}
        <div className="neo-card p-4 bg-gray-50">
          <h3 className="font-bold text-lg mb-4">{t('sub.free')}</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {t('sub.freeFeature1')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {t('sub.freeFeature2')}
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <span>✗</span>
              {t('sub.freeFeature3')}
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <span>✗</span>
              {t('sub.freeFeature4')}
            </li>
          </ul>
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold">0€</span>
            <span className="text-gray-500">{t('common.month')}</span>
          </div>
        </div>

        {/* Premium */}
        <div className="neo-card p-4 bg-[#FFD700]/20 border-[#FFD700]">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-lg">{t('sub.premium')}</h3>
            <span className="bg-[#FFD700] text-xs px-2 py-1 rounded font-bold">
              {t('sub.supportBadge')}
            </span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {t('sub.premFeature1')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <strong>{t('sub.premFeature2')}</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {t('sub.premFeature3')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {t('sub.premFeature4')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {t('sub.premFeature5')}
            </li>
          </ul>
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold">2,99€</span>
            <span className="text-gray-500">{t('common.month')}</span>
          </div>
        </div>
      </div>

      {/* Coming soon features */}
      <div className="bg-[#9B59B6]/10 neo-card p-4 mb-6">
        <p className="text-center font-bold text-sm mb-2">{t('sub.comingSoon')}</p>
        <p className="text-center text-xs text-gray-600">
          {t('sub.comingSoonDesc')}
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="w-full bg-[#FFD700] text-black neo-button py-4 font-bold text-xl uppercase disabled:opacity-50"
      >
        {isLoading ? t('common.loading') : t('sub.cta')}
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        {t('sub.footer')}
      </p>
    </div>
  );
}
