// Decisions screen.

const EXTRA_API = window.EXTRA_API || window.TAMMY_API || 'http://localhost:7861';
const { ScreenWrap, Eyebrow, Stat } = window._ExtraShared;

const DecisionTimeline = ({ decisions }) => {
  const W = 1080, H = 80, pad = 10;
  const x = d => pad + ((d - (-90)) / 90) * (W - pad * 2);
  return (
    <div style={{ padding: '24px 12px', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 16, overflow: 'hidden' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <line x1={pad} y1={H/2} x2={W-pad} y2={H/2} stroke="var(--mauve-soft)" strokeWidth="1" />
        {[-90, -60, -30, 0].map((d, i) => (
          <g key={i}>
            <line x1={x(d)} y1={H/2-6} x2={x(d)} y2={H/2+6} stroke="var(--mauve)" strokeWidth="1" />
            <text x={x(d)} y={H-4} fontSize="10" fill="var(--ink-3)" textAnchor="middle" fontFamily="ui-monospace,monospace" letterSpacing="0.1em">{d === 0 ? 'TODAY' : `${d}d`}</text>
          </g>
        ))}
        {decisions.map((d, i) => {
          const pos = -(d.age_days || 0);
          if (pos < -90) return null;
          const open = d.status === 'pending';
          const overdue = open && (d.follow_up_in_days || 0) <= 0;
          const r = overdue ? 9 : open ? 7 : 5;
          return (
            <g key={d.id || i}>
              {overdue && <circle cx={x(pos)} cy={H/2} r={r+6} fill="var(--amber-soft)" />}
              <circle cx={x(pos)} cy={H/2} r={r} fill={open ? 'var(--amber)' : 'var(--ink)'} stroke="var(--surface)" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const DecisionRow = ({ d, last }) => {
  const [expanded, setExpanded] = React.useState(false);
  const overdue = (d.follow_up_in_days || 0) <= 0;
  return (
    <div onClick={() => setExpanded(e => !e)} style={{ padding: '22px 4px', borderBottom: last ? 'none' : '1px solid var(--mauve-soft)', cursor: 'pointer', transition: 'all 200ms ease' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 140px', gap: 20, alignItems: 'baseline' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: overdue ? 'var(--amber)' : 'var(--mauve)', boxShadow: overdue ? '0 0 12px var(--amber-glow)' : 'none', marginTop: 10 }} />
        <div>
          <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.35, letterSpacing: '-0.01em' }}>{d.text}</div>
          <div style={{ maxHeight: expanded ? 200 : 0, opacity: expanded ? 1 : 0, overflow: 'hidden', transition: 'all 300ms cubic-bezier(0.32,0.72,0.24,1)' }}>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: '12px 0 16px' }}>{d.context}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Open in chat</button>
              <button className="btn btn-ghost" onClick={async e => { e.stopPropagation(); await fetch(`${EXTRA_API}/api/decisions/${d.id}`, { method: 'PATCH', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status:'made'}) }); window.TammyBootstrap(); }} style={{ padding: '8px 14px', fontSize: 12 }}>Mark as made</button>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 12, color: overdue ? 'var(--amber)' : 'var(--ink-2)' }}>{d.age_days}d circling</div>
        </div>
      </div>
    </div>
  );
};

const MadeRow = ({ d, last }) => (
  <div style={{ padding: '20px 4px', borderBottom: last ? 'none' : '1px solid var(--mauve-soft)', display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 24, alignItems: 'baseline' }}>
    <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>{d.age_days}d ago</div>
    <div className="serif" style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1.4 }}>{d.text}</div>
    <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic', lineHeight: 1.55 }}>{d.outcome || '—'}</div>
  </div>
);

const DecisionsScreen = () => {
  const [data, setData] = React.useState(window.TammyData);
  const [filter, setFilter] = React.useState('all');
  const [scanning, setScanning] = React.useState(false);

  React.useEffect(() => {
    const h = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  const fetchDecisions = () => {
    fetch(`${EXTRA_API}/api/decisions?status=${filter}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(d => { window.TammyData.decisions = d; setData({ ...window.TammyData }); })
      .catch(() => {});
  };
  React.useEffect(() => { fetchDecisions(); }, [filter]);

  const handleScan = async () => {
    setScanning(true);
    try {
      await fetch(`${EXTRA_API}/api/decisions/scan`, { method: 'POST', credentials: 'include' });
      fetchDecisions();
    } catch {}
    setScanning(false);
  };

  const decisions = data.decisions || [];
  const pending  = decisions.filter(d => d.status === 'pending').sort((a, b) => (a.follow_up_in_days || 99) - (b.follow_up_in_days || 99));
  const made     = decisions.filter(d => d.status === 'made');
  const overdue  = pending.filter(d => (d.follow_up_in_days || 0) <= 0);
  const spotlight = overdue[0] || pending[0];
  const others   = pending.filter(d => d !== spotlight);
  const avgDays  = made.length ? Math.round(made.reduce((a, d) => a + (d.age_days || 0), 0) / made.length) : 0;
  const oldest   = pending.reduce((a, d) => Math.max(a, d.age_days || 0), 0);

  return (
    <ScreenWrap>
      <Eyebrow>Decision journal</Eyebrow>
      <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
        What you're<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>still weighing.</em>
      </h1>
      <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: '0 0 20px', maxWidth: 640, lineHeight: 1.5 }}>
        Every open call lives here until it closes.
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 36, alignItems: 'center' }}>
        {['all', 'pending', 'made'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 999, border: `1px solid ${filter === f ? 'var(--ink)' : 'var(--mauve-soft)'}`, background: filter === f ? 'var(--ink)' : 'transparent', color: filter === f ? 'var(--canvas)' : 'var(--ink-2)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      {decisions.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--mauve-soft)', marginBottom: 56 }}>
          <div className="serif" style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 16 }}>No decisions tracked yet.</div>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>Tammy can scan your recent chats and extract open dilemmas automatically.</p>
          <button className="btn btn-primary" onClick={handleScan} disabled={scanning} style={{ padding: '12px 24px', borderRadius: 999 }}>{scanning ? 'Scanning…' : 'Scan for open decisions'}</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--mauve-soft)', borderBottom: '1px solid var(--mauve-soft)', marginBottom: 56 }}>
            <Stat n={pending.length}  label="open" />
            <Stat n={overdue.length}  label="overdue" amber={overdue.length > 0} />
            <Stat n={oldest}          label="oldest open · days" />
            <Stat n={`${avgDays}d`}   label="avg time-to-decide" right />
          </div>

          {spotlight && (
            <div style={{ padding: '44px 48px', background: 'var(--surface)', border: '1px solid var(--amber)', boxShadow: '0 0 0 6px var(--amber-soft), 0 30px 80px rgba(43,20,86,0.10)', borderRadius: 24, marginBottom: 56 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 12px var(--amber)' }} />
                most urgent · {spotlight.age_days} days circling
              </div>
              <h2 className="serif" style={{ fontSize: 40, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em', margin: '0 0 24px', lineHeight: 1.15 }}>{spotlight.text}</h2>
              {spotlight.context && <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 32px', maxWidth: 720 }}>{spotlight.context}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={() => { if (window.TammyNavigate) window.TammyNavigate('chat'); }}>Talk it through with Tammy</button>
                <button className="btn btn-ghost" onClick={async () => { await fetch(`${EXTRA_API}/api/decisions/${spotlight.id}`, { method: 'PATCH', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status:'made'}) }); fetchDecisions(); }}>Mark as made</button>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 56 }}>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--ink)', margin: '0 0 18px' }}>Last 90 days</h3>
            <DecisionTimeline decisions={decisions} />
          </div>

          {others.length > 0 && (
            <div style={{ marginBottom: 56 }}>
              <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px' }}>Also open</h3>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>{others.length} more on the table</div>
              {others.map((d, i) => <DecisionRow key={d.id || i} d={d} last={i === others.length - 1} />)}
            </div>
          )}

          {made.length > 0 && (
            <div>
              <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px' }}>Recently made</h3>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>closed calls</div>
              {made.map((d, i) => <MadeRow key={d.id || i} d={d} last={i === made.length - 1} />)}
            </div>
          )}
        </>
      )}
    </ScreenWrap>
  );
};

window.DecisionsScreen = DecisionsScreen;
