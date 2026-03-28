#!/usr/bin/env node

/**
 * FRANKENSTEIN — Archive Script
 * 
 * Archives the current season and resets App.jsx to a blank canvas.
 * Run this at the end of each 30-day season.
 *
 * Usage:
 *   node scripts/archive.mjs
 */

import { readFileSync, writeFileSync, cpSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const APP_PATH = resolve(ROOT, 'src/App.jsx')
const LOG_DIR = resolve(ROOT, 'evolution-log')
const ARCHIVE_DIR = resolve(ROOT, 'archive')

function getSeasonNumber() {
  if (!existsSync(ARCHIVE_DIR)) return 1
  const existing = require('fs').readdirSync(ARCHIVE_DIR)
    .filter(d => d.startsWith('season-'))
    .map(d => parseInt(d.replace('season-', ''), 10))
    .filter(n => !isNaN(n))
  return existing.length > 0 ? Math.max(...existing) + 1 : 1
}

function archive() {
  const season = getSeasonNumber()
  const seasonDir = resolve(ARCHIVE_DIR, `season-${season}`)

  console.log(`📦 Archiving Season ${season}...`)

  // Create archive directory
  mkdirSync(seasonDir, { recursive: true })

  // Copy current App.jsx
  const finalCode = readFileSync(APP_PATH, 'utf-8')
  writeFileSync(resolve(seasonDir, 'App.final.jsx'), finalCode, 'utf-8')

  // Copy evolution log
  if (existsSync(LOG_DIR)) {
    cpSync(LOG_DIR, resolve(seasonDir, 'evolution-log'), { recursive: true })
  }

  // Write season metadata
  const meta = {
    season,
    archivedAt: new Date().toISOString(),
    totalDays: (() => {
      const match = finalCode.match(/Day\s+(\d+)/)
      return match ? parseInt(match[1], 10) : 0
    })(),
  }
  writeFileSync(resolve(seasonDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8')

  console.log(`   Saved to: ${seasonDir}`)

  // Reset App.jsx for next season
  const nextSeason = season + 1
  const blankApp = `import { useState, useEffect } from 'react'

/*
 * FRANKENSTEIN — Season ${nextSeason}
 * A self-building web application.
 * This file is the living organism. The AI reads it, modifies it, and deploys it.
 * Every feature below this line was added autonomously.
 *
 * Day 0 — The blank page. Frankenstein is reborn.
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
        <p style={styles.subtitle}>Season ${nextSeason} · Day 0</p>
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
`

  // Clear evolution log
  if (existsSync(LOG_DIR)) {
    const logFiles = require('fs').readdirSync(LOG_DIR)
    logFiles.forEach(f => {
      require('fs').unlinkSync(resolve(LOG_DIR, f))
    })
  }

  writeFileSync(APP_PATH, blankApp, 'utf-8')
  console.log(`   App.jsx reset for Season ${nextSeason}`)
  console.log('')
  console.log(`✅ Season ${season} archived. Frankenstein is dead. Long live Frankenstein.`)
}

archive()
