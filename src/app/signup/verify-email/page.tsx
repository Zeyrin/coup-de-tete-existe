'use client'

import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

export default function VerifyEmailPage() {
  const { t } = useLanguage()
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#80a0c3]">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 neo-border neo-shadow text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-[#FFE951] p-4 neo-border">
            <Mail size={48} className="text-black" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('verify.title')}</h1>
          <p className="text-gray-600">
            {t('verify.subtitle')}
          </p>
        </div>

        <div className="bg-[#f0f9ff] rounded-lg p-4 neo-border space-y-2">
          <p className="font-bold text-sm">{t('verify.nextSteps')}</p>
          <ol className="text-left text-sm space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#4ECDC4]">1.</span>
              {t('verify.step1')}
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#4ECDC4]">2.</span>
              {t('verify.step2')}
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#4ECDC4]">3.</span>
              {t('verify.step3')}
            </li>
          </ol>
        </div>

        <p className="text-xs text-gray-500">
          {t('verify.spam')}
        </p>

        <div className="pt-4 space-y-3">
          <Link
            href="/login"
            className="block w-full neo-button px-4 py-3 bg-[#98D8C8] hover:bg-[#7ec9b8] font-bold text-center text-black"
          >
            {t('verify.loginButton')}
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <ArrowLeft size={16} />
            {t('verify.backSignup')}
          </Link>
        </div>
      </div>
    </div>
  )
}
