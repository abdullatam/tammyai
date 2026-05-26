// Network screen.

const EXTRA_API = window.EXTRA_API || window.TAMMY_API || 'http://localhost:7861';
const { ScreenWrap, Eyebrow } = window._ExtraShared;

const IncomingCard = ({ r }) => {
  const [state, setState] = React.useState('pending');
  if (state === 'shared') return (
    <div style={{ padding: '24px 28px', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 16, opacity: 0.85 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', color: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✓</div>
      <div style={{ flex: 1 }}><div className="serif" style={{ fontSize: 16, color: 'var(--ink)' }}>Info shared with {r.name}</div><div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>They'll get a Tammy-curated brief · revoke any time</div></div>
      <button onClick={() => setState('pending')} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Undo</button>
    </div>
  );
  if (state === 'declined') return (
    <div style={{ padding: '20px 24px', background: 'transparent', border: '1px dashed var(--mauve)', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.6 }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Declined · {r.name}</div>
      <button onClick={() => setState('pending')} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 11, marginLeft: 'auto' }}>Reconsider</button>
    </div>
  );
  const ac = r.avatar_color || '#947DED';
  return (
    <div style={{ position: 'relative', padding: '28px 30px', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${ac} 0%, ${ac}66 100%)`, color: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontFamily: 'var(--font-serif,Georgia)', flexShrink: 0, boxShadow: `0 8px 20px ${ac}40` }}>
          {r.name ? r.name.split(' ').map(s => s[0]).join('') : '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.015em' }}>{r.name}</div>
            {r.verified && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'var(--surface-2)', border: '1px solid var(--mauve-soft)', borderRadius: 12, fontSize: 10, fontFamily: 'var(--font-mono,ui-monospace)', color: 'var(--ink-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}><span style={{ color: '#C0ACFF' }}>✓</span> verified</span>}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>{r.role}</div>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{r.sent}</div>
      </div>
      {r.reason && (
        <div style={{ marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>Why they're reaching out</div>
          <p className="serif" style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>"{r.reason}"</p>
        </div>
      )}
      {r.tammy_take && (
        <div style={{ padding: '14px 18px', background: 'var(--surface-2)', borderRadius: 12, borderLeft: '2px solid var(--ink)', marginBottom: 18, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ink)', color: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'var(--font-serif,Georgia)', fontStyle: 'italic', flexShrink: 0, marginTop: 2 }}>T</div>
          <div><div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>tammy's take</div><div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>{r.tammy_take}</div></div>
        </div>
      )}
      {(r.asking_for || r.mutuals) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 22, paddingBottom: 20, borderBottom: '1px solid var(--mauve-soft)' }}>
          {r.asking_for && (
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>They're asking for</div>
              {r.asking_for.map((a, i) => <div key={i} style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ink-3)' }} />{a}</div>)}
            </div>
          )}
          {r.mutuals !== undefined && (
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Mutuals</div>
              {(r.mutuals || []).length === 0 ? <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', fontStyle: 'italic' }}>none — cold reach</div>
              : <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r.mutuals.join(' · ')}</div>}
            </div>
          )}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={() => setState('shared')} className="btn btn-primary" style={{ padding: '12px 20px', fontSize: 13 }}>Share my info</button>
        <button className="btn btn-ghost" style={{ padding: '12px 18px', fontSize: 13 }}>Reply via Tammy</button>
        <button onClick={() => setState('declined')} className="btn btn-ghost" style={{ padding: '12px 18px', fontSize: 13, marginLeft: 'auto', color: 'var(--ink-3)' }}>Decline</button>
      </div>
    </div>
  );
};

const NetworkOrbit = ({ intros }) => {
  const W = 1080, H = 280, cx = W/2, cy = H/2;
  return (
    <div style={{ marginBottom: 12 }}>
      <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Your circle</h2>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>{intros.length} active relationships</div>
      <div style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 24 }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
          {[60, 100, 140].map((r, i) => <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="var(--mauve-soft)" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />)}
          {intros.map((p, i) => {
            const angle = (i / intros.length) * Math.PI * 2 - Math.PI / 2;
            const dist = 50 + (1 - (p.warmth || 0.5)) * 100;
            const px = cx + Math.cos(angle) * dist, py = cy + Math.sin(angle) * dist;
            const right = px >= cx;
            const pending = p.status === 'pending';
            const name = p.name || '?';
            return (
              <g key={i}>
                <line x1={cx} y1={cy} x2={px} y2={py} stroke={pending ? 'var(--amber)' : 'var(--mauve)'} strokeDasharray={pending ? '3 4' : '0'} opacity="0.5" />
                <circle cx={px} cy={py} r="20" fill="var(--surface)" stroke={pending ? 'var(--amber)' : 'var(--ink)'} strokeWidth="2" />
                <text x={px} y={py+4} fontSize="11" fill={pending ? 'var(--amber)' : 'var(--ink)'} textAnchor="middle" fontFamily="var(--f-sans)">{name.split(' ').map(s=>s[0]).join('')}</text>
                <text x={right ? px+30 : px-30} y={py-2} fontSize="13" fill="var(--ink)" textAnchor={right ? 'start' : 'end'} fontFamily="var(--font-serif,Georgia)">{name}</text>
                <text x={right ? px+30 : px-30} y={py+14} fontSize="10" fill="var(--ink-3)" textAnchor={right ? 'start' : 'end'} fontFamily="var(--font-mono,ui-monospace)" letterSpacing="0.1em">{(p.role || '').toUpperCase()}</text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r="22" fill="var(--ink)" />
          <text x={cx} y={cy+6} fontSize="18" fill="var(--surface)" textAnchor="middle" fontFamily="var(--font-serif,Georgia)" fontStyle="italic">T</text>
        </svg>
      </div>
    </div>
  );
};

const NetworkScreen = () => {
  const [data, setData] = React.useState(window.TammyData);
  const [loading, setLoading] = React.useState(false);
  const [connections, setConnections] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [optedIn, setOptedIn] = React.useState(null);
  const [showInvite, setShowInvite] = React.useState(false);

  React.useEffect(() => {
    const h = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  // Fetch real connections and requests
  React.useEffect(() => {
    const API = window.EXTRA_API || window.TAMMY_API || 'http://localhost:7861';
    fetch(`${API}/network/connections`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : []).then(setConnections).catch(() => {});
    fetch(`${API}/network/requests`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : []).then(setRequests).catch(() => {});
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : {}).then(d => setOptedIn(!!d.network_opted_in)).catch(() => {});
  }, []);

  const handleScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${EXTRA_API}/api/network?force=1`, { credentials: 'include' });
      if (res.ok) { window.TammyData.network = await res.json(); setData({ ...window.TammyData }); }
    } catch (e) {}
    setLoading(false);
  };

  const handleOptToggle = async () => {
    const API = window.EXTRA_API || window.TAMMY_API || 'http://localhost:7861';
    const endpoint = optedIn ? '/network/opt-out' : '/network/opt-in';
    try {
      const res = await fetch(`${API}${endpoint}`, { method: 'POST', credentials: 'include' });
      if (res.ok) setOptedIn(!optedIn);
    } catch (e) {}
  };

  const net = data.network;
  const skillMatches = data.skill_matches || [];

  // Pending requests where this user is the target (permission requests)
  const pendingForMe = requests.filter(r => r.status === 'pending_target_approval');

  if (!net || !net.intros) {
    return (
      <ScreenWrap>
        <style>{`@keyframes tammy-pulse { 0%, 100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.98); } }`}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: 24, animation: 'tammy-pulse 3s infinite ease-in-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 40, justifyContent: 'center' }}>
            {[...Array(10)].map((_, i) => <div key={i} style={{ width: 4, height: 12 + (i%3)*6, background: 'var(--amber)', borderRadius: 4, opacity: 0.6 }} />)}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="serif" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 12 }}>Mapping your network…</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Analyzing chat history for connections</div>
          </div>
          <button className="btn btn-ghost" onClick={handleScan} disabled={loading}>{loading ? 'Scanning…' : 'Scan now'}</button>
        </div>
      </ScreenWrap>
    );
  }

  const { intros, skills, incoming } = net;

  // Merge real connections into the orbit — add them as high-warmth nodes
  const orbitPeople = [...intros];
  connections.forEach(c => {
    if (!orbitPeople.find(p => p.name === c.other_user_name)) {
      orbitPeople.push({
        name: c.other_user_name,
        role: 'Tammy Connect',
        status: 'made',
        warmth: 0.9,
        for: c.need_description,
      });
    }
  });

  return (
    <ScreenWrap>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 18 }}>
        <div>
          <Eyebrow>{orbitPeople.length} {orbitPeople.length === 1 ? 'connection' : 'connections'} · {intros.filter(i => i.status === 'pending').length} pending intros · {(incoming.length + skillMatches.length + pendingForMe.length)} new requests</Eyebrow>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>The people<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>around the work.</em></h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0, maxWidth: 560, lineHeight: 1.5 }}>Some you talked to last week. Some are knocking now. Tammy holds the context for both.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <button className="btn btn-ghost" style={{ padding: '14px 22px', fontSize: 14 }} onClick={() => setShowInvite(true)}>Invite someone</button>
          <button className="btn btn-ghost" onClick={handleScan} disabled={loading} style={{ padding: '14px 22px', fontSize: 14, color: 'var(--ink-3)' }}>{loading ? 'Scanning…' : 'Rescan network'}</button>
          {optedIn !== null && (
            <button
              className="btn btn-ghost"
              onClick={handleOptToggle}
              style={{
                padding: '14px 22px', fontSize: 14,
                color: optedIn ? 'var(--ink-3)' : 'var(--iris)',
                border: optedIn ? undefined : '1px solid var(--iris)',
              }}
            >
              {optedIn ? 'Opted in ✓' : 'Opt in to Connect'}
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 56, marginBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <h2 className="serif" style={{ fontSize: 30, fontWeight: 400, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>Tammy Connect</h2>
            <span style={{ padding: '4px 10px', background: 'var(--ink)', color: 'var(--surface)', borderRadius: 20, fontSize: 10, fontFamily: 'var(--font-mono,ui-monospace)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{incoming.length + skillMatches.length + pendingForMe.length} new</span>
          </div>
        </div>
        <p className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 24px' }}>People who want to reach you · Tammy filters &amp; summarizes</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Real Tammy Connect permission requests */}
          {pendingForMe.map((req, i) => (
            <ConnectRequestCard key={req.request_id || i} req={req} />
          ))}
          {skillMatches.map((sm, i) => (
            <div key={i} style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(148,125,237,0.08), rgba(192,172,255,0.05))', border: '1px solid rgba(148,125,237,0.3)', borderLeft: '3px solid var(--iris)', borderRadius: 16, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: '0 0 36px', height: 36, borderRadius: '50%', background: 'var(--iris)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✦</div>
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--iris)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>Tammy found a match · {sm.skill_requested}</div>
                <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, marginBottom: 4 }}>{sm.match?.name || 'Someone in your network'} — {sm.match?.role || ''}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{sm.message}</div>
              </div>
              <button onClick={async () => { window.TammyData.skill_matches = window.TammyData.skill_matches.filter((_,j) => j !== i); window.dispatchEvent(new Event('tammy:dataready')); }} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--mauve-soft)', background: 'transparent', color: 'var(--ink-3)', fontSize: 11, cursor: 'pointer' }}>dismiss</button>
            </div>
          ))}
          {incoming.length > 0 ? incoming.map(r => <IncomingCard key={r.id || r.name} r={r} />) : (
            skillMatches.length === 0 && pendingForMe.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 16 }}>
                <div className="serif" style={{ fontSize: 20, color: 'var(--ink-2)', marginBottom: 8 }}>No new requests</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>IT'S QUIET RIGHT NOW</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Real connections from Tammy Connect */}
      {connections.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Connected through Tammy</h2>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 20 }}>{connections.length} active {connections.length === 1 ? 'connection' : 'connections'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {connections.map(c => (
              <div key={c.request_id} style={{ padding: '22px 26px', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #947DED, #C0ACFF)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontFamily: 'var(--font-serif,Georgia)', flexShrink: 0 }}>
                  {c.other_user_name.split(' ').map(s => s[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="serif" style={{ fontSize: 19, color: 'var(--ink)' }}>{c.other_user_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{c.match_reason || c.need_description}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
                    Connected {c.connected_at ? new Date(c.connected_at * 1000).toLocaleDateString() : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={async () => {
                      try {
                        const API = window.EXTRA_API || window.TAMMY_API || 'http://localhost:7861';
                        const res = await fetch(`${API}/network/thread/${c.request_id}`, { method: 'POST', credentials: 'include' });
                        if (res.ok) {
                          const data = await res.json();
                          window.TammyData.activeConnectionChat = {
                            connection_id: c.request_id,
                            session_id: data.session_id,
                            other_user_name: c.other_user_name,
                            match_reason: c.match_reason || c.need_description || '',
                          };
                          if (window.TammyNavigate) window.TammyNavigate('dm');
                        }
                      } catch (e) { console.error('Thread create failed', e); }
                    }}
                    style={{
                      padding: '8px 16px', borderRadius: 10,
                      border: '1px solid rgba(148,125,237,0.3)',
                      background: 'rgba(148,125,237,0.08)',
                      color: '#947DED', fontSize: 12, fontFamily: 'var(--f-sans)',
                      cursor: 'pointer', fontWeight: 500,
                      transition: 'all 200ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,125,237,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,125,237,0.08)'; }}
                  >
                    Message
                  </button>
                  <div style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(148,125,237,0.1)', border: '1px solid rgba(148,125,237,0.3)', fontSize: 11, color: 'var(--iris)', fontFamily: 'var(--font-mono,ui-monospace)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>connected</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <NetworkOrbit intros={orbitPeople} />

      <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40 }}>
        <div>
          <h3 className="serif" style={{ fontSize: 24, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.015em' }}>Intros you've asked for</h3>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 20 }}>outgoing · sorted by recency</div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 16 }}>
            {intros.length === 0 ? <div style={{ padding: '32px', textAlign: 'center', fontSize: 14, color: 'var(--ink-3)', fontStyle: 'italic' }}>No intros yet.</div>
            : intros.map((p, i) => (
              <div key={i} style={{ padding: '20px 22px', borderBottom: i < intros.length - 1 ? '1px solid var(--mauve-soft)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--mauve-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--ink-2)' }}>{p.name.split(' ').map(s=>s[0]).join('')}</div>
                <div style={{ flex: 1 }}>
                  <div className="serif" style={{ fontSize: 17, color: 'var(--ink)' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.role}{p.for ? ` · for ${p.for}` : ''}</div>
                </div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999, background: p.status === 'pending' ? 'var(--amber-soft)' : 'var(--surface-2)', color: p.status === 'pending' ? 'var(--amber)' : 'var(--ink-2)', border: p.status === 'pending' ? '1px solid var(--amber)' : '1px solid var(--mauve-soft)' }}>{p.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="serif" style={{ fontSize: 24, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.015em' }}>What peers say you're good at</h3>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 20 }}>endorsements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(skills || []).length === 0 ? <div style={{ padding: '32px', textAlign: 'center', fontSize: 14, color: 'var(--ink-3)', fontStyle: 'italic' }}>No endorsements yet.</div>
            : (skills || []).map((s, i) => (
              <div key={i} style={{ padding: 18, background: 'var(--surface)', border: s.pending ? '1px solid var(--amber)' : '1px solid var(--mauve-soft)', boxShadow: s.pending ? '0 0 0 3px var(--amber-soft)' : 'none', borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <div className="serif" style={{ fontSize: 18, color: 'var(--ink)' }}>{s.skill}</div>
                  <div className="mono" style={{ fontSize: 10, color: s.pending ? 'var(--amber)' : 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{s.pending ? 'awaiting confirmation' : `${s.endorsements} endorsement${s.endorsements > 1 ? 's' : ''}`}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{(s.peers || []).join(' · ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} userName={window.TammyData?.user?.name || 'Someone'} />}
    </ScreenWrap>
  );
};

// Invite modal — share Tammy with someone
const InviteModal = ({ onClose, userName }) => {
  const [copied, setCopied] = React.useState(false);
  const inviteUrl = window.location.origin + '/landing';
  const inviteMessage = `${userName} invited you to try Tammy — an AI that actually remembers you. ${inviteUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = inviteUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform) => {
    const text = encodeURIComponent(inviteMessage);
    const url = encodeURIComponent(inviteUrl);
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } else if (platform === 'email') {
      window.open(`mailto:?subject=${encodeURIComponent(userName + ' invited you to Tammy')}&body=${text}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(31, 28, 48, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeInUp 300ms ease',
      }}
    >
      <div style={{
        width: 480, maxWidth: '90vw',
        background: 'var(--surface)',
        border: '1px solid var(--mauve-soft)',
        borderRadius: 24,
        padding: '40px 36px',
        boxShadow: '0 40px 100px rgba(43, 20, 86, 0.3)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #947DED, #C0ACFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>✦</div>
              <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#947DED' }}>Tammy Connect</span>
            </div>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>Invite someone to Tammy</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 22, cursor: 'pointer', padding: '4px 8px', lineHeight: 1 }}>×</button>
        </div>

        <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 24px' }}>
          Share this link with someone you want in your Tammy network. Once they sign up, Tammy can connect you when either of you needs what the other knows.
        </p>

        {/* Invite link */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          background: 'var(--surface-2)',
          border: '1px solid var(--mauve-soft)',
          borderRadius: 14,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          <div style={{
            flex: 1, padding: '14px 18px',
            fontSize: 14, fontFamily: 'var(--font-mono, ui-monospace)',
            color: 'var(--ink-2)', letterSpacing: '0.02em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {inviteUrl}
          </div>
          <button
            onClick={handleCopy}
            style={{
              padding: '14px 20px',
              background: copied ? 'rgba(148,125,237,0.15)' : 'var(--ink)',
              color: copied ? '#947DED' : 'var(--surface)',
              border: 'none',
              fontSize: 13,
              fontFamily: 'var(--f-sans)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              whiteSpace: 'nowrap',
              fontWeight: 500,
            }}
          >
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
        </div>

        {/* Share buttons */}
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>Or share via</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleShare('whatsapp')}
            style={{
              padding: '12px 20px', borderRadius: 12,
              border: '1px solid var(--mauve-soft)', background: 'transparent',
              color: 'var(--ink)', fontSize: 13, fontFamily: 'var(--f-sans)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 18 }}>💬</span> WhatsApp
          </button>
          <button
            onClick={() => handleShare('email')}
            style={{
              padding: '12px 20px', borderRadius: 12,
              border: '1px solid var(--mauve-soft)', background: 'transparent',
              color: 'var(--ink)', fontSize: 13, fontFamily: 'var(--f-sans)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 18 }}>✉️</span> Email
          </button>
          <button
            onClick={() => handleShare('twitter')}
            style={{
              padding: '12px 20px', borderRadius: 12,
              border: '1px solid var(--mauve-soft)', background: 'transparent',
              color: 'var(--ink)', fontSize: 13, fontFamily: 'var(--f-sans)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 18 }}>𝕏</span> Twitter
          </button>
        </div>

        {/* Invite message preview */}
        <div style={{ marginTop: 24, padding: '16px 18px', background: 'rgba(148,125,237,0.06)', border: '1px solid rgba(148,125,237,0.15)', borderRadius: 14 }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>Message preview</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, fontStyle: 'italic' }}>{inviteMessage}</div>
        </div>
      </div>
    </div>
  );
};

// Card for real Tammy Connect permission requests (target user perspective)
const ConnectRequestCard = ({ req }) => {
  const [state, setState] = React.useState('pending');
  const API = window.EXTRA_API || window.TAMMY_API || 'http://localhost:7861';

  const handleAccept = async () => {
    try {
      const res = await fetch(`${API}/network/accept-permission/${req.request_id}`, { method: 'POST', credentials: 'include' });
      if (res.ok) setState('accepted');
    } catch (e) {}
  };
  const handleDecline = async () => {
    try {
      const res = await fetch(`${API}/network/decline-permission/${req.request_id}`, { method: 'POST', credentials: 'include' });
      if (res.ok) setState('declined');
    } catch (e) {}
  };

  if (state === 'accepted') {
    return (
      <div style={{ padding: '20px 24px', background: 'rgba(148,125,237,0.06)', border: '1px solid rgba(148,125,237,0.25)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#947DED', fontSize: 18 }}>✓</span>
        <div>
          <div className="serif" style={{ fontSize: 16, color: 'var(--ink)' }}>Name shared</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>You're now connected</div>
        </div>
      </div>
    );
  }
  if (state === 'declined') {
    return (
      <div style={{ padding: '16px 20px', background: 'transparent', border: '1px dashed var(--mauve)', borderRadius: 16, opacity: 0.6 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Declined · stayed anonymous</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px', background: 'linear-gradient(135deg, rgba(148,125,237,0.08), rgba(192,172,255,0.04))', border: '1px solid rgba(148,125,237,0.3)', borderLeft: '3px solid var(--iris)', borderRadius: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #947DED, #C0ACFF)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--iris)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Tammy Connect · Permission Request</div>
        </div>
      </div>
      <p className="serif" style={{ fontSize: 17, color: 'var(--ink)', margin: '0 0 10px', lineHeight: 1.5 }}>
        Someone in the Tammy network is looking for exactly what you know.
      </p>
      {req.need_description && (
        <div style={{ padding: '10px 14px', background: 'var(--surface)', borderRadius: 10, marginBottom: 14, borderLeft: '2px solid var(--iris)' }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>What they need</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{req.need_description}</div>
        </div>
      )}
      {req.match_reason && (
        <div style={{ padding: '10px 14px', background: 'var(--surface)', borderRadius: 10, marginBottom: 14, borderLeft: '2px solid var(--ink)' }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>Why you match</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, fontStyle: 'italic' }}>{req.match_reason}</div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={handleAccept} className="btn btn-primary" style={{ padding: '12px 20px', fontSize: 13 }}>Yes, share my name</button>
        <button onClick={handleDecline} className="btn btn-ghost" style={{ padding: '12px 18px', fontSize: 13, color: 'var(--ink-3)' }}>Keep me anonymous</button>
      </div>
    </div>
  );
};

window.NetworkScreen = NetworkScreen;

