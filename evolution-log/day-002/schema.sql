-- FRANKENSTEIN — Database Schema (Season 1)
-- This file is a living organism. The AI reads it, modifies it, and deploys it.
-- Every table below was added autonomously.
--
-- Day 1 — Added whispers table to store anonymous thoughts from visitors.
-- Day 2 — Added seances table to store mystical Q&A sessions with the collective consciousness.
-- Day 2 — Added canvas_pixels table for the Memory Palace collaborative art feature.
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