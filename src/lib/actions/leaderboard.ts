'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLeaderboard(page = 0, limit = 50) {
  const supabase = await createClient()

  const { data, error, count } = await supabase
    .from('leaderboard')
    .select(`
      *,
      profile:profiles(id, username, display_name, country, avatar_url)
    `, { count: 'exact' })
    .order('total_points', { ascending: false })
    .order('updated_at', { ascending: true })
    .range(page * limit, (page + 1) * limit - 1)

  return { data: data || [], error: error?.message, count: count || 0 }
}

export async function getCountryLeaderboard(country: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leaderboard')
    .select(`
      *,
      profile:profiles!inner(id, username, display_name, country, avatar_url)
    `)
    .eq('profiles.country', country)
    .order('total_points', { ascending: false })
    .limit(50)

  return { data: data || [], error: error?.message }
}

export async function getCurrentUserLeaderboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null }

  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return { data }
}

export async function getPublicStats() {
  const supabase = await createClient()

  // Most predicted tournament winner
  const { data: winnerStats } = await supabase
    .from('tournament_predictions')
    .select('selected_team_id, teams(name, flag_url, short_code)')
    .eq('category', 'winner')
    .not('selected_team_id', 'is', null)

  // Most predicted golden boot
  const { data: goldenBootStats } = await supabase
    .from('tournament_predictions')
    .select('selected_player_id, players(name, team:teams(name, flag_url))')
    .eq('category', 'golden_boot')
    .not('selected_player_id', 'is', null)

  // Total predictions count
  const { count: totalMatchPredictions } = await supabase
    .from('predictions')
    .select('id', { count: 'exact', head: true })

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })

  // Aggregate winner stats
  const winnerCounts: Record<string, { name: string; flag_url: string | null; short_code: string; count: number }> = {}
  winnerStats?.forEach((p: any) => {
    const id = p.selected_team_id
    if (id && p.teams) {
      winnerCounts[id] = winnerCounts[id] || { ...p.teams, count: 0 }
      winnerCounts[id].count++
    }
  })

  const totalWinnerPreds = winnerStats?.length || 1
  const winnerLeaderboard = Object.values(winnerCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((t) => ({ ...t, percentage: Math.round((t.count / totalWinnerPreds) * 100) }))

  // Aggregate golden boot stats
  const bootCounts: Record<string, { name: string; teamName: string; count: number }> = {}
  goldenBootStats?.forEach((p: any) => {
    const id = p.selected_player_id
    if (id && p.players) {
      bootCounts[id] = bootCounts[id] || { name: p.players.name, teamName: p.players.team?.name || '', count: 0 }
      bootCounts[id].count++
    }
  })

  const totalBootPreds = goldenBootStats?.length || 1
  const bootLeaderboard = Object.values(bootCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((p) => ({ ...p, percentage: Math.round((p.count / totalBootPreds) * 100) }))

  return {
    winnerLeaderboard,
    bootLeaderboard,
    totalMatchPredictions: totalMatchPredictions || 0,
    totalUsers: totalUsers || 0,
  }
}

// Admin: recalculate all scores
export async function adminRecalculateScores() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  // Get all finished matches
  const { data: matches } = await supabase
    .from('matches')
    .select('id, home_score, away_score')
    .eq('status', 'finished')
    .not('home_score', 'is', null)

  if (!matches) return { error: 'No finished matches' }

  // Use admin client for the DB function
  const adminSupabase = await createAdminClient()

  for (const match of matches) {
    if (match.home_score !== null && match.away_score !== null) {
      await adminSupabase.rpc('score_match_prediction', {
        p_match_id: match.id,
        p_home_score: match.home_score,
        p_away_score: match.away_score,
      })
    }
  }

  revalidatePath('/admin/leaderboard')
  revalidatePath('/leaderboard')
  return { success: true }
}
