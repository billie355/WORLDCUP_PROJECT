'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isMatchLocked } from '@/lib/utils'
import type { TournamentCategory } from '@/types'

// -------------------------------------------------------
// Match Predictions
// -------------------------------------------------------
export async function submitMatchPrediction(
  matchId: string,
  predictedHome: number,
  predictedAway: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Validate lock time
  const { data: match } = await supabase
    .from('matches')
    .select('kickoff_time, lock_minutes, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Match not found' }
  if (match.status !== 'scheduled') return { error: 'Match is no longer accepting predictions' }
  if (isMatchLocked(match.kickoff_time, match.lock_minutes)) {
    return { error: 'Predictions are locked for this match' }
  }

  const { error } = await supabase
    .from('predictions')
    .upsert(
      {
        user_id: user.id,
        match_id: matchId,
        predicted_home: predictedHome,
        predicted_away: predictedAway,
      },
      { onConflict: 'user_id,match_id' }
    )

  if (error) return { error: error.message }

  revalidatePath('/predictions/matches')
  return { success: true }
}

export async function getUserMatchPredictions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('predictions')
    .select(`
      *,
      match:matches(
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { data: data || [], error: error?.message }
}

// -------------------------------------------------------
// Tournament Predictions
// -------------------------------------------------------
export async function submitTournamentPrediction(
  category: TournamentCategory,
  selectedTeamId: string | null,
  selectedPlayerId: string | null
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check if tournament predictions are open
  const { data: config } = await supabase
    .from('tournament_config')
    .select('value')
    .eq('key', 'predictions_open')
    .single()

  if (config?.value !== 'true') {
    return { error: 'Tournament predictions are currently closed' }
  }

  const { error } = await supabase
    .from('tournament_predictions')
    .upsert(
      {
        user_id: user.id,
        category,
        selected_team_id: selectedTeamId,
        selected_player_id: selectedPlayerId,
      },
      { onConflict: 'user_id,category' }
    )

  if (error) return { error: error.message }

  revalidatePath('/predictions/tournament')
  return { success: true }
}

export async function getUserTournamentPredictions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('tournament_predictions')
    .select(`
      *,
      selected_team:teams(*),
      selected_player:players(*, team:teams(*))
    `)
    .eq('user_id', user.id)

  return { data: data || [], error: error?.message }
}

// -------------------------------------------------------
// Match & Team Data (public)
// -------------------------------------------------------
export async function getUpcomingMatches(limit = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq('status', 'scheduled')
    .gt('kickoff_time', new Date().toISOString())
    .order('kickoff_time', { ascending: true })
    .limit(limit)

  return { data: data || [], error: error?.message }
}

export async function getAllMatches() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .order('kickoff_time', { ascending: true })

  return { data: data || [], error: error?.message }
}

export async function getAllTeams() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('group_name', { ascending: true })
    .order('name', { ascending: true })

  return { data: data || [], error: error?.message }
}

export async function getAllPlayers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('players')
    .select('*, team:teams(*)')
    .order('name', { ascending: true })

  return { data: data || [], error: error?.message }
}
