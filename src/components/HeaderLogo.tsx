'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function HeaderLogo() {
  const pathname = usePathname()

  const handleClick = () => {
    // If already on home page, emit a custom event to reset the state
    if (pathname === '/') {
      window.dispatchEvent(new CustomEvent('reset-home-state'))
    }
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="text-2xl font-bold hover:opacity-80 transition-opacity"
    >
      <h1>Coup de Tête</h1>
    </Link>
  )
}
