'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface AvatarModalProps {
  avatarUrl?: string | null
  initials: string
}

export default function AvatarModal({ avatarUrl, initials }: AvatarModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // We only allow opening the modal if there is an actual avatar image
  const handleClick = () => {
    if (avatarUrl) {
      setIsOpen(true)
    }
  }

  const modalContent = isOpen && avatarUrl ? (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, cursor: 'zoom-out'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div 
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setIsOpen(false)}
          className="btn btn-ghost btn-icon"
          style={{ position: 'absolute', top: -50, right: -10, color: '#fff', background: 'rgba(255,255,255,0.1)' }}
        >
          <X size={24} />
        </button>
        <img 
          src={avatarUrl} 
          alt="Profile avatar" 
          style={{ 
            width: '90vw',
            maxWidth: 400,
            aspectRatio: '1 / 1',
            objectFit: 'cover', 
            borderRadius: '50%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            border: '4px solid var(--color-border)',
            background: 'var(--color-background)'
          }} 
        />
      </div>
    </div>
  ) : null

  return (
    <>
      <div 
        onClick={handleClick}
        style={{ 
          width: 120, height: 120, borderRadius: '50%', marginBottom: 24, 
          background: 'rgba(255,255,255,0.05)', border: '4px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', fontWeight: 800, overflow: 'hidden',
          cursor: avatarUrl ? 'pointer' : 'default',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => {
          if (avatarUrl) e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          if (avatarUrl) e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {avatarUrl 
          ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials
        }
      </div>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  )
}
