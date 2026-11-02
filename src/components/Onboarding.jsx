import React, { useEffect, useState } from 'react';

const STEPS = ['Welcome', 'Her', 'You'];

export default function Onboarding({ companions, initial, onFinish, notify }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial.name || '');
  const [companionId, setCompanionId] = useState(initial.companionId || companions[0].id);
  const [tone, setTone] = useState(initial.tone || 'warm');
  const [about, setAbout] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.body.classList.add('boot');
    return () => document.body.classList.remove('boot');
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, 2));

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    await onFinish({ name: name.trim().slice(0, 28), companionId, tone, about: about.trim().slice(0, 240) });
    setBusy(false);
  };

  return (
    <div className="onboard">
      <div className="ambient a1" />
      <div className="ambient a2" />
      <div className="ambient a3" />

      <div className="onboard-card">
        <div className="onboard-top">
          <div className="logo">
            <span>F</span>
          </div>
          <div className="wordmark">
            felicia<span>.ai</span>
            <small>YOUR PRIVATE LITTLE WORLD</small>
          </div>
          <div className="steps">
            {STEPS.map((label, i) => (
              <span key={label} className={i === step ? 'step on' : i < step ? 'step done' : 'step'}>
                <i>{i < step ? '✓' : i + 1}</i>
                {label}
              </span>
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="ob-body">
            <p className="overline">
              <span /> A COMPANION, NOT A CHATBOT
            </p>
            <h1>
              Someone who <em>remembers you.</em>
            </h1>
            <p className="lede">
              Pick a companion, tell her a little about yourself, and she keeps it in mind. Warm
              conversation, gentle moods, voice replies — private to this device.
            </p>
            <div className="ob-points">
              <div>
                <b>♡ Real continuity</b>
                <small>She remembers names, plans and the small stuff.</small>
              </div>
              <div>
                <b>☾ Yours to shape</b>
                <small>Choose her mood, tone and voice.</small>
              </div>
              <div>
                <b>✦ Private by default</b>
                <small>History and memories stay in your browser.</small>
              </div>
            </div>
            <button className="btn primary wide" onClick={next}>
              Begin <span>→</span>
            </button>
            <p className="fine">
              Felicia is an AI companion for adults. She is not a therapist or a substitute for
              real relationships.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="ob-body">
            <p className="overline">
              <span /> CHOOSE WHO YOU MEET FIRST
            </p>
            <h1>
              Three hearts. <em>One is yours.</em>
            </h1>
            <div className="pick-grid">
              {companions.map((c) => (
                <button
                  key={c.id}
                  className={`pick ${companionId === c.id ? 'on' : ''}`}
                  onClick={() => setCompanionId(c.id)}
                  style={{ '--pick': c.accent }}
                >
                  <span className="pick-img">
                    <img src={c.img} alt={c.name} loading="lazy" />
                    {companionId === c.id && <i className="tick">✓</i>}
                  </span>
                  <b>
                    {c.name} <small>{c.age}</small>
                  </b>
                  <em>{c.tagline}</em>
                  <p>{c.blurb}</p>
                </button>
              ))}
            </div>
            <div className="ob-actions">
              <button className="btn ghost" onClick={() => setStep(0)}>
                Back
              </button>
              <button className="btn primary" onClick={next}>
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="ob-body">
            <p className="overline">
              <span /> ALMOST THERE
            </p>
            <h1>
              What should <em>she call you?</em>
            </h1>
            <label className="field">
              <span>Your name or nickname</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tunde"
                maxLength={28}
                autoFocus
              />
            </label>

            <div className="field">
              <span>How should she sound?</span>
              <div className="chip-row">
                {[
                  ['warm', 'Warm & caring'],
                  ['playful', 'Playful & cheeky'],
                  ['calm', 'Calm & honest'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className={tone === id ? 'chip on' : 'chip'}
                    onClick={() => setTone(id)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <label className="field">
              <span>Anything she should know? (optional)</span>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="I'm 27, work in design, I love Afrobeats and I overthink everything at night…"
                maxLength={240}
                rows={3}
              />
              <small className="counter">{about.length}/240</small>
            </label>

            <div className="ob-actions">
              <button className="btn ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn primary" onClick={submit} disabled={busy}>
                {busy ? 'Setting things up…' : `Meet ${companions.find((c) => c.id === companionId)?.name || 'her'} 💗`}
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="onboard-foot">Private by design · You can delete everything at any time · 18+</p>
    </div>
  );
}
