'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { LeaderboardEntry } from '@/types/database';
import { useLanguage } from '@/i18n/LanguageContext';

// NOTE: Period types kept for future use - API supports weekly/monthly/all-time
// type Period = 'weekly' | 'monthly' | 'all-time';

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
  period: string;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// NOTE: Period labels/icons kept for future use
// const PERIOD_LABELS: Record<Period, string> = {
//   'weekly': 'Cette semaine',
//   'monthly': 'Ce mois',
//   'all-time': 'Tout temps',
// };
// const PERIOD_ICONS: Record<Period, string> = {
//   'weekly': '📅',
//   'monthly': '📆',
//   'all-time': '🏆',
// };

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/leaderboard?limit=50&period=all-time');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(t('leaderboard.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="bg-white neo-border neo-shadow p-6 md:p-8 max-w-2xl w-full relative">
        {/* Back button */}
        <Link
          href="/"
          className="absolute top-4 left-4 text-gray-600 hover:text-black font-bold transition"
        >
          {t('common.back')}
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 uppercase">
            {t('leaderboard.title')}
          </h1>
        </div>

        {/* NOTE: Period tabs code kept for future use
        <div className="flex gap-2 mb-6">
          {(['weekly', 'monthly', 'all-time'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-3 px-2 font-bold text-sm uppercase transition-all neo-border ${
                period === p
                  ? 'bg-[#4ECDC4] text-black'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="block text-lg mb-1">{PERIOD_ICONS[p]}</span>
              <span className="hidden sm:block">{PERIOD_LABELS[p]}</span>
              <span className="sm:hidden">
                {p === 'weekly' ? 'Sem.' : p === 'monthly' ? 'Mois' : 'Total'}
              </span>
            </button>
          ))}
        </div>
        */}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">🏆</div>
            <p className="text-gray-600 font-bold">{t('common.loading')}</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-gray-600 hover:text-black font-bold transition"
            >
              {t('common.retry')}
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && data && (
          <>
            {/* Stats */}
            <p className="text-center text-gray-600 mb-6">
              {data.pagination.total} {data.pagination.total === 1 ? t('leaderboard.adventurerSingular') : t('leaderboard.adventurerPlural')}
            </p>

            {/* Current user banner if not in top 10 */}
            {data.currentUser && data.currentUser.rank > 10 && (
              <div className="mb-6 p-4 bg-[#4ECDC4] neo-card">
                <p className="text-sm font-bold mb-2">{t('leaderboard.yourPosition')}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">#{data.currentUser.rank}</span>
                    <span className="font-bold">
                      {data.currentUser.display_name || data.currentUser.username}
                    </span>
                  </div>
                  <span className="font-bold">{data.currentUser.points} pts</span>
                </div>
              </div>
            )}

            {/* Leaderboard list */}
            <div className="space-y-3">
              {data.leaderboard.map((entry) => {
                const isCurrentUser = data.currentUser?.user_id === entry.user_id;
                const rankEmoji = getRankEmoji(entry.rank);
                const rankStyle = getRankStyle(entry.rank);

                return (
                  <div
                    key={`${entry.user_type}-${entry.user_id}`}
                    className={`p-4 neo-card transition-all ${rankStyle} ${
                      isCurrentUser ? 'ring-2 ring-[#4ECDC4] ring-offset-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Rank */}
                        <div className={`w-10 text-center font-bold ${entry.rank <= 3 ? 'text-2xl' : 'text-lg'}`}>
                          {rankEmoji || `#${entry.rank}`}
                        </div>

                        {/* User info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">
                              {entry.display_name || entry.username}
                            </span>
                            {entry.user_type === 'guest' && (
                              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                                {t('leaderboard.guestBadge')}
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="text-xs bg-[#4ECDC4] text-black px-2 py-0.5 rounded-full font-bold">
                                {t('leaderboard.youBadge')}
                              </span>
                            )}
                          </div>
                          <div className="text-sm opacity-75">
                            {entry.total_spins} {entry.total_spins === 1 ? t('leaderboard.spinSingular') : t('leaderboard.spinPlural')}
                          </div>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="font-bold text-xl">{entry.points}</div>
                        <div className="text-sm opacity-75">{t('common.points')}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {data.leaderboard.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">🎲</p>
                <p className="text-gray-600 font-bold">
                  {t('leaderboard.empty')}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {t('leaderboard.emptySubtitle')}
                </p>
              </div>
            )}

            {/* Load more */}
            {data.pagination.hasMore && (
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  {t('leaderboard.moreAdventurers', { count: data.pagination.total - data.leaderboard.length })}
                </p>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-8">
          <Link
            href="/"
            className="block w-full bg-[#FF4747] text-white neo-button py-4 font-bold text-lg uppercase text-center"
          >
            {t('leaderboard.cta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
