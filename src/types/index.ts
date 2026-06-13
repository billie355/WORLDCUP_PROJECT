// Database types for the World Cup Prediction Platform

export type UserRole = 'user' | 'admin' | 'staff'
export type MatchStage = 'group' | 'round_of_32' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'third_place' | 'final'
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD'
export type TournamentCategory = 'winner' | 'runner_up' | 'golden_boot' | 'best_player' | 'best_young_player' | 'best_goalkeeper'
export type PlayerPredictionType = 'goal_scorer' | 'man_of_match'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  country: string | null
  avatar_url: string | null
  role: UserRole
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  short_code: string
  flag_url: string | null
  group_name: string | null
  confederation: string | null
  created_at: string
}

export interface Player {
  id: string
  name: string
  team_id: string | null
  position: PlayerPosition | null
  birth_date: string | null
  created_at: string
  team?: Team
}

export interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  kickoff_time: string
  lock_minutes: number
  stage: MatchStage
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  venue: string | null
  match_day: number | null
  created_at: string
  updated_at: string
  home_team?: Team
  away_team?: Team
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  predicted_home: number
  predicted_away: number
  points_awarded: number | null
  created_at: string
  updated_at: string
  match?: Match
}

export interface TournamentPrediction {
  id: string
  user_id: string
  category: TournamentCategory
  selected_team_id: string | null
  selected_player_id: string | null
  points_awarded: number | null
  created_at: string
  updated_at: string
  selected_team?: Team
  selected_player?: Player
}

export interface Leaderboard {
  user_id: string
  total_points: number
  match_points: number
  tournament_points: number
  rank: number | null
  predictions_correct: number
  predictions_total: number
  updated_at: string
  profile?: Profile
}

export interface PlayerMatchPrediction {
  id: string
  user_id: string
  match_id: string
  prediction_type: PlayerPredictionType
  player_id: string
  points_awarded: number | null
  created_at: string
  updated_at: string
  player?: Player
}

export interface ShareCard {
  id: string
  user_id: string
  snapshot: ShareCardSnapshot
  created_at: string
}

export interface ShareCardSnapshot {
  username: string
  display_name: string | null
  avatar_url: string | null
  tournament_predictions: {
    category: TournamentCategory
    label: string
    value: string
  }[]
  match_predictions: {
    home_team: string
    away_team: string
    home_flag: string | null
    away_flag: string | null
    predicted_home: number
    predicted_away: number
    goal_scorer?: string | null
    man_of_match?: string | null
  }[]
  total_points: number
  rank: number | null
}

export interface PointsConfig {
  key: string
  value: number
  description: string | null
}

export interface LeaderboardEntry extends Leaderboard {
  profile: Profile
}

export type LeaderboardTab = 'global' | 'weekly' | 'country' | 'friends'
