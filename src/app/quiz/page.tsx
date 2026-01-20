'use client';

import ArchetypeQuiz from '@/components/quiz/ArchetypeQuiz';
import Link from 'next/link';

export default function QuizPage() {
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

        <ArchetypeQuiz />
      </div>
    </div>
  );
}
