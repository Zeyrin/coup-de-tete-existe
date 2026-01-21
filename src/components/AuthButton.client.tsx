'use client'

import { signout } from '@/app/actions/auth'
import { clearLocalGuestUser, getLocalGuestUser } from '@/utils/guestUser'
import { LogIn, LogOut, UserCircle, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface AuthButtonClientProps {
  serverUser: User | null
  initialUsername: string | null
}

export function AuthButtonClient({ serverUser, initialUsername }: AuthButtonClientProps) {
  const [guestUser, setGuestUser] = useState<ReturnType<typeof getLocalGuestUser>>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setGuestUser(getLocalGuestUser())
  }, [])

  async function handleLogout() {
    if (serverUser) {
      await signout()
    } else if (guestUser) {
      clearLocalGuestUser()
      setGuestUser(null)
      router.push('/guest')
      router.refresh()
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-24 h-10 bg-white/50 rounded-lg animate-pulse neo-border" />
      </div>
    )
  }

  // If logged in with real account
  if (serverUser) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white neo-button font-bold"
        >
          <UserCircle className="w-5 h-5" />
          <span className="truncate max-w-[150px]">
            {initialUsername || serverUser.email}
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="neo-button px-6 py-3 bg-[#FF6B6B] font-bold flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    )
  }

  // If guest user
  if (guestUser) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-6 py-3 bg-[#FFE951] neo-button font-bold">
          <UserCircle className="w-5 h-5" />
          <span className="truncate max-w-[150px]">
            {guestUser.username}
          </span>
          <span className="text-xs bg-black text-white px-2 py-0.5 rounded">
            INVITÉ
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="neo-button px-6 py-3 bg-[#FF6B6B] font-bold flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Quitter</span>
        </button>
      </div>
    )
  }

  // Not logged in
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/guest"
        className="neo-button px-4 py-2.5 bg-[#F7DC6F] font-bold flex items-center gap-2"
      >
        <UserCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Invité</span>
      </Link>
      <Link
        href="/login"
        className="neo-button px-4 py-2.5 bg-[#98D8C8] font-bold flex items-center gap-2"
      >
        <LogIn className="w-5 h-5" />
        <span className="hidden sm:inline">Connexion</span>
      </Link>
      <Link
        href="/signup"
        className="neo-button px-4 py-2.5 bg-[#FFE951] font-bold flex items-center gap-2"
      >
        <UserPlus className="w-5 h-5" />
        <span className="hidden sm:inline">Inscription</span>
      </Link>
    </div>
  )
}
