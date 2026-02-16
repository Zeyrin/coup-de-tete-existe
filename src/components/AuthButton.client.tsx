'use client'

import { signout } from '@/app/actions/auth'
import { clearLocalGuestUser, getLocalGuestUser } from '@/utils/guestUser'
import { LogIn, LogOut, UserCircle, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useLanguage } from '@/i18n/LanguageContext'

interface AuthButtonClientProps {
  serverUser: User | null
  initialUsername: string | null
}

export function AuthButtonClient({ serverUser, initialUsername }: AuthButtonClientProps) {
  const { t } = useLanguage()
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
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/profile"
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-white neo-button font-bold text-sm"
        >
          <UserCircle className="w-4 h-4" />
          <span className="hidden sm:inline truncate max-w-[100px]">
            {initialUsername || serverUser.email}
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="neo-button px-2 sm:px-3 py-1.5 sm:py-2 bg-[#FF6B6B] font-bold flex items-center gap-1 text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{t('auth.logout')}</span>
        </button>
      </div>
    )
  }

  // If guest user
  if (guestUser) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/upgrade"
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#FFE951] neo-button font-bold text-sm"
        >
          <UserCircle className="w-4 h-4" />
          <span className="hidden sm:inline truncate max-w-[100px]">
            {guestUser.username}
          </span>
          <span className="text-xs bg-black text-white px-1 py-0.5 rounded">
            {t('auth.guestLabel')}
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="neo-button px-2 sm:px-3 py-1.5 sm:py-2 bg-[#FF6B6B] font-bold flex items-center gap-1 text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{t('auth.quit')}</span>
        </button>
      </div>
    )
  }

  // Not logged in
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Link
        href="/guest"
        className="neo-button px-2 sm:px-3 py-1.5 sm:py-2 bg-[#F7DC6F] font-bold flex items-center gap-1 text-sm"
      >
        <UserCircle className="w-4 h-4" />
        <span className="hidden sm:inline">{t('auth.guest')}</span>
      </Link>
      <Link
        href="/login"
        className="neo-button px-2 sm:px-3 py-1.5 sm:py-2 bg-[#98D8C8] font-bold flex items-center gap-1 text-sm"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">{t('auth.login')}</span>
      </Link>
      <Link
        href="/signup"
        className="neo-button px-2 sm:px-3 py-1.5 sm:py-2 bg-[#FFE951] font-bold flex items-center gap-1 text-sm"
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">{t('auth.signup')}</span>
      </Link>
    </div>
  )
}
