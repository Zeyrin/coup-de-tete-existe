'use client'

import { signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
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
          <h2 className="text-3xl font-bold">Inscription</h2>
          <p className="text-sm text-gray-600">
            Crée ton compte pour commencer l&apos;aventure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-bold">
                Nom d&apos;utilisateur
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
              <p className="text-xs text-gray-500">3-30 caractères</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="display_name" className="block text-sm font-bold">
                Nom d&apos;affichage <span className="text-gray-400">(optionnel)</span>
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
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Minimum 6 caractères</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full neo-button bg-[#98D8C8] hover:bg-[#7ec9b8] font-bold py-6 text-lg text-black"
            >
              {loading ? 'Création...' : "S'inscrire 🚀"}
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
              Essayer en mode invité
            </Link>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Déjà un compte ? </span>
            <Link href="/login" className="font-bold underline">
              Connecte-toi
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
