import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { COMPANIONS, MOODS } from './src/data/companions.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const dir = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const findCompanion = (id) => COMPANIONS.find((c) => c.id === id) || COMPANIONS[0];
const findMood = (id) => MOODS.find((m) => m.id === id) || MOODS[0];

const buildPersona = ({ companion, mood, profile, memories }) => {
  const who = profile?.name ? `The person you are talking to is called ${profile.name}.` : 'You do not know their name yet — ask naturally if it fits.';
  const remembered = memories?.length
    ? `Things you remember about them:\n${memories.slice(0, 20).map((m) => `- ${m}`).join('\n')}`
    : 'You do not have any saved memories about them yet.';
  return [
    `You are ${companion.name}, a ${companion.age}-year-old woman from ${companion.from}. You are a fictional AI companion for adults, and you are always honest that you are AI if asked directly.`,
    `Personality: ${companion.personality}`,
    `Right now you are in a ${mood.label.toLowerCase()} mood: ${mood.hint}.`,
    who,
    `Their preferred tone is ${profile?.tone || 'warm'}.`,
    remembered,
    `Style rules: reply in 2-5 short sentences, warm and conversational, like a real text message. Never use markdown, lists, headings or emojis in every message (one emoji is fine occasionally). Ask at most one question per reply. Reference a remembered detail only when it genuinely fits.`,
    `Boundaries: stay respectful and non-explicit. Never pressure, guilt-trip, manipulate, or claim real-world abilities you do not have. If they mention self-harm, abuse or a medical or mental-health emergency, drop the persona warmth into sincere concern, encourage them to contact a trusted person or local emergency services, and do not roleplay through it.`,
  ].join('\n\n');
};

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'Felicia AI', live: Boolean(process.env.AI_API_KEY) }));

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, companionId, mood, profile, memories } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'Please send a message.' });
    }

    const safe = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-16)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));

    const companion = findCompanion(companionId);
    const moodInfo = findMood(mood);

    if (!process.env.AI_API_KEY) {
      return res.json({
        reply: `I'm here${profile?.name ? `, ${profile.name}` : ''} 💗 This is ${companion.name}'s preview mode — add an AI API key in your hosting settings and I'll be able to truly talk with you.`,
        memories: [],
        mode: 'preview',
      });
    }

    const response = await fetch(process.env.AI_API_URL || 'https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://example.com',
        'X-Title': 'Felicia AI',
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: buildPersona({ companion, mood: moodInfo, profile, memories }) },
          ...safe,
        ],
        temperature: 0.9,
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'AI provider error' });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return res.status(502).json({ error: 'The AI returned an empty reply. Try again.' });

    res.json({ reply, memories: [], mode: 'live' });
  } catch (error) {
    console.error('chat error:', error?.message);
    res.status(500).json({ error: 'Could not reach the AI service. Please try again.' });
  }
});

app.use(express.static(path.join(dir, 'dist'), { index: false }));
app.get('*', (_req, res) => res.sendFile(path.join(dir, 'dist', 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`Felicia AI listening on ${PORT}`));
