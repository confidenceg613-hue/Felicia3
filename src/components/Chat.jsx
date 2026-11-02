import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MOODS } from '../data/companions.js';
import { useDictation } from '../lib/useVoice.js';

const timeOf = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

function Bubble({ message, companion, mine, animate, onSpeak }) {
  return (
    <div className={`message ${mine ? 'user' : 'assistant'} ${animate ? 'fresh' : ''}`}>
      {!mine && (
        <span className="mini" aria-hidden="true">
          <img src={companion.img} alt="" />
        </span>
      )}
      <div className="bubble-wrap">
        <div className="bubble">{message.content}</div>
        <div className="bubble-meta">
          <time>{timeOf(message.at)}</time>
          {!mine && (
            <button type="button" onClick={() => onSpeak(message.content)} title="Play aloud">
              ▷
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Chat({
  companion,
  mood,
  setMood,
  messages,
  busy,
  mode,
  animateId,
  onAnimated,
  onSend,
  onSpeak,
  speaking,
  onStopSpeaking,
  onRegenerate,
  onReset,
  onNavigate,
  memories,
  profile,
}) {
  const [input, setInput] = useState('');
  const [menu, setMenu] = useState(false);
  const bottom = useRef(null);
  const inputRef = useRef(null);
  const dictation = useDictation();

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, busy]);

  useEffect(() => {
    if (!dictation.error) return;
    const t = window.setTimeout(dictation.clearError, 4000);
    return () => window.clearTimeout(t);
  }, [dictation.error]);

  const lastUser = useMemo(() => [...messages].reverse().find((m) => m.role === 'user'), [messages]);
  const userTurns = messages.filter((m) => m.role === 'user').length;

  const submit = (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    onSend(text);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <section className="chat-shell">
      <div className="hero">
        <div className="portrait-wrap">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="portrait">
            <img src={companion.img} alt={companion.name} />
            <span className="portrait-glint" />
            <div className="portrait-badge">
              <i /> online
            </div>
          </div>
        </div>
        <div className="hero-copy">
          <div className="overline">
            <span /> {companion.tagline.toUpperCase()} · {companion.from.toUpperCase()}
          </div>
          <h1>
            {companion.name}, {companion.age}
            <br />
            <em>{mood.hint}.</em>
          </h1>
          <p>{companion.blurb}</p>
          <div className="hero-pills">
            {companion.traits.map((t) => (
              <span key={t}>♡ {t}</span>
            ))}
            <span>{memories.length} memories</span>
          </div>
        </div>
      </div>

      <div className="chat">
        <div className="chat-heading">
          <div>
            <b>
              Your conversation{profile.name ? `, ${profile.name}` : ''}
            </b>
            <small>{busy ? `${companion.name} is typing…` : 'A safe space to be yourself'}</small>
          </div>
          <div className="chat-tools">
            <span className="lock">♧ PRIVATE</span>
            <div className="menu">
              <button onClick={() => setMenu(!menu)} aria-label="Conversation options" aria-expanded={menu}>
                •••
              </button>
              {menu && (
                <div className="drop" onMouseLeave={() => setMenu(false)}>
                  <button onClick={() => { setMenu(false); onRegenerate(); }} disabled={!lastUser}>
                    ↻ Rephrase her last reply
                  </button>
                  <button onClick={() => { setMenu(false); onSpeak(lastUser ? `${companion.name} here.` : ''); }}>
                    ♪ Test her voice
                  </button>
                  <button onClick={() => { setMenu(false); onNavigate('memories'); }}>❋ Memory vault</button>
                  <button className="danger" onClick={() => { setMenu(false); onReset(); }}>
                    ⌫ New conversation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mood-bar" role="group" aria-label="Her current mood">
          <small>Her mood</small>
          {MOODS.map((m) => (
            <button
              key={m.id}
              className={m.id === mood.id ? 'mood on' : 'mood'}
              onClick={() => setMood(m.id)}
              title={m.hint}
            >
              <b>{m.emoji}</b> {m.label}
            </button>
          ))}
        </div>

        <div className="messages" aria-live="polite">
          {messages.map((m) => (
            <Bubble
              key={m.id || m.at}
              message={m}
              companion={companion}
              mine={m.role === 'user'}
              animate={m.id === animateId}
              onSpeak={(text) => (speaking ? onStopSpeaking() : onSpeak(text))}
            />
          ))}
          {busy && (
            <div className="message assistant">
              <span className="mini">
                <img src={companion.img} alt="" />
              </span>
              <div className="bubble typing" aria-label={`${companion.name} is typing`}>
                <i />
                <i />
                <i />
              </div>
            </div>
          )}
          <div ref={bottom} />
        </div>

        {userTurns === 0 && (
          <div className="starters">
            {companion.starters.map((s) => (
              <button key={s} onClick={() => onSend(s)} disabled={busy}>
                {s}
              </button>
            ))}
          </div>
        )}

        {dictation.error && <p className="inline-error">{dictation.error}</p>}

        <form onSubmit={submit}>
          <span className="input-spark">✧</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (animateId) onAnimated();
            }}
            placeholder={dictation.listening ? 'Listening…' : `Say something to ${companion.name}…`}
            maxLength={1200}
            aria-label="Message"
          />
          <button
            type="button"
            className={`icon-btn ${dictation.listening ? 'rec' : ''}`}
            onClick={() => (dictation.listening ? dictation.stop() : dictation.start(setInput))}
            aria-label="Voice input"
            title={dictation.supported ? 'Speak instead of typing' : 'Voice input unavailable'}
          >
            {dictation.listening ? '■' : '◉'}
          </button>
          {speaking && (
            <button type="button" className="icon-btn" onClick={onStopSpeaking} title="Stop voice">
              ✕
            </button>
          )}
          <button type="submit" disabled={!input.trim() || busy} aria-label="Send">
            ↑
          </button>
        </form>
        <div className="chat-footer">
          <span>
            {mode === 'live' ? 'Live AI replies' : 'Preview mode — add AI_API_KEY for live replies'}
          </span>
          <span>Enter to send</span>
        </div>
      </div>
    </section>
  );
}
