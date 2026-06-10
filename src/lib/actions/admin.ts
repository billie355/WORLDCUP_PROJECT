'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Unauthorized')
  return { supabase, user }
}

// -------------------------------------------------------
// Match Management
// -------------------------------------------------------
export async function adminCreateMatch(formData: FormData) {
  try {
    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from('matches')
      .insert({
        home_team_id: formData.get('home_team_id') as string,
        away_team_id: formData.get('away_team_id') as string,
        kickoff_time: formData.get('kickoff_time') as string,
        stage: formData.get('stage') as string,
        venue: formData.get('venue') as string,
        lock_minutes: parseInt(formData.get('lock_minutes') as string) || 60,
      })

    if (error) return { error: error.message }
    revalidatePath('/admin/matches')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function adminUpdateMatch(matchId: string, formData: FormData) {
  try {
    const { supabase } = await requireAdmin()

    const homeScore = formData.get('home_score')
    const awayScore = formData.get('away_score')
    const status = formData.get('status') as string

    const updateData: any = {
      kickoff_time: formData.get('kickoff_time') as string,
      venue: formData.get('venue') as string,
      status,
    }

    if (homeScore !== null && homeScore !== '') {
      updateData.home_score = parseInt(homeScore as string)
      updateData.away_score = parseInt(awayScore as string)
    }

    const { error } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', matchId)

    if (error) return { error: error.message }

    // If match is finished with scores, trigger scoring
    if (status === 'finished' && homeScore !== null && homeScore !== '') {
      const adminSupabase = await createAdminClient()
      await adminSupabase.rpc('score_match_prediction', {
        p_match_id: matchId,
        p_home_score: parseInt(homeScore as string),
        p_away_score: parseInt(awayScore as string),
      })
    }

    revalidatePath('/admin/matches')
    revalidatePath('/leaderboard')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function adminGetAllMatches() {
  try {
    const { supabase } = await requireAdmin()
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .order('kickoff_time', { ascending: true })

    return { data: data || [], error: error?.message }
  } catch (e: any) {
    return { data: [], error: e.message }
  }
}

// -------------------------------------------------------
// User Management
// -------------------------------------------------------
export async function adminGetUsers(page = 0, search = '') {
  try {
    const { supabase } = await requireAdmin()

    let query = supabase
      .from('profiles')
      .select('*, leaderboard(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * 50, (page + 1) * 50 - 1)

    if (search) {
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
    }

    const { data, error, count } = await query
    return { data: data || [], error: error?.message, count: count || 0 }
  } catch (e: any) {
    return { data: [], error: e.message, count: 0 }
  }
}

export async function adminBanUser(userId: string, banned: boolean) {
  try {
    const { supabase } = await requireAdmin()
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: banned })
      .eq('id', userId)

    if (error) return { error: error.message }
    revalidatePath('/admin/users')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function adminResetUserPredictions(userId: string) {
  try {
    const adminSupabase = await createAdminClient()

    await adminSupabase.from('predictions').delete().eq('user_id', userId)
    await adminSupabase.from('tournament_predictions').delete().eq('user_id', userId)
    await adminSupabase
      .from('leaderboard')
      .update({ total_points: 0, match_points: 0, tournament_points: 0, predictions_correct: 0, predictions_total: 0 })
      .eq('user_id', userId)

    revalidatePath('/admin/users')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

// -------------------------------------------------------
// Points Config
// -------------------------------------------------------
export async function adminUpdatePointsConfig(configs: { key: string; value: number }[]) {
  try {
    const { supabase } = await requireAdmin()

    for (const config of configs) {
      await supabase
        .from('points_config')
        .update({ value: config.value })
        .eq('key', config.key)
    }

    revalidatePath('/admin/leaderboard')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

// -------------------------------------------------------
// Team & Player Management
// -------------------------------------------------------
export async function adminCreateTeam(formData: FormData) {
  try {
    const { supabase } = await requireAdmin()
    const { error } = await supabase.from('teams').insert({
      name: formData.get('name') as string,
      short_code: formData.get('short_code') as string,
      flag_url: formData.get('flag_url') as string,
      group_name: formData.get('group_name') as string,
      confederation: formData.get('confederation') as string,
    })
    if (error) return { error: error.message }
    revalidatePath('/admin/tournament')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function adminCreatePlayer(formData: FormData) {
  try {
    const { supabase } = await requireAdmin()
    const { error } = await supabase.from('players').insert({
      name: formData.get('name') as string,
      team_id: formData.get('team_id') as string,
      position: formData.get('position') as string,
      birth_date: formData.get('birth_date') as string,
    })
    if (error) return { error: error.message }
    revalidatePath('/admin/tournament')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}
