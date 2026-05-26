// The Arc — emotional + growth timeline. Full story with annotations.
// Annotated chart, narrative beats, milestone cards with timestamps.

const ArcScreen = ({ activeBucket, setActiveBucket }) => {
  const D = window.TammyData;
  const arc = D.emotional_arc;
  const W = 1040, H = 360, PT = 56, PB = 56, PX = 48;
  const days = arc.length;

  const [hoverIdx, setHoverIdx] = React.useState(null);

  const y = (v) => PT + (H - PT - PB) * (1 - (v + 1) / 2);
  const x = (i) => PX + (W - 2 * PX) * (i / (days - 1));

  // Smooth path
  const pathD = arc.map((p, i) => {
    const cx = x(i), cy = y(p.v);
    if (i === 0) return `M ${cx} ${cy}`;
    const px = x(i - 1), py = y(arc[i - 1].v);
    const mx = (px + cx) / 2;
    return `C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`;
  }).join(' ');
  const areaD = pathD + ` L ${x(days - 1)} ${H - PB} L ${x(0)} ${H - PB} Z`;

  // Stats
  const lowest = arc.reduce((min, p) => p.v < min.v ? p : min, arc[0]);
  const highest = arc.reduce((max, p) => p.v > max.v ? p : max, arc[0]);
  const milestones = arc.filter(p => p.milestone);
  const today = arc[arc.length - 1];
  const baseline = arc[0];
  const delta = (today.v - baseline.v).toFixed(2);

  const tagColor = {
    overwhelmed: '#6B5BC8', stressed: '#7B6BA8', heavy: '#7B6BA8',
    restless: '#947DED', neutral: '#A89BB3',
    clear: '#947DED', 'in-flow': '#C0ACFF',
  };

  const dateLabel = (d) => {
    if (d === 0) return 'today';
    if (d === -1) return 'yesterday';
    return `${Math.abs(d)}d ago`;
  };

  // Build dated chronological narrative — only the milestones, but with derived context
  const narrative = milestones.map(m => {
    const idx = arc.indexOf(m);
    const prev = arc[Math.max(0, idx - 2)];
    const direction = m.v > prev.v ? 'rise' : m.v < prev.v ? 'fall' : 'flat';
    return { ...m, idx, direction };
  });

  const hovered = hoverIdx !== null ? arc[hoverIdx] : null;

  return (
    <div style={{ marginLeft: 120, padding: '0 0 80px', maxWidth: 1280, margin: '0 auto 0 120px' }}>
      <Buckets active={activeBucket} onChange={setActiveBucket} showSignal={false} />

      <div style={{ padding: '36px 64px 0' }}>
        {/* Header */}
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 12 }}>
          The Arc · 28 days · Apr 4 → May 2
        </div>
        <h1 className="serif" style={{ fontSize: 56, margin: '0 0 16px', fontWeight: 400, lineHeight: 1.08, maxWidth: 920, letterSpacing: '-0.015em' }}>
          You started <span style={{ fontStyle: 'italic', color: '#6B5BC8' }}>overwhelmed</span>.<br />
          You're ending <span style={{ fontStyle: 'italic', color: '#947DED' }}>clear</span>.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: '0 0 36px', maxWidth: 720, lineHeight: 1.55 }}>
          how you've been feeling · last 28 days. Hover any day for the full reading. Annotations explain every peak and dip.
        </p>

        {/* Top stat strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: 'rgba(178, 157, 217, 0.25)',
          border: '1px solid rgba(178, 157, 217, 0.3)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 28,
        }}>
          <ArcStat label="Lowest point" value={lowest.tag} sub={`${dateLabel(lowest.d)} · v ${lowest.v.toFixed(2)}`} accent="#6B5BC8" />
          <ArcStat label="Highest point" value={highest.tag} sub={`${dateLabel(highest.d)} · v +${highest.v.toFixed(2)}`} accent="#947DED" />
          <ArcStat label="Milestones" value={milestones.length} sub="moments worth pinning" accent="#C0ACFF" />
          <ArcStat label="Net shift" value={`+${delta}`} sub="baseline → today (valence)" accent="#947DED" />
        </div>

        {/* Annotated chart */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(178, 157, 217, 0.3)',
          borderRadius: 24,
          padding: '32px 28px 24px',
          boxShadow: '0 12px 36px rgba(31, 28, 48, 0.06)',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, padding: '0 8px' }}>
            <div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Valence over time</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
                Each dot is a check-in. Larger dots are milestones — moments that changed something.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--ink-3)' }}>
              {['overwhelmed', 'restless', 'neutral', 'clear', 'in-flow'].map(t => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: tagColor[t] }} /> {t}
                </span>
              ))}
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id="arcFillRich" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#947DED" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#947DED" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="arcLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6B5BC8" />
                <stop offset="100%" stopColor="#947DED" />
              </linearGradient>
            </defs>

            {/* Horizontal grid — emotion-band labels instead of numbers */}
            {[
              { v: 1, label: 'clear · in-flow' },
              { v: 0.5, label: 'lifting' },
              { v: 0, label: 'neutral' },
              { v: -0.5, label: 'restless' },
              { v: -1, label: 'overwhelmed' },
            ].map((g, i) => (
              <g key={i}>
                <line x1={PX} y1={y(g.v)} x2={W - PX} y2={y(g.v)} stroke="#947DED" strokeOpacity={g.v === 0 ? 0.35 : 0.08} strokeDasharray={g.v === 0 ? '3 5' : ''} strokeWidth="1" />
                <text x={PX - 10} y={y(g.v) + 4} fontSize="10.5" fill="#3E3D40" fontFamily="Inter" textAnchor="end" opacity={g.v === 0 ? 0.85 : 0.6} fontStyle="italic">
                  {g.label}
                </text>
              </g>
            ))}

            {/* Area + line */}
            <path d={areaD} fill="url(#arcFillRich)" />
            <path d={pathD} fill="none" stroke="url(#arcLine)" strokeWidth="2.5" strokeLinecap="round" />

            {/* Milestone vertical guides */}
            {arc.map((p, i) => p.milestone && (
              <line key={`g-${i}`} x1={x(i)} y1={y(p.v)} x2={x(i)} y2={H - PB} stroke="#947DED" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 4" />
            ))}

            {/* Points */}
            {arc.map((p, i) => (
              <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} style={{ cursor: 'pointer' }}>
                <circle cx={x(i)} cy={y(p.v)} r="14" fill="transparent" />
                <circle
                  cx={x(i)}
                  cy={y(p.v)}
                  r={p.milestone ? (hoverIdx === i ? 8 : 6) : (hoverIdx === i ? 5 : 3.5)}
                  fill={p.milestone ? '#947DED' : tagColor[p.tag]}
                  stroke="var(--surface)"
                  strokeWidth={p.milestone ? 3 : 2}
                  style={{ transition: 'r 180ms ease' }}
                />
                {p.milestone && (
                  <circle cx={x(i)} cy={y(p.v)} r="11" fill="none" stroke="#947DED" strokeOpacity="0.3" strokeWidth="1" />
                )}
              </g>
            ))}

            {/* Milestone callouts — alternating up/down */}
            {arc.map((p, i) => {
              if (!p.milestone) return null;
              const px = x(i), py = y(p.v);
              const above = py > H / 2; // place callout opposite the dot
              const ly = above ? py - 28 : py + 28;
              const ty = above ? ly - 6 : ly + 18;
              const subY = above ? ly + 8 : ly + 32;
              const align = px > W - 200 ? 'end' : px < 200 ? 'start' : 'middle';
              const xOff = align === 'start' ? 8 : align === 'end' ? -8 : 0;
              return (
                <g key={`cb-${i}`} opacity="0.95">
                  <line x1={px} y1={py} x2={px} y2={ly + (above ? 0 : 0)} stroke="#947DED" strokeOpacity="0.45" strokeWidth="1" />
                  <text x={px + xOff} y={ty} fontSize="11.5" fill="#1F1C30" fontFamily="Inter" fontWeight="600" textAnchor={align} letterSpacing="-0.005em">
                    {p.milestone.title}
                  </text>
                  <text x={px + xOff} y={subY} fontSize="10" fill="#3E3D40" fontFamily="Inter" fontStyle="italic" textAnchor={align} opacity="0.7">
                    {dateLabel(p.d)}
                  </text>
                </g>
              );
            })}

            {/* Hover crosshair + tooltip */}
            {hovered && (
              <g>
                <line x1={x(hoverIdx)} y1={PT - 8} x2={x(hoverIdx)} y2={H - PB + 8} stroke="#947DED" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 3" />
              </g>
            )}

            {/* X axis labels */}
            <text x={PX} y={H - 14} fontSize="11" fill="#3E3D40" fontFamily="Inter" opacity="0.6">28d ago · Apr 4</text>
            <text x={(W) / 2} y={H - 14} fontSize="11" fill="#3E3D40" fontFamily="Inter" textAnchor="middle" opacity="0.6">14d ago · Apr 18</text>
            <text x={W - PX} y={H - 14} fontSize="11" fill="#3E3D40" fontFamily="Inter" textAnchor="end" opacity="0.6">today · May 2</text>
          </svg>

          {/* Hover detail card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'rgba(192, 172, 255, 0.10)',
            border: '1px solid rgba(192, 172, 255, 0.3)',
            borderRadius: 12,
            marginTop: 8,
            minHeight: 56,
          }}>
            {hovered ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: hovered.milestone ? '#947DED' : tagColor[hovered.tag] }} />
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, fontStyle: 'italic' }}>
                      {hovered.milestone ? hovered.milestone.title : `feeling ${hovered.tag}`}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                      {hovered.milestone ? hovered.milestone.note : `${hovered.tag} · agency ${hovered.dom < 0.4 ? 'low' : hovered.dom < 0.7 ? 'steady' : 'high'} · ${hovered.a < 0.4 ? 'quiet' : hovered.a < 0.7 ? 'engaged' : 'activated'}`}
                    </div>
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {dateLabel(hovered.d)}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic', opacity: 0.7 }}>
                Hover any dot to see how you were feeling that day.
              </div>
            )}
          </div>
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
              <StoryBeat key={i} beat={n} dateLabel={dateLabel} idx={i} total={narrative.length} />
            ))}

            {/* Final "today" beat */}
            <div style={{ position: 'relative', marginBottom: 0, paddingLeft: 32 }}>
              <div style={{
                position: 'absolute', left: -32 + 2, top: 8,
                width: 14, height: 14, borderRadius: '50%',
                background: '#947DED',
                boxShadow: '0 0 0 4px rgba(148, 125, 237, 0.18)',
              }} />
              <div className="mono" style={{ fontSize: 11, color: '#947DED', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
                today · May 2
              </div>
              <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.35, letterSpacing: '-0.01em', maxWidth: 720 }}>
                You're <span style={{ fontStyle: 'italic', color: '#6B5BC8' }}>clear</span>. Not euphoric, not lifted — clear. That's a different muscle than happy. It's the one you've been training.
              </div>
            </div>
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
            <DeltaRow label="Valence" a="-0.4" b="+0.2" />
            <DeltaRow label="Agency (dominance)" a="0.30" b="0.65" />
            <DeltaRow label="Decisions made" a="0" b="3" />
            <DeltaRow label="Days since mentioning burnout" a="0" b="9" />
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

const StoryBeat = ({ beat, dateLabel, idx, total }) => {
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
          {dateLabel(beat.d)}
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
        {beat.milestone.title}
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 680, fontStyle: 'italic' }}>
        {beat.milestone.note}
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
