// Today dashboard — the home. Editorial greeting + hero voice card with breathing orb.
// Mode pills. "Where you've been" recent sessions. ClickUp whisper. Decisions waiting.

const TodayScreen = ({ onNavigate, activeBucket, setActiveBucket }) => {
  const [data, setData] = React.useState(window.TammyData);
  React.useEffect(() => {
    const onReady = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', onReady);
    return () => window.removeEventListener('tammy:dataready', onReady);
  }, []);
  const D = data;

  return (
    <div style={{ marginLeft: 120, padding: '0 0 80px', maxWidth: 1200, margin: '0 auto 0 120px' }}>
      <Buckets active={activeBucket} onChange={setActiveBucket} />

      <div style={{ padding: '36px 64px 0' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 400, marginBottom: 4 }}>
          {(D.greeting || D.today_greeting || {}).phrase || 'hey.'} <span style={{ color: 'var(--ink-2)' }}>{(D.user.name || '').toLowerCase()}.</span>
        </div>
      </div>

      {/* Hero line */}
      <h1 className="serif" style={{
        fontSize: 56, lineHeight: 1.05, margin: '0 0 12px',
        color: 'var(--ink)', fontWeight: 400,
        maxWidth: 900, textWrap: 'balance',
      }}>
        {(D.greeting || D.today_greeting || {}).hero_line || "what's on your chest?"}
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', margin: '0 0 44px', maxWidth: 700 }}>
        {(D.greeting || D.today_greeting || {}).subtext || ''}
      </p>

      {/* Hero voice card */}
      <div style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr 220px',
        alignItems: 'center',
        gap: 32,
        padding: '36px 40px',
        borderRadius: 28,
        background: 'linear-gradient(135deg, rgba(148, 125, 237, 0.12) 0%, rgba(148, 125, 237, 0.14) 100%)',
        border: '1px solid rgba(178, 157, 217, 0.4)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        marginBottom: 56,
      }}>
        {/* Soft pool */}
        <div style={{
          position: 'absolute', right: -60, top: -60,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(148, 125, 237, 0.18), transparent 60%)',
        }} />
        <div style={{ position: 'relative' }}>
          <h2 className="serif" style={{ fontSize: 32, margin: 0, color: 'var(--ink)', fontWeight: 400, lineHeight: 1.1 }}>
            Talk to me.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '10px 0 24px', maxWidth: 440 }}>
            {D.recent_sessions.length > 0
              ? `Last time: "${D.recent_sessions[0].preview || D.recent_sessions[0].title}"`
              : "Pick up where you left off, or start something new."}
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('voice')}>
              start voice
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <button className="btn btn-ghost" onClick={() => onNavigate('chat')}>type instead</button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <Orb size={180} state="idle" />
        </div>
      </div>

      {/* Mode pills */}
      <div style={{ marginBottom: 48 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 14 }}>
          or start with a frame
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {[
            { label: 'Morning check-in', sub: '2-min voice intention', tint: '#C0ACFF' },
            { label: 'Decision thinking', sub: D.decisions.length > 0 ? `${D.decisions.length} pending` : 'think it through', tint: '#947DED' },
            { label: 'Just dump', sub: 'she listens, no challenge', tint: '#8B8898' },
            { label: 'Brief me on…', sub: 'a person or topic', tint: '#6B5BC8' },
            { label: 'Weekly review', sub: 'surface the patterns', tint: '#C0ACFF' },
          ].map((p, i) => (
            <button key={i} style={{
              flex: '0 0 auto',
              padding: '14px 18px',
              borderRadius: 16,
              border: `1px solid ${p.tint}55`,
              background: `${p.tint}10`,
              color: 'var(--ink)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 200ms',
              minWidth: 180,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${p.tint}22`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${p.tint}10`; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="dot" style={{ background: p.tint }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{p.label}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Two-column: Where you've been + Waiting */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <h3 style={{ fontSize: 17, margin: 0, color: 'var(--ink)', fontWeight: 500 }}>Where you've been</h3>
            <button onClick={() => onNavigate('arc')} style={{ fontSize: 13, color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {D.recent_sessions.map(s => (
              <button key={s.id} style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr auto',
                alignItems: 'center',
                gap: 16, padding: '16px 14px',
                border: 'none',
                borderLeft: s.flagged ? `2px solid ${s.tint}` : '2px solid transparent',
                background: 'transparent',
                borderRadius: 8,
                textAlign: 'left', cursor: 'pointer',
                transition: 'background 200ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 253, 248, 0.5)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span className="dot" style={{ background: s.tint }} />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.state}</span>
                </div>
                <div>
                  <div className="serif" style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1.3 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{s.preview}</div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--mauve)' }}>{s.time}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 17, margin: '0 0 18px', color: 'var(--ink)', fontWeight: 500 }}>Still open</h3>

          {/* Pending decisions */}
          {D.decisions.filter(d => d.status === 'pending').map(d => (
            <div key={d.id} style={{
              padding: 18, marginBottom: 12,
              background: 'var(--surface)',
              border: d.follow_up_in_days <= 0 ? '1px solid var(--amber)' : '1px solid rgba(178, 157, 217, 0.3)',
              boxShadow: d.follow_up_in_days <= 0 ? '0 0 0 4px var(--amber-soft)' : 'none',
              borderRadius: 14,
            }}>
              <div className="mono" style={{ fontSize: 10, color: d.follow_up_in_days <= 0 ? 'var(--amber)' : 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
                decision · {d.age_days}d old {d.follow_up_in_days <= 0 ? '· follow-up overdue' : ''}
              </div>
              <div className="serif" style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1.3 }}>{d.text}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5 }}>{d.context}</div>
            </div>
          ))}

          {/* Session stats */}
          {D.arc_stats && (D.arc_stats.sessions_count > 0 || D.arc_stats.decisions_count > 0) && (
            <div style={{
              marginTop: 18,
              padding: 18,
              background: 'var(--surface-2)',
              border: '1px solid var(--mauve-soft)',
              borderRadius: 14,
            }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
                your arc
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {D.arc_stats.sessions_count || 0} sessions total · {D.arc_stats.decisions_count || 0} decisions tracked · {D.arc_stats.insights_count || 0} insights surfaced
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

window.TodayScreen = TodayScreen;
