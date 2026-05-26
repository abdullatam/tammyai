const D = window.AdminData;

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
  const textareaRef = useRef(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.max(200, scrollHeight) + 'px';
    }
  }, [text]);

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
        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: 0.05 }}>
            <span>tammy.system.md · {lines.length} lines · {wordCount} words · ~{tokenEst.toLocaleString()} tokens</span>
            <span>UTF-8 · LF</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative', background: 'var(--bg)' }}>
            {/* Gutter Background */}
            <div style={{ position: 'sticky', top: 0, bottom: 0, left: 0, width: 48, background: 'var(--bg-2)', borderRight: '1px solid var(--line)', zIndex: 2 }} />
            
            {/* Content Wrapper */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, minHeight: '100%' }}>
              {/* Fake text wrapper for line numbers */}
              <div aria-hidden="true" style={{
                position: 'absolute', inset: 0,
                padding: '14px',
                fontFamily: 'var(--f-mono)', fontSize: 12, lineHeight: 1.7,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                color: 'transparent', pointerEvents: 'none', zIndex: 1,
              }}>
                {lines.map((line, i) => (
                  <div key={i} style={{ position: 'relative', paddingLeft: 48 }}>
                    <span style={{ position: 'absolute', left: 0, width: 32, textAlign: 'right', color: 'var(--ink-4)' }}>{i + 1}</span>
                    {line || ' '}
                  </div>
                ))}
              </div>

              {/* Actual Textarea */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                style={{
                  display: 'block', width: '100%',
                  border: 'none', background: 'transparent',
                  color: 'var(--ink)',
                  fontFamily: 'var(--f-mono)', fontSize: 12, lineHeight: 1.7,
                  padding: '14px 14px 14px 62px',
                  outline: 'none', resize: 'none',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  overflow: 'hidden', zIndex: 3, position: 'relative',
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
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 'calc(100vh - 220px)' }}>
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

window.PromptPage = PromptPage;
