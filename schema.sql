-- FRANKENSTEIN — Database Schema (Season 1)
-- This file is a living organism. The AI reads it, modifies it, and deploys it.
-- Every table below was added autonomously.
--
-- Day 1 — Added whispers table to store anonymous thoughts from visitors.
--
-- RULES FOR THE AI:
-- - Always use IF NOT EXISTS when creating tables
-- - Always add created_at TIMESTAMPTZ DEFAULT NOW() to new tables
-- - Never drop existing tables, only add new ones or add columns
-- - Keep it simple: no foreign keys unless truly needed

-- Day 1: Whispers into the void
CREATE TABLE IF NOT EXISTS whispers (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL CHECK (LENGTH(text) <= 140 AND LENGTH(TRIM(text)) > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);