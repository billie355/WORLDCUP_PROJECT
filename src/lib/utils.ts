import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isPast, isFuture, differenceInMinutes } from 'date-fns'
import type { MatchStage, TournamentCategory } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKickoffTime(kickoffTime: string): string {
  return format(new Date(kickoffTime), 'MMM d, yyyy • HH:mm')
}

export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isMatchLocked(kickoffTime: string, lockMinutes: number = 60): boolean {
  const lockTime = new Date(kickoffTime).getTime() - lockMinutes * 60 * 1000
  return Date.now() >= lockTime
}

export function getMinutesToLock(kickoffTime: string, lockMinutes: number = 60): number {
  const lockTime = new Date(kickoffTime).getTime() - lockMinutes * 60 * 1000
  return Math.max(0, Math.floor((lockTime - Date.now()) / 60000))
}

export function isMatchStarted(kickoffTime: string): boolean {
  return isPast(new Date(kickoffTime))
}

export function isMatchUpcoming(kickoffTime: string): boolean {
  return isFuture(new Date(kickoffTime))
}

export function formatCountdown(kickoffTime: string, lockMinutes: number = 60): string {
  const lockTime = new Date(kickoffTime).getTime() - lockMinutes * 60 * 1000
  const now = Date.now()
  const diff = lockTime - now

  if (diff <= 0) return 'Locked'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function getStageLabel(stage: MatchStage): string {
  const labels: Record<MatchStage, string> = {
    group: 'Group Stage',
    round_of_32: 'Round of 32',
    round_of_16: 'Round of 16',
    quarter_final: 'Quarter Final',
    semi_final: 'Semi Final',
    third_place: 'Third Place',
    final: 'Final',
  }
  return labels[stage] || stage
}

export function getCategoryLabel(category: TournamentCategory): string {
  const labels: Record<TournamentCategory, string> = {
    winner: 'World Cup Winner 🏆',
    runner_up: 'Runner-Up 🥈',
    golden_boot: 'Golden Boot ⚽',
    best_player: 'Best Player 🌟',
    best_young_player: 'Best Young Player 🌱',
    best_goalkeeper: 'Best Goalkeeper 🧤',
  }
  return labels[category] || category
}

export function getAccuracyPercentage(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

export function formatPoints(points: number): string {
  return points.toLocaleString()
}

export function getRankBadge(rank: number | null): string {
  if (!rank) return ''
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

export function getCountryFlag(countryCode: string): string {
  // Convert country code to flag emoji
  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join('')
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getPredictionResult(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): 'exact' | 'correct' | 'wrong' {
  if (predictedHome === actualHome && predictedAway === actualAway) return 'exact'
  const predWinner = predictedHome > predictedAway ? 'home' : predictedHome < predictedAway ? 'away' : 'draw'
  const actualWinner = actualHome > actualAway ? 'home' : actualHome < actualAway ? 'away' : 'draw'
  if (predWinner === actualWinner) return 'correct'
  return 'wrong'
}
