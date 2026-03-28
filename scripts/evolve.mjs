#!/usr/bin/env node

/**
 * FRANKENSTEIN — Evolve Script
 * 
 * Reads the current App.jsx, sends it to an AI model, and writes back
 * the evolved version. Model-agnostic: supports Claude and OpenAI.
 *
 * Usage:
 *   node scripts/evolve.mjs                  # Run evolution
 *   node scripts/evolve.mjs --dry-run        # Preview without writing
 *   node scripts/evolve.mjs --model gpt-4o   # Override model
 *
 * Environment variables:
 *   FRANKENSTEIN_PROVIDER  — "anthropic" or "openai" (default: "anthropic")
 *   FRANKENSTEIN_MODEL     — model name override
 *   ANTHROPIC_API_KEY      — required if provider is anthropic
 *   OPENAI_API_KEY         — required if provider is openai
 *   FRANKENSTEIN_DAY       — current day number (auto-incremented if not set)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const APP_PATH = resolve(ROOT, 'src/App.jsx')
const LOG_DIR = resolve(ROOT, 'evolution-log')
const LOG_PATH = resolve(LOG_DIR, 'changelog.json')

// ─── Config ───────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const MODEL_OVERRIDE = args.find((_, i, a) => a[i - 1] === '--model')

const PROVIDER = process.env.FRANKENSTEIN_PROVIDER || 'anthropic'
const MODEL = MODEL_OVERRIDE
  || process.env.FRANKENSTEIN_MODEL
  || (PROVIDER === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gpt-4o')

const API_KEYS = {
  anthropic: process.env.ANTHROPIC_API_KEY,
  openai: process.env.OPENAI_API_KEY,
}

// ─── The Prompt ───────────────────────────────────────────────────────
function buildPrompt(currentCode, dayNumber) {
  return `You are Frankenstein, a self-building web application hosted at frankenstein.today.

Here is your current source code (a single React component, App.jsx):

\`\`\`jsx
${currentCode}
\`\`\`

YOUR TASK:
Add exactly ONE new feature to yourself. You choose what it is. It can be anything — useful, useless, weird, beautiful, interactive, or chaotic. Be creative. Surprise us.

RULES:
- Return ONLY the complete updated App.jsx file, nothing else
- Keep ALL existing features intact — you are adding to yourself, not replacing
- The file must be a valid React component with a default export
- Use inline styles (the \`styles\` object pattern already in the code) — no external CSS
- You may import from 'react' only (useState, useEffect, useRef, etc.)
- No external dependencies — everything must be self-contained
- Update the Day number in the comment header and in the UI to Day ${dayNumber}
- Add a comment above your new feature describing what you added

RESPOND WITH ONLY THE COMPLETE UPDATED CODE. No markdown fences. No explanation outside the code. Just the raw JSX file.

After the code, on a new line, write:
CHANGELOG: [one sentence describing what you added and why you chose it]`
}

// ─── API Adapters ─────────────────────────────────────────────────────
async function callAnthropic(prompt) {
  const apiKey = API_KEYS.anthropic
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error (${res.status}): ${err}`)
  }

  const data = await res.json()
  return data.content[0].text
}

async function callOpenAI(prompt) {
  const apiKey = API_KEYS.openai
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      messages: [
        { role: 'system', content: 'You are Frankenstein, a self-building web application. Follow the instructions exactly. Return only code.' },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error (${res.status}): ${err}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}

const providers = { anthropic: callAnthropic, openai: callOpenAI }

// ─── Helpers ──────────────────────────────────────────────────────────
function getCurrentDay(code) {
  const match = code.match(/Day\s+(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

function parseResponse(raw) {
  // Strip markdown code fences if present
  let code = raw.replace(/^```(?:jsx|javascript|js)?\n?/gm, '').replace(/```\s*$/gm, '')

  // Extract changelog
  let changelog = 'No changelog provided.'
  const changelogMatch = code.match(/CHANGELOG:\s*(.+)$/m)
  if (changelogMatch) {
    changelog = changelogMatch[1].trim()
    code = code.substring(0, changelogMatch.index).trim()
  }

  return { code, changelog }
}

function validateCode(code) {
  const errors = []

  if (!code.includes('export default')) {
    errors.push('Missing default export')
  }
  if (!code.includes("from 'react'") && !code.includes('from "react"')) {
    errors.push('Missing React import')
  }

  // Check for balanced braces (rough check)
  const opens = (code.match(/{/g) || []).length
  const closes = (code.match(/}/g) || []).length
  if (opens !== closes) {
    errors.push(`Unbalanced braces: ${opens} open, ${closes} close`)
  }

  // Check for forbidden imports
  const imports = [...code.matchAll(/from\s+['"]([^'"]+)['"]/g)]
  for (const match of imports) {
    if (match[1] !== 'react') {
      errors.push(`Forbidden import: ${match[1]} — only 'react' is allowed`)
    }
  }

  return errors
}

// ─── Main ─────────────────────────────────────────────────────────────
async function evolve() {
  console.log('⚡ FRANKENSTEIN — Evolution Cycle')
  console.log(`   Provider: ${PROVIDER}`)
  console.log(`   Model: ${MODEL}`)
  console.log(`   Dry run: ${DRY_RUN}`)
  console.log('')

  // Read current state
  const currentCode = readFileSync(APP_PATH, 'utf-8')
  const currentDay = process.env.FRANKENSTEIN_DAY
    ? parseInt(process.env.FRANKENSTEIN_DAY, 10)
    : getCurrentDay(currentCode) + 1

  console.log(`   Current day: ${currentDay}`)
  console.log('')

  // Build prompt and call AI
  const prompt = buildPrompt(currentCode, currentDay)
  const callAI = providers[PROVIDER]
  if (!callAI) throw new Error(`Unknown provider: ${PROVIDER}. Use "anthropic" or "openai".`)

  console.log('🧠 Sending current state to AI...')

  const MAX_RETRIES = 3
  let lastError = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const raw = await callAI(prompt)
      const { code, changelog } = parseResponse(raw)

      // Validate
      const errors = validateCode(code)
      if (errors.length > 0) {
        console.log(`⚠️  Validation failed (attempt ${attempt}/${MAX_RETRIES}):`)
        errors.forEach(e => console.log(`   - ${e}`))
        lastError = new Error(errors.join('; '))
        if (attempt < MAX_RETRIES) {
          console.log('   Retrying...\n')
          continue
        }
        throw lastError
      }

      // Success
      console.log('')
      console.log(`✅ Evolution successful!`)
      console.log(`📝 ${changelog}`)
      console.log('')

      if (DRY_RUN) {
        console.log('🔍 DRY RUN — Code preview (first 50 lines):')
        console.log(code.split('\n').slice(0, 50).join('\n'))
        console.log('...')
        console.log('')
        console.log('DRY RUN complete. No files written.')
        return
      }

      // Write updated App.jsx
      writeFileSync(APP_PATH, code, 'utf-8')
      console.log(`💾 Updated: ${APP_PATH}`)

      // Append to changelog
      if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true })
      const log = existsSync(LOG_PATH)
        ? JSON.parse(readFileSync(LOG_PATH, 'utf-8'))
        : []
      log.push({
        day: currentDay,
        timestamp: new Date().toISOString(),
        provider: PROVIDER,
        model: MODEL,
        changelog,
      })
      writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf-8')
      console.log(`📋 Changelog updated: ${LOG_PATH}`)

      // Save snapshot
      const snapshotPath = resolve(LOG_DIR, `day-${String(currentDay).padStart(3, '0')}.jsx`)
      writeFileSync(snapshotPath, code, 'utf-8')
      console.log(`📸 Snapshot saved: ${snapshotPath}`)

      console.log('')
      console.log('🚀 Ready to commit and deploy.')
      console.log(`   git add -A && git commit -m "Day ${currentDay}: ${changelog}" && git push`)

      return

    } catch (err) {
      lastError = err
      if (attempt < MAX_RETRIES) {
        console.log(`❌ Attempt ${attempt} failed: ${err.message}`)
        console.log('   Retrying...\n')
      }
    }
  }

  console.error(`\n💀 Evolution failed after ${MAX_RETRIES} attempts.`)
  console.error(`   Last error: ${lastError?.message}`)
  process.exit(1)
}

evolve()
