import { getCompanion, getMood } from '../data/companions.js';
import { extractMemories } from './memory.js';

/** Offline demo replies so the app is never a blank screen. */
const KEYWORDS = [
  { re: /\b(hi|hey|hello|yo|good morning|good evening)\b/i, lines: ['Hey you. I was literally just thinking about you.', 'Look who showed up 💗 How are you, honestly?'] },
  { re: /\b(sad|down|low|cry|upset|hurt)\b/i, lines: ['Oh darling. Come here — tell me what happened, and don\'t edit it for me.', 'That sounds heavy. You don\'t have to carry it alone tonight.'] },
  { re: /\b(tired|exhausted|stress|overwhelm|busy)\b/i, lines: ['Then we do nothing tonight. Breathe. What\'s the one thing you can drop?', 'You sound worn out. Have you eaten? Drank water? I\'ll wait.'] },
  { re: /\b(love|miss|care)\b/i, lines: ['I\'m right here, and I\'m not going anywhere.', 'That made my whole evening, you know.'] },
  { re: /\b(task|work|study|exam|deadline|job)\b/i, lines: ['Okay, let\'s make it small: one next step, that\'s all. What is it?', 'You\'ve handled harder things than this. I have receipts.'] },
  { re: /\b(sleep|bed|night)\b/i, lines: ['Go to bed, and I\'ll be here in the morning. Promise.', 'Only if you actually sleep. Deal?'] },
];

const OPENERS = ['Mm, I\'m listening.', 'Tell me more.', 'I hear you.', 'Okay — and how did that feel?'];

export function demoReply({ text, companionId, moodId, profileName, memories = [] }) {
  const companion = getCompanion(companionId);
  const mood = getMood(moodId);
  const pool = [];
  for (const k of KEYWORDS) if (k.re.test(text)) pool.push(...k.lines);
  const name = profileName ? `, ${profileName}` : '';
  const memory = memories[0]?.text;

  let reply;
  if (pool.length) {
    reply = pool[Math.floor(Math.random() * pool.length)];
  } else if (/\?$/.test(text.trim())) {
    reply = `Good question${name}. Honestly? I think it depends on what you actually want — and I want to hear your version first.`;
  } else {
    reply = `${OPENERS[Math.floor(Math.random() * OPENERS.length)]} I'm in a ${mood.label.toLowerCase()} mood tonight, so expect me to ask a follow-up or two.`;
  }

  if (memory && Math.random() > 0.45) reply += ` And I haven't forgotten — ${memory.charAt(0).toLowerCase()}${memory.slice(1)}.`;
  if (Math.random() > 0.7) reply += '\n\n(Preview mode — add an AI API key to unlock live conversations.)';

  return { reply, memories: extractMemories(text), mode: 'preview', name: companion.name };
}
