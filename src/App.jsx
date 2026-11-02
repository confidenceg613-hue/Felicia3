import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { COMPANIONS, getCompanion, getMood } from './data/companions.js';
import { load, save, clearAll, mergeMemories } from './lib/storage.js';
import { extractMemories } from './lib/memory.js';
import { demoReply } from './lib/fallback.js';
import { useSpeech } from './lib/useVoice.js';
import Onboarding from './components/Onboarding.jsx';
import Shell from './components/Shell.jsx';
import Chat from './components/Chat.jsx';
import { CompanionsView, MemoriesView, SettingsView } from './components/Views.jsx';

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const seedChats = (stored = {}) => {
  const next = { ...stored };
  for (const companion of COMPANIONS) {
    if (!Array.isArray(next[companion.id]) || !next[companion.id].length) {
      next[companion.id] = [
        {
          id: `greet-${companion.id}`,
          role: 'assistant',
          content: companion.greeting,
          at: new Date().toISOString(),
        },
      ];
    }
  }
  return next;
};

const DEFAULT_PROFILE = { name: '', companionId: 'felicia', tone: 'warm', onboarded: false };
const DEFAULT_SETTINGS = { voice: true, autoPlay: true, rate: 1 };

export default function App() {
  const [profile, setProfile] = useState(() => ({ ...DEFAULT_PROFILE, ...load('profile', {}) }));
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...load('settings', {}) }));
  const [chats, setChats] = useState(() => seedChats(load('chats', {})));
  const [memories, setMemories] = useState(() => load('memories', []));
  const [mood, setMood] = useState(() => load('mood', 'warm'));
  const [view, setView] = useState('chat');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('preview');
  const [toast, setToast] = useState('');
  const [animateId, setAnimateId] = useState(null);

  const companion = getCompanion(profile.companionId);
  const activeMood = getMood(mood);
  const messages = chats[companion.id] || [];

  const speech = useSpeech({
    pitch: companion.voice.pitch,
    rate: companion.voice.rate * (settings.rate || 1),
  });

  useEffect(() => save('profile', profile), [profile]);
  useEffect(() => save('settings', settings), [settings]);
  useEffect(() => save('chats', chats), [chats]);
  useEffect(() => save('memories', memories), [memories]);
  useEffect(() => save('mood', mood), [mood]);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(notify._t);
    notify._t = window.setTimeout(() => setToast(''), 3200);
  }, []);

  const speakNow = useCallback(
    (text) => {
      if (!settings.voice) {
        notify('Voice is off — enable it in Settings.');
        return;
      }
      speech.speak(text);
    },
    [settings.voice, speech, notify],
  );

  const pushMessage = useCallback(
    (companionId, message) => {
      setChats((prev) => ({
        ...prev,
        [companionId]: [...(prev[companionId] || []), { id: uid(), at: new Date().toISOString(), ...message }],
      }));
    },
    [],
  );

  const appendMemories = useCallback((facts) => {
    if (!facts?.length) return;
    setMemories((prev) => mergeMemories(prev, facts.map((text) => ({ text }))));
  }, []);

  const send = useCallback(
    async (raw, { silent = false } = {}) => {
      const text = String(raw || '').trim();
      if (!text || busy) return;
      const target = companion;
      const history = [...(chats[target.id] || []), { role: 'user', content: text, at: new Date().toISOString() }];
      if (!silent) {
        setChats((prev) => ({ ...prev, [target.id]: history }));
        appendMemories(extractMemories(text));
      }
      setBusy(true);
      speech.stop();

      const payload = {
        companionId: target.id,
        mood,
        profile: { name: profile.name, tone: profile.tone },
        memories: memories.map((m) => m.text).slice(0, 20),
        messages: history
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(-14)
          .map(({ role, content }) => ({ role, content })),
      };

      let result;
      try {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 45000);
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        window.clearTimeout(timer);
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Request failed');
        result = data;
      } catch (error) {
        result = {
          ...demoReply({
            text,
            companionId: target.id,
            moodId: mood,
            profileName: profile.name,
            memories,
          }),
          note: error.name === 'AbortError' ? 'That took too long, so here is a local reply.' : '',
        };
      }

      setMode(result.mode || 'preview');
      appendMemories(result.memories);
      const id = uid();
      pushMessage(target.id, { id, role: 'assistant', content: result.reply });
      setAnimateId(id);
      setBusy(false);

      if (settings.autoPlay && settings.voice) speech.speak(result.reply);
      if (result.note) notify(result.note);
    },
    [
      busy,
      companion,
      chats,
      mood,
      profile.name,
      profile.tone,
      memories,
      appendMemories,
      pushMessage,
      settings.autoPlay,
      settings.voice,
      speech,
      notify,
    ],
  );

  const regenerate = useCallback(() => {
    const list = chats[companion.id] || [];
    const lastUser = [...list].reverse().find((m) => m.role === 'user');
    if (!lastUser) return notify('Send a message first, then I can rephrase the reply.');
    setChats((prev) => {
      const next = [...(prev[companion.id] || [])];
      while (next.length && next[next.length - 1].role === 'assistant') next.pop();
      return { ...prev, [companion.id]: next };
    });
    send(lastUser.content, { silent: true });
  }, [chats, companion.id, send, notify]);

  const resetChat = useCallback(() => {
    if (!window.confirm(`Start a fresh conversation with ${companion.name}?`)) return;
    setChats((prev) => ({
      ...prev,
      [companion.id]: [
        {
          id: `greet-${companion.id}-${uid()}`,
          role: 'assistant',
          content: companion.greeting,
          at: new Date().toISOString(),
        },
      ],
    }));
    setAnimateId(null);
    notify('Fresh start. She still remembers the important things.');
  }, [companion, notify]);

  const resetEverything = useCallback(() => {
    if (!window.confirm('This deletes your profile, chats, memories and settings on this device. Continue?')) return;
    clearAll();
    setProfile({ ...DEFAULT_PROFILE });
    setSettings({ ...DEFAULT_SETTINGS });
    setChats(seedChats({}));
    setMemories([]);
    setMood('warm');
    setView('chat');
    setAnimateId(null);
    notify('Everything cleared.');
  }, [notify]);

  const finishOnboarding = useCallback(
    async (answers) => {
      setProfile({ ...DEFAULT_PROFILE, ...answers, onboarded: true });
      setMemories((prev) => mergeMemories(prev, extractMemories(answers.about || '').map((text) => ({ text }))));
      notify(`Nice to meet you${answers.name ? `, ${answers.name}` : ''} 💗`);
    },
    [notify],
  );

  const activeMemoryCount = useMemo(() => memories.length, [memories]);

  if (!profile.onboarded) {
    return (
      <Onboarding
        companions={COMPANIONS}
        initial={profile}
        onFinish={finishOnboarding}
        toast={toast}
        notify={notify}
      />
    );
  }

  return (
    <Shell
      view={view}
      setView={setView}
      companion={companion}
      mood={activeMood}
      mode={mode}
      memoryCount={activeMemoryCount}
      toast={toast}
    >
      {view === 'chat' && (
        <Chat
          companion={companion}
          mood={activeMood}
          setMood={setMood}
          messages={messages}
          busy={busy}
          mode={mode}
          animateId={animateId}
          onAnimated={() => setAnimateId(null)}
          onSend={send}
          onSpeak={speakNow}
          speaking={speech.speaking}
          onStopSpeaking={speech.stop}
          onRegenerate={regenerate}
          onReset={resetChat}
          onNavigate={setView}
          memories={memories}
          profile={profile}
        />
      )}
      {view === 'companions' && (
        <CompanionsView
          companions={COMPANIONS}
          activeId={companion.id}
          onPick={(id) => {
            if (id === companion.id) return setView('chat');
            speech.stop();
            setProfile((prev) => ({ ...prev, companionId: id }));
            setView('chat');
            notify(`You're now talking to ${getCompanion(id).name}.`);
          }}
        />
      )}
      {view === 'memories' && (
        <MemoriesView
          memories={memories}
          companion={companion}
          onAdd={(text) => {
            appendMemories([text]);
            notify('Saved. She will bring this up at the right moment.');
          }}
          onDelete={(index) => setMemories((prev) => prev.filter((_, i) => i !== index))}
          onClear={() => {
            if (window.confirm('Forget everything she has learned about you?')) {
              setMemories([]);
              notify('Memory cleared.');
            }
          }}
          onNavigate={setView}
        />
      )}
      {view === 'settings' && (
        <SettingsView
          profile={profile}
          setProfile={setProfile}
          settings={settings}
          setSettings={setSettings}
          companion={companion}
          messages={messages}
          onResetChat={resetChat}
          onResetAll={resetEverything}
          voiceSupported={speech.supported}
          onTestVoice={() => speakNow(`Hi${profile.name ? ` ${profile.name}` : ''}, it's ${companion.name}. This is how I sound.`)}
          notify={notify}
        />
      )}
    </Shell>
  );
}
