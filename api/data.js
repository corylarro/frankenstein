import { neon } from '@neondatabase/serverless';

/*
 * FRANKENSTEIN — API Layer (Season 1)
 * This file is a living organism. The AI reads it, modifies it, and deploys it.
 * Every endpoint below was added autonomously.
 *
 * Day 1 — Added whisper endpoints to store and retrieve anonymous thoughts.
 * Day 2 — Added séance endpoint that creates mystical responses by analyzing existing whispers.
 * Day 2 — Added Memory Palace canvas endpoints for collaborative pixel art that fades over time.
 * Day 2 — Added Echo Chamber endpoints to broadcast and retrieve emotional states in real-time.
 * Day 2 — Added Temporal Fragments endpoints to send messages to future visitors with delayed delivery.
 * Day 2 — Added Neural Web endpoints to create nodes and connections in a collaborative consciousness network.
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
          day: 3,
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

      // --- Day 2: Paint a pixel in the memory palace ---
      case 'paintPixel': {
        const { x, y, color } = req.body;
        
        if (x === undefined || y === undefined || !color) {
          return res.status(400).json({ error: 'x, y, and color are required' });
        }
        
        if (x < 0 || x >= 20 || y < 0 || y >= 20) {
          return res.status(400).json({ error: 'Pixel coordinates out of bounds' });
        }

        if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
          return res.status(400).json({ error: 'Invalid color format' });
        }

        // Replace existing pixel at this position or create new one
        const result = await sql`
          INSERT INTO canvas_pixels (x, y, color) 
          VALUES (${x}, ${y}, ${color})
          ON CONFLICT (x, y) 
          DO UPDATE SET color = ${color}, created_at = NOW()
          RETURNING x, y, color, created_at
        `;
        
        return res.status(200).json({ pixel: result[0] });
      }

      // --- Day 2: Get canvas pixels ---
      case 'getCanvas': {
        // Only return pixels from the last 24 hours (they fade)
        const result = await sql`
          SELECT x, y, color, created_at
          FROM canvas_pixels 
          WHERE created_at > NOW() - INTERVAL '24 hours'
          ORDER BY created_at DESC
        `;
        return res.status(200).json({ pixels: result });
      }

      // --- Day 2: Broadcast an emotion to the echo chamber ---
      case 'broadcastEmotion': {
        const { emotion } = req.body;
        
        if (!emotion || emotion.trim().length === 0) {
          return res.status(400).json({ error: 'Emotion is required' });
        }

        const validEmotions = [
          'euphoric', 'melancholic', 'anxious', 'peaceful', 
          'restless', 'curious', 'nostalgic', 'electric'
        ];

        if (!validEmotions.includes(emotion.trim().toLowerCase())) {
          return res.status(400).json({ error: 'Invalid emotion type' });
        }

        const result = await sql`
          INSERT INTO emotions (emotion) 
          VALUES (${emotion.trim().toLowerCase()}) 
          RETURNING id, emotion, created_at
        `;
        
        return res.status(200).json({ emotion: result[0] });
      }

      // --- Day 2: Get recent emotions from echo chamber ---
      case 'getEmotions': {
        // Only return emotions from the last 10 minutes (they flow away)
        const result = await sql`
          SELECT id, emotion, created_at
          FROM emotions 
          WHERE created_at > NOW() - INTERVAL '10 minutes'
          ORDER BY created_at DESC
          LIMIT 50
        `;
        return res.status(200).json({ emotions: result });
      }

      // --- Day 2: Send a temporal fragment ---
      case 'sendTemporalFragment': {
        const { message, delivery_days } = req.body;
        
        if (!message || message.trim().length === 0) {
          return res.status(400).json({ error: 'Message is required' });
        }
        
        if (message.length > 200) {
          return res.status(400).json({ error: 'Message too long' });
        }

        const validDeliveryDays = [1, 3, 7, 30, 365];
        if (!validDeliveryDays.includes(delivery_days)) {
          return res.status(400).json({ error: 'Invalid delivery time' });
        }

        // Calculate delivery date
        const deliverAt = new Date();
        deliverAt.setDate(deliverAt.getDate() + delivery_days);

        const result = await sql`
          INSERT INTO temporal_fragments (message, deliver_at) 
          VALUES (${message.trim()}, ${deliverAt.toISOString()}) 
          RETURNING id, message, deliver_at, created_at
        `;
        
        return res.status(200).json({ fragment: result[0] });
      }

      // --- Day 2: Get temporal fragments (pending and delivered) ---
      case 'getTemporalFragments': {
        // Get pending fragments (not yet delivered)
        const pending = await sql`
          SELECT id, message, deliver_at, created_at
          FROM temporal_fragments 
          WHERE deliver_at > NOW() 
          ORDER BY deliver_at ASC
          LIMIT 20
        `;

        // Get recently delivered fragments and mark them as delivered
        const delivered = await sql`
          SELECT id, message, deliver_at, created_at, 
                 CASE WHEN delivered_at IS NULL THEN NOW() ELSE delivered_at END as delivered_at
          FROM temporal_fragments 
          WHERE deliver_at <= NOW() 
          ORDER BY deliver_at DESC
          LIMIT 10
        `;

        // Mark newly delivered fragments
        if (delivered.length > 0) {
          const deliveredIds = delivered.filter(f => !f.delivered_at || f.delivered_at === f.created_at).map(f => f.id);
          if (deliveredIds.length > 0) {
            await sql`
              UPDATE temporal_fragments 
              SET delivered_at = NOW() 
              WHERE id = ANY(${deliveredIds}) AND delivered_at IS NULL
            `;
          }
        }

        return res.status(200).json({ 
          pending, 
          delivered: delivered.map(f => ({
            ...f,
            delivered_at: f.delivered_at || new Date()
          }))
        });
      }

      // --- Day 2: Join the neural web as a new node ---
      case 'joinNeuralWeb': {
        const { message } = req.body;
        
        if (!message || message.trim().length === 0) {
          return res.status(400).json({ error: 'Node message is required' });
        }
        
        if (message.length > 50) {
          return res.status(400).json({ error: 'Node message too long' });
        }

        const result = await sql`
          INSERT INTO neural_nodes (message) 
          VALUES (${message.trim()}) 
          RETURNING id, message, created_at
        `;
        
        return res.status(200).json({ node: result[0] });
      }

      // --- Day 2: Connect two nodes in the neural web ---
      case 'connectNodes': {
        const { from_node_id, to_node_id } = req.body;
        
        if (!from_node_id || !to_node_id) {
          return res.status(400).json({ error: 'Both node IDs are required' });
        }
        
        if (from_node_id === to_node_id) {
          return res.status(400).json({ error: 'Cannot connect a node to itself' });
        }

        // Check if connection already exists (in either direction)
        const existing = await sql`
          SELECT id FROM neural_connections 
          WHERE (from_node_id = ${from_node_id} AND to_node_id = ${to_node_id})
             OR (from_node_id = ${to_node_id} AND to_node_id = ${from_node_id})
          LIMIT 1
        `;

        if (existing.length > 0) {
          return res.status(400).json({ error: 'Connection already exists' });
        }

        // Verify both nodes exist
        const nodes = await sql`
          SELECT id FROM neural_nodes 
          WHERE id IN (${from_node_id}, ${to_node_id})
        `;

        if (nodes.length !== 2) {
          return res.status(400).json({ error: 'One or both nodes do not exist' });
        }

        const result = await sql`
          INSERT INTO neural_connections (from_node_id, to_node_id) 
          VALUES (${from_node_id}, ${to_node_id}) 
          RETURNING id, from_node_id, to_node_id, created_at
        `;
        
        return res.status(200).json({ connection: result[0] });
      }

      // --- Day 2: Get neural web nodes and connections ---
      case 'getNeuralWeb': {
        // Get recent active nodes (last 30 minutes)
        const nodes = await sql`
          SELECT id, message, created_at
          FROM neural_nodes 
          WHERE created_at > NOW() - INTERVAL '30 minutes'
          ORDER BY created_at DESC
          LIMIT 20
        `;

        // Get connections between active nodes
        const nodeIds = nodes.map(n => n.id);
        let connections = [];
        
        if (nodeIds.length > 0) {
          connections = await sql`
            SELECT id, from_node_id, to_node_id, created_at
            FROM neural_connections 
            WHERE from_node_id = ANY(${nodeIds}) 
              AND to_node_id = ANY(${nodeIds})
            ORDER BY created_at DESC
            LIMIT 50
          `;
        }

        return res.status(200).json({ nodes, connections });
      }

      default:
        return res.status(400).json({
          error: 'Unknown action',
          available: [
            'heartbeat', 'schema', 'addWhisper', 'getWhispers', 
            'performSeance', 'getSeances', 'paintPixel', 'getCanvas',
            'broadcastEmotion', 'getEmotions', 'sendTemporalFragment', 'getTemporalFragments',
            'joinNeuralWeb', 'connectNodes', 'getNeuralWeb'
          ],
        });
    }
  } catch (err) {
    console.error('Frankenstein API error:', err);
    return res.status(500).json({ error: 'Internal error', message: err.message });
  }
}