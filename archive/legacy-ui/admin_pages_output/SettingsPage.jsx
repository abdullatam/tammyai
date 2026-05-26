// ═══ PAGE 8 — SETTINGS & CONFIG ═══════════════════════════════════════════
const D2 = window.AdminData;

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

const ProfilePage = () => {
  const adminName = window.AdminData?.meta?.admin?.name || 'Administrator';
  const role = window.AdminData?.meta?.admin?.role || 'Super Admin';
  const initial = window.AdminData?.meta?.admin?.initial || 'A';
  
  return (
    <div className="page">
      <TopHeader
        eyebrow="Admin Profile"
        title="Profile"
        subtitle="Manage your admin account."
      />
      <div className="card" style={{ padding: 32, maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 36 }}>
          <div style={{ 
            width: 88, height: 88, borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--purple) 0%, var(--purple-deep) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, color: '#FFF', fontWeight: 600,
            boxShadow: '0 8px 24px rgba(108, 92, 231, 0.25)',
            fontFamily: 'var(--f-serif)'
          }}>
            {initial}
          </div>
          <div>
            <div style={{ fontSize: 28, color: 'var(--ink)', fontFamily: 'var(--f-serif)', marginBottom: 4 }}>{adminName}</div>
            <div className="mono" style={{ fontSize: 13, color: 'var(--purple-hi)', letterSpacing: 0.1 }}>{role.toUpperCase()}</div>
          </div>
        </div>
        
        <div className="eyebrow" style={{ marginBottom: 16 }}>Account Actions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '14px 20px', fontSize: 14 }} onClick={async () => {
             await window.AdminAuth.logout();
             window.location.reload();
          }}>
            <Icon name="profile" size={16} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

window.SettingsPage = SettingsPage;
