'use client';

import { useState } from 'react';
import type { ArchetypeId } from '@/types/database';
import { ARCHETYPES } from '@/data/archetypes';
import ArchetypeCard from './ArchetypeCard';

interface ArchetypeSelectorProps {
  selectedArchetype?: ArchetypeId | null;
  onSelect: (archetypeId: ArchetypeId) => void;
  disabled?: boolean;
}

const ARCHETYPE_IDS: ArchetypeId[] = [
  'royal_elegance',
  'culture_seeker',
  'nature_adventurer',
  'gastronome',
  'beach_relaxer',
];

export default function ArchetypeSelector({
  selectedArchetype,
  onSelect,
  disabled = false,
}: ArchetypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {ARCHETYPE_IDS.map((id) => (
        <ArchetypeCard
          key={id}
          archetypeId={id}
          selected={selectedArchetype === id}
          onClick={disabled ? undefined : () => onSelect(id)}
          size="md"
        />
      ))}
    </div>
  );
}
