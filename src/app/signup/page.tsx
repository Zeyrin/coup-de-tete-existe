'use client'

import { signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

export default function SignupPage() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else if (result?.success) {
      router.push('/signup/verify-email')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#80a0c3]">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 neo-border neo-shadow">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">{t('signup.title')}</h2>
          <p className="text-sm text-gray-600">
            {t('signup.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-bold">
                {t('signup.username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                minLength={3}
                maxLength={30}
                className="block w-full rounded-lg neo-border px-4 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE951]"
                placeholder="ton_username"
              />
              <p className="text-xs text-gray-500">{t('signup.usernameHint')}</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="display_name" className="block text-sm font-bold">
                {t('signup.displayName')} <span className="text-gray-400">{t('signup.displayNameOptional')}</span>
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                autoComplete="name"
                maxLength={50}
                className="block w-full rounded-lg neo-border px-4 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE951]"
                placeholder="Ton Nom"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold">
                {t('signup.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg neo-border px-4 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE951]"
                placeholder="ton@email.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold">
                {t('signup.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="block w-full rounded-lg neo-border px-4 py-3 pr-12 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE951]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">{t('signup.passwordHint')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full neo-button bg-[#98D8C8] hover:bg-[#7ec9b8] font-bold py-6 text-lg text-black"
            >
              {loading ? t('signup.submitting') : t('signup.submit')}
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
              href="/guest"
              className="block w-full neo-button px-4 py-3 bg-[#FFE951] hover:bg-[#ffd91a] font-bold text-center text-black"
            >
              {t('signup.guestMode')}
            </Link>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t('signup.hasAccount')} </span>
            <Link href="/login" className="font-bold underline">
              {t('signup.loginLink')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
