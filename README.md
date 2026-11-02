# Felicia.ai — AI girlfriend / companion app

A private, self-hosted AI companion app. Pick a companion, she learns about you, and she carries
that context into every conversation. Luxury dark UI, rose-gold accents, glassmorphism, mobile-first.

> Felicia is a fictional adult AI character — not a real person, and not a therapist.

## Features

**Onboarding** — 3-step welcome: choose a companion, pick her tone, tell her your name and a little about yourself.

**Three companions** — Felicia (Lagos, warm), Amara (Nairobi, thoughtful), Sofia (Lisbon, playful). Each has her own portrait, personality, greeting, starter prompts and voice. Separate chat history per companion.

**Moods** — Warm / Playful / Deep / Flirty. Her mood rewrites the system prompt, so replies actually change character.

**Memory vault** — facts are extracted on the user's own messages with no extra AI call (name, work, city, likes, dislikes, pets, feelings), stored locally, shown in a vault you can edit and delete from. Her memories are injected into every prompt.

**Voice** — replies read aloud through the browser's speech synthesis with a per-companion pitch and rate. Mic dictation for input where the browser supports it. Zero API cost.

**Extras** — typing indicator, "rephrase her last reply", per-message play button, export transcript to `.txt`, delete-everything control, live/preview status pill, graceful offline demo replies, reduced-motion support.

**Privacy** — chats, memories, profile and settings live in `localStorage` on the device. With a key configured, only the last ~14 messages plus saved memories go to the AI provider to write a reply.

## Run locally

```bash
npm install
cp .env.example .env      # optional: add your AI key
npm run build && npm start   # http://localhost:3000
```

Or for hot-reload development (proxies `/api` to the server on port 3000):

```bash
npm run dev                  # terminal 1 → http://localhost:5173
node server.js               # terminal 2
```

Without an `AI_API_KEY` the app runs in **preview mode**: scripted local replies, so every screen and
feature stays clickable. Add a key for live conversation.

## Environment

| Variable     | Default                                              | Purpose                          |
| ------------ | ---------------------------------------------------- | -------------------------------- |
| `AI_API_KEY` | —                                                    | Provider key. Empty = preview mode |
| `AI_API_URL` | `https://openrouter.ai/api/v1/chat/completions`      | Any OpenAI-compatible endpoint   |
| `AI_MODEL`   | `openai/gpt-4o-mini`                                 | Model name                       |
| `APP_URL`    | `https://example.com`                                | Sent as HTTP-Referer to OpenRouter |
| `PORT`       | `3000`                                               | Server port                      |

Never commit `.env` — it is gitignored.

## Deploy

**Render / Railway / Fly / any Node host** — Web Service:
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Add the env vars above.

`server.js` serves the built `dist/` and exposes `POST /api/chat` and `GET /api/health`.
It binds `0.0.0.0` and reads `PORT`, so container hosts work as-is.

## Project layout

```
src/
  App.jsx                 app state: profile, chats, memories, moods, views
  data/companions.js      companion + mood definitions (shared with the server)
  lib/storage.js          localStorage helpers, memory merge, transcript export
  lib/memory.js           free regex memory extraction
  lib/fallback.js         offline demo replies
  lib/useVoice.js         speech synthesis + dictation hooks
  components/             Onboarding, Shell, Chat, Views (companions/memories/settings)
  style.css               the whole design system
server.js                 Express: persona builder, /api/chat proxy, static hosting
public/avatars/           companion portraits
```

## Safety

The system prompt keeps replies non-explicit, forbids manipulation or pressure, and instructs the
companion to drop the persona and point to real help if self-harm, abuse or a medical emergency comes
up. The UI carries an 18+ notice and a reminder that she is AI.

## Roadmap

Accounts + cloud sync, streaming replies, image generation, subscription billing, moderation logging.
