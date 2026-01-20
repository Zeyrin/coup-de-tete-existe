'use client';

import { useCallback, useState } from 'react';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { getStripePromise } from '@/utils/stripe/client';

interface EmbeddedCheckoutFormProps {
  onCancel?: () => void;
}

export default function EmbeddedCheckoutForm({ onCancel }: EmbeddedCheckoutFormProps) {
  const [error, setError] = useState<string | null>(null);
  const stripePromise = getStripePromise();

  const fetchClientSecret = useCallback(async () => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embedded: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data.clientSecret;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  }, []);

  if (!stripePromise) {
    return (
      <div className="bg-red-100 neo-card p-4 text-center">
        <p className="font-bold text-red-600">
          Configuration Stripe manquante
        </p>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('autorisé') || error.includes('connecter');

    return (
      <div className="bg-red-100 neo-card p-4 text-center">
        <p className="font-bold text-red-600 mb-4">{error}</p>
        {isAuthError ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Tu dois te connecter pour devenir Premium.
            </p>
            <a
              href="/login?redirect=/subscription"
              className="inline-block bg-[#4ECDC4] text-black neo-button px-6 py-3 font-bold"
            >
              Se connecter
            </a>
          </div>
        ) : (
          onCancel && (
            <button
              onClick={onCancel}
              className="bg-gray-200 text-black neo-button px-4 py-2 font-bold"
            >
              Retour
            </button>
          )
        )}
      </div>
    );
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
