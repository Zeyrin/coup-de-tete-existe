'use client'

import { signout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/i18n/LanguageContext'

interface UserMenuProps {
  user: User | null
}

export function UserMenu({ user }: UserMenuProps) {
  const { t } = useLanguage()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsername() {
      if (!user) return

      const supabase = createClient()
      const { data } = await supabase
        .from('users')
        .select('username')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setUsername(data.username)
      }
    }

    fetchUsername()
  }, [user])

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button
          asChild
          className="neo-button bg-[#98D8C8] hover:bg-[#7ec9b8] font-bold px-4 py-2"
        >
          <a href="/login">{t('auth.login')}</a>
        </Button>
        <Button
          asChild
          className="neo-button bg-[#FFE951] hover:bg-[#ffd91a] font-bold px-4 py-2"
        >
          <a href="/signup">{t('auth.signup')}</a>
        </Button>
      </div>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="neo-button bg-white hover:bg-gray-100 font-bold px-4 py-2 flex items-center gap-2"
        >
          <UserIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{username || user.email}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 neo-border neo-shadow" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-bold">{t('auth.connectedAs')}</p>
            <p className="text-sm text-gray-600">{username || user.email}</p>
          </div>

          <form action={signout}>
            <Button
              type="submit"
              className="w-full neo-button bg-[#FF6B6B] hover:bg-[#ff5252] font-bold flex items-center gap-2 justify-start"
            >
              <LogOut className="h-4 w-4" />
              {t('auth.logout')}
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  )
}
