import { getShareCard } from '@/lib/actions/share'
import { notFound } from 'next/navigation'
import ShareCardView from '@/components/share/ShareCardView'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data } = await getShareCard(id)
  if (!data) return { title: 'Share Card Not Found' }

  const snapshot = data.snapshot
  return {
    title: `${snapshot.display_name || snapshot.username}'s World Cup Predictions`,
    description: `See ${snapshot.username}'s predictions for the FIFA World Cup 2026. Generated on PredictCup.`,
    openGraph: {
      title: `${snapshot.username}'s World Cup 2026 Predictions`,
      description: `Winner: ${snapshot.tournament_predictions.find((p: any) => p.category === 'winner')?.value || 'Unknown'}`,
      type: 'website',
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function SharePage({ params }: Props) {
  const { id } = await params
  const { data } = await getShareCard(id)
  if (!data) notFound()
  return <ShareCardView shareCard={data} />
}
