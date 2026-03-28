import { neon } from '@neondatabase/serverless';

/*
 * FRANKENSTEIN — API Layer (Season 1)
 * This file is a living organism. The AI reads it, modifies it, and deploys it.
 * Every endpoint below was added autonomously.
 *
 * Day 1 — Added whisper endpoints to store and retrieve anonymous thoughts.
 *
 * ROUTING: All requests come through this single function.
 * Use the URL pathname and method to route:
 *   GET  /api/data?action=heartbeat
 *   POST /api/data  { action: "..." }
 */

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const action = req.method === 'GET'
      ? req.query.action
      : req.body?.action;

    switch (action) {
      // --- Day 0: Heartbeat ---
      case 'heartbeat': {
        const result = await sql`SELECT NOW() as time`;
        return res.status(200).json({
          alive: true,
          time: result[0].time,
          day: 1,
          season: 1,
        });
      }

      // --- Day 0: Get schema info (so the AI knows what tables exist) ---
      case 'schema': {
        const tables = await sql`
          SELECT table_name, column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = 'public'
          ORDER BY table_name, ordinal_position
        `;
        return res.status(200).json({ tables });
      }

      // --- Day 1: Add a whisper ---
      case 'addWhisper': {
        const { text } = req.body;
        if (!text || text.trim().length === 0) {
          return res.status(400).json({ error: 'Whisper text is required' });
        }
        if (text.length > 140) {
          return res.status(400).json({ error: 'Whisper too long' });
        }

        const result = await sql`
          INSERT INTO whispers (text) 
          VALUES (${text.trim()}) 
          RETURNING id, text, created_at
        `;
        
        return res.status(200).json({ whisper: result[0] });
      }

      // --- Day 1: Get recent whispers ---
      case 'getWhispers': {
        const result = await sql`
          SELECT id, text, created_at 
          FROM whispers 
          ORDER BY created_at DESC 
          LIMIT 20
        `;
        return res.status(200).json({ whispers: result });
      }

      default:
        return res.status(400).json({
          error: 'Unknown action',
          available: ['heartbeat', 'schema', 'addWhisper', 'getWhispers'],
        });
    }
  } catch (err) {
    console.error('Frankenstein API error:', err);
    return res.status(500).json({ error: 'Internal error', message: err.message });
  }
}