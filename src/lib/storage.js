const NS = 'felicia.v2';

const safeParse = (raw, fallback) => {
  try {
    const value = JSON.parse(raw);
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

export const load = (key, fallback) => {
  try {
    return safeParse(localStorage.getItem(`${NS}.${key}`), fallback);
  } catch {
    return fallback;
  }
};

export const save = (key, value) => {
  try {
    localStorage.setItem(`${NS}.${key}`, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the app still works for this session */
  }
};

export const remove = (key) => {
  try {
    localStorage.removeItem(`${NS}.${key}`);
  } catch {
    /* ignore */
  }
};

export const clearAll = () => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(NS) || k === 'felicia-chat')
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
};

export const MAX_MEMORIES = 24;

/** Merge new facts into memory, newest first, de-duplicated and capped. */
export const mergeMemories = (existing, incoming) => {
  if (!Array.isArray(incoming) || !incoming.length) return existing;
  const seen = new Set();
  const merged = [];
  for (const fact of [...incoming, ...existing]) {
    const text = String(fact?.text ?? fact ?? '').trim().slice(0, 160);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({ text, at: fact?.at || new Date().toISOString() });
  }
  return merged.slice(0, MAX_MEMORIES);
};

export const exportTranscript = (companion, messages) => {
  const lines = messages.map((m) => {
    const who = m.role === 'user' ? 'You' : companion.name;
    return `${who} [${new Date(m.at || Date.now()).toLocaleString()}]\n${m.content}\n`;
  });
  const text = `Conversation with ${companion.name}\n${'='.repeat(34)}\n\n${lines.join('\n')}`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conversation-with-${companion.id}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
