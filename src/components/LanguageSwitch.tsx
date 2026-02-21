'use client';

import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/i18n/LanguageContext';

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLang('fr')}
        className={`text-2xl leading-none transition-all duration-200 ${lang === 'fr' ? 'scale-125 drop-shadow-lg' : 'opacity-40 scale-100'}`}
      >
        🇫🇷
      </button>

      <Switch
        checked={lang === 'en'}
        onCheckedChange={(checked) => setLang(checked ? 'en' : 'fr')}
      />

      <button
        onClick={() => setLang('en')}
        className={`text-2xl leading-none transition-all duration-200 ${lang === 'en' ? 'scale-125 drop-shadow-lg' : 'opacity-40 scale-100'}`}
      >
        🇬🇧
      </button>
    </div>
  );
}
