'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const displayName = formData.get('display_name') as string
  const country = formData.get('country') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
        country,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Update profile with country (trigger creates the basic profile)
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ country })
      .eq('id', data.user.id)
  }

  return { success: true, message: 'Check your email to confirm your account.' }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-confirm`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateProfile(
  formData: FormData,
  options?: { avatarOnly?: boolean }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const admin = await createAdminClient()

  if (options?.avatarOnly) {
    // Just update the avatar URL
    const avatarUrl = formData.get('avatar_url') as string
    const { error } = await admin
      .from('profiles')
      .upsert({ id: user.id, username: user.id, avatar_url: avatarUrl }, { onConflict: 'id' })
    if (error) return { error: error.message }
    revalidatePath('/', 'layout')
    return { success: true }
  }

  const displayName = formData.get('display_name') as string
  const country = (formData.get('country') as string) || null
  const username = (formData.get('username') as string) ||
    `${user.email?.split('@')[0]}_${user.id.slice(0, 6)}`

  // Use admin client so we can upsert — handles both:
  // 1. Users who registered BEFORE migrations ran (no profile row yet)
  // 2. Normal users updating their existing profile
  const { error: profileError } = await admin
    .from('profiles')
    .upsert(
      {
        id: user.id,
        username,
        display_name: displayName,
        country,
      },
      { onConflict: 'id' }
    )

  if (profileError) return { error: profileError.message }

  // Ensure leaderboard row exists too (same issue for pre-migration users)
  await admin
    .from('leaderboard')
    .upsert({ user_id: user.id }, { onConflict: 'user_id' })

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function checkUsernameAvailability(username: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  return { available: !data }
}
