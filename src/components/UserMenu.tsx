'use client'

import { signout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon } from 'lucide-react'

interface UserMenuProps {
  user: User | null
}

export function UserMenu({ user }: UserMenuProps) {
  if (!user) {
    return (
      <div className="flex gap-2">
        <Button
          asChild
          variant="outline"
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          <a href="/login">Connexion</a>
        </Button>
        <Button
          asChild
          className="bg-white text-purple-600 hover:bg-white/90"
        >
          <a href="/signup">Inscription</a>
        </Button>
      </div>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          size="icon"
        >
          <UserIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Connecté en tant que</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>

          <form action={signout}>
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-start"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  )
}
