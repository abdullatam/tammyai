// ═══ PAGE 5 — CONVERSATIONS MONITOR ═══════════════════════════════════════
const D2 = window.AdminData;

const ConvosPage = () => {
  const [loading, setLoading] = useState(true);
  const [allConvos, setAllConvos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    window.AdminAPI.getSessions(80).then(s => {
      setAllConvos(s || []);
      setLoading(false);
    }).catch(() => setLoading(false));
    const t = setInterval(() => {
      window.AdminAPI.getSessions(80).catch(() => []).then(s => setAllConvos(s || []));
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    return allConvos.filter((c) => {
      if (filter === 'flagged' && !(c.flags || []).some(f => ['flag','pattern'].includes(f))) return false;
      if (filter === 'voice' && !c.voice) return false;
      if (filter === 'arabic' && c.lang !== 'ar') return false;
      if (filter === 'pro' && c.plan !== 'Pro') return false;
      return true;
    });
  }, [filter, allConvos]);

  const flagColor = {
    'decision-detected': 'var(--purple-hi)',
    'dangerous-quiet': 'var(--danger)',
    milestone: 'var(--ok)',
    pattern: 'var(--warn)',
    flag: 'var(--danger)',
  };

  return (
    <div className="page">
      <TopHeader
        eyebrow={`${allConvos.length} sessions · live`}
        title="Conversations"
        subtitle="Live monitor. Click a row to read the session details."
        actions={<span className="pill"><span className="live-dot" /> Live</span>}
      />

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, padding: 4, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, width: 'fit-content' }}>
        {[
          { k: 'all', l: 'All' }, { k: 'flagged', l: 'Flagged' }, { k: 'voice', l: 'Voice' },
          { k: 'arabic', l: 'Arabic' }, { k: 'pro', l: 'Pro' }, { k: 'today', l: 'Today' },
        ].map((f) => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{
            padding: '6px 14px', fontSize: 12, border: 'none', cursor: 'pointer',
            background: filter === f.k ? 'var(--purple-soft)' : 'transparent',
            color: filter === f.k ? 'var(--purple-hi)' : 'var(--ink-2)',
            borderRadius: 8, fontFamily: 'var(--f-sans)',
          }}>{f.l}</button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={4} h={28} />) :
          filtered.map((c) => (
            <div key={c.id} onClick={() => setSelected(c)} style={{
              padding: '18px 22px', borderBottom: '1px solid var(--line)', cursor: 'pointer',
              transition: 'background 140ms', display: 'flex', gap: 18, alignItems: 'flex-start',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <div style={{ minWidth: 110 }}>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{c.user}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 4, letterSpacing: 0.05 }}>{c.when} · {c.dur}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {c.voice && <span title="voice" style={{ color: 'var(--calm)' }}><Icon name="mic" size={11} /></span>}
                  {c.lang === 'ar' && <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.06 }}>AR</span>}
                  {c.plan === 'Pro' && <span className="mono" style={{ fontSize: 9, color: 'var(--purple-hi)', letterSpacing: 0.06 }}>PRO</span>}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 6, fontStyle: 'italic', lineHeight: 1.5 }}>"{c.userMsg}"</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple-hi)', marginTop: 8, flexShrink: 0 }} />
                  <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.5 }}>{c.tammy}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', minWidth: 140 }}>
                <span className="pill" style={{ borderColor: 'var(--purple)', color: 'var(--purple-hi)' }}>{c.tag}</span>
                {c.flags.map((f) => (
                  <span key={f} className="pill" style={{ borderColor: flagColor[f] || 'var(--line)', color: flagColor[f] || 'var(--ink-3)', fontSize: 9 }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))
        }
      </div>

      {selected && (
        <>
          <div className="backdrop" onClick={() => setSelected(null)} style={{ background: 'rgba(11,9,21,0.5)' }} />
          <div className="side-panel" style={{ width: 540 }}>
            <div style={{ padding: 24, borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Transcript · {selected.dur} · {selected.when}</div>
                <h3 className="serif" style={{ margin: 0, fontSize: 22, fontWeight: 400 }}>{selected.user}</h3>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <span className="pill" style={{ borderColor: 'var(--purple)', color: 'var(--purple-hi)' }}>{selected.tag}</span>
                  {selected.flags.map(f => <span key={f} className="pill" style={{ borderColor: flagColor[f], color: flagColor[f] }}>{f}</span>)}
                </div>
              </div>
              <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => setSelected(null)}><Icon name="close" size={14} /></button>
            </div>

            {/* Orb state timeline */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Orb state timeline</div>
              <div style={{ display: 'flex', gap: 4, height: 24, alignItems: 'center' }}>
                {(selected.messages || []).map((m, i) => {
                  const c = m.orb === 'speaking' ? 'var(--purple-hi)' : m.orb === 'listening' ? 'var(--purple)' : 'var(--ink-4)';
                  return <div key={i} title={m.orb} style={{ flex: 1, height: 8, background: c, borderRadius: 4, opacity: 0.85 }} />;
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--ink-4)' }} className="mono">
                <span>0:00</span><span>{selected.dur}</span>
              </div>
            </div>

            {/* Transcript */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(selected.messages || [
                { role: 'user', text: selected.userMsg || 'Session started' },
                { role: 'assistant', text: selected.tammy || '(Tammy responded)' },
              ]).map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%', position: 'relative',
                }}>
                  <div style={{
                    background: m.role === 'user' ? 'var(--purple-soft)' : 'var(--surface-2)',
                    border: m.highlight ? '1px solid var(--purple)' : '1px solid var(--line)',
                    color: 'var(--ink)',
                    padding: '12px 16px', borderRadius: 14,
                    fontSize: 13.5, lineHeight: 1.6,
                  }}>
                    {m.decision && <div className="mono" style={{ fontSize: 9, color: 'var(--purple-hi)', letterSpacing: 0.1, marginBottom: 4 }}>★ DECISION HIGHLIGHT</div>}
                    {m.text}
                  </div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 4, letterSpacing: 0.06, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                    {m.role.toUpperCase()} · {m.tag} · ORB {m.orb}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

window.ConvosPage = ConvosPage;
