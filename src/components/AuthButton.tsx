import { getUser } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'
import { AuthButtonClient } from './AuthButton.client'

export async function AuthButton() {
  const user = await getUser()

  let username: string | null = null

  if (user) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('users')
      .select('username')
      .eq('user_id', user.id)
      .single()

    if (data) {
      username = data.username
    }
  }

  return <AuthButtonClient serverUser={user} initialUsername={username} />
}
