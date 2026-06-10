import { createClient } from '@/lib/supabase/server'
import AdminTournamentClient from '@/components/admin/AdminTournamentClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Tournament' }

export default async function AdminTournamentPage() {
  const supabase = await createClient()
  
  const [{ data: teams }, { data: players }] = await Promise.all([
    supabase.from('teams').select('*').order('name'),
    supabase.from('players').select('*, team:teams(*)').order('name'),
  ])

  return <AdminTournamentClient teams={teams || []} players={players || []} />
}
