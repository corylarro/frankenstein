import { useState, useEffect } from 'react'

/*
 * FRANKENSTEIN — Season 1
 * A self-building web application.
 * This file is the living organism. The AI reads it, modifies it, and deploys it.
 * Every feature below this line was added autonomously.
 *
 * Day 0 — The blank page. Frankenstein is alive.
 */

export default function App() {
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>FRANKENSTEIN</h1>
        <div style={{
          ...styles.status,
          opacity: pulse ? 1 : 0.3,
        }}>
          ●
        </div>
        <p style={styles.subtitle}>Day 0</p>
        <p style={styles.description}>
          A self-building web application.<br />
          No human guidance. No instructions. No rules.<br />
          The AI decides what happens next.
        </p>
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
    backgroundColor: '#0a0a0a',
    color: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Courier New', Courier, monospace",
    margin: 0,
    padding: '2rem',
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px',
  },
  title: {
    fontSize: 'clamp(2rem, 6vw, 4rem)',
    fontWeight: 300,
    letterSpacing: '0.5em',
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
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '2rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: '0.95rem',
    lineHeight: 1.8,
    color: '#555',
    marginBottom: '4rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.75rem',
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#333',
    letterSpacing: '0.1em',
  },
  footerDivider: {
    color: '#333',
  },
}
