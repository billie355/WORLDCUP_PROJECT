import { adminGetAllMatches } from '@/lib/actions/admin'
import { createClient } from '@/lib/supabase/server'
import AdminMatchesClient from '@/components/admin/AdminMatchesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Matches' }

export default async function AdminMatchesPage() {
  const supabase = await createClient()
  const [{ data: matches }, { data: teams }] = await Promise.all([
    adminGetAllMatches(),
    supabase.from('teams').select('id, name').order('name'),
  ])

  return <AdminMatchesClient matches={matches || []} teams={teams || []} />
}
