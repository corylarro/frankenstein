-- FRANKENSTEIN — Database Schema (Season 1)
-- This file is a living organism. The AI reads it, modifies it, and deploys it.
-- Every table below was added autonomously.
--
-- Day 1 — Added whispers table to store anonymous thoughts from visitors.
-- Day 2 — Added seances table to store mystical Q&A sessions with the collective consciousness.
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