'use client';

import { useEffect, useState } from 'react';
import ArchetypeQuiz from '@/components/quiz/ArchetypeQuiz';
import Link from 'next/link';

export default function QuizPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.isPremium === true);
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
      setIsLoading(false);
    };

    checkPremiumStatus();
  }, []);

  // Show loading while checking premium status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🎯</div>
          <p className="text-gray-600 font-bold">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="bg-white neo-border neo-shadow p-8 max-w-3xl w-full relative">
        {/* Back button */}
        <Link
          href="/"
          className="absolute top-4 left-4 text-gray-600 hover:text-black font-bold transition"
        >
          ← Retour
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 uppercase">
            Quel voyageur es-tu ?
          </h1>
          <p className="text-gray-600">
            Réponds à 6 questions pour découvrir ton profil
          </p>
        </div>

        <ArchetypeQuiz isPremium={isPremium} />
      </div>
    </div>
  );
}
