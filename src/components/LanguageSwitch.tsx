'use client';

import { useLanguage } from '@/i18n/LanguageContext';

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex neo-border overflow-hidden">
      <button
        onClick={() => setLang('fr')}
        className={`px-2 py-1.5 font-bold text-sm uppercase transition-all duration-200 ${
          lang === 'fr'
            ? 'bg-[#52688E] text-white'
            : 'bg-white text-black opacity-60 hover:opacity-80'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-1.5 font-bold text-sm uppercase transition-all duration-200 border-l-2 border-black ${
          lang === 'en'
            ? 'bg-[#52688E] text-white'
            : 'bg-white text-black opacity-60 hover:opacity-80'
        }`}
      >
        EN
      </button>
    </div>
  );
}
