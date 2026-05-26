// The Arc — emotional timeline rebuild
const ArcScreen = ({ activeBucket, setActiveBucket }) => {
  const D = window.TammyData;
  const arc = D.emotional_arc || [];
  const stats = D.arc_stats || {};
  
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const [animating, setAnimating] = React.useState(true);
  const containerRef = React.useRef(null);
  
  const LockedArc = window.LockedArc || (() => <div style={{padding: '100px', textAlign: 'center'}}>Not enough data. 3 sessions required.</div>);

  if (!arc || arc.length < 3) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '48px 64px 0', marginLeft: 120, maxWidth: 1280 }}>
          <Buckets active={activeBucket} onChange={setActiveBucket} showSignal={false} />
        </div>
        <LockedArc />
      </div>
    );
  }

  // Configuration
  const W = 1040, H = 360, PT = 56, PB = 56, PX = 120;
  
  // Timestamps for accurate X mapping
  const minT = arc[0].timestamp;
  const maxT = arc[arc.length - 1].timestamp;
  const spanT = Math.max(1, maxT - minT);
  
  const y = (v) => PT + (H - PT - PB) * (1 - (v + 1) / 2); // v is -1 to 1
  const x = (i) => {
    const ratio = (arc[i].timestamp - minT) / spanT;
    return PX + (W - 2 * PX) * ratio;
  };

  // Add coordinates to nodes for easy access
  const points = arc.map((p, i) => ({
    ...p,
    cx: x(i),
    cy: y(p.valence)
  }));

  // Build dated chronological narrative
  const narrative = points.map((p, idx) => ({ ...p, originalIdx: idx }))
    .filter(p => p.is_milestone)
    .map(m => {
      const prev = points[Math.max(0, m.originalIdx - 1)];
      const direction = m.valence > prev.valence ? 'rise' : m.valence < prev.valence ? 'fall' : 'flat';
      return { ...m, direction };
    });

  // Build the curve
  const pathD = points.map((p, i) => {
    if (i === 0) return `M ${p.cx} ${p.cy}`;
    const prev = points[i - 1];
    const mx = (prev.cx + p.cx) / 2;
    return `C ${mx} ${prev.cy}, ${mx} ${p.cy}, ${p.cx} ${p.cy}`;
  }).join(' ');
  const areaD = pathD + ` L ${points[points.length - 1].cx} ${H - PB} L ${points[0].cx} ${H - PB} Z`;

  // Annotations (valence shifts > 0.3)
  const annotations = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i-1];
    const curr = points[i];
    const diff = curr.valence - prev.valence;
    if (Math.abs(diff) > 0.3) {
      annotations.push({
        idx: i,
        x: curr.cx,
        y1: prev.cy,
        y2: curr.cy,
        diff,
        midY: (prev.cy + curr.cy) / 2,
        label: `${diff > 0 ? '↑ +' : '↓ '}${diff.toFixed(2)} shift`,
        positive: diff > 0
      });
    }
  }

  // Animation stagger effect
  React.useEffect(() => {
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), points.length * 30 + 300);
    return () => clearTimeout(t);
  }, [points.length]);

  const tagColor = {
    overwhelmed: '#D97757', stressed: '#E8A24B', heavy: '#E8A24B',
    restless: '#E8A24B', neutral: 'var(--ink-3)',
    clear: '#947DED', 'in-flow': '#7BB896',
  };

  const getTooltipStyle = (px, py) => {
    // Smart positioning relative to SVG
    let top = py - 120; // Default above
    let left = px - 100; // Centered
    
    // Check bounds
    if (top < 10) top = py + 20; // Go below if off top
    if (left < 10) left = 10; // Left edge
    if (left > W - 220) left = W - 220; // Right edge
    
    return { top, left };
  };

  const hovered = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div style={{ marginLeft: 120, padding: '0 0 80px', maxWidth: 1280, margin: '0 auto 0 120px' }}>
      <Buckets active={activeBucket} onChange={setActiveBucket} showSignal={false} />

      <div style={{ padding: '36px 64px 0' }}>
        
        {/* Narrative Header */}
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 12 }}>
          The Arc · {stats.sessions_in_range} sessions
        </div>
        <h1 className="serif" style={{ fontSize: 56, margin: '0 0 16px', fontWeight: 400, lineHeight: 1.08, maxWidth: 920, letterSpacing: '-0.015em' }}>
          {stats.narrative_headline || "Your emotional arc"}
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: '0 0 36px', maxWidth: 720, lineHeight: 1.55 }}>
          {stats.narrative_subtitle || "how you've been feeling. Hover any day for the full reading."}
        </p>

        {/* Stats Strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
          background: 'rgba(178, 157, 217, 0.25)', border: '1px solid rgba(178, 157, 217, 0.3)',
          borderRadius: 16, overflow: 'hidden', marginBottom: 28,
        }}>
          <ArcStat label="Lowest point" value={stats.lowest_point?.emotion || '-'} sub={`${stats.lowest_point?.days_ago || ''} · v ${stats.lowest_point?.valence ?? ''}`} accent="#D97757" />
          <ArcStat label="Highest point" value={stats.highest_point?.emotion || '-'} sub={`${stats.highest_point?.days_ago || ''} · v ${stats.highest_point?.valence > 0 ? '+' : ''}${stats.highest_point?.valence ?? ''}`} accent="#7BB896" />
          <ArcStat label="Milestones" value={stats.milestones_count || 0} sub={stats.milestones_count > 0 ? "moments worth pinning" : "none yet · keep talking"} accent="#E8A24B" />
          <ArcStat label="Net shift" value={`${stats.net_shift > 0 ? '+' : ''}${stats.net_shift ?? 0}`} sub="baseline → today (valence)" accent={stats.net_shift > 0 ? '#7BB896' : stats.net_shift < 0 ? '#D97757' : 'var(--mauve)'} />
        </div>

        {/* Chart Container */}
        <div ref={containerRef} style={{
          background: 'var(--surface)', border: '1px solid rgba(178, 157, 217, 0.3)',
          borderRadius: 24, padding: '32px 28px 24px', position: 'relative',
          boxShadow: '0 12px 36px rgba(31, 28, 48, 0.06)'
        }}>
          
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id="arcFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#947DED" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#947DED" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="arcLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#947DED" />
                <stop offset="100%" stopColor="#D97757" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Layer 1: Emotional Zones */}
            {[
              { yStart: PT, height: (H - PT - PB) * 0.2, color: 'rgba(107,63,160,0.08)', label: 'clear / in-flow' }, // 60-80% ? Wait, mapping 1 to -1. Top 20% is v: 0.6 to 1.0
              { yStart: PT + (H - PT - PB) * 0.2, height: (H - PT - PB) * 0.2, color: 'rgba(123,184,150,0.06)', label: 'lifting' },
              { yStart: PT + (H - PT - PB) * 0.4, height: (H - PT - PB) * 0.2, color: 'transparent', label: 'neutral' },
              { yStart: PT + (H - PT - PB) * 0.6, height: (H - PT - PB) * 0.2, color: 'rgba(232,162,75,0.06)', label: 'restless' },
              { yStart: PT + (H - PT - PB) * 0.8, height: (H - PT - PB) * 0.2, color: 'rgba(217,119,87,0.08)', label: 'overwhelmed' }
            ].map((z, i) => (
              <g key={`zone-${i}`}>
                <rect x={PX} y={z.yStart} width={W - 2 * PX} height={z.height} fill={z.color} />
                <text x={PX - 12} y={z.yStart + 16} fontSize="9" fill="var(--ink-3)" fontFamily="IBM Plex Mono, monospace" textAnchor="end" fontStyle="italic" opacity="0.8">
                  {z.label}
                </text>
              </g>
            ))}

            {/* Layer 2: Area and Curve */}
            <g style={{
              strokeDasharray: 3000,
              strokeDashoffset: animating ? 3000 : 0,
              transition: 'stroke-dashoffset 2s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}>
              <path d={areaD} fill="url(#arcFill)" style={{ opacity: animating ? 0 : 1, transition: 'opacity 1s ease 1s' }} />
              <path d={pathD} fill="none" stroke="url(#arcLine)" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Layer 4: Annotations */}
            {annotations.map((ann, i) => (
              <g key={`ann-${i}`} style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.5s ease 1.5s' }}>
                <line x1={ann.x} y1={ann.y1} x2={ann.x} y2={ann.y2} stroke={ann.positive ? '#E8A24B' : '#D97757'} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <text x={ann.x + 8} y={ann.midY} fontSize="9" fill={ann.positive ? '#E8A24B' : '#D97757'} fontFamily="IBM Plex Mono, monospace" fontWeight="600">
                  {ann.label}
                </text>
              </g>
            ))}

            {/* Layer 3: Dots */}
            {points.map((p, i) => {
              const delay = i * 30;
              let r = 5, fill = tagColor[p.primary_emotion] || 'var(--ink-3)', stroke = 'var(--ivory)', sw = 1, filter = 'none';
              
              if (p.is_milestone) {
                r = 10; fill = '#E8A24B'; stroke = '#C58434'; sw = 1.5; filter = 'url(#glow)';
              } else if (p.decision_made) {
                r = 8; fill = '#947DED'; stroke = 'var(--mauve)'; sw = 1;
              }

              const isHovered = hoverIdx === i;
              if (isHovered) r = 14;

              return (
                <g key={`pt-${i}`} 
                   onMouseEnter={() => setHoverIdx(i)} 
                   onMouseLeave={() => setHoverIdx(null)} 
                   style={{ cursor: 'pointer', opacity: animating ? 0 : 1, transform: animating ? 'scale(0)' : 'scale(1)', transformOrigin: `${p.cx}px ${p.cy}px`, transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${animating ? delay : 0}ms` }}
                >
                  <circle cx={p.cx} cy={p.cy} r="20" fill="transparent" />
                  <circle cx={p.cx} cy={p.cy} r={r} fill={fill} stroke={stroke} strokeWidth={sw} filter={filter} style={{ transition: 'all 0.2s ease' }} />
                </g>
              );
            })}

            {/* X-axis labels */}
            {(() => {
              const dateClusters = {};
              points.forEach(p => {
                if (!dateClusters[p.date]) dateClusters[p.date] = { minX: p.cx, maxX: p.cx, p: p };
                else dateClusters[p.date].maxX = p.cx;
              });

              return Object.values(dateClusters).map((cluster, i) => {
                const p = cluster.p;
                const isToday = p.days_ago === 'today';
                const midX = (cluster.minX + cluster.maxX) / 2;
                const isMulti = cluster.minX !== cluster.maxX;
                const yOffset = (i % 2 === 0) ? H - PB + 20 : H - PB + 35; // Stagger unique days
                
                return (
                  <g key={`x-${i}`} style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.5s ease 1s' }}>
                    {isMulti && (
                      <path d={`M ${cluster.minX} ${yOffset - 22} L ${cluster.minX} ${yOffset - 14} L ${cluster.maxX} ${yOffset - 14} L ${cluster.maxX} ${yOffset - 22}`} fill="none" stroke="var(--ink-3)" strokeWidth="1" opacity="0.35" />
                    )}
                    <text x={midX} y={yOffset} fontSize="10" fill={isToday ? '#E8A24B' : 'var(--ink-3)'} fontFamily="Inter" textAnchor="middle" opacity="0.9">
                      {p.day_label} · {p.date.substring(5).replace('-', '/')}
                    </text>
                  </g>
                );
              });
            })()}
          </svg>

          {/* Hover Tooltip (HTML overlay) */}
          {hovered && (
            <div style={{
              position: 'absolute',
              ...getTooltipStyle(hovered.cx, hovered.cy),
              width: 240,
              background: 'var(--surface)',
              border: '1px solid rgba(178, 157, 217, 0.4)',
              borderRadius: 12,
              padding: '16px',
              boxShadow: '0 8px 24px rgba(31, 28, 48, 0.15)',
              pointerEvents: 'none',
              zIndex: 100,
              animation: 'fadeInUp 150ms ease-out forwards'
            }}>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 8, fontFamily: 'IBM Plex Mono, monospace' }}>
                {hovered.day_label} · {hovered.date}
              </div>
              <div className="serif" style={{ fontSize: 18, color: tagColor[hovered.primary_emotion] || 'var(--ink)', marginBottom: 4 }}>
                {hovered.primary_emotion}
              </div>
              <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink-3)', marginBottom: 12 }}>
                v {hovered.valence > 0 ? '+' : ''}{hovered.valence}
              </div>
              
              <div style={{ fontSize: 13, color: 'var(--ink-2)', fontStyle: 'italic', marginBottom: hovered.is_milestone || hovered.decision_made ? 12 : 0, lineHeight: 1.4 }}>
                "{hovered.session_preview}..."
              </div>
              
              {hovered.is_milestone && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', background: 'rgba(232,162,75,0.1)', padding: '6px 8px', borderRadius: 6, marginBottom: 6 }}>
                  <span style={{ color: '#E8A24B', fontSize: 12 }}>⭐</span>
                  <div style={{ fontSize: 12, color: '#C58434', lineHeight: 1.3 }}>
                    <strong>milestone</strong><br/>{hovered.milestone_label}
                  </div>
                </div>
              )}
              
              {hovered.decision_made && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', background: 'rgba(148,125,237,0.1)', padding: '6px 8px', borderRadius: 6 }}>
                  <span style={{ color: '#947DED', fontSize: 12 }}>✓</span>
                  <div style={{ fontSize: 12, color: '#7B6BA8', lineHeight: 1.3 }}>
                    <strong>decision made</strong><br/>{hovered.decision_preview}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Context Strip */}
        <div style={{
          marginTop: 24, padding: '16px 20px',
          background: 'rgba(192, 172, 255, 0.08)',
          borderRadius: 12, border: '1px solid rgba(192, 172, 255, 0.2)',
          minHeight: 56, display: 'flex', alignItems: 'center'
        }}>
          {hovered ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--ink-2)' }}>
              <span style={{ fontWeight: 600, minWidth: 100 }}>{hovered.day_label}, {hovered.date}</span>
              <span style={{ color: tagColor[hovered.primary_emotion] || 'var(--ink)', fontStyle: 'italic' }}>{hovered.primary_emotion}</span>
              <span style={{ opacity: 0.6 }}>·</span>
              <span>"{hovered.session_preview}"</span>
              {hovered.is_milestone && <span style={{ color: '#E8A24B', marginLeft: 8, fontSize: 12, padding: '2px 6px', background: 'rgba(232,162,75,0.1)', borderRadius: 4 }}>{hovered.milestone_label}</span>}
              {hovered.decision_made && <span style={{ color: '#947DED', marginLeft: 8, fontSize: 12, padding: '2px 6px', background: 'rgba(148,125,237,0.1)', borderRadius: 4 }}>{hovered.decision_preview}</span>}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--ink-3)', fontStyle: 'italic' }}>
              Your most frequent state this month was <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{stats.dominant_emotion || 'neutral'}</span> · {stats.sessions_in_range || 0} sessions
            </div>
          )}
        </div>

        {/* Story timeline — chronological annotations */}
        <div style={{ marginTop: 56 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 8 }}>The story · in order</div>
          <h2 className="serif" style={{ fontSize: 32, fontWeight: 400, margin: '0 0 28px', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            What actually moved you.
          </h2>

          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {/* Vertical timeline rail */}
            <div style={{
              position: 'absolute', left: 8, top: 8, bottom: 8,
              width: 1, background: 'linear-gradient(180deg, rgba(148,125,237,0.5), rgba(192,172,255,0.2))',
            }} />

            {narrative.map((n, i) => (
              <StoryBeat key={i} beat={n} />
            ))}

            {/* Final "today" beat */}
            {points.length > 0 && (
              <div style={{ position: 'relative', marginBottom: 0, paddingLeft: 32 }}>
                <div style={{
                  position: 'absolute', left: -32 + 2, top: 8,
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#947DED',
                  boxShadow: '0 0 0 4px rgba(148, 125, 237, 0.18)',
                }} />
                <div className="mono" style={{ fontSize: 11, color: '#947DED', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
                  today · {points[points.length-1].date.substring(5).replace('-', '/')}
                </div>
                <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.35, letterSpacing: '-0.01em', maxWidth: 720 }}>
                  You're <span style={{ fontStyle: 'italic', color: tagColor[points[points.length-1].primary_emotion] || 'var(--ink)' }}>{points[points.length-1].primary_emotion}</span>. Not euphoric, not lifted — clear. That's a different muscle than happy. It's the one you've been training.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delta panel — final readout */}
        <div style={{
          marginTop: 56,
          padding: 32,
          background: 'linear-gradient(135deg, rgba(192, 172, 255, 0.14), rgba(148, 125, 237, 0.06))',
          border: '1px solid rgba(192, 172, 255, 0.35)',
          borderRadius: 20,
        }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>The delta · baseline → today</div>
          <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, margin: '0 0 20px', lineHeight: 1.3, letterSpacing: '-0.005em' }}>
            Four numbers that prove the shift wasn't a mood.
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px', marginBottom: 22 }}>
            <DeltaRow label="Valence" a={points.length > 0 ? points[0].valence : '-'} b={points.length > 0 ? points[points.length-1].valence : '-'} />
            <DeltaRow label="Agency (dominance)" a={points.length > 0 ? points[0].dominance : '-'} b={points.length > 0 ? points[points.length-1].dominance : '-'} />
            <DeltaRow label="Decisions made" a="0" b={points.filter(p => p.decision_made).length} />
            <DeltaRow label="Milestones" a="0" b={points.filter(p => p.is_milestone).length} />
          </div>
          <div style={{ paddingTop: 22, borderTop: '1px solid rgba(178, 157, 217, 0.3)' }}>
            <p className="serif" style={{ fontSize: 19, lineHeight: 1.45, color: 'var(--ink)', margin: 0, fontStyle: 'italic', letterSpacing: '-0.005em' }}>
              "When you started you described paralysis. In the last three weeks you've made four decisions without mentioning it. The change is structural, not seasonal."
            </p>
            <div className="mono" style={{ fontSize: 10, color: '#947DED', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 12 }}>— tammy's read</div>
          </div>
        </div>

      </div>
    </div>
  );
};

const ArcStat = ({ label, value, sub, accent }) => (
  <div style={{ background: 'var(--surface)', padding: '18px 22px' }}>
    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
      {label}
    </div>
    <div className="serif" style={{ fontSize: 26, color: accent, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.01em', textTransform: 'lowercase' }}>
      {value}
    </div>
    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
      {sub}
    </div>
  </div>
);

const StoryBeat = ({ beat }) => {
  const dirIcon = beat.direction === 'rise' ? '↑' : beat.direction === 'fall' ? '↓' : '→';
  const dirColor = beat.direction === 'rise' ? '#947DED' : beat.direction === 'fall' ? '#6B5BC8' : '#A89BB3';
  const dirText = beat.direction === 'rise' ? 'a rise' : beat.direction === 'fall' ? 'a dip' : 'a hold';

  return (
    <div style={{ position: 'relative', marginBottom: 28, paddingLeft: 32 }}>
      <div style={{
        position: 'absolute', left: -32 + 2, top: 6,
        width: 14, height: 14, borderRadius: '50%',
        background: 'var(--surface)',
        border: `2px solid ${dirColor}`,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          {beat.days_ago}
        </span>
        <span style={{
          padding: '3px 9px', borderRadius: 999,
          fontSize: 10, fontWeight: 500, color: dirColor,
          background: `${dirColor}1a`, border: `1px solid ${dirColor}40`,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {dirIcon} {dirText}
        </span>
      </div>
      <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: '-0.005em', maxWidth: 720, marginBottom: 6 }}>
        {beat.milestone_label}
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 680, fontStyle: 'italic' }}>
        "{beat.session_preview}"
      </div>
    </div>
  );
};

const DeltaRow = ({ label, a, b }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed rgba(178, 157, 217, 0.3)' }}>
    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{label}</span>
    <div className="mono" style={{ fontSize: 13, color: 'var(--ink)' }}>
      <span style={{ color: 'var(--ink-3)', opacity: 0.7 }}>{a}</span>
      <span style={{ margin: '0 10px', color: '#947DED' }}>→</span>
      <span style={{ color: '#6B5BC8', fontWeight: 600 }}>{b}</span>
    </div>
  </div>
);

window.ArcScreen = ArcScreen;
