import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppSidebar from '@/components/layout/AppSidebar'
import AppHeader from '@/components/layout/AppHeader'
import MobileNav from '@/components/layout/MobileNav'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('total_points, rank')
    .eq('user_id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar profile={profile} leaderboard={leaderboard} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppHeader profile={profile} leaderboard={leaderboard} />
        <main className="main-app-content" style={{ flex: 1, padding: '32px 32px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
      <MobileNav profile={profile} />
    </div>
  )
}
