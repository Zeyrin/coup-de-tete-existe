'use client'

import { createGuestUser } from '@/app/actions/guest'
import { Button } from '@/components/ui/button'
import { setLocalGuestUser, getDeviceFingerprint } from '@/utils/guestUser'
import { UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'

export default function GuestPage() {
  const { t } = useLanguage()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!username.trim()) {
      toast.error(t('guest.errorRequired'))
      return
    }

    if (username.length < 3) {
      toast.error(t('guest.errorTooShort'))
      return
    }

    if (username.length > 30) {
      toast.error(t('guest.errorTooLong'))
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
      toast.success(t('guest.welcome').replace('{username}', username))
      router.push('/')
      router.refresh()
    } else {
      toast.error(t('guest.errorGeneric'))
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
          <h2 className="text-3xl font-bold">{t('guest.title')}</h2>
          <p className="text-sm text-gray-600">
            {t('guest.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-bold">
              {t('guest.usernameLabel')}
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
            <p className="text-xs text-gray-500">{t('guest.usernameHint')}</p>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full neo-button bg-[#FFE951] hover:bg-[#ffd91a] font-bold py-6 text-lg text-black"
            >
              {loading ? t('guest.submitting') : t('guest.submit')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 font-bold">{t('common.or')}</span>
              </div>
            </div>

            <Link
              href="/signup"
              className="block w-full neo-button px-4 py-3 bg-[#98D8C8] hover:bg-[#7ec9b8] font-bold text-center"
            >
              {t('guest.createAccount')}
            </Link>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t('guest.hasAccount')} </span>
            <Link href="/login" className="font-bold underline">
              {t('guest.loginLink')}
            </Link>
          </div>

          <div className="neo-card bg-[#FFE951] p-4 space-y-2">
            <p className="text-xs font-bold">{t('guest.infoTitle')}</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>{t('guest.info1')}</li>
              <li>{t('guest.info2')}</li>
              <li>{t('guest.info3')}</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  )
}
