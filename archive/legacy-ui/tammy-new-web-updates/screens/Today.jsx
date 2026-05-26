// Today dashboard — full viewport, no empty space.
// Bucket strip · greeting + hero card · mode pills · two-column grid (sessions + open).

const TodayScreen = ({ onNavigate, activeBucket, setActiveBucket }) => {
  const D = window.TammyData;
  const pending = D.decisions.filter(d => d.status === 'pending');

  return (
    <div style={{
      marginLeft: 96,
      minHeight: '100vh',
      padding: '24px 56px 56px',
      display: 'flex', flexDirection: 'column',
      gap: 32,
    }}>
      <Buckets active={activeBucket} onChange={setActiveBucket} />

      {/* Greeting + hero card row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)', gap: 28, alignItems: 'stretch' }}>
        {/* Greeting block */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 8 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 14 }}>
            {D.today_greeting.phrase} <span style={{ color: 'var(--ink-2)' }}>{D.user.name.toLowerCase()}</span>
          </div>
          <h1 className="serif" style={{
            fontSize: 'clamp(40px, 4.4vw, 60px)',
            lineHeight: 1.04, margin: '0 0 14px',
            color: 'var(--ink)', fontWeight: 400, letterSpacing: '-0.02em',
            textWrap: 'balance',
          }}>
            {D.today_greeting.hero_line}
          </h1>
          <p style={{ fontSize: 15.5, color: 'var(--ink-3)', margin: '0 0 24px', maxWidth: 540, lineHeight: 1.55 }}>
            {D.today_greeting.subtext}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => onNavigate('voice')}>
              start voice
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <button className="btn btn-ghost" onClick={() => onNavigate('chat')}>type instead</button>
          </div>
        </div>

        {/* Hero card with orb — fills the right column fully */}
        <div style={{
          position: 'relative',
          padding: 32,
          borderRadius: 28,
          background: 'linear-gradient(135deg, rgba(148, 125, 237, 0.16) 0%, rgba(192, 172, 255, 0.10) 100%)',
          border: '1px solid rgba(148, 125, 237, 0.28)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: 260,
        }}>
          <div style={{
            position: 'absolute', right: -80, top: -80,
            width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(148, 125, 237, 0.22), transparent 60%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'absolute', left: 28, top: 26 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              tammy · idle
            </div>
            <div className="serif" style={{ fontSize: 20, color: 'var(--ink)', marginTop: 6, fontWeight: 400 }}>
              breathing in.
            </div>
          </div>
          <Orb size={180} state="idle" />
        </div>
      </section>

      {/* Mode pills */}
      <section>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 12 }}>
          or start with a frame
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 10 }}>
          {[
            { label: 'Morning check-in', sub: '2-min voice intention', tint: '#C0ACFF' },
            { label: 'Decision thinking', sub: 'CTO hire · 21d circling', tint: '#947DED' },
            { label: 'Just dump', sub: 'she listens, no challenge', tint: '#8B8898' },
            { label: 'Brief me on…', sub: 'a person or topic', tint: '#6B5BC8' },
            { label: 'Weekly review', sub: 'surface the patterns', tint: '#C0ACFF' },
          ].map((p, i) => (
            <button key={i} style={{
              padding: '14px 16px',
              borderRadius: 14,
              border: `1px solid ${p.tint}45`,
              background: `${p.tint}10`,
              color: 'var(--ink)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 200ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${p.tint}22`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${p.tint}10`; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="dot" style={{ background: p.tint }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{p.sub}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Bottom grid: Where you've been + Still open */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: 28, flex: 1, minHeight: 0,
      }}>
        {/* Sessions */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h3 className="serif" style={{ fontSize: 22, margin: 0, color: 'var(--ink)', fontWeight: 400, letterSpacing: '-0.01em' }}>Where you've been</h3>
            <button onClick={() => onNavigate('arc')} style={{ fontSize: 13, color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer' }}>see all →</button>
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column',
            background: 'var(--surface)',
            border: '1px solid var(--mauve-soft)',
            borderRadius: 18,
            overflow: 'hidden',
            flex: 1,
          }}>
            {D.recent_sessions.slice(0, 5).map((s, i, arr) => (
              <button key={s.id} style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr auto',
                alignItems: 'center',
                gap: 16, padding: '14px 18px',
                border: 'none',
                borderBottom: i < arr.length - 1 ? '1px solid var(--mauve-soft)' : 'none',
                borderLeft: s.flagged ? `3px solid ${s.tint}` : '3px solid transparent',
                background: 'transparent',
                textAlign: 'left', cursor: 'pointer',
                transition: 'background 180ms',
                flex: 1,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span className="dot" style={{ background: s.tint }} />
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{s.state}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="serif" style={{ fontSize: 16.5, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: '-0.005em' }}>{s.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.preview}</div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Still open column */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h3 className="serif" style={{ fontSize: 22, margin: 0, color: 'var(--ink)', fontWeight: 400, letterSpacing: '-0.01em' }}>Still open</h3>
            <button onClick={() => onNavigate('decisions')} style={{ fontSize: 13, color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer' }}>all decisions →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0 }}>
            {pending.map(d => (
              <div key={d.id} style={{
                padding: 16,
                background: 'var(--surface)',
                border: d.follow_up_in_days <= 0 ? '1px solid var(--amber)' : '1px solid var(--mauve-soft)',
                boxShadow: d.follow_up_in_days <= 0 ? '0 0 0 3px var(--amber-soft)' : 'none',
                borderRadius: 14,
              }}>
                <div className="mono" style={{ fontSize: 10, color: d.follow_up_in_days <= 0 ? 'var(--amber)' : 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
                  decision · {d.age_days}d old{d.follow_up_in_days <= 0 ? ' · follow-up overdue' : ''}
                </div>
                <div className="serif" style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 6 }}>{d.text}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>{d.context}</div>
              </div>
            ))}
            <div style={{
              padding: 14,
              background: 'var(--surface-2)',
              border: '1px solid var(--mauve-soft)',
              borderRadius: 14,
              marginTop: 'auto',
            }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
                clickup · context only
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                2 overdue tied to the hiring thread. 3 today. 1 shipped this week — the blog cut.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

window.TodayScreen = TodayScreen;
