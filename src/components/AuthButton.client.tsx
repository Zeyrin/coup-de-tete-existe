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
}

export function AuthButtonClient({ serverUser }: AuthButtonClientProps) {
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
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white neo-border rounded-lg">
          <span className="text-sm font-bold truncate max-w-[150px]">
            {serverUser.email}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="neo-button px-4 py-2 bg-[#FF6B6B] hover:bg-[#ff5252] font-bold flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    )
  }

  // If guest user
  if (guestUser) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#FFE951] neo-border rounded-lg">
          <UserCircle className="w-4 h-4" />
          <span className="text-sm font-bold truncate max-w-[150px]">
            {guestUser.username}
          </span>
          <span className="text-xs bg-black text-white px-2 py-0.5 rounded">
            INVITÉ
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="neo-button px-4 py-2 bg-[#FF6B6B] hover:bg-[#ff5252] font-bold flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
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
        className="neo-button px-3 py-2 bg-[#F7DC6F] hover:bg-[#f5d04e] font-bold flex items-center gap-2"
      >
        <UserCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Invité</span>
      </Link>
      <Link
        href="/login"
        className="neo-button px-3 py-2 bg-[#98D8C8] hover:bg-[#7ec9b8] font-bold flex items-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">Connexion</span>
      </Link>
      <Link
        href="/signup"
        className="neo-button px-3 py-2 bg-[#FFE951] hover:bg-[#ffd91a] font-bold flex items-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">Inscription</span>
      </Link>
    </div>
  )
}
