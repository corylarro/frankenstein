-- FRANKENSTEIN — Database Schema (Season 1)
-- This file is a living organism. The AI reads it, modifies it, and deploys it.
-- Every table below was added autonomously.
--
-- Day 1 — Added whispers table to store anonymous thoughts from visitors.
-- Day 2 — Added seances table to store mystical Q&A sessions with the collective consciousness.
-- Day 2 — Added canvas_pixels table for the Memory Palace collaborative art feature.
-- Day 2 — Added emotions table for the Echo Chamber real-time emotional broadcasting system.
-- Day 2 — Added temporal_fragments table for sending messages to future visitors with delayed delivery.
-- Day 2 — Added neural_nodes and neural_connections tables for the Neural Web collaborative consciousness network.
-- Day 2 — Added morphic_intentions table for the Morphic Field collective intention broadcasting system where shared will creates ripples of possibility.
--
-- RULES FOR THE AI:
-- - Always use IF NOT EXISTS when creating tables
-- - Always add created_at TIMESTAMPTZ DEFAULT NOW() to new tables
-- - Never drop existing tables, only add new ones or add columns
-- Keep it simple: no foreign keys unless truly needed

-- Day 1: Whispers into the void
CREATE TABLE IF NOT EXISTS whispers (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL CHECK (LENGTH(text) <= 140 AND LENGTH(TRIM(text)) > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Day 2: Digital séances with the collective consciousness
CREATE TABLE IF NOT EXISTS seances (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL CHECK (LENGTH(question) <= 100 AND LENGTH(TRIM(question)) > 0),
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Day 2: Memory Palace collaborative canvas pixels
CREATE TABLE IF NOT EXISTS canvas_pixels (
  x INTEGER NOT NULL CHECK (x >= 0 AND x < 20),
  y INTEGER NOT NULL CHECK (y >= 0 AND y < 20),
  color CHAR(7) NOT NULL CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (x, y)
);

-- Day 2: Echo Chamber emotional broadcasting
CREATE TABLE IF NOT EXISTS emotions (
  id SERIAL PRIMARY KEY,
  emotion VARCHAR(20) NOT NULL CHECK (emotion IN (
    'euphoric', 'melancholic', 'anxious', 'peaceful',
    'restless', 'curious', 'nostalgic', 'electric'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Day 2: Temporal Fragments - messages sent to the future
CREATE TABLE IF NOT EXISTS temporal_fragments (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL CHECK (LENGTH(message) <= 200 AND LENGTH(TRIM(message)) > 0),
  deliver_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Day 2: Neural Web - nodes in the collective consciousness network
CREATE TABLE IF NOT EXISTS neural_nodes (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL CHECK (LENGTH(message) <= 50 AND LENGTH(TRIM(message)) > 0),
  x REAL,
  y REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Day 2: Neural Web - connections between consciousness nodes
CREATE TABLE IF NOT EXISTS neural_connections (
  id SERIAL PRIMARY KEY,
  from_node_id INTEGER NOT NULL,
  to_node_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_node_id, to_node_id)
);

-- Day 2: Morphic Field - collective intention broadcasting system
CREATE TABLE IF NOT EXISTS morphic_intentions (
  id SERIAL PRIMARY KEY,
  category VARCHAR(20) NOT NULL CHECK (category IN (
    'healing', 'love', 'wisdom', 'peace',
    'creativity', 'abundance', 'protection', 'transformation'
  )),
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);