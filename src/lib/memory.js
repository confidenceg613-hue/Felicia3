/** Lightweight, free memory extraction — no extra AI call needed. */
const PATTERNS = [
  { re: /\bmy name is ([A-Z][\w'-]{1,20}(?:\s[A-Z][\w'-]{1,20})?)/i, make: (m) => `Their name is ${m[1]}` },
  { re: /\bcall me ([\w'-]{2,20})/i, make: (m) => `Likes to be called ${m[1]}` },
  { re: /\bi(?:'m| am) (\d{1,2}) (?:years old|yo)\b/i, make: (m) => `${m[1]} years old` },
  { re: /\bi work (?:as|at|in) ([^.,;!?]{2,40})/i, make: (m) => `Works ${/^as/i.test(m[0]) ? 'as' : 'at'} ${m[1].trim()}` },
  { re: /\bi live in ([^.,;!?]{2,40})/i, make: (m) => `Lives in ${m[1].trim()}` },
  { re: /\bi(?:'m| am) from ([^.,;!?]{2,40})/i, make: (m) => `From ${m[1].trim()}` },
  { re: /\bi (?:really )?(?:love|adore) ([^.,;!?]{2,40})/i, make: (m) => `Loves ${m[1].trim()}` },
  { re: /\bi (?:really )?(?:hate|dislike) ([^.,;!?]{2,40})/i, make: (m) => `Dislikes ${m[1].trim()}` },
  { re: /\bi have (?:a|an) ([a-z ]{2,20}?) (?:called|named) ([\w'-]{2,20})/i, make: (m) => `Has a ${m[1].trim()} named ${m[2]}` },
  { re: /\bi(?:'m| am) (?:feeling |so )?(sad|anxious|tired|stressed|lonely|happy|excited|angry|overwhelmed)\b/i, make: (m) => `Recently felt ${m[1].toLowerCase()}` },
  { re: /\bi(?:'m| am) (?:a|an) ([a-z ]{2,24}?)(?:\.|,|!|\?|$)/i, make: (m) => `Describes themselves as ${m[1].trim()}` },
];

const BLOCKED = /^(a|an|the|so|very|really|not|just|too|good|fine|okay|ok|here|back|sorry|sure)\b/i;

export function extractMemories(text) {
  if (typeof text !== 'string' || text.length < 6 || text.includes('?')) return [];
  const out = [];
  for (const { re, make } of PATTERNS) {
    const match = text.match(re);
    if (!match) continue;
    const fact = make(match).replace(/\s+/g, ' ').trim().slice(0, 140);
    if (fact.length < 6 || BLOCKED.test(fact.replace(/^[A-Z][a-z]+ (is|as|at|in|from|felt|Loves|Dislikes)/, ''))) continue;
    if (!out.some((f) => f.toLowerCase() === fact.toLowerCase())) out.push(fact);
  }
  return out.slice(0, 3);
}
