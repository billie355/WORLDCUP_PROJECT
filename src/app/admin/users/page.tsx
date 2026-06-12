import { adminGetUsers } from '@/lib/actions/admin'
import AdminUsersClient from '@/components/admin/AdminUsersClient'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Users' }

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()

  const { data: users } = await adminGetUsers()
  return <AdminUsersClient users={users || []} currentUserRole={profile?.role as 'admin' | 'staff'} />
}
