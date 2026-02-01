'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArchetypeQuiz from '@/components/quiz/ArchetypeQuiz';
import Link from 'next/link';

export default function QuizPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          if (data.isPremium === true) {
            setIsPremium(true);
          } else {
            // Redirect non-premium users to premium page
            router.push('/subscription');
            return;
          }
        } else {
          // Not authenticated or error - redirect to premium
          router.push('/subscription');
          return;
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
        router.push('/subscription');
        return;
      }
      setIsLoading(false);
    };

    checkPremiumStatus();
  }, [router]);

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

  // Only render quiz for premium users
  if (!isPremium) {
    return null;
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
