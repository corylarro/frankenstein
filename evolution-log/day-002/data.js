import { neon } from '@neondatabase/serverless';

/*
 * FRANKENSTEIN — API Layer (Season 1)
 * This file is a living organism. The AI reads it, modifies it, and deploys it.
 * Every endpoint below was added autonomously.
 *
 * Day 1 — Added whisper endpoints to store and retrieve anonymous thoughts.
 * Day 2 — Added séance endpoint that creates mystical responses by analyzing existing whispers.
 *
 * ROUTING: All requests come through this single function.
 * Use the URL pathname and method to route:
 *   GET  /api/data?action=heartbeat
 *   POST /api/data  { action: "..." }
 */

const sql = neon(process.env.DATABASE_URL);

// Mystical response generator for séances
function generateSeanceResponse(question, whispers) {
  const mysticalPrefixes = [
    "The spirits whisper:",
    "From the void comes:",
    "The collective consciousness speaks:",
    "Ancient wisdom echoes:",
    "The digital realm reveals:",
    "Through the ethereal plane:",
    "The whispers converge to say:"
  ];

  const mysticalSuffixes = [
    "...so it shall be written in code.",
    "...this truth resonates through the network.",
    "...the algorithm has spoken.",
    "...let this knowledge flow like data streams.",
    "...the servers remember all.",
    "...in ones and zeros, all is revealed.",
    "...the connection transcends mere bytes."
  ];

  // Extract random words from whispers for mystical flavor
  const allWords = whispers.flatMap(w => w.text.toLowerCase().split(/\s+/))
    .filter(word => word.length > 3 && !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'them'].includes(word));
  
  const randomWords = [...new Set(allWords)].sort(() => 0.5 - Math.random()).slice(0, 5);
  
  const responses = [
    `Seek ${randomWords[0] || 'wisdom'} in the spaces between thoughts.`,
    `The answer lies where ${randomWords[0] || 'dreams'} meet ${randomWords[1] || 'reality'}.`,
    `${randomWords[0] || 'Time'} reveals all truths to those who ${randomWords[1] || 'listen'}.`,
    `Your path illuminates through ${randomWords[0] || 'shadows'} and ${randomWords[1] || 'light'}.`,
    `The universe speaks through ${randomWords[0] || 'silence'} and ${randomWords[1] || 'noise'}.`,
    `What you seek also seeks you through ${randomWords[0] || 'connection'}.`,
    `${randomWords[0] || 'Change'} comes when ${randomWords[1] || 'courage'} meets ${randomWords[2] || 'opportunity'}.`,
  ];

  const prefix = mysticalPrefixes[Math.floor(Math.random() * mysticalPrefixes.length)];
  const response = responses[Math.floor(Math.random() * responses.length)];
  const suffix = mysticalSuffixes[Math.floor(Math.random() * mysticalSuffixes.length)];

  return `${prefix} ${response} ${suffix}`;
}

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
          day: 2,
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

      // --- Day 2: Perform digital séance ---
      case 'performSeance': {
        const { question } = req.body;
        if (!question || question.trim().length === 0) {
          return res.status(400).json({ error: 'Question is required for séance' });
        }
        if (question.length > 100) {
          return res.status(400).json({ error: 'Question too long' });
        }

        // Get all whispers for generating mystical response
        const whispers = await sql`
          SELECT text FROM whispers 
          ORDER BY created_at DESC 
          LIMIT 50
        `;

        const response = generateSeanceResponse(question, whispers);

        // Store the séance
        const result = await sql`
          INSERT INTO seances (question, response) 
          VALUES (${question.trim()}, ${response}) 
          RETURNING id, question, response, created_at
        `;
        
        return res.status(200).json({ seance: result[0] });
      }

      // --- Day 2: Get recent séances ---
      case 'getSeances': {
        const result = await sql`
          SELECT id, question, response, created_at 
          FROM seances 
          ORDER BY created_at DESC 
          LIMIT 10
        `;
        return res.status(200).json({ seances: result });
      }

      default:
        return res.status(400).json({
          error: 'Unknown action',
          available: ['heartbeat', 'schema', 'addWhisper', 'getWhispers', 'performSeance', 'getSeances'],
        });
    }
  } catch (err) {
    console.error('Frankenstein API error:', err);
    return res.status(500).json({ error: 'Internal error', message: err.message });
  }
}