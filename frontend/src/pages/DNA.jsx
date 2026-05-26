// Founder DNA screen.

const EXTRA_API = window.EXTRA_API || window.TAMMY_API || 'http://localhost:7861';
const { ScreenWrap, Eyebrow, Sub, ScreenSkeleton, LockedGate, FilterChip } = window._ExtraShared;

const DNA_CATEGORIES = {
  decision:    { label: 'Decision',    color: '#947DED' },
  emotion:     { label: 'Emotion',     color: '#C0ACFF' },
  performance: { label: 'Performance', color: '#6B5BC8' },
  avoidance:   { label: 'Avoidance',   color: '#7B6BA8' },
  strength:    { label: 'Strength',    color: '#A89BB3' },
};

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
  if (dna.locked) return <LockedDNA />;

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

window.DNAScreen = DNAScreen;
