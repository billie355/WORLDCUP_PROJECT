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

async function requireStaffOrAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'staff') throw new Error('Unauthorized')
  return { supabase, user, role: profile.role }
}

// -------------------------------------------------------
// Match Management
// -------------------------------------------------------
/** Staff or Admin: create a new match (basic info only, no scoring). */
export async function adminCreateMatch(formData: FormData) {
  try {
    const { supabase } = await requireStaffOrAdmin()

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

/** Staff or Admin: update a match's basic info (venue, kickoff time).
 *  Score entry and marking as finished is ADMIN ONLY — the action enforces this. */
export async function adminUpdateMatch(matchId: string, formData: FormData) {
  try {
    const { supabase, role } = await requireStaffOrAdmin()

    const homeScore = formData.get('home_score')
    const awayScore = formData.get('away_score')
    const status = formData.get('status') as string

    // Staff cannot enter scores or mark match as finished
    if (role === 'staff') {
      if (status === 'finished') {
        return { error: 'Staff cannot mark a match as finished. Contact an admin.' }
      }
      if (homeScore !== null && homeScore !== '') {
        return { error: 'Staff cannot enter match scores. Contact an admin.' }
      }
    }

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

    // If match is finished with scores, trigger scoring (admin only, guarded above)
    if (status === 'finished' && homeScore !== null && homeScore !== '') {
      const adminSupabase = await createAdminClient()
      await adminSupabase.rpc('score_match_prediction', {
        p_match_id: matchId,
        p_home_score: parseInt(homeScore as string),
        p_away_score: parseInt(awayScore as string),
      })

      // Evaluate badges after scoring
      const { evaluateBadges } = await import('./badges')
      await evaluateBadges(matchId)
    }

    revalidatePath('/admin/matches')
    revalidatePath('/leaderboard')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

/** Staff or Admin: list all matches. */
export async function adminGetAllMatches() {
  try {
    const { supabase } = await requireStaffOrAdmin()
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
    const { supabase } = await requireStaffOrAdmin()

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

export async function adminChangeUserRole(userId: string, role: string) {
  try {
    const { supabase } = await requireAdmin()
    
    // Admins cannot change other admins' roles
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
      
    if (targetProfile?.role === 'admin') throw new Error('Cannot modify admin roles')

    const { error } = await supabase
      .from('profiles')
      .update({ role })
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
    await requireStaffOrAdmin()
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
/** Staff or Admin: add a team. */
export async function adminCreateTeam(formData: FormData) {
  try {
    const { supabase } = await requireStaffOrAdmin()
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

/** Staff or Admin: add a player. */
export async function adminCreatePlayer(formData: FormData) {
  try {
    const { supabase } = await requireStaffOrAdmin()
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
