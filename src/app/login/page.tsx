'use client'

import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await login(formData)

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#80a0c3]">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 neo-border neo-shadow">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Connexion</h2>
          <p className="text-sm text-gray-600">
            Connecte-toi pour accéder à ton compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold">
                Email
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
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-lg neo-border px-4 py-3 pr-12 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE951]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full neo-button bg-[#98D8C8] hover:bg-[#7ec9b8] font-bold py-6 text-lg text-black"
            >
              {loading ? 'Connexion...' : 'Se connecter 🚀'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 font-bold">OU</span>
              </div>
            </div>

            <Link
              href="/guest"
              className="block w-full neo-button px-4 py-3 bg-[#FFE951] hover:bg-[#ffd91a] font-bold text-center text-black"
            >
              Continuer en tant qu&apos;invité
            </Link>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Pas encore de compte ? </span>
            <Link href="/signup" className="font-bold underline">
              Inscris-toi
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
