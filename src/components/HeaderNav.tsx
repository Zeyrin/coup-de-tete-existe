'use client';

import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import LanguageSwitch from './LanguageSwitch';

export default function HeaderNav() {
  const { t } = useLanguage();

  return (
    <>
      <LanguageSwitch />
      <Link
        href="/leaderboard"
        className="neo-button px-2 sm:px-3 py-1.5 sm:py-2 bg-[#FFE951] font-bold flex items-center gap-1 text-sm"
      >
        <Trophy className="w-4 h-4" />
        <span className="hidden sm:inline">{t('header.leaderboard')}</span>
      </Link>
    </>
  );
}
