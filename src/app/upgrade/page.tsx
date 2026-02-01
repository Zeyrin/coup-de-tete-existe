'use client';

import Link from 'next/link';
import { UserPlus, Trophy, History, Shield, Sparkles } from 'lucide-react';

export default function UpgradePage() {
  const benefits = [
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Sauvegarde tes points',
      description: 'Tes points sont sauvegardés définitivement et accessibles depuis n\'importe quel appareil',
    },
    {
      icon: <History className="w-6 h-6" />,
      title: 'Historique complet',
      description: 'Retrouve toutes tes destinations passées et tes statistiques de voyage',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Données sécurisées',
      description: 'Tes données sont protégées et ne seront jamais perdues',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Accès Premium',
      description: 'Possibilité de passer Premium pour des destinations personnalisées selon ton profil',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="bg-white neo-border neo-shadow p-6 md:p-8 max-w-lg w-full relative">
        {/* Back button */}
        <Link
          href="/"
          className="absolute top-4 left-4 text-gray-600 hover:text-black font-bold transition"
        >
          ← Retour
        </Link>

        <div className="text-center mb-8 pt-4">
          <div className="w-16 h-16 bg-[#4ECDC4] rounded-full flex items-center justify-center mx-auto mb-4 neo-border">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase">
            Crée ton compte
          </h1>
          <p className="text-gray-600">
            En tant qu&apos;invité, tu n&apos;as pas accès à ton profil.
            <br />
            Crée un compte gratuit pour débloquer toutes les fonctionnalités !
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-gray-50 neo-card"
            >
              <div className="text-[#4ECDC4] flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <h3 className="font-bold">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Current guest status */}
        <div className="bg-[#FFE951] neo-card p-4 mb-6">
          <p className="text-sm text-center">
            <span className="font-bold">Mode invité actuel :</span> Tes données restent uniquement sur cet appareil et peuvent être perdues.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            href="/signup"
            className="block w-full bg-[#4ECDC4] text-black neo-button py-4 font-bold text-lg uppercase text-center"
          >
            Créer mon compte gratuit
          </Link>

          <Link
            href="/login"
            className="block w-full bg-white text-black neo-button py-3 font-bold uppercase text-center"
          >
            J&apos;ai déjà un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
