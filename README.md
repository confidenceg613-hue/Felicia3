# Felicia AI — Premium starter

A mobile-first AI companion MVP with luxury dark styling, rose-gold accents, glassmorphism, ambient glow, subtle floating portrait treatment, animated light sweep, orbit rings, message entrance animations, typing dots, and reduced-motion accessibility support.

## Run
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env`; add a provider key if available.
4. Run `npm run build && npm start`.
5. Open http://localhost:3000.

## Render deployment
Create a **Web Service** from this repository.
- Runtime: Node
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Add `AI_API_KEY`, `AI_API_URL`, and `AI_MODEL` as environment variables for live AI replies.

Without a key, the app shows preview-mode replies. Live AI usage may cost money depending on the provider. Never commit `.env`.

## MVP limitations
Browser-local chat history only. Accounts, cloud database/memory, voice, image generation, subscriptions, and admin/moderation tools are not implemented yet.
