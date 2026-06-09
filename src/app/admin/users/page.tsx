import { adminGetUsers } from '@/lib/actions/admin'
import AdminUsersClient from '@/components/admin/AdminUsersClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Users' }

export default async function AdminUsersPage() {
  const { data: users } = await adminGetUsers()
  return <AdminUsersClient users={users || []} />
}
