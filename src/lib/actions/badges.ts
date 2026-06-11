'use server'

import { createAdminClient } from '@/lib/supabase/server'

async function awardBadge(adminSupabase: any, userId: string, badgeType: string, matchId?: string) {
  const { error } = await adminSupabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_type: badgeType,
      match_id: matchId || null,
    })
    
  if (error && error.code !== '23505') {
    console.error(`Failed to award badge ${badgeType} to user ${userId}:`, error)
  }
}

export async function evaluateBadges(matchId: string) {
  const adminSupabase = await createAdminClient()

  // Fetch the match result
  const { data: match } = await adminSupabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (!match || match.status !== 'finished') return

  // Fetch all predictions for this match
  const { data: predictions } = await adminSupabase
    .from('predictions')
    .select('*')
    .eq('match_id', matchId)

  if (!predictions || predictions.length === 0) return

  const totalPredictions = predictions.length
  
  // Determine if it was an underdog win (< 30% of users picked this team to win)
  let isUnderdogWin = false
  if (match.home_score !== null && match.home_score > match.away_score) {
    const homePicks = predictions.filter(p => p.predicted_home > p.predicted_away).length
    if (totalPredictions > 0 && homePicks / totalPredictions <= 0.3) isUnderdogWin = true
  } else if (match.home_score !== null && match.home_score < match.away_score) {
    const awayPicks = predictions.filter(p => p.predicted_home < p.predicted_away).length
    if (totalPredictions > 0 && awayPicks / totalPredictions <= 0.3) isUnderdogWin = true
  }

  // Get points config to know what "exact score" points are
  const { data: exactConfig } = await adminSupabase
    .from('points_config')
    .select('value')
    .eq('key', 'correct_scoreline')
    .single()
  const exactScorePoints = exactConfig?.value || 5

  for (const pred of predictions) {
    const userId = pred.user_id

    // 1. FIRST_BLOOD
    const { count: userTotalPredictions } = await adminSupabase
      .from('predictions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (userTotalPredictions === 1) {
      await awardBadge(adminSupabase, userId, 'FIRST_BLOOD', matchId)
    }

    // 2. SNIPER
    if (pred.points_awarded === exactScorePoints) {
      await awardBadge(adminSupabase, userId, 'SNIPER', matchId)
    }

    // 3. UNDERDOG_KING
    if (isUnderdogWin && pred.points_awarded && pred.points_awarded > 0) {
      await awardBadge(adminSupabase, userId, 'UNDERDOG_KING', matchId)
    }

    // 4. ON_FIRE (Streak of 3 correct predictions)
    if (pred.points_awarded && pred.points_awarded > 0) {
      const { data: last3 } = await adminSupabase
        .from('predictions')
        .select('points_awarded')
        .eq('user_id', userId)
        .not('points_awarded', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(3)

      if (last3 && last3.length === 3 && last3.every((p: any) => p.points_awarded > 0)) {
        await awardBadge(adminSupabase, userId, 'ON_FIRE', matchId)
      }
    }
  }
}
