export interface LocalGuestUser {
  id: string
  username: string
  isGuest: true
}

export function getLocalGuestUser(): LocalGuestUser | null {
  if (typeof window === 'undefined') return null

  const guestData = localStorage.getItem('guestUser')
  if (!guestData) return null

  try {
    return JSON.parse(guestData)
  } catch {
    return null
  }
}

export function setLocalGuestUser(id: string, username: string): LocalGuestUser {
  const guestUser: LocalGuestUser = {
    id,
    username,
    isGuest: true,
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('guestUser', JSON.stringify(guestUser))
  }

  return guestUser
}

export function clearLocalGuestUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('guestUser')
  }
}

// Helper to generate a device fingerprint (basic implementation)
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return ''

  const nav = window.navigator
  const screen = window.screen

  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join('|')

  // Simple hash function
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return Math.abs(hash).toString(36)
}
