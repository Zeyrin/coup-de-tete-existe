'use client';

import { useState } from 'react';

interface SubscriptionCTAProps {
  currentArchetype?: string;
  onSubscribe?: () => void;
}

export default function SubscriptionCTA({ currentArchetype, onSubscribe }: SubscriptionCTAProps) {
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
      alert('Erreur lors de la création de la session de paiement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white neo-card p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Passe Premium 👑</h2>
        <p className="text-gray-600">
          Des destinations personnalisées selon ton profil voyageur
        </p>
      </div>

      {/* Comparison */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* Free */}
        <div className="neo-card p-4 bg-gray-50">
          <h3 className="font-bold text-lg mb-4">Gratuit</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Roulette aléatoire
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Filtres temps & budget
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Quiz de personnalité
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <span>✗</span>
              Destinations personnalisées
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <span>✗</span>
              Changer d'archétype
            </li>
          </ul>
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold">0€</span>
            <span className="text-gray-500">/mois</span>
          </div>
        </div>

        {/* Premium */}
        <div className="neo-card p-4 bg-[#FFD700]/20 border-[#FFD700]">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-lg">Premium</h3>
            <span className="bg-[#FFD700] text-xs px-2 py-1 rounded font-bold">
              RECOMMANDÉ
            </span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Tout le gratuit
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <strong>Destinations personnalisées</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Basées sur ton archétype
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Changer d'archétype à volonté
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Support prioritaire
            </li>
          </ul>
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold">4,99€</span>
            <span className="text-gray-500">/mois</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="w-full bg-[#FFD700] text-black neo-button py-4 font-bold text-xl uppercase disabled:opacity-50"
      >
        {isLoading ? 'Chargement...' : '👑 Devenir Premium'}
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        Annulation à tout moment. Paiement sécurisé par Stripe.
      </p>
    </div>
  );
}
