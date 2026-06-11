'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// Configure web-push with our VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@predictcup.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export async function saveSubscription(subscription: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Admin client needed to bypass RLS or simply use the authenticated user since RLS allows it
  const { error } = await supabase
    .from('push_subscriptions')
    .insert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    })

  // Ignore unique constraint errors (already subscribed)
  if (error && error.code !== '23505') {
    console.error('Error saving subscription:', error)
    return { error: 'Failed to save subscription' }
  }

  return { success: true }
}

export async function removeSubscription(endpoint: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)

  if (error) {
    return { error: 'Failed to remove subscription' }
  }

  return { success: true }
}

export async function sendTestNotification() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const admin = await createAdminClient()
  const { data: subscriptions } = await admin
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', user.id)

  if (!subscriptions || subscriptions.length === 0) {
    return { error: 'No active subscriptions found' }
  }

  const payload = JSON.stringify({
    title: 'Test Notification 🚀',
    body: 'It works! You will now receive match alerts.',
    url: '/dashboard'
  })

  let successCount = 0

  for (const sub of subscriptions) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      }
    }

    try {
      await webpush.sendNotification(pushSubscription, payload)
      successCount++
    } catch (err: any) {
      console.error('Failed to send push notification:', err)
      // If the subscription has expired or is invalid, remove it
      if (err.statusCode === 410 || err.statusCode === 404) {
        await admin.from('push_subscriptions').delete().eq('id', sub.id)
      }
    }
  }

  if (successCount === 0) {
    return { error: 'Failed to send notification to any device.' }
  }

  return { success: true, message: `Notification sent to ${successCount} devices.` }
}
