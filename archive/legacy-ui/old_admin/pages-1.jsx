// Tammy Admin — Pages 1: Overview, Prompt, RAG, Users
const D = window.AdminData;

// ═══ PAGE 1 — OVERVIEW ════════════════════════════════════════════════════
const OverviewPage = () => {
  const [stats, setStats] = useState(D.meta);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      window.AdminAPI.getStats().catch(() => null),
      window.AdminAPI.getSessions(20).catch(() => []),
    ]).then(([s, sess]) => {
      if (s) setStats(s);
      setSessions(sess || []);
      setLoading(false);
    });
    const t = setInterval(() => {
      window.AdminAPI.getSessions(20).catch(() => []).then(s => setSessions(s || []));
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const eventColor = {
    session: 'var(--info)', decision: 'var(--purple-hi)',
    milestone: 'var(--ok)', voice: 'var(--calm)',
    flag: 'var(--danger)', memory: 'var(--warn)', arc: 'var(--purple)',
  };

  return (
    <div className="page">
      <TopHeader
        eyebrow="Live · Production"
        title="Overview"
        subtitle="Everything Tammy is doing right now. Refreshes live."
        actions={<>
          <span className="pill"><span className="live-dot" /> Live</span>
          <span className="pill mono">{stats.region || D.meta.region}</span>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Active users now" value={stats.activeNow ?? D.meta.activeNow} sub="last 10 min" accent />
        <StatCard label="Total users" value={(stats.totalUsers ?? D.meta.totalUsers).toLocaleString()} sub="registered" />
        <StatCard label="Conversations today" value={(stats.convosToday ?? D.meta.convosToday).toLocaleString()} sub="last 24h" />
        <StatCard label="Avg response time" value={stats.avgResponse ?? D.meta.avgResponse} unit="s" sub="estimated" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ChartCard title="Daily active users" sub="last 7 days" data={D.dauTrend} labels={D.dauLabels} suffix="" />
          <ChartCard title="Response time" sub="last 7 days · seconds" data={D.responseTrend} labels={D.dauLabels} suffix="s" inverted />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 660 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Recent sessions</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Live · all users</div>
            </div>
            <span className="live-dot" />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={2} />) :
              sessions.length === 0 ? (
                <div style={{ padding: 24, color: 'var(--ink-3)', fontSize: 13 }}>No recent activity</div>
              ) :
              sessions.map((ev, i) => (
                <div key={ev.id || i} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '12px 20px', borderBottom: '1px solid var(--line)',
                }}>
                  <span className="dot" style={{ background: 'var(--purple)', marginTop: 6 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.45 }}>
                      <strong style={{ fontWeight: 500 }}>{ev.user}</strong>
                      <span style={{ color: 'var(--ink-2)' }}> · {ev.session_name || ev.userMsg?.slice(0, 60) || 'new session'}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2, letterSpacing: 0.06 }}>{ev.when} · SESSION</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, sub, data, labels, suffix = '', inverted }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 720, h = 200, pad = { l: 40, r: 16, t: 20, b: 28 };
  const innerW = w - pad.l - pad.r, innerH = h - pad.t - pad.b;
  const pts = data.map((v, i) => ({
    x: pad.l + (i / (data.length - 1)) * innerW,
    y: pad.t + (1 - (v - min) / (max - min || 1)) * innerH,
    v,
  }));
  const path = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const fill = `${path} L${pts[pts.length - 1].x},${h - pad.b} L${pts[0].x},${h - pad.b} Z`;
  const last = data[data.length - 1];
  const first = data[0];
  const change = last - first;
  const dirGood = inverted ? change < 0 : change > 0;

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="serif" style={{ fontSize: 28 }}>{last}{suffix}</span>
            <span className="mono" style={{ fontSize: 11, color: dirGood ? 'var(--ok)' : 'var(--danger)', letterSpacing: 0.05 }}>
              {change >= 0 ? '+' : ''}{change.toFixed(suffix === 's' ? 2 : 0)}{suffix} 7d
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 200 }}>
        <defs>
          <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#947DED" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#947DED" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line key={p} x1={pad.l} x2={w - pad.r} y1={pad.t + p * innerH} y2={pad.t + p * innerH} stroke="rgba(192,172,255,0.06)" strokeWidth="1" />
        ))}
        <path d={fill} fill={`url(#grad-${title})`} />
        <path d={path} fill="none" stroke="#C0ACFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3} fill={i === pts.length - 1 ? '#C0ACFF' : '#947DED'} />
            {i === pts.length - 1 && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#C0ACFF" strokeOpacity="0.4" strokeWidth="1" />}
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={l} x={pts[i].x} y={h - 8} fontSize="10" fill="#7A7595" fontFamily="IBM Plex Mono" textAnchor="middle" letterSpacing="0.5">{l.toUpperCase()}</text>
        ))}
      </svg>
    </div>
  );
};

// ═══ PAGE 2 — SYSTEM PROMPT EDITOR ════════════════════════════════════════
const PromptPage = () => {
  const [text, setText] = useState(D.systemPrompt || '');
  const [version, setVersion] = useState(D.meta.promptVersion);
  const [versions, setVersions] = useState([]);
  const [activeId, setActiveId] = useState(D._activePromptId || null);
  const [savedAt, setSavedAt] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [confirmRollback, setConfirmRollback] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [selfTestResults, setSelfTestResults] = useState([]);
  const [selfTestRunning, setSelfTestRunning] = useState(false);
  const [testMessages, setTestMessages] = useState([
    { role: 'tammy', text: 'Mini test chat. Type a message below — Tammy answers using the live backend.' },
  ]);
  const [testInput, setTestInput] = useState('');
  const [orbState, setOrbState] = useState('idle');
  const [showSelfTest, setShowSelfTest] = useState(false);

  // Load active prompt + versions on mount
  useEffect(() => {
    window.AdminAPI.getActivePrompt().then(p => {
      if (p && p.content) {
        setText(p.content);
        setVersion(`v${p.version}`);
        setActiveId(p._id);
        setSavedAt(p.published_at ? new Date(p.published_at).toLocaleTimeString() : '');
      }
    }).catch(() => {});
    window.AdminAPI.listPromptVersions().then(vs => setVersions(vs)).catch(() => {});
  }, []);

  const lines = text.split('\n');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const tokenEst = Math.round(text.length / 3.8);

  const doSave = async () => {
    setAutoSaveStatus('saving');
    try {
      const draft = await window.AdminAPI.savePrompt(text, `Saved from admin panel`);
      setActiveId(draft._id);
      setVersion(`v${draft.version}`);
      setSavedAt(new Date().toLocaleTimeString());
      setAutoSaveStatus('saved');
      const vs = await window.AdminAPI.listPromptVersions().catch(() => []);
      setVersions(vs);
    } catch (e) {
      setAutoSaveStatus('error');
      alert('Save failed: ' + e.message);
    }
  };

  const doRollback = async () => {
    const target = versions.find(v => `v${v.version}` === version);
    if (!target) return alert('Version not found');
    try {
      const rolled = await window.AdminAPI.rollbackPrompt(target._id);
      setText(rolled.content);
      setVersion(`v${rolled.version}`);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) { alert('Rollback failed: ' + e.message); }
    setConfirmRollback(false);
  };

  const runSelfTest = async () => {
    setSelfTestRunning(true);
    setSelfTestResults([]);
    try {
      const res = await window.AdminAPI.runSelfTest(text);
      const tests = Array.isArray(res) ? res : (res.results || []);
      setSelfTestResults(tests);
    } catch (e) { setSelfTestResults([]); }
    setSelfTestRunning(false);
    setShowSelfTest(true);
  };

  const sendTest = async () => {
    if (!testInput.trim() || !activeId) return;
    const msg = testInput.trim();
    const history = testMessages.filter(m => m.role !== 'tammy' || testMessages.indexOf(m) > 0);
    setTestMessages((m) => [...m, { role: 'user', text: msg }]);
    setTestInput('');
    setOrbState('thinking');
    try {
      const messages = history.concat({ role: 'user', text: msg })
        .filter(m => m.role !== 'tammy' || testMessages.indexOf(m) === 0)
        .map(m => ({ role: m.role === 'tammy' ? 'assistant' : 'user', content: m.text }));
      const r = await window.AdminAPI.testPrompt(activeId, messages);
      setTimeout(() => setOrbState('speaking'), 100);
      setTestMessages((m) => [...m, { role: 'tammy', text: r.response || '[no response]' }]);
    } catch (e) {
      setTestMessages((m) => [...m, { role: 'tammy', text: '[test error: ' + e.message + ']' }]);
    }
    setOrbState('idle');
  };

  return (
    <div className="page">
      <TopHeader
        eyebrow={`Editing · ${version}`}
        title="System Prompt"
        subtitle="The voice. Test before saving. Self-test runs automatically after every save."
        actions={<>
          <span className="pill mono"><span className="dot" style={{ background: autoSaveStatus === 'saved' ? 'var(--ok)' : 'var(--warn)' }} /> {autoSaveStatus === 'saved' ? `auto-saved ${savedAt}` : 'saving…'}</span>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: 16 }}>
        {/* LEFT: editor */}
        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 720 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: 0.05 }}>
            <span>tammy.system.md · {lines.length} lines · {wordCount} words · ~{tokenEst.toLocaleString()} tokens</span>
            <span>UTF-8 · LF</span>
          </div>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* line numbers */}
            <div style={{
              padding: '14px 12px', textAlign: 'right',
              fontFamily: 'var(--f-mono)', fontSize: 12, lineHeight: 1.7,
              color: 'var(--ink-4)',
              borderRight: '1px solid var(--line)',
              minWidth: 48, userSelect: 'none',
              background: 'var(--bg-2)',
              overflow: 'hidden',
            }}>
              {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            {/* code with section highlighting */}
            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                style={{
                  width: '100%', height: '100%',
                  border: 'none', background: 'transparent',
                  color: 'var(--ink)',
                  fontFamily: 'var(--f-mono)', fontSize: 12, lineHeight: 1.7,
                  padding: 14,
                  outline: 'none', resize: 'none',
                  minHeight: 580,
                }}
              />
            </div>
          </div>
          {/* bottom bar */}
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)', display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg-2)' }}>
            <select className="select" style={{ width: 120, fontSize: 12 }} value={version} onChange={(e) => setVersion(e.target.value)}>
              {versions.length > 0
                ? versions.map((v) => <option key={v._id} value={`v${v.version}`}>{`v${v.version}`}{v.status === 'published' ? ' ✓' : ''}</option>)
                : <option>{version}</option>}
            </select>
            <button className="btn btn-ghost" onClick={() => setConfirmRollback(true)}>
              <Icon name="rollback" size={14} /> Rollback
            </button>
            <div style={{ flex: 1 }} />
            <button className="btn btn-ghost" onClick={runSelfTest} disabled={selfTestRunning}>
              <Icon name="test" size={14} /> {selfTestRunning ? 'Running…' : 'Self-test results'}
            </button>
            <button className="btn btn-primary" onClick={() => setConfirmSave(true)}>
              <Icon name="save" size={14} /> Save & deploy
            </button>
          </div>
        </div>

        {/* RIGHT: test chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 720 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <MiniOrb state={orbState} />
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ marginBottom: 2 }}>Live test · unsaved</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Tammy answers using the prompt on the left</div>
            </div>
            <span className="pill" style={{ borderColor: 'var(--warn)', color: 'var(--warn)' }}>Testing unsaved</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {testMessages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? 'var(--purple-soft)' : 'var(--surface-2)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                padding: '12px 16px',
                borderRadius: 14,
                fontSize: 13.5,
                lineHeight: 1.55,
              }}>
                {m.text}
              </div>
            ))}
            {orbState === 'thinking' && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 6, padding: '6px 16px' }}>
                <span style={{ width: 6, height: 6, background: 'var(--purple-hi)', borderRadius: '50%', animation: 'pulse-glow 1.2s ease infinite' }} />
                <span style={{ width: 6, height: 6, background: 'var(--purple-hi)', borderRadius: '50%', animation: 'pulse-glow 1.2s ease 0.2s infinite' }} />
                <span style={{ width: 6, height: 6, background: 'var(--purple-hi)', borderRadius: '50%', animation: 'pulse-glow 1.2s ease 0.4s infinite' }} />
              </div>
            )}
          </div>
          <div style={{ padding: 14, borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Type a message to test the prompt…"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendTest()}
            />
            <button className="btn btn-primary" onClick={sendTest}>
              <Icon name="arrow" size={14} />
            </button>
          </div>
        </div>
      </div>

      {showSelfTest && (
        <div className="backdrop" onClick={() => setShowSelfTest(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: 720, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 22, borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="eyebrow">Self-test · live run</div>
                <h3 className="serif" style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 400 }}>
                  {selfTestRunning ? 'Running…' : selfTestResults.length > 0
                    ? `${selfTestResults.filter(t => t.pass || t.passed).length} of ${selfTestResults.length} passed`
                    : 'Click "Self-test" to run'}
                </h3>
              </div>
              <button className="btn btn-ghost" onClick={() => setShowSelfTest(false)}><Icon name="close" size={14} /></button>
            </div>
            <div style={{ overflowY: 'auto', padding: 0 }}>
              {selfTestResults.length === 0 && !selfTestRunning && (
                <div style={{ padding: 24, color: 'var(--ink-3)', fontSize: 13 }}>No results yet. Click Self-test to run.</div>
              )}
              {selfTestResults.map((t, idx) => (
                <div key={t.id || idx} style={{ padding: '14px 22px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', width: 22 }}>{String(idx + 1).padStart(2, '0')}</span>
                  <span style={{ flex: 1, fontSize: 13.5 }}>{t.name || t.test_name || t.description || JSON.stringify(t)}</span>
                  <span className="pill" style={{ background: (t.pass || t.passed) ? 'rgba(74,222,128,0.10)' : 'rgba(248,113,113,0.10)', color: (t.pass || t.passed) ? 'var(--ok)' : 'var(--danger)', borderColor: 'transparent' }}>
                    {(t.pass || t.passed) ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {confirmRollback && (
        <ConfirmModal title="Rollback to previous version?" body={`This will restore prompt ${version} as the live prompt.`}
          confirmLabel="Rollback" onConfirm={doRollback} onCancel={() => setConfirmRollback(false)} />
      )}
      {confirmSave && (
        <ConfirmModal title="Save & deploy?" body="This will deploy the new prompt immediately. The change is logged."
          confirmLabel="Save & deploy" onConfirm={() => { setConfirmSave(false); doSave(); }} onCancel={() => setConfirmSave(false)} />
      )}
    </div>
  );
};

// ═══ PAGE 3 — RAG BOOKS MANAGER ═══════════════════════════════════════════
const RAGPage = () => {
  const [loading, setLoading] = useState(true);
  const [ragStats, setRagStats] = useState({ total_vectors: 0, books: [] });
  const [books, setBooks] = useState([]);

  useEffect(() => {
    window.AdminAPI.getRagStats().then(s => {
      setRagStats(s);
      setBooks((s.books || []).map((b, i) => ({
        id: b.book_id || `b${i}`,
        title: b.book_name || b.book_id,
        vectors: b.chunk_count || 0,
        chunks: b.chunk_count || 0,
        indexed: 'indexed',
        status: 'ready',
        size: '—',
      })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  const [confirm, setConfirm] = useState(null);
  const [injectStage, setInjectStage] = useState(null);
  const [chunkSize, setChunkSize] = useState(512);
  const [pasteMode, setPasteMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const startInject = () => {
    const stages = ['chunking', 'embedding', 'upserting', 'done'];
    let i = 0;
    setInjectStage({ stage: stages[0], pct: 0 });
    const t = setInterval(() => {
      i++;
      if (i >= stages.length) {
        clearInterval(t);
        setTimeout(() => setInjectStage(null), 1500);
        return;
      }
      setInjectStage({ stage: stages[i], pct: (i / (stages.length - 1)) * 100 });
    }, 900);
  };

  return (
    <div className="page">
      <TopHeader
        eyebrow={`${books.length} books · ${books.reduce((s, b) => s + b.vectors, 0).toLocaleString()} vectors`}
        title="RAG Books"
        subtitle="The library Tammy thinks with. Books are chunked, embedded, and stored in Pinecone."
      />

      {/* Books grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 18 }} />)
          : books.map((b) => (
            <div key={b.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusDot status={b.status} />
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>{b.status}</span>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{b.size}</span>
              </div>
              <h3 className="serif" style={{ margin: 0, fontSize: 18, fontWeight: 400, lineHeight: 1.25, minHeight: 44 }}>{b.title}</h3>
              <div style={{ display: 'flex', gap: 18, fontSize: 12, color: 'var(--ink-3)', marginTop: 'auto' }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.06 }}>VECTORS</div>
                  <div className="mono" style={{ color: 'var(--ink), fontSize: 13' }}>{b.vectors.toLocaleString()}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.06 }}>CHUNKS</div>
                  <div className="mono" style={{ color: 'var(--ink)', fontSize: 13 }}>{b.chunks}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.06 }}>INDEXED</div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 12 }}>{b.indexed}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}><Icon name="refresh" size={12} /> Re-index</button>
                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}><Icon name="eye" size={12} /> Preview</button>
                <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12, marginLeft: 'auto', color: 'var(--danger)', borderColor: 'transparent' }} onClick={() => setConfirm({ kind: 'book', id: b.id, title: b.title })}>
                  <Icon name="trash" size={12} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Upload */}
      <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Inject new book</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button className="btn btn-ghost" style={{ background: !pasteMode ? 'var(--purple-soft)' : 'transparent', color: !pasteMode ? 'var(--purple-hi)' : undefined, borderColor: !pasteMode ? 'var(--purple)' : undefined }} onClick={() => setPasteMode(false)}>Drop file</button>
            <button className="btn btn-ghost" style={{ background: pasteMode ? 'var(--purple-soft)' : 'transparent', color: pasteMode ? 'var(--purple-hi)' : undefined, borderColor: pasteMode ? 'var(--purple)' : undefined }} onClick={() => setPasteMode(true)}>Paste text</button>
          </div>

          {!pasteMode ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
              style={{
                border: `2px dashed ${dragActive ? 'var(--purple)' : 'var(--line-strong)'}`,
                borderRadius: 14,
                padding: '38px 20px',
                textAlign: 'center',
                background: dragActive ? 'var(--purple-soft)' : 'var(--bg-2)',
                transition: 'all 200ms',
                marginBottom: 16,
              }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--purple-hi)' }}>
                <Icon name="upload" size={28} />
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>Drop a PDF, EPUB, or .md file here</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>or click to browse · max 50 MB</div>
            </div>
          ) : (
            <textarea className="textarea" placeholder="Paste book text or article…" style={{ minHeight: 180, marginBottom: 16 }} />
          )}

          {/* Chunk size */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--line)' }}>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Chunk size</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{chunkSize} tokens · {chunkSize < 400 ? 'tighter recall' : chunkSize > 800 ? 'fuller context' : 'balanced'}</div>
            </div>
            <input type="range" min="256" max="1024" step="64" value={chunkSize} onChange={(e) => setChunkSize(+e.target.value)} style={{ width: 200, accentColor: 'var(--purple)' }} />
          </div>

          {/* Inject button + progress */}
          {injectStage ? (
            <div style={{ padding: 16, background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--purple)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--purple-hi)', letterSpacing: 0.1, textTransform: 'uppercase' }}>{injectStage.stage}…</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{Math.round(injectStage.pct)}%</div>
              </div>
              <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${injectStage.pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--purple), var(--purple-hi))', transition: 'width 800ms ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                {['chunking', 'embedding', 'upserting', 'done'].map((s) => (
                  <span key={s} className="mono" style={{ fontSize: 10, color: injectStage.stage === s ? 'var(--purple-hi)' : 'var(--ink-4)', letterSpacing: 0.05 }}>{s.toUpperCase()}</span>
                ))}
              </div>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={startInject}>
              <Icon name="plus" size={14} /> Inject into RAG
            </button>
          )}
        </div>

      {confirm && (
        <ConfirmModal
          danger
          title={`Delete ${confirm.kind === 'book' ? 'book' : 'document'}?`}
          body={`"${confirm.title}" will be removed${confirm.kind === 'book' ? ' from the RAG index. All vectors will be deleted from Pinecone.' : '. The user will lose access to this knowledge.'}`}
          confirmLabel="Delete"
          onConfirm={() => {
            if (confirm.kind === 'book') setBooks((bs) => bs.filter((b) => b.id !== confirm.id));
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

// ═══ PAGE 4 — ACTIVE USERS ════════════════════════════════════════════════
const UsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [confirmImp, setConfirmImp] = useState(false);

  useEffect(() => {
    window.AdminAPI.getUsers().then(users => {
      setAllUsers(users || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return allUsers.filter((u) => {
      if (filter === 'online' && !u.online) return false;
      if (filter === 'pro' && u.plan !== 'Pro') return false;
      if (filter === 'new' && parseInt(u.joined) > 14) return false;
      if (query && !(`${u.name || ''} ${u.handle || ''}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [filter, query, allUsers]);

  const stateColor = (s) => {
    if (['heavy', 'tense', 'strained', 'stuck'].includes(s)) return 'var(--danger)';
    if (['weighing', 'quiet'].includes(s)) return 'var(--warn)';
    if (['breakthrough', 'rising', 'clear', 'building', 'reset'].includes(s)) return 'var(--ok)';
    return 'var(--info)';
  };

  return (
    <div className="page">
      <TopHeader
        eyebrow={`${allUsers.filter(u => u.online).length} online · ${allUsers.length} total`}
        title="Active Users"
        subtitle="Click any row for the full picture. Impersonate is read-only."
      />

      {/* Filters + search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12 }}>
          {[
            { k: 'all', l: 'All' },
            { k: 'online', l: 'Online now' },
            { k: 'pro', l: 'Pro only' },
            { k: 'new', l: 'New this week' },
          ].map((f) => (
            <button key={f.k} onClick={() => setFilter(f.k)} className="btn" style={{
              padding: '6px 14px', fontSize: 12,
              background: filter === f.k ? 'var(--purple-soft)' : 'transparent',
              color: filter === f.k ? 'var(--purple-hi)' : 'var(--ink-2)',
              border: 'none',
              borderRadius: 8,
            }}>{f.l}</button>
          ))}
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <input className="input" placeholder="Search by name or @handle…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 38 }} />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>
            <Icon name="search" size={14} />
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 1fr 0.7fr 80px', padding: '14px 22px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
          {['User', 'Sessions today', 'Last seen', 'Emotional state', 'Plan', ''].map((h) => (
            <div key={h} className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.1, textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
          : filtered.map((u) => (
            <div key={u.id} onClick={() => setSelected(u)} style={{
              display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 1fr 0.7fr 80px',
              padding: '14px 22px',
              borderBottom: '1px solid var(--line)',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background 140ms',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--purple), var(--purple-deep))',
                    color: '#FFF', fontSize: 12, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  {u.online && <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: 'var(--ok)', border: '2px solid var(--surface)' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink)' }}>{u.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{u.handle}</div>
                </div>
                {u.flag && <span className="pill" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 9 }}>{u.flag}</span>}
              </div>
              <div className="mono" style={{ fontSize: 13, color: u.sessions > 0 ? 'var(--ink)' : 'var(--ink-4)' }}>{u.sessions}</div>
              <div className="mono" style={{ fontSize: 12, color: u.online ? 'var(--ok)' : 'var(--ink-3)' }}>{u.lastSeen}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="dot" style={{ background: stateColor(u.state) }} />
                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{u.state}</span>
              </div>
              <div>
                <span className="pill" style={{ borderColor: u.plan === 'Pro' ? 'var(--purple)' : 'var(--line-strong)', color: u.plan === 'Pro' ? 'var(--purple-hi)' : 'var(--ink-3)' }}>{u.plan}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Icon name="chevron" size={14} />
              </div>
            </div>
          ))}
      </div>

      {/* Side panel */}
      {selected && (
        <>
          <div className="backdrop" onClick={() => setSelected(null)} style={{ background: 'rgba(11,9,21,0.5)' }} />
          <div className="side-panel">
            <div style={{ padding: 24, borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--purple), var(--purple-deep))',
                    color: '#FFF', fontSize: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{selected.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                  <div>
                    <h3 className="serif" style={{ margin: 0, fontSize: 22, fontWeight: 400 }}>{selected.name}</h3>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{selected.handle} · joined {selected.joined} ago</div>
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => setSelected(null)}><Icon name="close" size={14} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
                <PanelStat label="Plan" value={selected.plan} />
                <PanelStat label="Memories" value={selected.memories} />
                <PanelStat label="Sessions today" value={selected.sessions} />
                <PanelStat label="Last seen" value={selected.lastSeen} />
              </div>
            </div>

            <div style={{ padding: 24, borderBottom: '1px solid var(--line)' }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Venture</div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{selected.venture}</div>
            </div>

            <div style={{ padding: 24, borderBottom: '1px solid var(--line)' }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Last 5 sessions</div>
              {[
                { t: 'now', preview: '"i need to figure out the co-founder split"', dur: '4m 12s', tag: 'decision' },
                { t: '6h', preview: '"the call with the investor went sideways"', dur: '7m 03s', tag: 'pattern' },
                { t: '1d', preview: '"closed the contractor decision"', dur: '2m 41s', tag: 'milestone' },
                { t: '2d', preview: '"morning. just thinking out loud."', dur: '5m 18s', tag: 'reflective' },
                { t: '4d', preview: '"why does this still feel hard"', dur: '11m 22s', tag: 'heavy' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)', display: 'flex', gap: 12 }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', minWidth: 32, marginTop: 3 }}>{s.t}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)', fontStyle: 'italic' }}>{s.preview}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 4, letterSpacing: 0.05 }}>{s.dur} · {s.tag.toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: 24, borderBottom: '1px solid var(--line)' }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Emotional threads</div>
              {['decision · co-founder split · open 3d', 'pattern · pricing decision · 4 visits', 'value-thread · "clarity over speed"'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', fontSize: 13, color: 'var(--ink-2)' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--purple)', marginTop: 8, flexShrink: 0 }} />
                  {t}
                </div>
              ))}
            </div>

            <div style={{ padding: 24 }}>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setConfirmImp(true)}>
                <Icon name="impersonate" size={14} /> Impersonate (read-only)
              </button>
            </div>
          </div>
        </>
      )}

      {confirmImp && (
        <ConfirmModal
          title="Enter read-only impersonation?"
          body={`You'll see Tammy's view of ${selected?.name}'s account. You can read everything; no actions will be taken on their behalf. Logged in audit log.`}
          confirmLabel="Enter"
          onConfirm={() => { setConfirmImp(false); setSelected(null); }}
          onCancel={() => setConfirmImp(false)}
        />
      )}
    </div>
  );
};

const PanelStat = ({ label, value }) => (
  <div style={{ padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 10 }}>
    <div className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: 0.1, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
    <div className="serif" style={{ fontSize: 18 }}>{value}</div>
  </div>
);

Object.assign(window, { OverviewPage, PromptPage, RAGPage, UsersPage });
