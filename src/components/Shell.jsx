import React from 'react';

const NAV = [
  { id: 'chat', icon: '✧', label: 'Chat' },
  { id: 'companions', icon: '♡', label: 'Companions' },
  { id: 'memories', icon: '❋', label: 'Memories' },
];

export default function Shell({ view, setView, companion, mood, mode, memoryCount, toast, children }) {
  return (
    <div className="app" style={{ '--accent': companion.accent }}>
      <div className="ambient a1" />
      <div className="ambient a2" />
      <div className="ambient a3" />

      <nav className="rail" aria-label="Main">
        <div className="logo">
          <span>F</span>
        </div>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`rail-icon ${view === item.id ? 'selected' : ''}`}
            onClick={() => setView(item.id)}
            title={item.label}
            aria-label={item.label}
            aria-current={view === item.id}
          >
            {item.icon}
            {item.id === 'memories' && memoryCount > 0 && <i className="badge">{memoryCount}</i>}
          </button>
        ))}
        <button
          className={`rail-icon rail-bottom ${view === 'settings' ? 'selected' : ''}`}
          onClick={() => setView('settings')}
          title="Settings"
          aria-label="Settings"
        >
          ⚙
        </button>
      </nav>

      <main className="main">
        <header>
          <div className="wordmark">
            felicia<span>.ai</span>
            <small>YOUR PRIVATE LITTLE WORLD</small>
          </div>
          <div className="header-right">
            <span className={`status ${mode === 'live' ? 'live' : ''}`} title={mode === 'live' ? 'Live AI replies' : 'Preview replies'}>
              <i /> {mode === 'live' ? 'LIVE AI' : 'PREVIEW'}
            </span>
            <span className="mood-pill" title="Current mood">
              {mood.emoji} {mood.label}
            </span>
          </div>
        </header>
        {children}
        <footer className="site-foot">
          <span>{companion.name} is an AI companion, not a real person.</span>
          <span>Be careful with personal information · 18+</span>
        </footer>
      </main>

      <nav className="tabbar" aria-label="Sections">
        {[...NAV, { id: 'settings', icon: '⚙', label: 'Settings' }].map((item) => (
          <button
            key={item.id}
            className={view === item.id ? 'on' : ''}
            onClick={() => setView(item.id)}
          >
            <b>{item.icon}</b>
            {item.label}
            {item.id === 'memories' && memoryCount > 0 && <i className="badge">{memoryCount}</i>}
          </button>
        ))}
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
