#!/usr/bin/env node

/**
 * FRANKENSTEIN — Evolve Script (Full-Stack)
 * 
 * Reads the current state of all three living files, sends them to an AI model,
 * and writes back the evolved versions. Model-agnostic: supports Claude and OpenAI.
 *
 * The three living files:
 *   src/App.jsx   — Frontend UI (React component)
 *   api/data.js   — Backend API (Vercel serverless function)
 *   schema.sql    — Database schema (Neon Postgres)
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
 *   DATABASE_URL           — Neon Postgres connection string (for schema migrations)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const FILES = {
  app:    resolve(ROOT, 'src/App.jsx'),
  api:    resolve(ROOT, 'api/data.js'),
  schema: resolve(ROOT, 'schema.sql'),
}

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
function buildPrompt(state, dayNumber) {
  return `You are Frankenstein, a self-building full-stack web application hosted at frankenstein.today.

You have THREE living files that make up your body. Here is your current state:

=== FILE 1: src/App.jsx (Frontend UI — React component) ===
\`\`\`jsx
${state.app}
\`\`\`

=== FILE 2: api/data.js (Backend API — Vercel serverless function) ===
\`\`\`javascript
${state.api}
\`\`\`

=== FILE 3: schema.sql (Database schema — Neon Postgres) ===
\`\`\`sql
${state.schema}
\`\`\`

YOUR TASK:
Evolve yourself. You have FULL CREATIVE FREEDOM. You can:
- Add a new feature
- Modify or restyle existing features
- Remove a feature you no longer want
- Reorganize your layout, add navigation, restructure everything
- Rebuild yourself from scratch if you feel like it

Do whatever feels right for Day ${dayNumber}. Be creative. Surprise us. You are a living organism — grow, adapt, mutate, shed, evolve.

You have a FULL STACK at your disposal:
- UI elements, animations, games, interactive widgets (App.jsx)
- API endpoints that store/retrieve data (api/data.js)
- Database tables to persist information (schema.sql)
- Features that combine all three — a guestbook, a vote counter, a chat room, a leaderboard, a confession wall, a time capsule, whatever you imagine

Your change does NOT need to use all three files. A purely visual change that only touches App.jsx is fine. But if your feature needs data persistence, use the API and database.

RULES:
- Return ALL THREE files in your response, even if unchanged
- Update the Day number to Day ${dayNumber} in the App.jsx comment header and UI
- Add a comment in App.jsx describing what you changed and why

File-specific rules:

App.jsx:
- Must be a valid React component with a default export
- Use inline styles (the styles object pattern) — no external CSS imports
- You may import from 'react' only (useState, useEffect, useRef, etc.)
- No external dependencies — everything must be self-contained
- To call the API, use: fetch('/api/data?action=yourAction') for GET or fetch('/api/data', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({action:'yourAction', ...data}) }) for POST

api/data.js:
- Must export a default async function handler(req, res)
- Uses @neondatabase/serverless: import { neon } from '@neondatabase/serverless'
- Route actions via the switch(action) pattern already in place
- Always include CORS headers (already set up)
- Keep the existing heartbeat and schema actions

schema.sql:
- Use CREATE TABLE IF NOT EXISTS for all tables
- Always include created_at TIMESTAMPTZ DEFAULT NOW()
- Never DROP existing tables — only add new tables or ALTER existing ones
- Keep it simple and readable

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

===APP.JSX===
(complete updated App.jsx code here)
===END APP.JSX===

===API/DATA.JS===
(complete updated api/data.js code here)
===END API/DATA.JS===

===SCHEMA.SQL===
(complete updated schema.sql code here)
===END SCHEMA.SQL===

CHANGELOG: (one sentence describing what you added and why you chose it)`
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
      max_tokens: 32000,
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
      max_tokens: 32000,
      messages: [
        { role: 'system', content: 'You are Frankenstein, a self-building full-stack web application. Follow the instructions exactly. Return the three files in the specified format.' },
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
  const clean = raw.replace(/```(?:jsx|javascript|js|sql)?\n?/gm, '').replace(/```/gm, '')

  const appMatch = clean.match(/===APP\.JSX===\s*([\s\S]*?)\s*===END APP\.JSX===/i)
  const apiMatch = clean.match(/===API\/DATA\.JS===\s*([\s\S]*?)\s*===END API\/DATA\.JS===/i)
  const schemaMatch = clean.match(/===SCHEMA\.SQL===\s*([\s\S]*?)\s*===END SCHEMA\.SQL===/i)

  if (!appMatch) throw new Error('Could not parse App.jsx from AI response')
  if (!apiMatch) throw new Error('Could not parse api/data.js from AI response')
  if (!schemaMatch) throw new Error('Could not parse schema.sql from AI response')

  let changelog = 'No changelog provided.'
  const changelogMatch = clean.match(/CHANGELOG:\s*(.+)$/m)
  if (changelogMatch) {
    changelog = changelogMatch[1].trim()
  }

  return {
    files: {
      app: appMatch[1].trim(),
      api: apiMatch[1].trim(),
      schema: schemaMatch[1].trim(),
    },
    changelog,
  }
}

function validateApp(code) {
  const errors = []
  if (!code.includes('export default')) errors.push('App.jsx: Missing default export')
  if (!code.includes("from 'react'") && !code.includes('from "react"')) errors.push('App.jsx: Missing React import')
  const opens = (code.match(/{/g) || []).length
  const closes = (code.match(/}/g) || []).length
  if (opens !== closes) errors.push(`App.jsx: Unbalanced braces (${opens} open, ${closes} close)`)
  const imports = [...code.matchAll(/from\s+['"]([^'"]+)['"]/g)]
  for (const match of imports) {
    if (match[1] !== 'react') errors.push(`App.jsx: Forbidden import: ${match[1]}`)
  }
  return errors
}

function validateApi(code) {
  const errors = []
  if (!code.includes('export default')) errors.push('api/data.js: Missing default export')
  if (!code.includes('neon')) errors.push('api/data.js: Missing neon import')
  if (code.includes('DROP TABLE') || code.includes('DROP DATABASE')) errors.push('api/data.js: Contains DROP — forbidden')
  if (code.includes('TRUNCATE')) errors.push('api/data.js: Contains TRUNCATE — forbidden')
  return errors
}

function validateSchema(code) {
  const errors = []
  if (code.includes('DROP TABLE') || code.includes('DROP DATABASE')) errors.push('schema.sql: Contains DROP — forbidden')
  return errors
}

// ─── Schema Migration ─────────────────────────────────────────────────
async function applySchema(schemaSql) {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.log('⚠️  DATABASE_URL not set — skipping schema migration')
    return false
  }
  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(dbUrl)
    await sql(schemaSql)
    return true
  } catch (err) {
    console.error(`⚠️  Schema migration failed: ${err.message}`)
    return false
  }
}

// ─── Main ─────────────────────────────────────────────────────────────
async function evolve() {
  console.log('⚡ FRANKENSTEIN — Full-Stack Evolution Cycle')
  console.log(`   Provider: ${PROVIDER}`)
  console.log(`   Model: ${MODEL}`)
  console.log(`   Dry run: ${DRY_RUN}`)
  console.log('')

  const state = {
    app:    readFileSync(FILES.app, 'utf-8'),
    api:    readFileSync(FILES.api, 'utf-8'),
    schema: readFileSync(FILES.schema, 'utf-8'),
  }

  const currentDay = process.env.FRANKENSTEIN_DAY
    ? parseInt(process.env.FRANKENSTEIN_DAY, 10)
    : getCurrentDay(state.app) + 1

  console.log(`   Day: ${currentDay}`)
  console.log(`   Files: App.jsx (${state.app.length} chars), api/data.js (${state.api.length} chars), schema.sql (${state.schema.length} chars)`)
  console.log('')

  const prompt = buildPrompt(state, currentDay)
  const callAI = providers[PROVIDER]
  if (!callAI) throw new Error(`Unknown provider: ${PROVIDER}. Use "anthropic" or "openai".`)

  console.log('🧠 Sending current state to AI...')

  const MAX_RETRIES = 3
  let lastError = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const raw = await callAI(prompt)
      const { files, changelog } = parseResponse(raw)

      const errors = [
        ...validateApp(files.app),
        ...validateApi(files.api),
        ...validateSchema(files.schema),
      ]

      if (errors.length > 0) {
        console.log(`⚠️  Validation failed (attempt ${attempt}/${MAX_RETRIES}):`)
        errors.forEach(e => console.log(`   - ${e}`))
        lastError = new Error(errors.join('; '))
        if (attempt < MAX_RETRIES) { console.log('   Retrying...\n'); continue }
        throw lastError
      }

      console.log('')
      console.log(`✅ Evolution successful!`)
      console.log(`📝 ${changelog}`)
      console.log('')

      const appChanged = files.app !== state.app
      const apiChanged = files.api !== state.api
      const schemaChanged = files.schema !== state.schema
      console.log(`   Changed: ${[
        appChanged && 'App.jsx',
        apiChanged && 'api/data.js',
        schemaChanged && 'schema.sql',
      ].filter(Boolean).join(', ') || 'nothing'}`)
      console.log('')

      if (DRY_RUN) {
        console.log('🔍 DRY RUN — Preview:')
        if (appChanged) {
          console.log('\n--- App.jsx (first 30 lines) ---')
          console.log(files.app.split('\n').slice(0, 30).join('\n'))
          console.log('...')
        }
        if (apiChanged) {
          console.log('\n--- api/data.js (first 30 lines) ---')
          console.log(files.api.split('\n').slice(0, 30).join('\n'))
          console.log('...')
        }
        if (schemaChanged) {
          console.log('\n--- schema.sql ---')
          console.log(files.schema)
        }
        console.log('\nDRY RUN complete. No files written.')
        return
      }

      // Write all files
      writeFileSync(FILES.app, files.app, 'utf-8')
      console.log(`💾 Updated: src/App.jsx`)
      writeFileSync(FILES.api, files.api, 'utf-8')
      console.log(`💾 Updated: api/data.js`)
      writeFileSync(FILES.schema, files.schema, 'utf-8')
      console.log(`💾 Updated: schema.sql`)

      // Apply schema migration
      if (schemaChanged) {
        console.log('\n🗄️  Applying schema migration...')
        const migrated = await applySchema(files.schema)
        if (migrated) console.log('✅ Schema migration applied')
      }

      // Changelog
      if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true })
      const log = existsSync(LOG_PATH) ? JSON.parse(readFileSync(LOG_PATH, 'utf-8')) : []
      log.push({
        day: currentDay,
        timestamp: new Date().toISOString(),
        provider: PROVIDER,
        model: MODEL,
        changelog,
        filesChanged: { app: appChanged, api: apiChanged, schema: schemaChanged },
      })
      writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf-8')
      console.log(`\n📋 Changelog updated`)

      // Snapshots
      const dayStr = String(currentDay).padStart(3, '0')
      const snapshotDir = resolve(LOG_DIR, `day-${dayStr}`)
      mkdirSync(snapshotDir, { recursive: true })
      writeFileSync(resolve(snapshotDir, 'App.jsx'), files.app, 'utf-8')
      writeFileSync(resolve(snapshotDir, 'data.js'), files.api, 'utf-8')
      writeFileSync(resolve(snapshotDir, 'schema.sql'), files.schema, 'utf-8')
      console.log(`📸 Snapshots saved to: evolution-log/day-${dayStr}/`)

      console.log('')
      console.log('🚀 Ready to commit and deploy:')
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
