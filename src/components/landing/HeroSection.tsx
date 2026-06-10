'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Trophy, ChevronRight, Star, Users, Zap } from 'lucide-react'

function CountdownTimer() {
  const target = new Date('2026-06-11T17:00:00Z').getTime()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
      ].map(({ label, value }) => (
        <div
          key={label}
          style={{
            textAlign: 'center',
            minWidth: 80,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 16,
            padding: '16px 20px',
          }}
        >
          <div
            className="font-display"
            style={{ fontSize: '2.5rem', color: 'var(--color-gold)', lineHeight: 1 }}
          >
            {String(value).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HeroSection() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orbs */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '20%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto' }}>
        {/* Badge */}
        <div
          className="badge badge-gold animate-fade-in"
          style={{ marginBottom: 24, fontSize: '0.8rem', padding: '6px 16px' }}
        >
          <Star size={12} /> FIFA World Cup 2026 • USA | Canada | Mexico
        </div>

        {/* Trophy icon */}
        <div className="animate-float" style={{ marginBottom: 32 }}>
          <div
            style={{
              width: 100,
              height: 100,
              margin: '0 auto',
              borderRadius: 28,
              background: 'var(--gradient-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 60px rgba(245,158,11,0.4)',
            }}
          >
            <Trophy size={52} color="#0a0e1a" strokeWidth={2} />
          </div>
        </div>

        {/* Headline */}
        <h1
          className="font-display animate-slide-up"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            lineHeight: 1.05,
            marginBottom: 24,
            background: 'linear-gradient(135deg, #ffffff 0%, var(--color-gold) 60%, #fbbf24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Predict the
          <br />
          World Cup
        </h1>

        <p
          className="animate-slide-up delay-100"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
            marginBottom: 40,
            maxWidth: 560,
            margin: '0 auto 40px',
          }}
        >
          Predict every match score, bet on the champion, compete on global leaderboards,
          and share your predictions with the world.
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-slide-up delay-200 flex-responsive"
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}
        >
          <Link href="/register" className="btn btn-primary btn-lg" style={{ minWidth: 200 }}>
            Start Predicting Free
            <ChevronRight size={18} />
          </Link>
          <Link href="/stats" className="btn btn-secondary btn-lg">
            View Live Stats
          </Link>
        </div>

        {/* Social proof */}
        <div
          className="animate-slide-up delay-300 flex-responsive"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem',
            marginBottom: 64,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} style={{ color: 'var(--color-gold)' }} />
            <span>Join thousands of fans</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} style={{ color: 'var(--color-green)' }} />
            <span>Real-time leaderboards</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={16} style={{ color: 'var(--color-gold)' }} />
            <span>48 teams • 104 matches</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="animate-slide-up delay-400">
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Tournament kicks off in
          </p>
          <CountdownTimer />
        </div>
      </div>
    </section>
  )
}
