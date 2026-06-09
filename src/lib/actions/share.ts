'use server'

import { createClient } from '@/lib/supabase/server'
import type { ShareCardSnapshot, TournamentCategory } from '@/types'
import { getCategoryLabel } from '@/lib/utils'

export async function generateShareCard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get leaderboard entry
  const { data: lb } = await supabase
    .from('leaderboard')
    .select('total_points, rank')
    .eq('user_id', user.id)
    .single()

  // Get tournament predictions
  const { data: tournamentPreds } = await supabase
    .from('tournament_predictions')
    .select('category, selected_team:teams(name, flag_url), selected_player:players(name, team:teams(name))')
    .eq('user_id', user.id)

  // Get top 5 match predictions
  const { data: matchPreds } = await supabase
    .from('predictions')
    .select(`
      predicted_home, predicted_away,
      match:matches(
        kickoff_time,
        home_team:teams!matches_home_team_id_fkey(name, flag_url, short_code),
        away_team:teams!matches_away_team_id_fkey(name, flag_url, short_code)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const snapshot: ShareCardSnapshot = {
    username: profile?.username || 'fan',
    display_name: profile?.display_name,
    avatar_url: profile?.avatar_url,
    tournament_predictions: (tournamentPreds || []).map((p: any) => ({
      category: p.category as TournamentCategory,
      label: getCategoryLabel(p.category as TournamentCategory),
      value: p.selected_player?.name || p.selected_team?.name || '—',
    })),
    match_predictions: (matchPreds || []).map((p: any) => ({
      home_team: p.match?.home_team?.name || '',
      away_team: p.match?.away_team?.name || '',
      home_flag: p.match?.home_team?.flag_url,
      away_flag: p.match?.away_team?.flag_url,
      predicted_home: p.predicted_home,
      predicted_away: p.predicted_away,
    })),
    total_points: lb?.total_points || 0,
    rank: lb?.rank || null,
  }

  const { data: card, error } = await supabase
    .from('share_cards')
    .insert({ user_id: user.id, snapshot })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { success: true, shareId: card.id }
}

export async function getShareCard(shareId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('share_cards')
    .select('*')
    .eq('id', shareId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data }
}
