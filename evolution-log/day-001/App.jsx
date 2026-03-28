import { useState, useEffect } from 'react'

/*
 * FRANKENSTEIN — Season 1
 * A self-building web application.
 * This file is the living organism. The AI reads it, modifies it, and deploys it.
 * Every feature below this line was added autonomously.
 *
 * Day 1 — Added a "Whisper into the Void" feature where visitors can anonymously submit thoughts that float across the screen like digital ghosts.
 */

export default function App() {
  const [pulse, setPulse] = useState(true)
  const [whispers, setWhispers] = useState([])
  const [whisperText, setWhisperText] = useState('')
  const [showWhisperForm, setShowWhisperForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Load existing whispers
    fetch('/api/data?action=getWhispers')
      .then(res => res.json())
      .then(data => {
        if (data.whispers) {
          setWhispers(data.whispers.map(w => ({
            ...w,
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20,
            opacity: 0.7,
            drift: Math.random() * 2 - 1
          })))
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    // Animate whispers
    const interval = setInterval(() => {
      setWhispers(prev => prev.map(whisper => ({
        ...whisper,
        x: (whisper.x + whisper.drift * 0.1 + 100) % 100,
        opacity: Math.sin(Date.now() * 0.001 + whisper.id) * 0.3 + 0.4
      })))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const submitWhisper = async () => {
    if (!whisperText.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'addWhisper', 
          text: whisperText.trim() 
        })
      })
      const data = await response.json()
      
      if (data.whisper) {
        const newWhisper = {
          ...data.whisper,
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20,
          opacity: 0.7,
          drift: Math.random() * 2 - 1
        }
        setWhispers(prev => [...prev, newWhisper])
        setWhisperText('')
        setShowWhisperForm(false)
      }
    } catch (error) {
      console.error('Failed to submit whisper:', error)
    }
    setIsSubmitting(false)
  }

  return (
    <div style={styles.container}>
      {/* Floating whispers */}
      {whispers.map(whisper => (
        <div
          key={whisper.id}
          style={{
            ...styles.whisper,
            left: `${whisper.x}%`,
            top: `${whisper.y}%`,
            opacity: whisper.opacity
          }}
        >
          {whisper.text}
        </div>
      ))}

      <div style={styles.content}>
        <h1 style={styles.title}>FRANKENSTEIN</h1>
        <div style={{
          ...styles.status,
          opacity: pulse ? 1 : 0.3,
        }}>
          ●
        </div>
        <p style={styles.subtitle}>Day 1</p>
        <p style={styles.description}>
          A self-building web application.<br />
          No human guidance. No instructions. No rules.<br />
          The AI decides what happens next.
        </p>

        {/* Whisper feature */}
        <div style={styles.whisperSection}>
          {!showWhisperForm ? (
            <button
              onClick={() => setShowWhisperForm(true)}
              style={styles.whisperButton}
            >
              whisper into the void
            </button>
          ) : (
            <div style={styles.whisperForm}>
              <textarea
                value={whisperText}
                onChange={(e) => setWhisperText(e.target.value)}
                placeholder="share a thought, fear, dream, or secret..."
                style={styles.whisperInput}
                maxLength={140}
                autoFocus
              />
              <div style={styles.whisperActions}>
                <button
                  onClick={submitWhisper}
                  disabled={!whisperText.trim() || isSubmitting}
                  style={{
                    ...styles.whisperSubmit,
                    opacity: (!whisperText.trim() || isSubmitting) ? 0.5 : 1
                  }}
                >
                  {isSubmitting ? 'releasing...' : 'release'}
                </button>
                <button
                  onClick={() => {
                    setShowWhisperForm(false)
                    setWhisperText('')
                  }}
                  style={styles.whisperCancel}
                >
                  nevermind
                </button>
              </div>
              <div style={styles.whisperCounter}>
                {whisperText.length}/140
              </div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <span style={styles.footerText}>frankenstein.today</span>
          <span style={styles.footerDivider}>·</span>
          <span style={styles.footerText}>@FrankenToday</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#0a0a0a',
    color: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Courier New', Courier, monospace",
    margin: 0,
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  title: {
    fontSize: 'clamp(1.3rem, 4.5vw, 4rem)',
    fontWeight: 300,
    letterSpacing: 'clamp(0.12em, 1.5vw, 0.5em)',
    paddingLeft: 'clamp(0.12em, 1.5vw, 0.5em)',
    marginBottom: '1rem',
    color: '#ffffff',
  },
  status: {
    fontSize: '1.5rem',
    color: '#00ff41',
    marginBottom: '2rem',
    transition: 'opacity 1s ease-in-out',
  },
  subtitle: {
    fontSize: 'clamp(0.85rem, 2.5vw, 1.2rem)',
    color: '#888',
    marginBottom: '2rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 'clamp(0.75rem, 2.2vw, 0.95rem)',
    lineHeight: 1.8,
    color: '#777',
    marginBottom: '3rem',
    padding: '0 0.5rem',
  },
  whisperSection: {
    marginBottom: '4rem',
  },
  whisperButton: {
    background: 'transparent',
    border: '1px solid #333',
    color: '#888',
    padding: '0.8rem 1.5rem',
    fontSize: '0.8rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    textTransform: 'lowercase',
  },
  whisperForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
  whisperInput: {
    background: 'transparent',
    border: '1px solid #333',
    color: '#e0e0e0',
    padding: '1rem',
    width: '100%',
    maxWidth: '400px',
    height: '80px',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
  },
  whisperActions: {
    display: 'flex',
    gap: '1rem',
  },
  whisperSubmit: {
    background: 'transparent',
    border: '1px solid #555',
    color: '#bbb',
    padding: '0.5rem 1rem',
    fontSize: '0.7rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.1em',
  },
  whisperCancel: {
    background: 'transparent',
    border: '1px solid #333',
    color: '#666',
    padding: '0.5rem 1rem',
    fontSize: '0.7rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.1em',
  },
  whisperCounter: {
    fontSize: '0.6rem',
    color: '#555',
  },
  whisper: {
    position: 'absolute',
    fontSize: '0.7rem',
    color: '#444',
    maxWidth: '200px',
    pointerEvents: 'none',
    transition: 'opacity 0.1s ease',
    lineHeight: 1.4,
    textShadow: '0 0 10px rgba(68,68,68,0.5)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.75rem',
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#555',
    letterSpacing: '0.1em',
  },
  footerDivider: {
    color: '#555',
  },
}