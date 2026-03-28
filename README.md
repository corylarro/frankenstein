# ⚡ FRANKENSTEIN

**A self-building web application. No human guidance. Pure AI autonomy.**

Every day, an AI reads this app's source code, decides what feature to add, builds it, and deploys it. Nobody tells it what to build. After 30 days, the season ends, the monster is archived, and it starts over.

🌐 [frankenstein.today](https://frankenstein.today) · 🐦 [@FrankenToday](https://x.com/FrankenToday)

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/frankenstein.git
cd frankenstein
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env and add your API key (Anthropic or OpenAI)
```

### 3. Run Locally

```bash
npm run dev
```

### 4. Deploy to Vercel

```bash
npx vercel
# Follow prompts, link to your frankenstein.today domain
```

---

## The Evolution Cycle

### Manual Run (Recommended for Week 1)

```bash
# Preview what the AI would do (doesn't write any files)
npm run evolve:dry

# Run the evolution for real
npm run evolve
```

### What Happens

1. Script reads `src/App.jsx` (the living organism)
2. Sends current code to AI with the prompt: "Add one new feature. You decide what."
3. AI returns updated code with the new feature integrated
4. Script validates the code (syntax, imports, balanced braces)
5. If valid: writes updated `App.jsx`, logs changelog, saves snapshot
6. If invalid: retries up to 3 times, then fails safely

### Switch AI Providers

```bash
# Use Claude (default)
FRANKENSTEIN_PROVIDER=anthropic npm run evolve

# Use OpenAI
FRANKENSTEIN_PROVIDER=openai npm run evolve

# Use a specific model
npm run evolve -- --model gpt-4o-mini
```

### Automate with Cron (Week 2+)

```bash
# Add to crontab — runs daily at 10am UTC
0 10 * * * cd /path/to/frankenstein && npm run evolve && git add -A && git commit -m "$(date +%Y-%m-%d) evolution" && git push
```

Vercel auto-deploys on push, so this is the full autonomous pipeline.

---

## End of Season

After 30 days, archive the season:

```bash
npm run archive
```

This:
- Saves the final App.jsx and all evolution logs to `archive/season-N/`
- Resets App.jsx to a blank canvas for the next season
- The monster is dead. Long live the monster.

---

## Project Structure

```
frankenstein/
├── src/
│   ├── main.jsx          # React entry (don't touch)
│   └── App.jsx           # THE LIVING ORGANISM (AI modifies this)
├── scripts/
│   ├── evolve.mjs        # AI build script (model-agnostic)
│   └── archive.mjs       # End-of-season archiver
├── evolution-log/         # Daily changelogs and snapshots
├── archive/               # Past seasons
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

---

## How It Works (Technical)

The AI receives the **entire** `App.jsx` file and a minimal prompt. It returns the complete updated file with one new feature added. The prompt intentionally gives almost no guidance — the less direction, the more unpredictable (and entertaining) the results.

Key constraints for the AI:
- Must keep all existing features (additive only)
- Must use inline styles (no external CSS)
- Can only import from `react` (no external deps)
- Must be a valid React component with default export

These constraints keep the app deployable and prevent the AI from breaking things while still allowing maximum creative freedom.

---

*It's alive.*
