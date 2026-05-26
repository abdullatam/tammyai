// ═══ PAGE 4 — ACTIVE USERS ════════════════════════════════════════════════
const D = window.AdminData;

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

window.UsersPage = UsersPage;
