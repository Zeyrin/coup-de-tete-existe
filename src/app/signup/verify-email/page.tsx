'use client'

import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#80a0c3]">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 neo-border neo-shadow text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-[#FFE951] p-4 neo-border">
            <Mail size={48} className="text-black" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Vérifie tes emails !</h1>
          <p className="text-gray-600">
            On t&apos;a envoyé un lien de confirmation.
          </p>
        </div>

        <div className="bg-[#f0f9ff] rounded-lg p-4 neo-border space-y-2">
          <p className="font-bold text-sm">Prochaines étapes :</p>
          <ol className="text-left text-sm space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#4ECDC4]">1.</span>
              Ouvre ta boîte mail
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#4ECDC4]">2.</span>
              Clique sur le lien de confirmation
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#4ECDC4]">3.</span>
              Reviens ici et connecte-toi !
            </li>
          </ol>
        </div>

        <p className="text-xs text-gray-500">
          Tu ne vois pas l&apos;email ? Vérifie tes spams ou attends quelques minutes.
        </p>

        <div className="pt-4 space-y-3">
          <Link
            href="/login"
            className="block w-full neo-button px-4 py-3 bg-[#98D8C8] hover:bg-[#7ec9b8] font-bold text-center text-black"
          >
            Se connecter
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <ArrowLeft size={16} />
            Retour à l&apos;inscription
          </Link>
        </div>
      </div>
    </div>
  )
}
