// Tammy Admin — Pages 2: Conversations, Self-Test, EQ Monitor, Settings
const D2 = window.AdminData;

// ═══ PAGE 5 — CONVERSATIONS MONITOR ═══════════════════════════════════════
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

// ═══ PAGE 6 — SELF-TEST RUNNER ════════════════════════════════════════════
const TestPage = () => {
  const [running, setRunning] = useState(false);
  const [tests, setTests] = useState([]);
  const [progress, setProgress] = useState(0);
  const [autoTest, setAutoTest] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const runAll = async () => {
    setRunning(true);
    setTests([]);
    setProgress(0);
    try {
      const res = await window.AdminAPI.runSelfTest();
      const arr = Array.isArray(res) ? res : (res.results || []);
      setTests(arr);
      setProgress(arr.length);
    } catch (e) {
      setTests([{ name: 'Error: ' + e.message, pass: false, id: 1 }]);
    }
    setRunning(false);
  };

  const passed = tests.filter(t => t.pass || t.passed).length;
  const total = tests.length;

  return (
    <div className="page">
      <TopHeader
        eyebrow={`Self-Test Runner · live · v${window.AdminData.meta.promptVersion}`}
        title="Self-Test Runner"
        subtitle="The 12 things Tammy must always do right. Runs automatically after every prompt save."
      />

      {/* Hero */}
      <div className="card" style={{ padding: 28, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(500px 200px at 90% 50%, var(--purple-soft), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Pass rate</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span className="serif" style={{ fontSize: 64, lineHeight: 1, letterSpacing: '-0.025em' }}>
              {total > 0 ? passed : '—'}<span style={{ color: 'var(--ink-3)', fontSize: 32 }}>{total > 0 ? `/${total}` : ''}</span>
            </span>
            {total > 0 && <span className="mono" style={{ fontSize: 12, color: passed === total ? 'var(--ok)' : 'var(--warn)', letterSpacing: 0.05 }}>{Math.round(passed / total * 100)}%</span>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 8 }}>
            {total === 0 ? 'Run the self-test to see results.' : passed === total ? 'All checks green. Voice is intact.' : `${total - passed} regression${total - passed === 1 ? '' : 's'} need attention.`}
          </div>
        </div>
        <button className="btn btn-primary" style={{ padding: '14px 26px', fontSize: 14 }} onClick={runAll} disabled={running}>
          <Icon name="play" size={14} /> {running ? `Running…` : 'Run full self-test'}
        </button>
      </div>

      {/* Test rows */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1.4fr 1fr 100px', padding: '14px 22px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
          {['#', 'Test name', 'Input', 'Expected', 'Result'].map((h) => (
            <div key={h} className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.1, textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {tests.length === 0 && !running && (
          <div style={{ padding: 24, color: 'var(--ink-3)', fontSize: 13 }}>Click "Run full self-test" to fetch live results from the backend.</div>
        )}
        {tests.map((t, i) => {
          const pass = t.pass || t.passed;
          const isOpen = expanded === (t.id || i);
          return (
            <React.Fragment key={t.id || i}>
              <div onClick={() => !pass && setExpanded(isOpen ? null : (t.id || i))} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 1.4fr 1fr 100px',
                padding: '14px 22px', borderBottom: isOpen ? 'none' : '1px solid var(--line)',
                alignItems: 'center', cursor: !pass ? 'pointer' : 'default',
                transition: 'background 140ms',
                background: isOpen ? 'var(--surface-2)' : 'transparent',
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 13.5 }}>{t.name || t.test_name || ''}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.input || ''}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.expected || ''}</span>
                <span className="pill" style={{ background: pass ? 'rgba(74,222,128,0.10)' : 'rgba(248,113,113,0.10)', color: pass ? 'var(--ok)' : 'var(--danger)', borderColor: 'transparent', justifySelf: 'start' }}>
                  {pass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              {isOpen && !pass && (
                <div style={{ padding: '16px 22px 22px 62px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>Actual response</div>
                  <div style={{ padding: 14, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.6 }}>{t.actual || ''}</div>
                  {t.error && <><div className="eyebrow" style={{ marginBottom: 6, color: 'var(--danger)' }}>Why it failed</div><div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t.error}</div></>}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* History + auto-test */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
            <div className="eyebrow">Test history · last 10 runs</div>
          </div>
          <div style={{ padding: 24, color: 'var(--ink-3)', fontSize: 13 }}>Test history is not yet tracked in this backend. Run the self-test above to see current results.</div>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Auto-test</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--line)', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, color: 'var(--ink)' }}>Run after every prompt save</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Block deploy if regression detected</div>
            </div>
            <div className={`toggle ${autoTest ? 'on' : ''}`} onClick={() => setAutoTest(!autoTest)} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
            When ON, every save triggers the full 12-test suite before the new prompt reaches users. A failing run rolls back automatically and pings you in the audit log.
          </div>
        </div>
      </div>
    </div>
  );
};

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

// ═══ PAGE 8 — SETTINGS & CONFIG ═══════════════════════════════════════════
const SettingsPage = () => {
  const [triggers, setTriggers] = useState(D2.triggers);
  const [primaryModel, setPrimaryModel] = useState('claude-sonnet-4-5');
  const [fallback, setFallback] = useState('claude-haiku-4-5');
  const [temp, setTemp] = useState(0.65);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [ctxWindow, setCtxWindow] = useState(200000);
  const [rateLimit, setRateLimit] = useState(3);
  const [checkFreq, setCheckFreq] = useState('daily');
  const [mirrorMoment, setMirrorMoment] = useState(true);
  const [founderDNA, setFounderDNA] = useState(true);
  const [confirmPwd, setConfirmPwd] = useState(false);

  return (
    <div className="page">
      <TopHeader
        eyebrow={`Admin: ${D2.meta?.admin?.name || 'Admin'}`}
        title="Settings"
        subtitle="Models, triggers, and access. Every change is logged."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* API Keys */}
        <div className="card" style={{ padding: 24, gridColumn: '1 / -1' }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>API Keys · service status</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {(D2.apiKeys || []).map((k) => (
              <div key={k.name} style={{
                padding: 16, background: 'var(--bg-2)', border: `1px solid ${k.status === 'connected' ? 'var(--line)' : 'var(--danger)'}`,
                borderRadius: 12, position: 'relative', overflow: 'hidden',
              }}>
                {k.status !== 'connected' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--danger)' }} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{k.name}</span>
                  <StatusDot status={k.status} />
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 6, letterSpacing: 0.05, lineHeight: 1.5 }}>{k.model}</div>
                <div style={{ fontSize: 11, color: k.status === 'connected' ? 'var(--ink-3)' : 'var(--danger)', marginBottom: 10 }}>
                  {k.err || `tested ${k.lastTested}`}
                </div>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '6px 8px', fontSize: 11 }}>
                  <Icon name="refresh" size={11} /> Test now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Model config */}
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Model configuration</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Primary model">
              <select className="select" value={primaryModel} onChange={(e) => setPrimaryModel(e.target.value)}>
                <option>claude-sonnet-4-5</option>
                <option>claude-haiku-4-5</option>
                <option>gpt-4o</option>
                <option>gpt-4o-mini</option>
              </select>
            </Field>
            <Field label="Fallback model">
              <select className="select" value={fallback} onChange={(e) => setFallback(e.target.value)}>
                <option>claude-haiku-4-5</option>
                <option>gpt-4o-mini</option>
              </select>
            </Field>
            <Field label="Temperature" right={<span className="mono" style={{ fontSize: 12, color: 'var(--purple-hi)' }}>{temp}</span>}>
              <input type="range" min="0" max="1" step="0.05" value={temp} onChange={(e) => setTemp(+e.target.value)} style={{ width: '100%', accentColor: 'var(--purple)' }} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Max tokens"><input className="input" type="number" value={maxTokens} onChange={(e) => setMaxTokens(+e.target.value)} /></Field>
              <Field label="Context window"><input className="input" type="number" value={ctxWindow} onChange={(e) => setCtxWindow(+e.target.value)} /></Field>
            </div>
          </div>
        </div>

        {/* Intervention engine */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <div className="eyebrow">Intervention engine</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-3)' }}>
              Rate limit · max
              <input className="input" type="number" value={rateLimit} onChange={(e) => setRateLimit(+e.target.value)} style={{ width: 60, padding: '4px 8px', textAlign: 'center' }} />
              /day per user
            </div>
          </div>
          {triggers.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, color: 'var(--ink)' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{t.desc}</div>
              </div>
              <div className={`toggle ${t.on ? 'on' : ''}`} onClick={() => setTriggers(ts => ts.map(x => x.id === t.id ? { ...x, on: !x.on } : x))} />
            </div>
          ))}
        </div>

        {/* Scheduler */}
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Scheduler</div>
          <Field label="Check frequency"><select className="select" value={checkFreq} onChange={(e) => setCheckFreq(e.target.value)}>
            <option>hourly</option><option>every-3h</option><option>daily</option><option>twice-daily</option>
          </select></Field>
          <div style={{ height: 14 }} />
          <SchedRow label="Mirror Moment" desc="Daily reflection summary, 9am local" on={mirrorMoment} setOn={setMirrorMoment} />
          <SchedRow label="Founder DNA" desc="Weekly pattern report, Sundays 6pm" on={founderDNA} setOn={setFounderDNA} />
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>
            <Icon name="play" size={14} /> Run scheduler now
          </button>
        </div>

        {/* Admin access */}
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Admin access</div>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }} onClick={() => setConfirmPwd(true)}>
            <Icon name="key" size={14} /> Change admin password
          </button>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Audit log · last 8</div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {(D2.auditLog || []).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)', fontSize: 12 }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', minWidth: 56 }}>{a.when}</span>
                <span style={{ flex: 1, color: 'var(--ink-2)' }}>{a.what}</span>
                <span className="mono" style={{ fontSize: 10, color: a.who === 'system' ? 'var(--info)' : 'var(--purple-hi)' }}>{a.who}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {confirmPwd && (
        <ConfirmModal title="Change admin password?" body="You'll be signed out of all devices. The new password takes effect immediately."
          confirmLabel="Continue" onConfirm={() => setConfirmPwd(false)} onCancel={() => setConfirmPwd(false)} />
      )}
    </div>
  );
};

const Field = ({ label, children, right }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <div className="eyebrow">{label}</div>
      {right}
    </div>
    {children}
  </div>
);

const SchedRow = ({ label, desc, on, setOn }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: '1px solid var(--line)' }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13.5, color: 'var(--ink)' }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{desc}</div>
    </div>
    <div className={`toggle ${on ? 'on' : ''}`} onClick={() => setOn(!on)} />
  </div>
);

Object.assign(window, { ConvosPage, TestPage, EQPage, SettingsPage });
