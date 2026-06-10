import { Target, Trophy, Users, BarChart3, Share2, Shield } from 'lucide-react'

const features = [
  {
    icon: Target,
    color: '#f59e0b',
    title: 'Predict Every Match',
    description: 'Pick exact scores for all 104 matches — from Group Stage to the Final. Earn bonus points for perfect predictions.',
  },
  {
    icon: Trophy,
    color: '#10b981',
    title: 'Tournament Awards',
    description: 'Predict the World Cup winner, Golden Boot, Best Player, Best Young Player, and Best Goalkeeper.',
  },
  {
    icon: Users,
    color: '#8b5cf6',
    title: 'Global Leaderboard',
    description: 'Compete against fans worldwide. Track your rank, points, and accuracy in real-time across global, country, and friends boards.',
  },
  {
    icon: BarChart3,
    color: '#3b82f6',
    title: 'Community Insights',
    description: 'See what millions of fans are predicting. Who does the crowd favor to win? Find out with live stats.',
  },
  {
    icon: Share2,
    color: '#f59e0b',
    title: 'Share Your Predictions',
    description: 'Generate a stunning prediction card and share it on WhatsApp, X, Facebook, and Instagram Stories.',
  },
  {
    icon: Shield,
    color: '#ef4444',
    title: 'Smart Lock System',
    description: 'Predictions lock 1 hour before kickoff, keeping the game fair. Edit freely until the whistle gets close.',
  },
]

export default function FeaturesSection() {
  return (
    <section style={{ padding: '80px 24px', position: 'relative' }}>
      <div className="container-app">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="badge badge-muted" style={{ marginBottom: 16, display: 'inline-flex' }}>
            Everything you need
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              marginBottom: 16,
              color: 'var(--color-text)',
            }}
          >
            The ultimate fan
            <span style={{ color: 'var(--color-gold)' }}> experience</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
            Everything fans need to engage with the World Cup — from the first whistle to the trophy lift.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 24,
          }}
        >
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="card card-hover animate-slide-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>
                  {f.title}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {f.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
