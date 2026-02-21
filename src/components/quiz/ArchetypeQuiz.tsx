'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUIZ_QUESTIONS } from '@/data/archetypes';
import type { QuizResult } from '@/types/database';
import ArchetypeCard from '@/components/archetype/ArchetypeCard';
import { useLanguage } from '@/i18n/LanguageContext';

interface ArchetypeQuizProps {
  onComplete?: (result: QuizResult) => void;
  isPremium?: boolean;
  isGuest?: boolean;
}

export default function ArchetypeQuiz({ onComplete, isPremium = false, isGuest = false }: ArchetypeQuizProps) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleAnswer = (optionId: string) => {
    const newAnswers = { ...answers, [question.id]: optionId };
    setAnswers(newAnswers);

    // Auto-advance to next question after short delay
    setTimeout(() => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        submitQuiz(newAnswers);
      }
    }, 300);
  };

  const submitQuiz = async (finalAnswers: Record<string, string>) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/archetypes/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const data = await response.json();

      const quizResult: QuizResult = {
        archetype_id: data.archetype_id,
        archetype: data.archetype,
        confidence: data.confidence,
        scores: data.scores,
      };

      setResult(quizResult);
      onComplete?.(quizResult);
    } catch (error) {
      console.error('Quiz submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Show result screen
  if (result) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2">{t('quiz.resultTitle')}</h2>
        <p className="text-gray-600 mb-8">
          {t('quiz.resultSubtitle')}
        </p>

        <div className="flex justify-center mb-8">
          <div className="transform scale-125">
            <ArchetypeCard
              archetypeId={result.archetype_id}
              selected
              size="lg"
            />
          </div>
        </div>

        <div className="bg-gray-100 neo-card p-4 mb-8">
          <p className="text-sm text-gray-600">
            {t('quiz.confidence')} <span className="font-bold">{result.confidence}%</span>
          </p>
        </div>

        <div className="space-y-4">
          {isGuest && (
            <div className="bg-[#FFE951] neo-card p-4 text-left">
              <p className="font-bold text-sm mb-1">{t('quiz.guestSaveTitle')}</p>
              <p className="text-xs text-gray-700 mb-3">{t('quiz.guestSaveDesc')}</p>
              <button
                onClick={() => router.push('/signup')}
                className="w-full bg-[#4ECDC4] text-black neo-button py-3 font-bold uppercase"
              >
                {t('quiz.guestCTA')}
              </button>
            </div>
          )}

          {!isPremium && !isGuest && (
            <button
              onClick={() => router.push('/subscription')}
              className="w-full bg-[#FFD700] text-black neo-button py-4 font-bold text-lg uppercase"
            >
              {t('quiz.premiumCTA')}
            </button>
          )}

          <button
            onClick={() => router.push('/')}
            className={`w-full neo-button py-4 font-bold uppercase ${
              isPremium
                ? 'bg-[#4ECDC4] text-black text-lg'
                : 'bg-white text-black'
            }`}
          >
            {isPremium ? t('quiz.launchWheel') : t('quiz.backHome')}
          </button>
        </div>
      </div>
    );
  }

  // Show quiz
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>{t('quiz.question')} {currentQuestion + 1}/{QUIZ_QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-200 neo-card overflow-hidden">
          <div
            className="h-full bg-[#4ECDC4] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
        {lang === 'en' ? question.question_en : question.question_fr}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = answers[question.id] === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              disabled={isSubmitting}
              className={`
                w-full text-left p-4 neo-card font-bold transition-all duration-200
                ${isSelected
                  ? 'bg-[#4ECDC4] scale-105'
                  : 'bg-white hover:bg-gray-50 hover:scale-102'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {lang === 'en' ? option.label_en : option.label_fr}
            </button>
          );
        })}
      </div>

      {/* Back button */}
      {currentQuestion > 0 && (
        <button
          onClick={goBack}
          disabled={isSubmitting}
          className="mt-6 text-gray-600 font-bold hover:text-black transition"
        >
          {t('quiz.prevQuestion')}
        </button>
      )}

      {isSubmitting && (
        <div className="mt-8 text-center">
          <p className="font-bold animate-pulse">{t('quiz.analyzing')}</p>
        </div>
      )}
    </div>
  );
}
