import { getUser } from '@/app/actions/auth'
import { AuthButtonClient } from './AuthButton.client'

export async function AuthButton() {
  const user = await getUser()
  return <AuthButtonClient serverUser={user} />
}
