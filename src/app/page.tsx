import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPublicStats } from '@/lib/actions/leaderboard'
import { getLeaderboard } from '@/lib/actions/leaderboard'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import StatsSection from '@/components/landing/StatsSection'
import LeaderboardPreview from '@/components/landing/LeaderboardPreview'
import LandingNav from '@/components/landing/LandingNav'
import Footer from '@/components/landing/Footer'

export default async function HomePage() {
  const [statsResult, leaderboardResult] = await Promise.all([
    getPublicStats(),
    getLeaderboard(0, 5),
  ])

  return (
    <div className="min-h-screen">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <StatsSection stats={statsResult} />
      <LeaderboardPreview entries={leaderboardResult.data} />
      <Footer />
    </div>
  )
}
