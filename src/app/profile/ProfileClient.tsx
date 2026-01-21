'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ArchetypeSelector from '@/components/archetype/ArchetypeSelector';
import { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as DBUser, Archetype, UserPreferences, ArchetypeId } from '@/types/database';
import { Mail, Calendar, Trophy, Shuffle, User as UserIcon, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ARCHETYPES } from '@/data/archetypes';

interface ProfileClientProps {
  user: SupabaseUser;
  userData: DBUser | null;
  preferences: (UserPreferences & { archetype: Archetype | null }) | null;
  archetypes: Archetype[];
}

export function ProfileClient({ user, userData, preferences, archetypes }: ProfileClientProps) {
  const router = useRouter();
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId | null>(
    preferences?.archetype_id || null
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleArchetypeChange = async (archetypeId: ArchetypeId) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archetype_id: archetypeId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      setSelectedArchetype(archetypeId);
      toast.success('Archétype mis à jour avec succès !');
      router.refresh();
    } catch (error) {
      console.error('Error updating archetype:', error);
      toast.error('Erreur lors de la mise à jour de l\'archétype');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartQuiz = () => {
    router.push('/quiz');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#80a0c3] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white neo-border neo-shadow p-8 mb-6 rounded-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#80a0c3] neo-border rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{userData?.username || 'Profil'}</h1>
              {userData?.display_name && (
                <p className="text-gray-600">{userData.display_name}</p>
              )}
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FFE951] neo-border p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">Points</span>
              </div>
              <p className="text-2xl font-bold">{userData?.points || 0}</p>
            </div>

            <div className="bg-[#98D8C8] neo-border p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shuffle className="w-5 h-5" />
                <span className="font-bold">Tours joués</span>
              </div>
              <p className="text-2xl font-bold">{userData?.total_spins || 0}</p>
            </div>

            <div className="bg-[#F7DC6F] neo-border p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5" />
                <span className="font-bold">Abonnement</span>
              </div>
              <p className="text-lg font-bold capitalize">
                {userData?.subscription_tier === 'premium' ? 'Premium ⭐' : 'Gratuit'}
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white neo-border neo-shadow p-6 mb-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Informations du compte</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">
                Membre depuis le {formatDate(userData?.created_at || user.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Archetype Section */}
        <div className="bg-white neo-border neo-shadow p-6 mb-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Ton archétype de voyageur</h2>
            <Button
              onClick={handleStartQuiz}
              className="neo-button bg-[#FFE951] font-bold text-black"
            >
              {preferences?.quiz_completed ? 'Refaire le quiz' : 'Commencer le quiz'}
            </Button>
          </div>

          {preferences?.archetype && (
            <div
              className="mb-6 p-4 neo-border rounded-lg"
              style={{ backgroundColor: ARCHETYPES[preferences.archetype.id]?.color || '#F3F4F6' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{preferences.archetype.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-black">{preferences.archetype.name_fr}</h3>
                  <p className="text-sm text-gray-800">
                    {preferences.quiz_completed ? 'Résultat du quiz' : 'Sélection manuelle'}
                  </p>
                </div>
              </div>
              <p className="text-gray-900 mt-2">{preferences.archetype.description_fr}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold mb-3">Choisir un archétype manuellement</h3>
            <ArchetypeSelector
              selectedArchetype={selectedArchetype}
              onSelect={handleArchetypeChange}
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Subscription Upgrade */}
        {userData?.subscription_tier !== 'premium' && (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 neo-border neo-shadow p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">Passe à Premium ! ⭐</h2>
            <p className="text-gray-700 mb-4">
              Débloque des destinations exclusives, plus de points et bien plus encore !
            </p>
            <Button
              onClick={() => router.push('/subscription')}
              className="neo-button bg-[#FFE951] hover:bg-[#ffd91a] font-bold text-black"
            >
              Découvrir Premium
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
