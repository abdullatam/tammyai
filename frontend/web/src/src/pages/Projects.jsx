// Projects screen — intelligent project cards auto-populated from conversations.

const EXTRA_API = window.EXTRA_API || window.TAMMY_API || 'http://localhost:7861';
const { ScreenWrap, Eyebrow, H1, Sub, STATUS_COLOR, Glyph, StatusPill } = window._ExtraShared;

const INITIAL_VISIBLE = 6;

// ── Stage colors ────────────────────────────────────────────
const STAGE_COLORS = {
  idea: { bg: 'rgba(192,172,255,0.12)', color: '#C0ACFF', border: 'rgba(192,172,255,0.35)' },
  building: { bg: 'rgba(107,91,200,0.10)', color: '#6B5BC8', border: 'rgba(107,91,200,0.3)' },
  launched: { bg: 'rgba(125,237,148,0.10)', color: '#4CAF50', border: 'rgba(125,237,148,0.3)' },
  scaling: { bg: 'rgba(237,184,125,0.10)', color: '#EDB87D', border: 'rgba(237,184,125,0.3)' },
};

const ENERGY_DOT = {
  high: '#4CAF50',
  medium: '#EDB87D',
  low: '#ED7D97',
};

// ── Stats row ────────────────────────────────────────────────
const ProjStat = ({ label, value, sub, accent, small }) => (
  <div style={{ background: 'var(--surface)', padding: '20px 24px' }}>
    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>{label}</div>
    <div className="serif" style={{ fontSize: small ? 22 : 36, color: accent, fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em' }}>{value}</div>
    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>
  </div>
);

// ── Gravity map ─────────────────────────────────────────────
const Constellation = ({ projects }) => {
  const W = 1080, H = 320, cx = W / 2, cy = H / 2;
  const energyScores = React.useMemo(() => projects.map(p => {
    const mc = p.mentions_count || 1;
    const el = p.energy_level || 'medium';
    return mc * (el === 'high' ? 3 : el === 'medium' ? 2 : 1);
  }), [projects]);
  const maxE = React.useMemo(() => Math.max(...energyScores, 1), [energyScores]);

  const stageColor = (p) => {
    const s = p.stage || 'building';
    return STAGE_COLORS[s]?.color || '#947DED';
  };

  return (
    <div style={{ position: 'relative', padding: '32px 24px', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 24, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 24, left: 28, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'var(--font-mono,ui-monospace)' }}>Gravity map</div>
      <div style={{ position: 'absolute', top: 24, right: 28, fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono,ui-monospace)', display: 'flex', gap: 20 }}>
        {Object.entries(STAGE_COLORS).map(([k, c]) => <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} /> {k}</span>)}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {[80, 130, 180].map((r, i) => <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="var(--mauve-soft)" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />)}
        {projects.map((p, i) => {
          const angle = (i / projects.length) * Math.PI * 2 - Math.PI / 2;
          const e = energyScores[i];
          const dist = 90 + (1 - e / maxE) * 90;
          const px = cx + Math.cos(angle) * dist, py = cy + Math.sin(angle) * dist;
          const color = stageColor(p);
          return <line key={`l-${i}`} x1={cx} y1={cy} x2={px} y2={py} stroke={color} strokeWidth="1" strokeDasharray={(p.energy_level === 'low') ? '3 4' : '0'} opacity="0.45" />;
        })}
        {projects.map((p, i) => {
          const angle = (i / projects.length) * Math.PI * 2 - Math.PI / 2;
          const e = energyScores[i];
          const dist = 90 + (1 - e / maxE) * 90;
          const r = 14 + (e / maxE) * 22;
          const px = cx + Math.cos(angle) * dist, py = cy + Math.sin(angle) * dist;
          const color = stageColor(p);
          const labelOnRight = px >= cx;
          const name = p.name || 'Untitled';
          const openCount = (p.open_threads || []).length;
          return (
            <g key={`n-${i}`}>
              {p.energy_level === 'high' && <circle cx={px} cy={py} r={r+8} fill={color} opacity="0.12" />}
              <circle cx={px} cy={py} r={r} fill="var(--surface)" stroke={color} strokeWidth="2.5" />
              <circle cx={px} cy={py} r={r*0.45} fill={color} opacity={p.energy_level === 'low' ? 0.4 : 0.85} />
              <text x={labelOnRight ? px+r+12 : px-r-12} y={py+4} fontSize="13" fill="var(--ink)" textAnchor={labelOnRight ? 'start' : 'end'} fontFamily="var(--font-serif,Georgia)" letterSpacing="-0.01em">{name}</text>
              <text x={labelOnRight ? px+r+12 : px-r-12} y={py+20} fontSize="10" fill="var(--ink-3)" textAnchor={labelOnRight ? 'start' : 'end'} fontFamily="var(--font-mono,ui-monospace)" letterSpacing="0.1em">{openCount} OPEN</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="22" fill="var(--ink)" />
        <text x={cx} y={cy+6} fontSize="18" fill="var(--surface)" textAnchor="middle" fontFamily="var(--font-serif,Georgia)" fontStyle="italic">T</text>
      </svg>
    </div>
  );
};

// ── Project Card ─────────────────────────────────────────────
const ProjectCard = ({ p: rawP, onTalkAbout }) => {
  const [hover, setHover] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const p = {
    name: rawP.name || rawP.bucket || 'Untitled',
    description: rawP.description || rawP.summary || '',
    stage: rawP.stage || 'building',
    industry: rawP.industry || '',
    current_challenge: rawP.current_challenge || '',
    last_milestone: rawP.last_milestone || '',
    open_threads: rawP.open_threads || rawP.threads || [],
    stalled_on: rawP.stalled_on || '',
    energy_level: rawP.energy_level || 'medium',
    mentions_count: rawP.mentions_count || 0,
    first_mentioned: rawP.first_mentioned || 0,
    last_mentioned: rawP.last_mentioned || rawP.updated_at || 0,
    color: rawP.color || '#947DED',
    founded_context: rawP.founded_context || '',
    id: rawP.id || rawP._id,
  };

  const stageStyle = STAGE_COLORS[p.stage] || STAGE_COLORS.building;
  const energyColor = ENERGY_DOT[p.energy_level] || ENERGY_DOT.medium;

  const timeAgo = (ts) => {
    if (!ts) return 'never';
    const d = Math.max(0, Math.floor((Date.now() / 1000 - ts) / 86400));
    if (d === 0) return 'today';
    if (d === 1) return '1d ago';
    return `${d}d ago`;
  };

  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={() => setExpanded(v => !v)}
      style={{
        position: 'relative', padding: '28px 28px 24px 36px',
        background: 'var(--surface)',
        border: '1px solid var(--mauve-soft)',
        borderRadius: 20, cursor: 'pointer',
        transition: 'all 240ms cubic-bezier(0.32,0.72,0.24,1)',
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? '0 24px 60px rgba(43,20,86,0.10)' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, background: `linear-gradient(180deg, ${p.color} 0%, ${p.color}66 100%)` }} />

      {/* Header: name + stage + energy dot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: energyColor, flexShrink: 0, boxShadow: `0 0 6px ${energyColor}66` }} />
          <div>
            <div className="serif" style={{ fontSize: 24, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.1 }}>{p.name}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {p.industry && (
                <span className="mono" style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: 'rgba(237,184,125,0.1)', color: '#EDB87D', border: '1px solid rgba(237,184,125,0.25)' }}>{p.industry}</span>
              )}
              <span className="mono" style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: stageStyle.bg, color: stageStyle.color, border: `1px solid ${stageStyle.border}` }}>{p.stage}</span>
            </div>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', whiteSpace: 'nowrap', marginTop: 4 }}>{timeAgo(p.last_mentioned)}</div>
      </div>

      {/* Description */}
      {p.description && (
        <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: expanded ? 'visible' : 'hidden' }}>{p.description}</p>
      )}

      {/* Current challenge */}
      {p.current_challenge && (
        <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic', marginBottom: 8, lineHeight: 1.5 }}>
          Currently: {p.current_challenge}
        </div>
      )}

      {/* Last milestone */}
      {p.last_milestone && (
        <div style={{ fontSize: 13, color: '#4CAF50', marginBottom: 10, lineHeight: 1.5 }}>
          Last win: {p.last_milestone}
        </div>
      )}

      {/* Footer: threads + mentions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--mauve-soft)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {p.open_threads.length > 0 && (
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-2)', letterSpacing: '0.1em', padding: '3px 8px', background: 'var(--surface-2)', borderRadius: 6 }}>{p.open_threads.length} open thread{p.open_threads.length > 1 ? 's' : ''}</span>
          )}
          {p.mentions_count > 0 && (
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>discussed {p.mentions_count} time{p.mentions_count > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--mauve-soft)' }}>
          {p.founded_context && (
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 10 }}>
              <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Background</span>
              <div style={{ marginTop: 4 }}>{p.founded_context}</div>
            </div>
          )}

          {p.stalled_on && (
            <div style={{ fontSize: 13, color: '#ED7D97', marginBottom: 10 }}>
              <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Stalled on</span>
              <div style={{ marginTop: 4 }}>{p.stalled_on}</div>
            </div>
          )}

          {p.open_threads.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Open threads</span>
              <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {p.open_threads.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          {p.first_mentioned > 0 && (
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', marginBottom: 12 }}>
              First mentioned: {new Date(p.first_mentioned * 1000).toLocaleDateString()} · Last: {timeAgo(p.last_mentioned)}
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); if (onTalkAbout) onTalkAbout(p.name); }}
            style={{
              padding: '10px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #947DED, #C0ACFF)',
              border: 'none', color: '#fff', fontSize: 13,
              fontFamily: 'var(--f-sans)', cursor: 'pointer',
              fontWeight: 500,
            }}
          >Talk about this</button>
        </div>
      )}
    </div>
  );
};

// ── List view ────────────────────────────────────────────────
const ProjectList = ({ projects }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid rgba(178,157,217,0.3)', borderRadius: 18, overflow: 'hidden' }}>
    {projects.map((rawP, i) => {
      const p = {
        name: rawP.name || rawP.bucket || 'Untitled',
        stage: rawP.stage || 'building',
        description: rawP.description || rawP.summary || '',
        industry: rawP.industry || '',
        open_threads: rawP.open_threads || rawP.threads || [],
        energy_level: rawP.energy_level || 'medium',
        mentions_count: rawP.mentions_count || 0,
        last_mentioned: rawP.last_mentioned || rawP.updated_at || 0,
        id: rawP.id || rawP._id,
      };
      const stageStyle = STAGE_COLORS[p.stage] || STAGE_COLORS.building;
      const energyColor = ENERGY_DOT[p.energy_level] || ENERGY_DOT.medium;
      const timeAgo = (ts) => { if (!ts) return ''; const d = Math.floor((Date.now()/1000 - ts)/86400); return d === 0 ? 'today' : `${d}d`; };
      return (
        <div key={p.id || i} style={{ display: 'grid', gridTemplateColumns: '12px 1fr 80px 90px 100px 60px', gap: 16, alignItems: 'center', padding: '16px 20px', borderBottom: i < projects.length - 1 ? '1px solid rgba(178,157,217,0.2)' : 'none', cursor: 'pointer', transition: 'background 160ms ease' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,172,255,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: energyColor }} />
          <div>
            <div className="serif" style={{ fontSize: 17, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{p.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{p.description}</div>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{p.open_threads.length} open</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{timeAgo(p.last_mentioned)} ago</div>
          <span className="mono" style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: stageStyle.bg, color: stageStyle.color, border: `1px solid ${stageStyle.border}`, textAlign: 'center' }}>{p.stage}</span>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right' }}>{p.mentions_count}x</div>
        </div>
      );
    })}
  </div>
);

// ── Main screen ──────────────────────────────────────────────
const ProjectsScreen = () => {
  const [data, setData] = React.useState(window.TammyData);
  const [showAll, setShowAll] = React.useState(false);
  const [view, setView] = React.useState('cards');

  React.useEffect(() => {
    const h = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  // Also fetch fresh projects on mount
  React.useEffect(() => {
    fetch(`${EXTRA_API}/api/projects`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          window.TammyData.projects = d;
          window.dispatchEvent(new Event('tammy:dataready'));
        }
      })
      .catch(() => {});
  }, []);

  const rawProjects = data.projects;

  if (rawProjects === null || rawProjects === undefined) {
    return (
      <ScreenWrap>
        <div style={{ paddingTop: 40 }}>
          <div style={{ height: 14, width: 220, background: 'var(--mauve-soft)', borderRadius: 6, marginBottom: 18, opacity: 0.5 }} />
          <div style={{ height: 64, width: 480, background: 'var(--mauve-soft)', borderRadius: 8, marginBottom: 32, opacity: 0.4 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 180, background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 20, opacity: 0.5 }} />)}
          </div>
        </div>
      </ScreenWrap>
    );
  }

  const projects = rawProjects || [];

  if (projects.length === 0) {
    return (
      <ScreenWrap>
        <Eyebrow>Projects</Eyebrow>
        <H1>The shape of everything you carry.</H1>
        <Sub>Tammy reads your conversations and maps your active projects automatically.</Sub>
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--mauve-soft)' }}>
          <div className="serif" style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 16 }}>No projects yet.</div>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>Once you have a few conversations, Tammy will map your active projects here.</p>
          <button className="btn btn-primary" onClick={() => fetch(`${EXTRA_API}/api/projects?force=1`, { credentials: 'include' }).then(r => r.json()).then(d => { window.TammyData.projects = d; window.dispatchEvent(new Event('tammy:dataready')); })} style={{ padding: '12px 24px', borderRadius: 999 }}>
            Scan from chat history
          </button>
        </div>
      </ScreenWrap>
    );
  }

  const openThreadsTotal = projects.reduce((a, p) => a + (p.open_threads || p.threads || []).length, 0);
  const now = Date.now() / 1000;
  const stalledCount = projects.filter(p => p.energy_level === 'low' && p.last_mentioned && (now - p.last_mentioned) > 7 * 86400).length;
  const activeCount = projects.filter(p => p.energy_level !== 'low').length;
  const heaviest = [...projects].sort((a, b) => (b.open_threads || []).length - (a.open_threads || []).length)[0];

  const sorted = [...projects].sort((a, b) => {
    const stageOrder = { scaling: 0, launched: 1, building: 2, idea: 3 };
    const sa = stageOrder[a.stage] || 2, sb = stageOrder[b.stage] || 2;
    if (sa !== sb) return sa - sb;
    return (b.last_mentioned || 0) - (a.last_mentioned || 0);
  });
  const visibleProjects = showAll ? sorted : sorted.slice(0, INITIAL_VISIBLE);

  const handleTalkAbout = (projectName) => {
    if (window.TammyData) {
      window.TammyData.pendingChatId = 'new';
      window.TammyData.pendingChatPrefill = `Let me tell you about ${projectName}`;
    }
    if (window.TammyNavigate) window.TammyNavigate('chat');
  };

  return (
    <ScreenWrap>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 18 }}>
        <div>
          <Eyebrow>{projects.length} project{projects.length !== 1 ? 's' : ''} · {openThreadsTotal} open threads · {stalledCount} stalled</Eyebrow>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            The shape of<br /><em style={{ fontStyle: 'italic', color: '#947DED' }}>everything you carry.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0, maxWidth: 560, lineHeight: 1.5 }}>Tammy maps your projects automatically from conversations. No manual input needed.</p>
        </div>
        <button className="btn btn-primary" style={{ flexShrink: 0, marginTop: 12, padding: '14px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => fetch(`${EXTRA_API}/api/projects?force=1`, { credentials: 'include' }).then(r => r.json()).then(d => { window.TammyData.projects = d; window.dispatchEvent(new Event('tammy:dataready')); })}>
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: -2 }}>&#x21bb;</span> Rescan
        </button>
      </div>

      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(178,157,217,0.25)', border: '1px solid rgba(178,157,217,0.3)', borderRadius: 18, overflow: 'hidden' }}>
        <ProjStat label="Active projects" value={activeCount} sub={`of ${projects.length} total`} accent="#947DED" />
        <ProjStat label="Open threads" value={openThreadsTotal} sub="across all projects" accent="#6B5BC8" />
        <ProjStat label="Stalled" value={stalledCount} sub={stalledCount === 0 ? 'all moving' : 'no update in 7+ days'} accent={stalledCount > 0 ? '#ED7D97' : '#A89BB3'} />
        <ProjStat label="Heaviest" value={heaviest ? (heaviest.name || 'Untitled') : '\u2014'} sub={heaviest ? `${(heaviest.open_threads || []).length} open threads` : ''} accent="#C0ACFF" small />
      </div>

      <div style={{ marginTop: 36, marginBottom: 56 }}>
        <Constellation projects={projects} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h2 className="serif" style={{ fontSize: 32, fontWeight: 400, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>All projects.</h2>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>sorted by stage then recency</div>
        </div>
        <div style={{ display: 'inline-flex', padding: 3, background: 'rgba(178,157,217,0.15)', borderRadius: 10 }}>
          {['cards', 'list'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '7px 14px', fontSize: 12, fontFamily: 'inherit', background: view === v ? 'var(--surface)' : 'transparent', color: view === v ? 'var(--ink)' : 'var(--ink-3)', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 500, boxShadow: view === v ? '0 1px 3px rgba(31,28,48,0.08)' : 'none', textTransform: 'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>

      {view === 'cards' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            {visibleProjects.map((p, i) => <ProjectCard key={p.id || i} p={p} onTalkAbout={handleTalkAbout} />)}
          </div>
          {sorted.length > INITIAL_VISIBLE && (
            <button onClick={() => setShowAll(v => !v)} style={{ width: '100%', marginTop: 18, padding: '14px', borderRadius: 14, border: '1px solid var(--mauve-soft)', background: 'transparent', fontSize: 13, color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'inherit' }}>
              {showAll ? 'Show less \u2191' : `Show all ${sorted.length} projects \u2193`}
            </button>
          )}
        </>
      ) : <ProjectList projects={sorted} />}
    </ScreenWrap>
  );
};

window.ProjectsScreen = ProjectsScreen;
