'use client'

import { createGuestUser } from '@/app/actions/guest'
import { Button } from '@/components/ui/button'
import { setLocalGuestUser, getDeviceFingerprint } from '@/utils/guestUser'
import { UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function GuestPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!username.trim()) {
      toast.error('Le pseudo est requis')
      return
    }

    if (username.length < 3) {
      toast.error('Le pseudo doit contenir au moins 3 caractères')
      return
    }

    if (username.length > 30) {
      toast.error('Le pseudo ne peut pas dépasser 30 caractères')
      return
    }

    setLoading(true)

    // Get device fingerprint for tracking
    const fingerprint = getDeviceFingerprint()

    // Create guest user in database
    const result = await createGuestUser(username.trim(), fingerprint)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    if (result.data) {
      // Store guest user ID and username in localStorage
      setLocalGuestUser(result.data.user_id, result.data.username)
      toast.success(`Bienvenue ${username} !`)
      router.push('/')
      router.refresh()
    } else {
      toast.error('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#80a0c3]">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 neo-border neo-shadow">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <UserCircle className="w-16 h-16" />
          </div>
          <h2 className="text-3xl font-bold">Mode Invité</h2>
          <p className="text-sm text-gray-600">
            Entre un pseudo pour commencer l&apos;aventure sans créer de compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-bold">
              Ton pseudo
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              className="block w-full rounded-lg neo-border px-4 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE951]"
              placeholder="SuperVoyageur"
            />
            <p className="text-xs text-gray-500">3-30 caractères</p>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full neo-button bg-[#FFE951] hover:bg-[#ffd91a] font-bold py-6 text-lg text-black"
            >
              {loading ? 'Chargement...' : "C'est parti ! 🚀"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 font-bold">OU</span>
              </div>
            </div>

            <Link
              href="/signup"
              className="block w-full neo-button px-4 py-3 bg-[#98D8C8] hover:bg-[#7ec9b8] font-bold text-center"
            >
              Créer un compte complet
            </Link>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Déjà un compte ? </span>
            <Link href="/login" className="font-bold underline">
              Connecte-toi
            </Link>
          </div>

          <div className="neo-card bg-[#FFE951] p-4 space-y-2">
            <p className="text-xs font-bold">ℹ️ Mode invité :</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Tes données restent sur cet appareil uniquement</li>
              <li>Tu peux créer un compte plus tard</li>
              <li>Parfait pour essayer l&apos;app !</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  )
}
