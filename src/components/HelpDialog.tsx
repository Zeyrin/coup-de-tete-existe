"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Star5 from "@/components/icons/Star5"
import { useLanguage } from '@/i18n/LanguageContext'

export default function HelpDialog() {
  const { t } = useLanguage()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="absolute -top-6 -left-6 z-10 group">
          <div className="relative w-16 h-16">
            <Star5
              color="#FFE951"
              stroke="#000000"
              strokeWidth={3}
              className="w-full h-full transition-transform duration-150 group-hover:scale-110"
            />
            <span className="absolute inset-0 flex items-center justify-center text-black font-bold text-2xl">
              ?
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white neo-border max-w-lg p-0 gap-0 rounded-md overflow-hidden">
        <DialogHeader className="bg-[#FFE951] neo-border p-6 -m-[3px] -mb-0 rounded-t-md">
          <DialogTitle className="text-2xl font-bold uppercase text-center">
            {t('help.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Step 1 */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-[#FF6B6B] neo-border w-9 h-9 flex items-center justify-center font-bold text-lg flex-shrink-0 rounded-md">
                1
              </div>
              <h3 className="font-bold text-base uppercase">{t('help.step1Title')}</h3>
            </div>
            <p className="text-sm pl-12" dangerouslySetInnerHTML={{ __html: t('help.step1Desc') }} />
          </div>

          {/* Step 2 */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-[#4ECDC4] neo-border w-9 h-9 flex items-center justify-center font-bold text-lg flex-shrink-0 rounded-md">
                2
              </div>
              <h3 className="font-bold text-base uppercase">{t('help.step2Title')}</h3>
            </div>
            <p className="text-sm pl-12" dangerouslySetInnerHTML={{ __html: t('help.step2Desc') }} />
          </div>

          {/* Step 3 - Profile */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-[#9B59B6] neo-border w-9 h-9 flex items-center justify-center font-bold text-lg flex-shrink-0 rounded-md text-white">
                3
              </div>
              <h3 className="font-bold text-base uppercase">{t('help.step3Title')}</h3>
            </div>
            <p className="text-sm pl-12" dangerouslySetInnerHTML={{ __html: t('help.step3Desc') }} />
          </div>

          {/* Step 4 */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFE951] neo-border w-9 h-9 flex items-center justify-center font-bold text-lg flex-shrink-0 rounded-md">
                4
              </div>
              <h3 className="font-bold text-base uppercase">{t('help.step4Title')}</h3>
            </div>
            <p className="text-sm pl-12" dangerouslySetInnerHTML={{ __html: t('help.step4Desc') }} />
          </div>

          {/* Step 5 */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-[#98D8C8] neo-border w-9 h-9 flex items-center justify-center font-bold text-lg flex-shrink-0 rounded-md">
                5
              </div>
              <h3 className="font-bold text-base uppercase">{t('help.step5Title')}</h3>
            </div>
            <p className="text-sm pl-12" dangerouslySetInnerHTML={{ __html: t('help.step5Desc') }} />
          </div>

          {/* Premium feature box */}
          <div className="bg-[#FFD700] neo-card p-4 mt-4">
            <p className="text-center font-bold text-sm uppercase mb-1">
              {t('help.premiumTitle')}
            </p>
            <p className="text-center text-sm" dangerouslySetInnerHTML={{ __html: t('help.premiumDesc') }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
