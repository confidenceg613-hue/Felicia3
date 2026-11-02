import React, { useState } from 'react';
import { exportTranscript } from '../lib/storage.js';

export function CompanionsView({ companions, activeId, onPick }) {
  return (
    <section className="view">
      <div className="view-head">
        <p className="overline">
          <span /> THE ROSTER
        </p>
        <h1>
          Choose your <em>companion.</em>
        </h1>
        <p className="lede">Each one has her own voice, humour and way of caring. Switch anytime — your chats stay separate.</p>
      </div>
      <div className="grid-cards">
        {companions.map((c) => (
          <article key={c.id} className={`card ${activeId === c.id ? 'on' : ''}`} style={{ '--pick': c.accent }}>
            <div className="card-img">
              <img src={c.img} alt={c.name} loading="lazy" />
            </div>
            <div className="card-body">
              <header>
                <b>{c.name}</b>
                <span>{c.age}</span>
                {activeId === c.id && <i className="tag">Current</i>}
              </header>
              <em>{c.tagline} · {c.from}</em>
              <p>{c.blurb}</p>
              <div className="pills">
                {c.traits.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <button className={activeId === c.id ? 'btn ghost wide' : 'btn primary wide'} onClick={() => onPick(c.id)}>
                {activeId === c.id ? 'Back to chat' : `Talk to ${c.name}`}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MemoriesView({ memories, companion, onAdd, onDelete, onClear, onNavigate }) {
  const [draft, setDraft] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAdd(text.slice(0, 160));
    setDraft('');
  };

  return (
    <section className="view">
      <div className="view-head">
        <p className="overline">
          <span /> THE MEMORY VAULT
        </p>
        <h1>
          What {companion.name} <em>remembers.</em>
        </h1>
        <p className="lede">
          She learns from your messages and carries these into every reply. Nothing here leaves your
          browser — delete anything you would rather she forget.
        </p>
      </div>

      <div className="memory-card">
        <form onSubmit={submit} className="memory-add">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Teach her something — e.g. My birthday is 12 March"
            maxLength={160}
          />
          <button className="btn primary" disabled={!draft.trim()}>
            Save
          </button>
        </form>

        {memories.length === 0 ? (
          <div className="empty">
            <b>✦ Nothing yet</b>
            <p>Tell her your name, what you do, or what you love. She will start remembering.</p>
            <button className="btn ghost" onClick={() => onNavigate('chat')}>
              Open the chat
            </button>
          </div>
        ) : (
          <ul className="memory-list">
            {memories.map((m, i) => (
              <li key={`${m.text}-${i}`}>
                <span className="mem-dot">{i + 1}</span>
                <div>
                  <b>{m.text}</b>
                  <small>Saved {new Date(m.at).toLocaleDateString()}</small>
                </div>
                <button onClick={() => onDelete(i)} aria-label={`Forget: ${m.text}`}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {memories.length > 0 && (
          <div className="memory-foot">
            <small>{memories.length} memories · stored on this device only</small>
            <button className="link-danger" onClick={onClear}>
              Forget everything
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function SettingsView({
  profile,
  setProfile,
  settings,
  setSettings,
  companion,
  messages,
  onResetChat,
  onResetAll,
  voiceSupported,
  onTestVoice,
  notify,
}) {
  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="view">
      <div className="view-head">
        <p className="overline">
          <span /> YOUR SPACE
        </p>
        <h1>
          Settings & <em>privacy.</em>
        </h1>
      </div>

      <div className="settings-grid">
        <div className="panel">
          <h3>Profile</h3>
          <label className="field">
            <span>What she calls you</span>
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value.slice(0, 28) }))}
              placeholder="Your name or nickname"
            />
          </label>
          <label className="field">
            <span>Your tone preference</span>
            <select value={profile.tone} onChange={(e) => setProfile((p) => ({ ...p, tone: e.target.value }))}>
              <option value="warm">Warm & caring</option>
              <option value="playful">Playful & cheeky</option>
              <option value="calm">Calm & honest</option>
            </select>
          </label>
          <p className="hint">
            Currently talking to <b>{companion.name}</b>. Change companions from the ♡ tab.
          </p>
        </div>

        <div className="panel">
          <h3>Voice</h3>
          {!voiceSupported && <p className="hint warn">This browser has no speech support. Try Chrome, Edge or Safari.</p>}
          <div className="switch-row">
            <div>
              <b>Her voice</b>
              <small>Read replies aloud with the browser's natural voice.</small>
            </div>
            <button
              className={`switch ${settings.voice ? 'on' : ''}`}
              onClick={() => toggle('voice')}
              aria-pressed={settings.voice}
            >
              <i />
            </button>
          </div>
          <div className="switch-row">
            <div>
              <b>Auto-play replies</b>
              <small>Speak every new answer without tapping play.</small>
            </div>
            <button
              className={`switch ${settings.autoPlay ? 'on' : ''}`}
              onClick={() => toggle('autoPlay')}
              aria-pressed={settings.autoPlay}
            >
              <i />
            </button>
          </div>
          <label className="field">
            <span>Speaking pace</span>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={settings.rate}
              onChange={(e) => setSettings((s) => ({ ...s, rate: Number(e.target.value) }))}
            />
          </label>
          <button className="btn ghost" onClick={onTestVoice} disabled={!voiceSupported}>
            ♪ Test her voice
          </button>
        </div>

        <div className="panel">
          <h3>Data & privacy</h3>
          <p className="hint">
            Chats and memories live in this browser only. With an API key, only the last few messages
            plus your saved memories are sent to the AI provider to write her reply.
          </p>
          <div className="btn-stack">
            <button className="btn ghost" onClick={() => exportTranscript(companion, messages)}>
              ⤓ Export this conversation
            </button>
            <button className="btn ghost" onClick={onResetChat}>
              ⌫ Start a new conversation
            </button>
            <button className="btn danger" onClick={onResetAll}>
              Delete all my data
            </button>
          </div>
        </div>

        <div className="panel">
          <h3>About</h3>
          <p className="hint">
            Felicia.ai is a self-hosted AI companion app. {companion.name} is a fictional adult AI
            character — not a real person. She is not a therapist, doctor or emergency service.
          </p>
          <p className="hint">
            If you are in crisis, please contact a local emergency line or a trusted person near you.
          </p>
          <button
            className="btn ghost"
            onClick={() => notify('This build is open source — deploy it anywhere Node runs.')}
          >
            ✧ About this build
          </button>
        </div>
      </div>
    </section>
  );
}
