'use client';

import type { Archetype, ArchetypeId } from '@/types/database';
import { ARCHETYPES } from '@/data/archetypes';
import { useLanguage } from '@/i18n/LanguageContext';

interface ArchetypeCardProps {
  archetypeId: ArchetypeId;
  archetype?: Archetype;
  selected?: boolean;
  onClick?: () => void;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ArchetypeCard({
  archetypeId,
  archetype,
  selected = false,
  onClick,
  showDescription = true,
  size = 'md',
}: ArchetypeCardProps) {
  const { lang } = useLanguage();
  const data = archetype || ARCHETYPES[archetypeId];

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div
      onClick={onClick}
      className={`
        neo-card ${sizeClasses[size]} transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${selected ? 'ring-4 ring-black scale-105' : ''}
      `}
      style={{
        backgroundColor: selected ? data.color : 'white',
        borderColor: data.color,
      }}
    >
      <div className="text-center">
        <span className={iconSizes[size]}>{data.icon}</span>
        <h3
          className={`font-bold mt-2 ${titleSizes[size]} ${selected ? 'text-white' : ''}`}
        >
          {lang === 'en' ? data.name_en : data.name_fr}
        </h3>
        {showDescription && (
          <p
            className={`text-sm mt-1 ${selected ? 'text-white/90' : 'text-gray-600'}`}
          >
            {lang === 'en' ? data.description_en : data.description_fr}
          </p>
        )}
      </div>
    </div>
  );
}
