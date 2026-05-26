// ═══ PAGE 6 — SELF-TEST RUNNER ════════════════════════════════════════════
const D2 = window.AdminData;

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

window.TestPage = TestPage;
