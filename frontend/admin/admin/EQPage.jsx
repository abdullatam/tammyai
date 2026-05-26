const D2 = window.AdminData;

// ═══ PAGE 7 — EMOTIONAL INTELLIGENCE MONITOR ══════════════════════════════
const EQPage = () => {
  const [hover, setHover] = useState(null);
  const [threads, setThreads] = useState([]);
  const W = 720, H = 460, P = 50;

  useEffect(() => {
    window.AdminAPI.getEmotionalThreads().then(t => setThreads(t || [])).catch(() => {});
  }, []);

  // Map valence (-1..1) → x, arousal (0..1) → y (inverted), dominance → size
  const dotFor = (d) => ({
    x: P + ((d.v + 1) / 2) * (W - P * 2),
    y: P + (1 - d.a) * (H - P * 2),
    r: 6 + d.d * 6,
    color: d.d > 0.65 ? 'var(--purple-hi)' : d.d > 0.45 ? 'var(--purple)' : 'var(--purple-deep)',
  });

  return (
    <div className="page">
      <TopHeader
        eyebrow={`${threads.length} active threads`}
        title="EQ Monitor"
        subtitle="Active emotional threads sorted by intensity. X = valence · Y = arousal · size = dominance."
        actions={<span className="pill"><span className="live-dot" /> Live</span>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, marginBottom: 16 }}>
        {/* Threads */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Active threads</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Sorted by intensity · need follow-up</div>
          </div>
          {threads.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--ink-3)', fontSize: 13 }}>No active threads.</div>
          ) : threads.map((t) => (
            <div key={t.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{t.user}</span>
                <span className="mono" style={{ fontSize: 10, color: t.priority === 'high' ? 'var(--danger)' : t.priority === 'medium' ? 'var(--warn)' : 'var(--ink-3)', letterSpacing: 0.1, textTransform: 'uppercase' }}>{t.priority}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 8 }}>{t.state} · {t.days}d</div>
              <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ width: `${t.intensity * 100}%`, height: '100%', background: t.priority === 'high' ? 'var(--danger)' : t.priority === 'medium' ? 'var(--warn)' : 'var(--purple)' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', lineHeight: 1.5 }}>{t.last}</div>
            </div>
          ))}
        </div>

        {/* Scatter */}
        <div className="card" style={{ padding: 24, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="eyebrow">Emotional space · now</div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {[
                { c: 'var(--purple-deep)', l: 'low dom.' },
                { c: 'var(--purple)', l: 'mid' },
                { c: 'var(--purple-hi)', l: 'high dom.' },
              ].map((k) => (
                <div key={k.l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-3)' }}>
                  <span className="dot" style={{ background: k.c }} />{k.l}
                </div>
              ))}
            </div>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 460 }}>
            {/* axes / quadrants */}
            <line x1={W / 2} y1={P} x2={W / 2} y2={H - P} stroke="rgba(192,172,255,0.10)" strokeWidth="1" strokeDasharray="3 4" />
            <line x1={P} y1={H / 2} x2={W - P} y2={H / 2} stroke="rgba(192,172,255,0.10)" strokeWidth="1" strokeDasharray="3 4" />
            {/* axes labels */}
            <text x={P} y={H - 20} fontSize="10" fill="#7A7595" fontFamily="IBM Plex Mono" letterSpacing="1">HEAVY ←</text>
            <text x={W - P - 30} y={H - 20} fontSize="10" fill="#7A7595" fontFamily="IBM Plex Mono" letterSpacing="1">→ LIGHT</text>
            <text x={20} y={P} fontSize="10" fill="#7A7595" fontFamily="IBM Plex Mono" letterSpacing="1">↑ ACTIVATED</text>
            <text x={20} y={H - P + 8} fontSize="10" fill="#7A7595" fontFamily="IBM Plex Mono" letterSpacing="1">↓ CALM</text>
            <text x={W / 2 - 10} y={36} fontSize="10" fill="#4F4A6E" fontFamily="IBM Plex Mono" letterSpacing="1">VALENCE 0</text>

            {/* quadrant labels */}
            <text x={W * 0.78} y={P + 28} fontSize="11" fill="#A78BFA" fontFamily="Instrument Serif" fontStyle="italic">excited</text>
            <text x={P + 14} y={P + 28} fontSize="11" fill="#F87171" fontFamily="Instrument Serif" fontStyle="italic">tense</text>
            <text x={W * 0.78} y={H - P - 12} fontSize="11" fill="#4ADE80" fontFamily="Instrument Serif" fontStyle="italic">content</text>
            <text x={P + 14} y={H - P - 12} fontSize="11" fill="#FBBF24" fontFamily="Instrument Serif" fontStyle="italic">heavy</text>

            {D2.scatter && D2.scatter.length > 0 ? D2.scatter.map((d) => {
              const p = dotFor(d);
              const isHover = hover && hover.id === d.id;
              return (
                <g key={d.id}>
                  {isHover && <circle cx={p.x} cy={p.y} r={p.r + 8} fill="none" stroke="var(--purple-hi)" strokeOpacity="0.4" strokeWidth="1.5" />}
                  <circle cx={p.x} cy={p.y} r={p.r} fill={p.color} fillOpacity="0.85" stroke={isHover ? '#FFF' : 'transparent'} strokeWidth="1.5"
                    onMouseEnter={() => setHover(d)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }} />
                </g>
              );
            }) : null}
            {hover && (
              <g>
                <rect x={dotFor(hover).x + 14} y={dotFor(hover).y - 30} width="160" height="50" rx="8" fill="#181729" stroke="#947DED" strokeWidth="1" />
                <text x={dotFor(hover).x + 24} y={dotFor(hover).y - 12} fontSize="12" fill="#F5F2FF" fontFamily="IBM Plex Sans" fontWeight="500">{hover.name}</text>
                <text x={dotFor(hover).x + 24} y={dotFor(hover).y + 4} fontSize="10" fill="#B8B2D8" fontFamily="IBM Plex Sans">{hover.state} · {hover.dur}</text>
                <text x={dotFor(hover).x + 24} y={dotFor(hover).y + 16} fontSize="9" fill="#7A7595" fontFamily="IBM Plex Mono" letterSpacing="0.5">V {hover.v.toFixed(1)} · A {hover.a.toFixed(1)} · D {hover.d.toFixed(1)}</text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Bottom summary */}
      <div className="card" style={{ padding: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Platform-wide · last hour</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Most common state</div>
            <div className="serif" style={{ fontSize: 28 }}>{D2.emotionSummary?.mostCommon || '—'}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{D2.emotionSummary?.mostCommonPct || 0}% of active users</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Positive valence</div>
            <div className="serif" style={{ fontSize: 28 }}>{D2.emotionSummary?.posValencePct || 0}<span style={{ fontSize: 16, color: 'var(--ink-3)' }}>%</span></div>
            <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: `${D2.emotionSummary?.posValencePct || 0}%`, height: '100%', background: 'var(--ok)' }} />
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>High arousal</div>
            <div className="serif" style={{ fontSize: 28 }}>{D2.emotionSummary?.highArousalPct || 0}<span style={{ fontSize: 16, color: 'var(--ink-3)' }}>%</span></div>
            <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: `${D2.emotionSummary?.highArousalPct || 0}%`, height: '100%', background: 'var(--warn)' }} />
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Notable shifts</div>
            {(D2.emotionSummary?.shifts || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
                <span style={{ color: 'var(--ink)' }}>{s.name}</span>
                <span className="mono" style={{ fontSize: 10, color: s.kind === 'breakthrough' ? 'var(--ok)' : s.kind === 'decline' ? 'var(--danger)' : 'var(--purple-hi)' }}>{s.delta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.EQPage = EQPage;
