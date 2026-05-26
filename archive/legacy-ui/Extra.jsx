// Extra.jsx — Founder DNA, Blind Spots, Calibration, Mirror Moment,
// Decisions, Projects, Network. Full editorial UI, wired to real backend.

const EXTRA_API = window.TAMMY_API || 'http://localhost:7861';

// ── Shared layout components ─────────────────────────────────────────────────
const ScreenWrap = ({ children }) => (
  <main style={{ marginLeft: 88, minHeight: '100vh', padding: '64px 80px 96px', maxWidth: 1280 }}>
    {children}
  </main>
);
const Eyebrow = ({ children }) => (
  <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>{children}</div>
);
const H1 = ({ children }) => (
  <h1 className="serif" style={{ fontSize: 56, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>{children}</h1>
);
const Sub = ({ children }) => (
  <p style={{ fontSize: 16, color: 'var(--ink-2)', margin: '0 0 48px', maxWidth: 720, lineHeight: 1.55 }}>{children}</p>
);
const Stat = ({ n, label, amber, right }) => (
  <div style={{ padding: '28px 0', borderRight: right ? 'none' : '1px solid var(--mauve-soft)', paddingLeft: 28 }}>
    <div className="serif" style={{ fontSize: 56, fontWeight: 400, color: amber ? 'var(--amber)' : 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>{n}</div>
    <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 12 }}>{label}</div>
  </div>
);

// ── Loading + locked states ──────────────────────────────────────────────────
const ScreenSkeleton = () => (
  <div style={{ padding: '40px 0', animation: 'fadeInUp 400ms ease' }}>
    <div style={{ height: 12, width: 220, background: 'var(--mauve-soft)', borderRadius: 4, marginBottom: 20, opacity: 0.5 }} />
    <div style={{ height: 56, width: 420, background: 'var(--mauve-soft)', borderRadius: 8, marginBottom: 16, opacity: 0.4 }} />
    <div style={{ height: 18, width: 600, background: 'var(--mauve-soft)', borderRadius: 4, marginBottom: 48, opacity: 0.3 }} />
    <div style={{ height: 260, background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 22, opacity: 0.5 }} />
  </div>
);
const LockedGate = ({ title, reason, sessions, sessions_needed }) => (
  <div style={{ padding: '80px 0', textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28, color: 'var(--ink-3)' }}>⟳</div>
    <h2 className="serif" style={{ fontSize: 30, fontWeight: 400, color: 'var(--ink)', marginBottom: 12, letterSpacing: '-0.02em' }}>{title}</h2>
    <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: 24 }}>{reason}</p>
    {sessions_needed && (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--mauve-soft)' }}>
        <div style={{ height: 6, width: 120, background: 'var(--mauve-soft)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(100, Math.round(((sessions || 0) / sessions_needed) * 100))}%`, background: 'var(--iris)', borderRadius: 3 }} />
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{sessions || 0} / {sessions_needed} sessions</span>
      </div>
    )}
  </div>
);

// ── STATUS_COLOR / Glyph / StatusPill ────────────────────────────────────────
const STATUS_COLOR = { Live: '#947DED', Stalled: '#7B6BA8', Review: '#C0ACFF' };
const Glyph = ({ kind, color = 'currentColor', size = 28 }) => {
  const s = size;
  switch (kind) {
    case 'ring':    return <svg width={s} height={s} viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" stroke={color} strokeWidth="2" /><circle cx="14" cy="14" r="3" fill={color} /></svg>;
    case 'square':  return <svg width={s} height={s} viewBox="0 0 28 28" fill="none"><rect x="3" y="3" width="22" height="22" stroke={color} strokeWidth="2" /><rect x="10" y="10" width="8" height="8" fill={color} /></svg>;
    case 'triangle':return <svg width={s} height={s} viewBox="0 0 28 28" fill="none"><path d="M14 3 L25 24 L3 24 Z" stroke={color} strokeWidth="2" strokeLinejoin="round" /><circle cx="14" cy="18" r="2.5" fill={color} /></svg>;
    case 'dots':    return <svg width={s} height={s} viewBox="0 0 28 28" fill={color}><circle cx="6" cy="14" r="3" /><circle cx="14" cy="14" r="3" /><circle cx="22" cy="14" r="3" /></svg>;
    case 'line':    return <svg width={s} height={s} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M4 8 L24 8" /><path d="M4 14 L20 14" /><path d="M4 20 L16 20" /></svg>;
    case 'star':    return <svg width={s} height={s} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"><path d="M14 3 L17 11 L25 11 L19 16 L21 24 L14 19 L7 24 L9 16 L3 11 L11 11 Z" /></svg>;
    default:        return <svg width={s} height={s} viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="10" stroke={color} strokeWidth="2" /></svg>;
  }
};
const StatusPill = ({ status, color }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: `${color}1a`, color, borderRadius: 20, fontSize: 10, fontFamily: 'var(--font-mono,ui-monospace)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: status === 'Live' ? `0 0 8px ${color}` : 'none' }} />
    {status}
  </div>
);

// ╔══════════════════════════════════════════════════════════════ Founder DNA ═╗

const DNA_CATEGORIES = {
  decision:    { label: 'Decision',    color: '#947DED' },
  emotion:     { label: 'Emotion',     color: '#C0ACFF' },
  performance: { label: 'Performance', color: '#6B5BC8' },
  avoidance:   { label: 'Avoidance',   color: '#7B6BA8' },
  strength:    { label: 'Strength',    color: '#A89BB3' },
};

const FilterChip = ({ label, active, color, onClick }) => (
  <button onClick={onClick} style={{ padding: '7px 14px', border: `1px solid ${active ? color : 'rgba(178,157,217,0.4)'}`, background: active ? color : 'transparent', color: active ? '#FFF' : 'var(--ink-2)', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.005em', transition: 'all 160ms ease' }}>
    {label}
  </button>
);

const DNAStrand = ({ pairs, selected, setSelected }) => {
  const W = 380, ROW_H = 52, CENTER = W / 2, AMP = 110, PERIOD = 4;
  const H = pairs.length * ROW_H + 60;
  const positions = pairs.map((p, i) => {
    const t = (i / PERIOD) * Math.PI * 2;
    const offset = Math.sin(t) * AMP;
    return { y: 30 + i * ROW_H, lx: CENTER - offset, rx: CENTER + offset };
  });
  const leftPath  = positions.map((p, i) => i === 0 ? `M ${p.lx} ${p.y}` : `L ${p.lx} ${p.y}`).join(' ');
  const rightPath = positions.map((p, i) => i === 0 ? `M ${p.rx} ${p.y}` : `L ${p.rx} ${p.y}`).join(' ');
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid rgba(178,157,217,0.3)', borderRadius: 22, padding: '20px 12px 24px', boxShadow: '0 8px 28px rgba(31,28,48,0.05)', position: 'sticky', top: 24 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', textAlign: 'center', marginBottom: 6 }}>
        The strand · {pairs.length} pairs
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        <path d={leftPath}  fill="none" stroke="rgba(148,125,237,0.45)" strokeWidth="2.5" strokeLinecap="round" />
        <path d={rightPath} fill="none" stroke="rgba(148,125,237,0.45)" strokeWidth="2.5" strokeLinecap="round" />
        {positions.map((pos, i) => {
          const p = pairs[i];
          const cat = DNA_CATEGORIES[p.cat] || DNA_CATEGORIES.strength;
          const isSelected = selected === i;
          const isFront = Math.abs(pos.lx - pos.rx) > AMP * 0.4;
          return (
            <g key={i} onClick={() => setSelected(i)} style={{ cursor: 'pointer' }}>
              <rect x={Math.min(pos.lx, pos.rx) - 12} y={pos.y - 18} width={Math.abs(pos.rx - pos.lx) + 24} height={36} fill="transparent" />
              <line x1={pos.lx} y1={pos.y} x2={pos.rx} y2={pos.y} stroke={isSelected ? cat.color : 'rgba(148,125,237,0.35)'} strokeWidth={isSelected ? 2.5 : 1.5} opacity={isFront ? 1 : 0.45} />
              <line x1={(pos.lx+pos.rx)/2-(Math.abs(pos.rx-pos.lx)/2)*p.strength} y1={pos.y} x2={(pos.lx+pos.rx)/2+(Math.abs(pos.rx-pos.lx)/2)*p.strength} y2={pos.y} stroke={cat.color} strokeWidth={isSelected ? 4 : 2.5} strokeLinecap="round" opacity={isSelected ? 1 : 0.7} />
              <circle cx={pos.lx} cy={pos.y} r={isSelected ? 7 : 5} fill={isSelected ? cat.color : 'var(--surface)'} stroke={cat.color} strokeWidth={isSelected ? 0 : 2} />
              <circle cx={pos.rx} cy={pos.y} r={isSelected ? 7 : 5} fill={isSelected ? cat.color : 'var(--surface)'} stroke={cat.color} strokeWidth={isSelected ? 0 : 2} />
              {isSelected && (<><circle cx={pos.lx} cy={pos.y} r="11" fill="none" stroke={cat.color} strokeOpacity="0.4" strokeWidth="1" /><circle cx={pos.rx} cy={pos.y} r="11" fill="none" stroke={cat.color} strokeOpacity="0.4" strokeWidth="1" /></>)}
              <text x={4} y={pos.y + 4} fontSize="10" fill="var(--ink-3)" fontFamily="ui-monospace,monospace" opacity={isSelected ? 1 : 0.5}>{String(i+1).padStart(2,'0')}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', fontSize: 10, color: 'var(--ink-3)' }}>
        {Object.entries(DNA_CATEGORIES).map(([k, c]) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} /> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const DNAInspector = ({ pair, pairs, idx, setSelected }) => {
  if (!pair) return null;
  const cat = DNA_CATEGORIES[pair.cat] || DNA_CATEGORIES.strength;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ padding: '28px 32px', background: 'var(--surface)', border: `1px solid ${cat.color}40`, borderRadius: 22, boxShadow: `0 12px 32px ${cat.color}1c`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}80)` }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: cat.color, fontWeight: 600 }}>Pair {String(idx+1).padStart(2,'0')} · {cat.label}</div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Strength {Math.round(pair.strength * 100)}%</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 18, alignItems: 'center', marginBottom: 22 }}>
          <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.3, textAlign: 'right' }}>{pair.left}</div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 14 }}>↔</div>
          <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.3 }}>{pair.right}</div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'ui-monospace,monospace', marginBottom: 6 }}><span>weak signal</span><span>defining</span></div>
          <div style={{ height: 4, background: 'rgba(178,157,217,0.2)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${pair.strength * 100}%`, height: '100%', background: cat.color, borderRadius: 999 }} />
          </div>
        </div>
        {pair.evidence && (
          <div style={{ padding: '16px 18px', background: 'rgba(192,172,255,0.08)', borderLeft: `2px solid ${cat.color}`, borderRadius: '0 10px 10px 0' }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>Evidence</div>
            <div style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.55, fontStyle: 'italic', marginBottom: 8 }}>"{pair.evidence}"</div>
            {pair.when && <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{pair.when}</div>}
          </div>
        )}
      </div>
      <div style={{ padding: '20px 24px', background: 'var(--surface)', border: '1px solid rgba(178,157,217,0.3)', borderRadius: 18 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>All pairs · click to inspect</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
          {pairs.map((p, i) => {
            const c = DNA_CATEGORIES[p.cat] || DNA_CATEGORIES.strength;
            const isSel = i === idx;
            return (
              <button key={i} onClick={() => setSelected(i)} style={{ display: 'grid', gridTemplateColumns: '24px 8px 1fr auto', gap: 12, alignItems: 'center', padding: '8px 8px', background: isSel ? `${c.color}10` : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{String(i+1).padStart(2,'0')}</span>
                <span style={{ width: 4, height: 16, background: c.color, borderRadius: 2 }} />
                <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: isSel ? 500 : 400 }}>{p.left} <span style={{ color: 'var(--ink-3)', margin: '0 4px' }}>↔</span> {p.right}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{Math.round(p.strength * 100)}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DNAScreen = () => {
  const [, rerender] = React.useState(0);
  const [selected, setSelected] = React.useState(0);
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => {
    const h = () => rerender(n => n + 1);
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  const D = window.TammyData;
  const dna = D.dna;

  if (dna === undefined || dna === null) return <ScreenWrap><ScreenSkeleton /></ScreenWrap>;
  if (dna.locked) return (
    <ScreenWrap>
      <LockedGate
        title="Founder DNA"
        reason="Tammy needs more time with you before she can read your patterns. Keep talking — real insights need real data."
        sessions={dna.sessions}
        sessions_needed={dna.sessions_needed}
      />
    </ScreenWrap>
  );

  // Normalize traits from backend into DNA_PAIRS shape
  const rawTraits = dna.traits || dna.pairs || [];
  const DNA_PAIRS = rawTraits.map(t => ({
    cat: t.cat || t.category || 'strength',
    left: t.left || (t.pattern ? t.pattern.split('|')[0]?.trim() : t.name || 'Pattern'),
    right: t.right || (t.pattern ? t.pattern.split('|')[1]?.trim() : ''),
    strength: typeof t.strength === 'number' ? t.strength : 0.7,
    evidence: t.evidence || '',
    when: t.when || t.timeframe || '',
  }));

  const filtered = filter === 'all' ? DNA_PAIRS : DNA_PAIRS.filter(p => p.cat === filter);
  const active = filtered[selected] || filtered[0];
  const archetype = dna.archetype || '';
  const archetypeDesc = dna.archetype_desc || dna.archetype_description || '';
  const sessionCount = dna.sessions || dna.session_count || 0;
  const days = dna.days || 0;

  return (
    <ScreenWrap>
      <Eyebrow>Unlocked · {sessionCount} sessions · {days} days</Eyebrow>
      <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
        Your <span style={{ fontStyle: 'italic', color: '#947DED' }}>Founder DNA</span>.
      </h1>
      <Sub>Tammy has been watching. Each pair is a real pattern — not a personality test, a pattern reading.</Sub>

      {archetype && (
        <div style={{ padding: '32px 36px', marginBottom: 40, background: 'linear-gradient(135deg, rgba(192,172,255,0.16), rgba(148,125,237,0.06))', border: '1px solid rgba(192,172,255,0.3)', borderRadius: 22 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#947DED', marginBottom: 10 }}>Operating archetype</div>
          <div className="serif" style={{ fontSize: 36, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14, fontStyle: 'italic' }}>{archetype}</div>
          {archetypeDesc && <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0, maxWidth: 660 }}>{archetypeDesc}</p>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <FilterChip label={`All · ${DNA_PAIRS.length}`} active={filter === 'all'} color="#1F1C30" onClick={() => { setFilter('all'); setSelected(0); }} />
        {Object.entries(DNA_CATEGORIES).map(([key, cat]) => {
          const count = DNA_PAIRS.filter(p => p.cat === key).length;
          if (!count) return null;
          return <FilterChip key={key} label={`${cat.label} · ${count}`} active={filter === key} color={cat.color} onClick={() => { setFilter(key); setSelected(0); }} />;
        })}
      </div>

      {DNA_PAIRS.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', fontSize: 15, color: 'var(--ink-3)', fontStyle: 'italic' }}>
          Tammy is still reading the patterns. Check back after your next few sessions.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 32, alignItems: 'flex-start' }}>
          <DNAStrand pairs={filtered} selected={selected} setSelected={setSelected} />
          <DNAInspector pair={active} pairs={filtered} idx={selected} setSelected={setSelected} />
        </div>
      )}

      <div style={{ marginTop: 48, padding: 24, borderTop: '1px solid rgba(178,157,217,0.3)', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="serif" style={{ fontSize: 18, color: 'var(--ink)' }}>Refreshes every 3 sessions</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>Last generated from your real conversations</div>
        </div>
        <button className="btn btn-ghost" onClick={() => { fetch(`${EXTRA_API}/api/dna?force=1`, { credentials: 'include' }).then(r => r.json()).then(d => { window.TammyData.dna = d; window.dispatchEvent(new Event('tammy:dataready')); }); }}>Re-run synthesis</button>
      </div>
    </ScreenWrap>
  );
};

// ╔══════════════════════════════════════════════════════════════ Blind Spots ═╗

const BlindSpotsScreen = () => {
  const [, rerender] = React.useState(0);
  React.useEffect(() => {
    const h = () => rerender(n => n + 1);
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  const D = window.TammyData;
  const bs = D.blindspots;

  if (bs === undefined || bs === null) return <ScreenWrap><ScreenSkeleton /></ScreenWrap>;
  if (bs.locked || (bs && !Array.isArray(bs) && bs.locked)) return (
    <ScreenWrap>
      <LockedGate
        title="Blind Spots"
        reason="Tammy needs to see a few more sessions before she can spot your patterns. Keep the conversations going."
        sessions={bs.sessions}
        sessions_needed={bs.sessions_needed}
      />
    </ScreenWrap>
  );

  const spots = Array.isArray(bs) ? bs : (bs.spots || []);
  const generatedAt = bs.generated_at || bs.week || 'this week';

  return (
    <ScreenWrap>
      <Eyebrow>Weekly scan · {typeof generatedAt === 'string' ? generatedAt : new Date(generatedAt * 1000).toLocaleDateString()}</Eyebrow>
      <H1>What I keep seeing</H1>
      <Sub>Patterns I noticed this week. With the actual quotes, so you can argue with me if I'm wrong.</Sub>

      {spots.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', fontSize: 15, color: 'var(--ink-3)', fontStyle: 'italic' }}>
          Tammy hasn't detected any clear patterns yet. Keep talking.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {spots.map((s, i) => (
            <div key={i} style={{ padding: 32, background: 'var(--surface)', border: s.severity === 'high' ? '1px solid var(--amber)' : '1px solid var(--mauve-soft)', boxShadow: s.severity === 'high' ? '0 0 0 4px var(--amber-soft)' : 'none', borderRadius: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, gap: 16 }}>
                <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: 0, letterSpacing: '-0.015em' }}>{s.title}</h2>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: s.severity === 'high' ? 'var(--amber)' : 'var(--ink-3)', whiteSpace: 'nowrap' }}>{s.pattern}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>Evidence</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(s.evidence || []).map((e, j) => (
                      <div key={j} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 12, alignItems: 'baseline' }}>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{e.date}</div>
                        <div className="serif" style={{ fontSize: 15, color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.5 }}>{e.quote}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>My reading</div>
                  <p className="serif" style={{ fontSize: 19, color: 'var(--ink)', lineHeight: 1.45, margin: 0 }}>{s.reading}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                    <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>You're right</button>
                    <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>You're wrong</button>
                    <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => { window.dispatchEvent(new CustomEvent('tammy:open_chat', { detail: null })); if (window.TammyNavigate) window.TammyNavigate('chat'); }}>Talk about it</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScreenWrap>
  );
};

// ╔══════════════════════════════════════════════════════════════ Calibration ═╗

const VERDICT_COLOR = { right: '#947DED', partial: '#C0ACFF', wrong: '#6B5BC8' };

const ScoreLine = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span className="serif" style={{ fontSize: 22, color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>· {pct}%</span>
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>{label}</div>
      <div style={{ height: 3, background: 'rgba(148,125,237,0.15)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
};

const DomainCard = ({ label, stat, subtotal, trend, note, active, onClick }) => {
  const W = 200, H = 36;
  const max = Math.max(...trend, 1);
  const min = Math.min(...trend);
  const norm = v => H - ((v - min) / (max - min || 1)) * H;
  const path = trend.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (trend.length - 1)) * W} ${norm(v)}`).join(' ');
  return (
    <button onClick={onClick} style={{ padding: '20px 22px', background: active ? 'var(--ink)' : 'var(--surface)', border: active ? '1px solid var(--ink)' : '1px solid rgba(178,157,217,0.3)', borderRadius: 18, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 200ms ease', boxShadow: active ? '0 12px 32px rgba(31,28,48,0.18)' : 'none', transform: active ? 'translateY(-2px)' : 'none' }}>
      <div className="mono" style={{ fontSize: 10, color: active ? 'color-mix(in srgb, var(--canvas) 70%, transparent)' : 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <span className="serif" style={{ fontSize: 36, color: active ? 'var(--canvas)' : 'var(--ink)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1 }}>{stat}</span>
        <span className="mono" style={{ fontSize: 11, color: active ? 'color-mix(in srgb, var(--canvas) 70%, transparent)' : 'var(--ink-3)' }}>· {subtotal}</span>
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', marginBottom: 10 }}>
        <path d={path} fill="none" stroke={active ? 'var(--canvas)' : '#947DED'} strokeOpacity={active ? 0.6 : 1} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div style={{ fontSize: 11, color: active ? 'color-mix(in srgb, var(--canvas) 70%, transparent)' : 'var(--ink-3)', lineHeight: 1.4, fontStyle: 'italic' }}>{note}</div>
    </button>
  );
};

const PredictionCard = ({ r }) => {
  const [open, setOpen] = React.useState(false);
  const c = VERDICT_COLOR[r.verdict] || '#947DED';
  return (
    <button onClick={() => setOpen(o => !o)} style={{ padding: '20px 24px', background: 'var(--surface)', border: `1px solid rgba(178,157,217,0.3)`, borderLeft: `3px solid ${c}`, borderRadius: 14, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', width: '100%', transition: 'all 160ms ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 80px 110px', gap: 20, alignItems: 'center' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.date}</div>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>{r.domain}</div>
          <div className="serif" style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.35 }}>{r.text}</div>
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center' }}>conf {r.confidence}%</div>
        <div><span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 999, background: `${c}1f`, color: c, border: `1px solid ${c}40`, fontWeight: 600 }}>{r.verdict}</span></div>
      </div>
      {open && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed rgba(178,157,217,0.35)', display: 'grid', gridTemplateColumns: '90px 1fr', gap: 20 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>actual</div>
          <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>
            <div style={{ marginBottom: 8 }}><strong style={{ fontWeight: 600 }}>{r.actual}</strong></div>
            <div style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>{r.note}</div>
          </div>
        </div>
      )}
    </button>
  );
};

const NewPredictionForm = ({ onClose, onSaved }) => {
  const [text, setText] = React.useState('');
  const [confidence, setConfidence] = React.useState(70);
  const [domain, setDomain] = React.useState('Product');
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await fetch(`${EXTRA_API}/api/calibration/predictions`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, confidence, domain }),
      });
      const fresh = await fetch(`${EXTRA_API}/api/calibration`, { credentials: 'include' }).then(r => r.json());
      window.TammyData.calibration = fresh;
      window.dispatchEvent(new Event('tammy:dataready'));
    } catch {}
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,28,48,0.5)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, padding: 32, background: 'var(--surface)', borderRadius: 22, boxShadow: '0 32px 80px rgba(31,28,48,0.35)' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 8 }}>Log a prediction</div>
        <h3 className="serif" style={{ fontSize: 28, fontWeight: 400, margin: '0 0 18px', letterSpacing: '-0.015em' }}>What do you believe will happen?</h3>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="e.g. The hire decision will land by Friday." style={{ width: '100%', minHeight: 80, padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', color: 'var(--ink)', background: 'rgba(192,172,255,0.06)', border: '1px solid rgba(178,157,217,0.3)', borderRadius: 12, resize: 'vertical', outline: 'none', marginBottom: 18, boxSizing: 'border-box' }} />
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Confidence</span>
            <span className="mono" style={{ fontSize: 13, color: '#947DED', fontWeight: 600 }}>{confidence}%</span>
          </div>
          <input type="range" min="10" max="95" step="5" value={confidence} onChange={e => setConfidence(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#947DED' }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>Domain</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Product', 'People', 'Timelines', 'Market'].map(d => (
              <button key={d} onClick={() => setDomain(d)} style={{ padding: '6px 12px', fontSize: 12, fontFamily: 'inherit', border: `1px solid ${domain === d ? '#947DED' : 'rgba(178,157,217,0.4)'}`, background: domain === d ? '#947DED' : 'transparent', color: domain === d ? '#FFF' : 'var(--ink-2)', borderRadius: 999, cursor: 'pointer' }}>{d}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving || !text.trim()} className="btn btn-primary">{saving ? 'Saving…' : 'Log it'}</button>
        </div>
      </div>
    </div>
  );
};

const CalibrationScreen = () => {
  const [, rerender] = React.useState(0);
  const [activeDomain, setActiveDomain] = React.useState('all');
  const [showOpenForm, setShowOpenForm] = React.useState(false);

  React.useEffect(() => {
    const h = () => rerender(n => n + 1);
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  const D = window.TammyData;
  const cal = D.calibration;

  if (cal === undefined || cal === null) return <ScreenWrap><ScreenSkeleton /></ScreenWrap>;
  if (cal.locked) return (
    <ScreenWrap>
      <LockedGate
        title="Calibration"
        reason="Tammy tracks your predictions and resolves them against reality. Make a few predictions and come back."
        sessions={cal.sessions}
        sessions_needed={cal.sessions_needed}
      />
    </ScreenWrap>
  );

  const stats  = cal.stats  || cal.domains || [];
  const recent = cal.recent || cal.predictions || [];
  const overall = cal.overall || (stats.length ? Math.round(stats.reduce((a, s) => a + (s.right / Math.max(s.total || 1, 1)), 0) / stats.length * 100) : 0);
  const total  = stats.reduce((a, s) => a + (s.total || 0), 0) || recent.length;
  const totalRight   = stats.reduce((a, s) => a + (s.right || 0), 0);
  const totalPartial = stats.reduce((a, s) => a + (s.partial || 0), 0);
  const tammyRead = cal.tammy_read || cal.summary || `You're at ${overall}% calibration across ${total} predictions.`;

  const filtered = activeDomain === 'all' ? recent : recent.filter(r => r.domain === activeDomain);

  const [arcAnim, setArcAnim] = React.useState(0);
  React.useEffect(() => {
    let raf, start;
    const tick = t => { if (!start) start = t; const p = Math.min(1, (t - start) / 1400); setArcAnim(1 - Math.pow(1 - p, 3)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const C_R = 96, C_C = 110, C_CIRC = 2 * Math.PI * C_R;
  const arcLen = (overall / 100) * C_CIRC * arcAnim;

  return (
    <ScreenWrap>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 24 }}>
        <div>
          <Eyebrow>{total} predictions tracked</Eyebrow>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 16px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            How well you <span style={{ fontStyle: 'italic', color: '#947DED' }}>see ahead.</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0, maxWidth: 640, lineHeight: 1.5 }}>Reality keeps the score, not me. Every claim you make about the future gets logged and resolved.</p>
        </div>
        <button onClick={() => setShowOpenForm(true)} className="btn btn-primary" style={{ flexShrink: 0, marginTop: 12, padding: '14px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: -2 }}>+</span> Log a prediction
        </button>
      </div>

      <div style={{ marginTop: 32, padding: '36px 40px', background: 'linear-gradient(135deg, rgba(192,172,255,0.14) 0%, rgba(148,125,237,0.04) 100%)', border: '1px solid rgba(178,157,217,0.3)', borderRadius: 24, display: 'grid', gridTemplateColumns: '260px 1fr', gap: 48, alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto' }}>
          <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={C_C} cy={C_C} r={C_R} fill="none" stroke="rgba(148,125,237,0.16)" strokeWidth="14" />
            <circle cx={C_C} cy={C_C} r={C_R} fill="none" stroke="url(#calGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${arcLen} ${C_CIRC}`} style={{ filter: 'drop-shadow(0 0 8px rgba(148,125,237,0.4))' }} />
            <defs><linearGradient id="calGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C0ACFF" /><stop offset="100%" stopColor="#6B5BC8" /></linearGradient></defs>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="serif" style={{ fontSize: 64, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1 }}>{Math.round(overall * arcAnim)}<span style={{ fontSize: 28, color: '#947DED' }}>%</span></div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: 6 }}>calibrated</div>
          </div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 12 }}>Tammy's read</div>
          <p className="serif" style={{ fontSize: 20, color: 'var(--ink)', lineHeight: 1.45, margin: '0 0 20px', fontStyle: 'italic' }}>"{tammyRead}"</p>
          <div style={{ display: 'flex', gap: 32 }}>
            <ScoreLine label="Right"   value={totalRight}                       total={total} color={VERDICT_COLOR.right}   />
            <ScoreLine label="Partial" value={totalPartial}                     total={total} color={VERDICT_COLOR.partial} />
            <ScoreLine label="Wrong"   value={total - totalRight - totalPartial} total={total} color={VERDICT_COLOR.wrong}   />
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <>
          <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: '56px 0 4px', letterSpacing: '-0.02em' }}>By domain.</h2>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>click to filter</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
            <DomainCard domain="all" label="All domains" stat={`${overall}%`} subtotal={`${totalRight}/${total}`} trend={[overall, overall, overall, overall, overall, overall, overall]} note="The whole picture." active={activeDomain === 'all'} onClick={() => setActiveDomain('all')} />
            {stats.map((s, i) => {
              const pct = s.total > 0 ? Math.round((s.right / s.total) * 100) : 0;
              return <DomainCard key={i} domain={s.domain} label={s.domain} stat={`${pct}%`} subtotal={`${s.right}/${s.total}`} trend={s.trend || [pct, pct, pct, pct, pct, pct, pct]} note={s.note || ''} active={activeDomain === s.domain} onClick={() => setActiveDomain(s.domain)} />;
            })}
          </div>
        </>
      )}

      <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Recent calls.</h2>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 20 }}>{filtered.length} predictions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((r, i) => <PredictionCard key={i} r={r} />)}
        {filtered.length === 0 && <div style={{ padding: 32, textAlign: 'center', fontSize: 14, color: 'var(--ink-3)', fontStyle: 'italic' }}>No predictions yet. Log one above.</div>}
      </div>

      {showOpenForm && <NewPredictionForm onClose={() => setShowOpenForm(false)} />}
    </ScreenWrap>
  );
};

// ╔══════════════════════════════════════════════════════════════ Mirror Moment ╗

const WaveBars = ({ active }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 100, justifyContent: 'center' }}>
    {[...Array(60)].map((_, i) => {
      const h = 16 + Math.sin(i * 0.4) * 30 + Math.cos(i * 0.7) * 18;
      return <div key={i} style={{ width: 3, height: Math.abs(h) + 8, background: i < 24 ? 'var(--ink)' : 'var(--mauve)', borderRadius: 999, animation: active ? `pulse 1.${i % 9}s ease-in-out infinite` : 'none' }} />;
    })}
  </div>
);
const SourceRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--mauve-soft)' }}>
    <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{label}</div>
    <div className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>{value}</div>
  </div>
);

const MirrorScreen = () => {
  const [, rerender] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [pos, setPos] = React.useState(0);

  React.useEffect(() => {
    const h = () => rerender(n => n + 1);
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);
  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setPos(p => p >= 100 ? (clearInterval(t), 100) : p + 0.4), 80);
    return () => clearInterval(t);
  }, [playing]);

  const D = window.TammyData;
  const mirror = D.mirror;

  if (mirror === undefined || mirror === null) return <ScreenWrap><ScreenSkeleton /></ScreenWrap>;
  if (mirror.locked) return (
    <ScreenWrap>
      <LockedGate
        title="Mirror Moment"
        reason="Your weekly reflection needs more conversations to draw from. Keep talking to Tammy."
        sessions={mirror.sessions}
        sessions_needed={mirror.sessions_needed}
      />
    </ScreenWrap>
  );

  const excerpt = mirror.excerpt || mirror.content || '';
  const paragraphs = excerpt.split(/\n\n+/).filter(Boolean);
  const sessionCount  = mirror.session_count  || mirror.sessions_this_week || '—';
  const decisionCount = mirror.decisions_touched || '—';
  const avoidanceCount= mirror.avoidance_signals || '—';
  const moodDelta     = mirror.mood_delta || '—';
  const voiceRatio    = mirror.voice_text_ratio || '—';
  const generatedAt   = mirror.generated_at ? new Date(mirror.generated_at * 1000).toLocaleDateString() : 'this week';

  return (
    <ScreenWrap>
      <Eyebrow>Reflection · {generatedAt}</Eyebrow>
      <H1>Mirror moment</H1>
      <Sub>A spoken read of where you are right now. Harsh, fair, private. Listen on a walk, not at your desk.</Sub>

      <div style={{ padding: 40, background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)', border: '1px solid var(--mauve-soft)', borderRadius: 24, marginBottom: 40 }}>
        <WaveBars active={playing} />
        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => setPlaying(p => !p)} style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--amber)', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 32px var(--amber-glow)', flexShrink: 0 }}>
            {playing ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                     : <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 19 12 7 20" /></svg>}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ height: 4, background: 'var(--mauve-soft)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${pos}%`, height: '100%', background: 'var(--ink)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{Math.floor(pos * 2.4 / 60).toString().padStart(2,'0')}:{Math.floor((pos * 2.4) % 60).toString().padStart(2,'0')}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>04:00</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 18 }}>Excerpt</div>
          {paragraphs.length > 0 ? paragraphs.map((para, i) => (
            <p key={i} className="serif" style={{ fontSize: 24, color: i === paragraphs.length - 1 ? 'var(--ink-2)' : 'var(--ink)', lineHeight: 1.45, margin: '0 0 24px', letterSpacing: '-0.01em' }}>{para}</p>
          )) : (
            <p className="serif" style={{ fontSize: 20, color: 'var(--ink-3)', lineHeight: 1.5, fontStyle: 'italic' }}>Tammy is preparing your reflection…</p>
          )}
        </div>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 18 }}>Generated from</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SourceRow label="Sessions this week" value={sessionCount} />
            <SourceRow label="Decisions touched"  value={decisionCount} />
            <SourceRow label="Avoidance signals"  value={avoidanceCount} />
            <SourceRow label="Mood baseline"       value={moodDelta} />
            <SourceRow label="Voice : text ratio"  value={voiceRatio} />
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 24, width: '100%' }}>Download · MP3</button>
        </div>
      </div>
    </ScreenWrap>
  );
};

// ╔══════════════════════════════════════════════════════════════ Decisions ═══╗

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

// ╔══════════════════════════════════════════════════════════════ Projects ════╗

const INITIAL_VISIBLE = 6;

const ProjStat = ({ label, value, sub, accent, small }) => (
  <div style={{ background: 'var(--surface)', padding: '20px 24px' }}>
    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>{label}</div>
    <div className="serif" style={{ fontSize: small ? 22 : 36, color: accent, fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em' }}>{value}</div>
    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>
  </div>
);

const Constellation = ({ projects }) => {
  const W = 1080, H = 320, cx = W / 2, cy = H / 2;
  const sumE = React.useMemo(() => projects.map(p => (p.energy || []).reduce((a, b) => a + b, 0)), [projects]);
  const maxE = React.useMemo(() => Math.max(...sumE, 1), [sumE]);
  return (
    <div style={{ position: 'relative', padding: '32px 24px', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 24, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 24, left: 28, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'var(--font-mono,ui-monospace)' }}>Gravity map · this week</div>
      <div style={{ position: 'absolute', top: 24, right: 28, fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono,ui-monospace)', display: 'flex', gap: 20 }}>
        {Object.entries(STATUS_COLOR).map(([k, c]) => <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} /> {k}</span>)}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {[80, 130, 180].map((r, i) => <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="var(--mauve-soft)" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />)}
        {projects.map((p, i) => {
          const angle = (i / projects.length) * Math.PI * 2 - Math.PI / 2;
          const e = sumE[i];
          const dist = 90 + (1 - e / maxE) * 90;
          const px = cx + Math.cos(angle) * dist, py = cy + Math.sin(angle) * dist;
          return <line key={`l-${i}`} x1={cx} y1={cy} x2={px} y2={py} stroke={p.status === 'Stalled' ? 'var(--amber)' : 'var(--mauve)'} strokeWidth="1" strokeDasharray={p.status === 'Stalled' ? '3 4' : '0'} opacity="0.45" />;
        })}
        {projects.map((p, i) => {
          const angle = (i / projects.length) * Math.PI * 2 - Math.PI / 2;
          const e = sumE[i];
          const dist = 90 + (1 - e / maxE) * 90;
          const r = 14 + (e / maxE) * 22;
          const px = cx + Math.cos(angle) * dist, py = cy + Math.sin(angle) * dist;
          const color = STATUS_COLOR[p.status] || STATUS_COLOR.Live;
          const labelOnRight = px >= cx;
          const name = p.bucket || p.name || 'Untitled';
          return (
            <g key={`n-${i}`}>
              {p.status === 'Live' && <circle cx={px} cy={py} r={r+8} fill={color} opacity="0.12" />}
              <circle cx={px} cy={py} r={r} fill="var(--surface)" stroke={color} strokeWidth="2.5" />
              <circle cx={px} cy={py} r={r*0.45} fill={color} opacity={p.status === 'Stalled' ? 0.4 : 0.85} />
              <text x={labelOnRight ? px+r+12 : px-r-12} y={py+4} fontSize="13" fill="var(--ink)" textAnchor={labelOnRight ? 'start' : 'end'} fontFamily="var(--font-serif,Georgia)" letterSpacing="-0.01em">{name}</text>
              <text x={labelOnRight ? px+r+12 : px-r-12} y={py+20} fontSize="10" fill="var(--ink-3)" textAnchor={labelOnRight ? 'start' : 'end'} fontFamily="var(--font-mono,ui-monospace)" letterSpacing="0.1em">{p.open || 0} OPEN</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="22" fill="var(--ink)" />
        <text x={cx} y={cy+6} fontSize="18" fill="var(--surface)" textAnchor="middle" fontFamily="var(--font-serif,Georgia)" fontStyle="italic">T</text>
      </svg>
    </div>
  );
};

const ProjectCard = ({ p: rawP }) => {
  const [hover, setHover] = React.useState(false);
  const p = {
    bucket: rawP.bucket || rawP.name || rawP.label || 'Untitled',
    kind: rawP.kind || 'project',
    status: rawP.status || 'Live',
    summary: rawP.summary || '',
    glyph: rawP.glyph || 'ring',
    energy: Array.isArray(rawP.energy) && rawP.energy.length > 0 ? rawP.energy : [0,0,0,0,0,0,0],
    threads: Array.isArray(rawP.threads) ? rawP.threads : [],
    last_said: rawP.last_said || '',
    last_touch: rawP.last_touch || (rawP.updated_at ? `${Math.max(1, Math.round((Date.now()/1000 - rawP.updated_at) / 86400))}d` : 'recently'),
    id: rawP.id || rawP._id,
  };
  const color = STATUS_COLOR[p.status] || STATUS_COLOR.Live;
  const max = Math.max(...p.energy, 1);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ position: 'relative', padding: '28px 28px 24px 36px', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 20, cursor: 'pointer', transition: 'all 240ms cubic-bezier(0.32,0.72,0.24,1)', transform: hover ? 'translateY(-3px)' : 'none', boxShadow: hover ? '0 24px 60px rgba(43,20,86,0.10)' : 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, background: `linear-gradient(180deg, ${color} 0%, ${color}66 100%)`, opacity: p.status === 'Stalled' ? 1 : 0.85 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Glyph kind={p.glyph} color={color} size={24} />
          </div>
          <div>
            <div className="serif" style={{ fontSize: 24, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.1 }}>{p.bucket}</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{p.kind}</div>
          </div>
        </div>
        <StatusPill status={p.status} color={color} />
      </div>
      {p.summary && <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 16px' }}>{p.summary}</p>}
      <div style={{ marginBottom: 16, height: 36, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
        {p.energy.map((v, i) => (
          <div key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, minHeight: 2, background: i === p.energy.length - 1 ? color : `${color}66`, borderRadius: 1.5, opacity: 0.4 + (i / p.energy.length) * 0.6 }} />
        ))}
      </div>
      {p.last_said && (
        <div style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 10, borderLeft: `2px solid ${color}`, marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>last said</div>
          <div className="serif" style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5, fontStyle: 'italic' }}>"{p.last_said}"</div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 14, borderTop: '1px solid var(--mauve-soft)' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {p.threads.length === 0 ? <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>no open threads</span>
          : p.threads.slice(0, 3).map((t, i) => <span key={i} style={{ fontSize: 11, padding: '4px 9px', background: 'var(--mauve-soft)', color: 'var(--ink-2)', borderRadius: 6, whiteSpace: 'nowrap' }}>{t}</span>)}
          {p.threads.length > 3 && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', alignSelf: 'center' }}>+{p.threads.length - 3}</span>}
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{p.last_touch} ago</div>
      </div>
    </div>
  );
};

const ProjectList = ({ projects }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid rgba(178,157,217,0.3)', borderRadius: 18, overflow: 'hidden' }}>
    {projects.map((rawP, i) => {
      const p = { bucket: rawP.bucket || rawP.name || rawP.label || 'Untitled', status: rawP.status || 'Live', summary: rawP.summary || '', glyph: rawP.glyph || 'ring', open: rawP.open || 0, energy: Array.isArray(rawP.energy) ? rawP.energy : [], last_touch: rawP.last_touch || 'recently', id: rawP.id || rawP._id };
      const color = STATUS_COLOR[p.status] || STATUS_COLOR.Live;
      const energySum = p.energy.reduce((a, b) => a + b, 0);
      return (
        <div key={p.id || i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 90px 100px 60px', gap: 16, alignItems: 'center', padding: '16px 20px', borderBottom: i < projects.length - 1 ? '1px solid rgba(178,157,217,0.2)' : 'none', cursor: 'pointer', transition: 'background 160ms ease' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,172,255,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Glyph kind={p.glyph} color={color} size={18} />
          </div>
          <div>
            <div className="serif" style={{ fontSize: 17, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{p.bucket}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{p.summary}</div>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{p.open} open</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{p.last_touch} ago</div>
          <StatusPill status={p.status} color={color} />
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right' }}>·{energySum}</div>
        </div>
      );
    })}
  </div>
);

const NewProjectCard = () => {
  const [hover, setHover] = React.useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ position: 'relative', padding: 28, background: hover ? 'var(--surface)' : 'transparent', border: `1.5px dashed ${hover ? 'var(--ink-2)' : 'var(--mauve)'}`, borderRadius: 20, cursor: 'pointer', transition: 'all 240ms cubic-bezier(0.32,0.72,0.24,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 320 }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: hover ? 'var(--ink)' : 'var(--mauve-soft)', color: hover ? 'var(--surface)' : 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 300, lineHeight: 1, marginBottom: 18, transition: 'all 240ms ease', transform: hover ? 'scale(1.06) rotate(90deg)' : 'scale(1) rotate(0deg)' }}>+</div>
      <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.015em', marginBottom: 8 }}>Start a new bucket</div>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55, margin: '0 0 16px', maxWidth: 240 }}>A relationship, a side project, a thing you're trying to figure out. Tammy will hold the context.</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Project', 'Person', 'Practice', 'Decision'].map(t => (
          <span key={t} className="mono" style={{ fontSize: 10, padding: '4px 9px', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', color: 'var(--ink-3)', borderRadius: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t}</span>
        ))}
      </div>
    </div>
  );
};

const ProjectsScreen = () => {
  const [data, setData] = React.useState(window.TammyData);
  const [showAll, setShowAll] = React.useState(false);
  const [view, setView] = React.useState('cards');

  React.useEffect(() => {
    const h = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
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

  const projects = React.useMemo(() => (rawProjects || []).map(p => ({
    ...p,
    energy: Array.isArray(p.energy) && p.energy.length > 0 ? p.energy : [1,1,1,1,1,1,1],
  })), [rawProjects]);

  if (projects.length === 0) {
    return (
      <ScreenWrap>
        <Eyebrow>Projects</Eyebrow>
        <H1>The shape of everything you carry.</H1>
        <Sub>Tammy reads your conversations and maps your active projects automatically.</Sub>
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--mauve-soft)' }}>
          <div className="serif" style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 16 }}>No projects yet.</div>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>Once you have a few conversations, Tammy will map your active buckets here.</p>
          <button className="btn btn-primary" onClick={() => fetch(`${EXTRA_API}/api/projects?force=1`, { credentials: 'include' }).then(r => r.json()).then(d => { window.TammyData.projects = d; window.dispatchEvent(new Event('tammy:dataready')); })} style={{ padding: '12px 24px', borderRadius: 999 }}>
            Scan from chat history
          </button>
        </div>
      </ScreenWrap>
    );
  }

  const totalOpen = projects.reduce((a, p) => a + (p.open || 0), 0);
  const stalled   = projects.filter(p => p.status === 'Stalled').length;
  const live      = projects.filter(p => p.status === 'Live').length;
  const heaviest  = [...projects].sort((a, b) => b.energy.reduce((x,y)=>x+y,0) - a.energy.reduce((x,y)=>x+y,0))[0];
  const sorted    = [...projects].sort((a, b) => {
    const order = { Live: 0, Review: 1, Stalled: 2 };
    if ((order[a.status]||0) !== (order[b.status]||0)) return (order[a.status]||0) - (order[b.status]||0);
    return b.energy.reduce((x,y)=>x+y,0) - a.energy.reduce((x,y)=>x+y,0);
  });
  const visibleProjects = showAll ? sorted : sorted.slice(0, INITIAL_VISIBLE);

  return (
    <ScreenWrap>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 18 }}>
        <div>
          <Eyebrow>{projects.length} buckets · {totalOpen} open threads · {stalled} stalled</Eyebrow>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            The shape of<br /><em style={{ fontStyle: 'italic', color: '#947DED' }}>everything you carry.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0, maxWidth: 560, lineHeight: 1.5 }}>Each bucket has its own gravity. Tammy maps this from your real conversations.</p>
        </div>
        <button className="btn btn-primary" style={{ flexShrink: 0, marginTop: 12, padding: '14px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => fetch(`${EXTRA_API}/api/projects?force=1`, { credentials: 'include' }).then(r => r.json()).then(d => { window.TammyData.projects = d; window.dispatchEvent(new Event('tammy:dataready')); })}>
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: -2 }}>↻</span> Rescan
        </button>
      </div>

      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(178,157,217,0.25)', border: '1px solid rgba(178,157,217,0.3)', borderRadius: 18, overflow: 'hidden' }}>
        <ProjStat label="Active buckets" value={live} sub={`of ${projects.length} total`} accent="#947DED" />
        <ProjStat label="Open threads" value={totalOpen} sub="across all buckets" accent="#6B5BC8" />
        <ProjStat label="Stalled" value={stalled} sub={stalled === 0 ? 'all moving' : 'quietly costing you'} accent={stalled > 0 ? '#7B6BA8' : '#A89BB3'} />
        <ProjStat label="Heaviest" value={heaviest ? (heaviest.bucket || heaviest.name || 'Untitled') : '—'} sub={heaviest ? `${heaviest.energy.reduce((x,y)=>x+y,0)} energy units` : ''} accent="#C0ACFF" small />
      </div>

      <div style={{ marginTop: 36, marginBottom: 56 }}>
        <Constellation projects={projects} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h2 className="serif" style={{ fontSize: 32, fontWeight: 400, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>All projects.</h2>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>sorted by status · then by gravity</div>
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
            {visibleProjects.map((p, i) => <ProjectCard key={p.id || i} p={p} />)}
            <NewProjectCard />
          </div>
          {sorted.length > INITIAL_VISIBLE && (
            <button onClick={() => setShowAll(v => !v)} style={{ width: '100%', marginTop: 18, padding: '14px', borderRadius: 14, border: '1px solid var(--mauve-soft)', background: 'transparent', fontSize: 13, color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'inherit' }}>
              {showAll ? 'Show less ↑' : `Show all ${sorted.length} projects ↓`}
            </button>
          )}
        </>
      ) : <ProjectList projects={sorted} />}
    </ScreenWrap>
  );
};

// ╔══════════════════════════════════════════════════════════════ Network ══════╗

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

  React.useEffect(() => {
    const h = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  const handleScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${EXTRA_API}/api/network?force=1`, { credentials: 'include' });
      if (res.ok) { window.TammyData.network = await res.json(); setData({ ...window.TammyData }); }
    } catch {}
    setLoading(false);
  };

  const net = data.network;
  const skillMatches = data.skill_matches || [];

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

  return (
    <ScreenWrap>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 18 }}>
        <div>
          <Eyebrow>{intros.length} {intros.length === 1 ? 'connection' : 'connections'} · {intros.filter(i => i.status === 'pending').length} pending intros · {(incoming.length + skillMatches.length)} new requests</Eyebrow>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>The people<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>around the work.</em></h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0, maxWidth: 560, lineHeight: 1.5 }}>Some you talked to last week. Some are knocking now. Tammy holds the context for both.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <button className="btn btn-ghost" style={{ padding: '14px 22px', fontSize: 14 }}>Invite someone</button>
          <button className="btn btn-ghost" onClick={handleScan} disabled={loading} style={{ padding: '14px 22px', fontSize: 14, color: 'var(--ink-3)' }}>{loading ? 'Scanning…' : 'Rescan network'}</button>
        </div>
      </div>

      {/* Tammy Connect */}
      <div style={{ marginTop: 56, marginBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <h2 className="serif" style={{ fontSize: 30, fontWeight: 400, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>Tammy Connect</h2>
            <span style={{ padding: '4px 10px', background: 'var(--ink)', color: 'var(--surface)', borderRadius: 20, fontSize: 10, fontFamily: 'var(--font-mono,ui-monospace)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{incoming.length + skillMatches.length} new</span>
          </div>
        </div>
        <p className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 24px' }}>People who want to reach you · Tammy filters &amp; summarizes</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* AI skill-match notifications */}
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
            skillMatches.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 16 }}>
                <div className="serif" style={{ fontSize: 20, color: 'var(--ink-2)', marginBottom: 8 }}>No new requests</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>IT'S QUIET RIGHT NOW</div>
              </div>
            )
          )}
        </div>
      </div>

      <NetworkOrbit intros={intros} />

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
    </ScreenWrap>
  );
};

// ── Exports ──────────────────────────────────────────────────────────────────
window.DNAScreen         = DNAScreen;
window.BlindSpotsScreen  = BlindSpotsScreen;
window.CalibrationScreen = CalibrationScreen;
window.MirrorScreen      = MirrorScreen;
window.DecisionsScreen   = DecisionsScreen;
window.ProjectsScreen    = ProjectsScreen;
window.NetworkScreen     = NetworkScreen;
