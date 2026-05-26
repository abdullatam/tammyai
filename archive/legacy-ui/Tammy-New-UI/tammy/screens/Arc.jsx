// The Arc — emotional + growth timeline. The unique feature.
// 28-day PAD chart, milestones pinned, emotional baseline vs today delta.

const ArcScreen = ({ activeBucket, setActiveBucket }) => {
  const [data, setData] = React.useState(window.TammyData);
  React.useEffect(() => {
    const onReady = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', onReady);
    return () => window.removeEventListener('tammy:dataready', onReady);
  }, []);
  const D = data;
  const arc = D.emotional_arc || [];
  const stats = D.arc_stats || {};
  const W = 920, H = 320, P = 32;
  const days = arc.length;

  // Generate narrative from real arc data
  const firstTag = days > 0 ? arc[0].tag : null;
  const lastTag  = days > 0 ? arc[arc.length - 1].tag : null;
  const arcNarrative = firstTag && lastTag && firstTag !== lastTag
    ? `you started ${firstTag}. you're ending ${lastTag}.`
    : days > 0
      ? `${days} days of presence tracked.`
      : 'your arc is building.';

  // Compute delta stats from arc if available
  const firstV = days > 0 ? arc[0].v : null;
  const lastV  = days > 0 ? arc[arc.length - 1].v : null;
  const firstDom = days > 0 ? arc[0].dom : null;
  const lastDom  = days > 0 ? arc[arc.length - 1].dom : null;
  const fmt = (n) => n != null ? (n >= 0 ? `+${n.toFixed(1)}` : n.toFixed(1)) : '—';

  if (!days) return (
    <div style={{ marginLeft: 120, padding: '64px', color: 'var(--ink-3)' }}>
      <div className="serif" style={{ fontSize: 32 }}>no arc data yet.</div>
      <p style={{ marginTop: 12 }}>start a few sessions and Tammy will build your emotional arc.</p>
    </div>
  );

  // Map valence -1..1 → H-P..P (positive up)
  const y = (v) => P + (H - 2 * P) * (1 - (v + 1) / 2);
  const x = (i) => P + (W - 2 * P) * (days > 1 ? i / (days - 1) : 0);

  // Smooth path
  const pathD = arc.map((p, i) => {
    const cx = x(i), cy = y(p.v);
    if (i === 0) return `M ${cx} ${cy}`;
    const px = x(i - 1), py = y(arc[i - 1].v);
    const mx = (px + cx) / 2;
    return `C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`;
  }).join(' ');

  const areaD = pathD + ` L ${x(days - 1)} ${H - P} L ${x(0)} ${H - P} Z`;

  const tagColor = {
    overwhelmed: '#7B6BA8', stressed: '#7B6BA8', heavy: '#7B6BA8',
    restless: '#947DED', neutral: '#8B8898',
    clear: '#947DED', 'in-flow': '#C0ACFF',
  };

  return (
    <div style={{ marginLeft: 120, padding: '0 0 80px', maxWidth: 1200, margin: '0 auto 0 120px' }}>
      <Buckets active={activeBucket} onChange={setActiveBucket} showSignal={false} />
      <div style={{ padding: '36px 64px 0' }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
        the arc · 28 days
      </div>
      <h1 className="serif" style={{ fontSize: 48, margin: '0 0 20px', fontWeight: 400, lineHeight: 1.15, maxWidth: 820, paddingBottom: 4 }}>
        {arcNarrative}
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', margin: '0 0 40px', maxWidth: 700, paddingTop: 4 }}>
        Valence over time. Milestones pinned. Dominance and arousal underneath.
      </p>

      {/* Chart */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid rgba(178, 157, 217, 0.3)',
        borderRadius: 20,
        padding: 24,
        boxShadow: 'var(--shadow-md)',
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="arcFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#947DED" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#947DED" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Zero line */}
          <line x1={P} y1={y(0)} x2={W - P} y2={y(0)} stroke="#C0ACFF" strokeDasharray="2 4" strokeWidth="1" opacity="0.5" />
          <text x={P} y={y(0) - 6} fontSize="10" fill="#3E3D40" fontFamily="Inter">neutral</text>

          {/* Area */}
          <path d={areaD} fill="url(#arcFill)" />
          {/* Line */}
          <path d={pathD} fill="none" stroke="#6B5BC8" strokeWidth="2" />

          {/* Points */}
          {arc.map((p, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(p.v)} r={p.milestone ? 6 : 3} fill={tagColor[p.tag]} stroke="var(--surface)" strokeWidth="2" />
              {p.milestone && (
                <g>
                  <line x1={x(i)} y1={y(p.v) - 10} x2={x(i)} y2={y(p.v) - 34} stroke={tagColor[p.tag]} strokeWidth="1" />
                  <circle cx={x(i)} cy={y(p.v) - 40} r="4" fill="#947DED" />
                </g>
              )}
            </g>
          ))}

          {/* X labels */}
          <text x={P} y={H - 10} fontSize="10" fill="#3E3D40" fontFamily="Inter">28d ago</text>
          <text x={W - P} y={H - 10} fontSize="10" fill="#3E3D40" fontFamily="Inter" textAnchor="end">today</text>
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 18, fontSize: 12, color: 'var(--ink-3)' }}>
          {['overwhelmed', 'restless', 'neutral', 'clear', 'in-flow'].map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="dot" style={{ background: tagColor[t] }} /> {t}
            </span>
          ))}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <span className="dot" style={{ background: '#947DED' }} /> milestone
          </span>
        </div>
      </div>

      {/* Milestones list */}
      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <h3 style={{ fontSize: 17, color: 'var(--ink)', fontWeight: 500, marginBottom: 18 }}>Milestones pinned</h3>
          {arc.filter(p => p.milestone).reverse().map((p, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              borderLeft: '2px solid var(--amber)',
              marginBottom: 10,
              background: 'var(--surface)',
              borderRadius: '0 10px 10px 0',
            }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                {Math.abs(p.d)}d ago
              </div>
              <div className="serif" style={{ fontSize: 19, color: 'var(--ink)', marginTop: 4 }}>{p.milestone.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, fontStyle: 'italic' }}>{p.milestone.note}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 style={{ fontSize: 17, color: 'var(--ink)', fontWeight: 500, marginBottom: 18 }}>Delta · baseline → today</h3>
          <div style={{
            padding: 24,
            background: 'linear-gradient(135deg, rgba(192, 172, 255, 0.1), rgba(148, 125, 237, 0.08))',
            border: '1px solid rgba(192, 172, 255, 0.3)',
            borderRadius: 16,
          }}>
            {firstV != null && lastV != null && (
              <DeltaRow label="Valence" a={fmt(firstV)} b={fmt(lastV)} pos={lastV >= firstV} />
            )}
            {firstDom != null && lastDom != null && (
              <DeltaRow label="Dominance" a={firstDom.toFixed(2)} b={lastDom.toFixed(2)} pos={lastDom >= firstDom} />
            )}
            {stats.decisions_count != null && (
              <DeltaRow label="Decisions tracked" a="0" b={String(stats.decisions_count)} pos />
            )}
            {stats.sessions_count != null && (
              <DeltaRow label="Sessions" a="0" b={String(stats.sessions_count)} pos />
            )}
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(178, 157, 217, 0.3)' }}>
              <p className="serif" style={{ fontSize: 18, lineHeight: 1.4, color: 'var(--ink)', margin: 0 }}>
                {stats.sessions_count > 0
                  ? `${stats.sessions_count} session${stats.sessions_count === 1 ? '' : 's'} in the books. ${stats.insights_count > 0 ? `${stats.insights_count} insight${stats.insights_count === 1 ? '' : 's'} surfaced.` : 'Keep going.'}`
                  : 'Start a session and your arc will come alive.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

const DeltaRow = ({ label, a, b, pos }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed rgba(178, 157, 217, 0.25)' }}>
    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{label}</span>
    <div className="mono" style={{ fontSize: 13, color: 'var(--ink)' }}>
      <span style={{ color: 'var(--mauve)' }}>{a}</span>
      <span style={{ margin: '0 8px', color: pos ? 'var(--sage)' : 'var(--sienna)' }}>→</span>
      <span style={{ color: pos ? '#6B5BC8' : 'var(--sienna)', fontWeight: 500 }}>{b}</span>
    </div>
  </div>
);

window.ArcScreen = ArcScreen;
