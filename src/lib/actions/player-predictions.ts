'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isMatchLocked } from '@/lib/utils'
import type { PlayerPredictionType } from '@/types'

// -------------------------------------------------------
// Submit / update a player pick for a match
// -------------------------------------------------------
export async function submitPlayerMatchPrediction(
  matchId: string,
  predictionType: PlayerPredictionType,
  playerId: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check match lock
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
    .from('player_match_predictions')
    .upsert(
      {
        user_id: user.id,
        match_id: matchId,
        prediction_type: predictionType,
        player_id: playerId,
      },
      { onConflict: 'user_id,match_id,prediction_type' }
    )

  if (error) return { error: error.message }

  revalidatePath('/predictions/matches')
  return { success: true }
}

// -------------------------------------------------------
// Fetch the current user's player picks for given match IDs
// -------------------------------------------------------
export async function getUserPlayerMatchPredictions(matchIds?: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Not authenticated' }

  let query = supabase
    .from('player_match_predictions')
    .select(`
      *,
      player:players(id, name, position, team:teams(name, flag_url))
    `)
    .eq('user_id', user.id)

  if (matchIds && matchIds.length > 0) {
    query = query.in('match_id', matchIds)
  }

  const { data, error } = await query

  return { data: data || [], error: error?.message }
}

// -------------------------------------------------------
// Fetch players for both teams in a match
// -------------------------------------------------------
export async function getPlayersForMatch(matchId: string) {
  const supabase = await createClient()

  // Get team IDs from match
  const { data: match } = await supabase
    .from('matches')
    .select('home_team_id, away_team_id')
    .eq('id', matchId)
    .single()

  if (!match) return { data: [], error: 'Match not found' }

  const { data, error } = await supabase
    .from('players')
    .select('*, team:teams(id, name, flag_url)')
    .in('team_id', [match.home_team_id, match.away_team_id])
    .order('name', { ascending: true })

  return { data: data || [], error: error?.message }
}
