// Locked.jsx — empty / locked states for new accounts.
// Each feature gets its own hero, progress, and voice — never a generic
// "feature unavailable" screen.

const LockedShell = ({ eyebrow, gate, title, lede, hero, progress, voice, stats, philosophy, cta }) => (
  <main style={{
    marginLeft: 88,
    minHeight: '100vh',
    padding: '64px 80px 96px',
    maxWidth: 1280,
    position: 'relative',
  }}>
    {/* Eyebrow + gate badge */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <span className="mono" style={{
        fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'var(--ink-3)',
      }}>{eyebrow}</span>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--mauve)' }} />
      <span className="mono" style={{
        fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--iris-deep)',
        padding: '4px 9px', borderRadius: 999,
        border: '1px solid var(--mauve)',
        background: 'var(--surface-2)',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        <LockGlyph /> {gate}
      </span>
    </div>

    {/* Title + sub */}
    <h1 className="serif" style={{
      fontSize: 72, fontWeight: 400, lineHeight: 0.98, letterSpacing: '-0.035em',
      margin: '0 0 18px', color: 'var(--ink)', maxWidth: 720,
    }}>
      {title}
    </h1>
    <p style={{
      fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.55,
      maxWidth: 580, margin: '0 0 56px',
    }}>
      {lede}
    </p>

    {/* Hero + sidebar */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 360px',
      gap: 64,
      alignItems: 'start',
      marginBottom: 56,
    }}>
      {/* Left — hero visual */}
      <div style={{
        position: 'relative',
        padding: '56px 32px',
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--canvas-tint) 100%)',
        border: '1px solid var(--mauve-soft)',
        borderRadius: 24,
        minHeight: 420,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* ambient pool */}
        <div aria-hidden style={{
          position: 'absolute', inset: -40, opacity: 0.6,
          background: 'radial-gradient(ellipse 60% 60% at 50% 40%, var(--amber-soft), transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* corner ticks */}
        <CornerTicks />
        {/* hero */}
        <div style={{ position: 'relative', zIndex: 2 }}>{hero}</div>
      </div>

      {/* Right — progress + stats */}
      <aside style={{ position: 'sticky', top: 24 }}>
        <div className="mono" style={{
          fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--ink-3)', marginBottom: 14,
        }}>
          accumulating
        </div>

        <div style={{
          padding: '24px 22px',
          background: 'var(--surface)',
          border: '1px solid var(--mauve-soft)',
          borderRadius: 18,
          marginBottom: 16,
        }}>
          {/* Big progress */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="serif" style={{
              fontSize: 44, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1,
            }}>
              {progress.have}<span style={{ fontSize: 22, color: 'var(--ink-3)' }}> / {progress.need}</span>
            </span>
            <span className="mono" style={{
              fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--iris-deep)',
            }}>{Math.round((progress.have / progress.need) * 100)}%</span>
          </div>
          {/* Segmented progress (one tick per unit) */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
            {Array.from({ length: progress.need }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 6, borderRadius: 2,
                background: i < progress.have ? 'var(--ink)' : 'var(--mauve-soft)',
                transition: 'background 240ms ease',
              }} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
            {progress.label}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          padding: '14px 22px',
          background: 'var(--surface)',
          border: '1px solid var(--mauve-soft)',
          borderRadius: 18,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '14px 0',
              borderBottom: i < stats.length - 1 ? '1px solid var(--mauve-soft)' : 'none',
            }}>
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{s.label}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>

    {/* Tammy voice + CTA strip */}
    <div style={{
      padding: '28px 32px',
      background: 'var(--ink)',
      color: 'var(--canvas)',
      borderRadius: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 32, marginBottom: 40,
    }}>
      <div style={{ flex: 1 }}>
        <div className="mono" style={{
          fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)', marginBottom: 8,
        }}>she'd tell you</div>
        <p className="serif" style={{
          margin: 0, fontSize: 22, lineHeight: 1.35,
          fontStyle: 'italic', color: 'var(--canvas)', letterSpacing: '-0.01em',
        }}>{voice}</p>
      </div>
      <button style={{
        flexShrink: 0,
        padding: '14px 22px', borderRadius: 999,
        background: 'var(--amber)', color: '#FFFFFF',
        border: 'none', cursor: 'pointer',
        fontFamily: 'var(--f-sans)', fontSize: 13, fontWeight: 500,
        boxShadow: '0 6px 22px var(--amber-glow)',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        whiteSpace: 'nowrap',
      }}>
        {cta} <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
      </button>
    </div>

    {/* Philosophy hairline */}
    <div style={{
      padding: '18px 22px',
      border: '1px dashed var(--mauve)',
      borderRadius: 14,
      display: 'flex', alignItems: 'center', gap: 14,
      maxWidth: 720,
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--iris-deep)" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <span className="mono" style={{
        fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--ink-3)', lineHeight: 1.6,
      }}>
        why this waits · {philosophy}
      </span>
    </div>
  </main>
);

const LockGlyph = () => (
  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
    <rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
    <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const CornerTicks = () => (
  <div aria-hidden style={{ position: 'absolute', inset: 18, pointerEvents: 'none' }}>
    {[
      { top: 0, left: 0 },
      { top: 0, right: 0, transform: 'scaleX(-1)' },
      { bottom: 0, left: 0, transform: 'scaleY(-1)' },
      { bottom: 0, right: 0, transform: 'scale(-1, -1)' },
    ].map((p, i) => (
      <svg key={i} width="18" height="18" viewBox="0 0 18 18" fill="none"
        style={{ position: 'absolute', opacity: 0.5, ...p }}>
        <path d="M1 1 L1 7 M1 1 L7 1" stroke="var(--mauve)" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ))}
  </div>
);

// ─────────────────────────────────────────── FOUNDER DNA · locked

const HelixGhost = () => {
  // Vertical double-helix with some rungs "read" (solid) and most still "unread" (dashed mauve)
  const rows = 9;
  const readUntil = 3; // first 3 rungs are read
  return (
    <svg width="320" height="360" viewBox="-160 -180 320 360">
      {/* Two sine wave strands */}
      {[1, -1].map((sign, idx) => {
        let d = '';
        for (let y = -170; y <= 170; y += 4) {
          const x = Math.sin((y / 180) * Math.PI * 2) * 60 * sign;
          d += y === -170 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }
        return <path key={idx} d={d} stroke="var(--iris-deep)" strokeWidth="1.5" fill="none" opacity={0.7} />;
      })}
      {/* Rungs */}
      {Array.from({ length: rows }).map((_, i) => {
        const y = -160 + (i / (rows - 1)) * 320;
        const x = Math.sin((y / 180) * Math.PI * 2) * 60;
        const read = i < readUntil;
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={-x} y2={y}
              stroke={read ? 'var(--ink)' : 'var(--mauve)'}
              strokeWidth={read ? 2 : 1}
              strokeDasharray={read ? '0' : '3 4'}
              opacity={read ? 0.9 : 0.6}
            />
            {/* Nodes */}
            <circle cx={x} cy={y} r={read ? 4 : 2.5} fill={read ? 'var(--ink)' : 'var(--mauve)'} />
            <circle cx={-x} cy={y} r={read ? 4 : 2.5} fill={read ? 'var(--ink)' : 'var(--mauve)'} />
            {/* Trait label for read rungs */}
            {read && (
              <text x={x > 0 ? x + 14 : x - 14}
                    textAnchor={x > 0 ? 'start' : 'end'}
                    y={y + 3}
                    fontSize="9"
                    fontFamily="ui-monospace, monospace"
                    letterSpacing="0.1em"
                    fill="var(--ink-3)"
                    style={{ textTransform: 'uppercase' }}>
                {['decision', 'avoidance', 'tempo'][i]}
              </text>
            )}
          </g>
        );
      })}
      {/* Heading */}
      <text x="0" y="-180" textAnchor="middle" fontSize="9"
        fontFamily="ui-monospace, monospace" letterSpacing="0.22em"
        fill="var(--ink-3)" style={{ textTransform: 'uppercase' }}>
        3 traits read · 9 still waiting
      </text>
    </svg>
  );
};

const LockedDNA = () => (
  <LockedShell
    eyebrow="Founder DNA · your patterns mapped"
    gate="locked · 10 sessions"
    title={<>Your <em style={{ fontStyle: 'italic', color: 'var(--iris-deep)' }}>patterns</em>, not yet.</>}
    lede="Tammy needs ten honest sessions before she'll read your patterns back to you. Less than that is guessing, and you didn't sign up for guesses."
    hero={<HelixGhost />}
    progress={{ have: 4, need: 10, label: 'Six more conversations and she\'ll draft your DNA.' }}
    voice="Three traits are already loud. I want six more before I name the rest — patterns from four sessions are coincidence, not character."
    stats={[
      { label: 'Themes noticed', value: '8' },
      { label: 'Strongest signal', value: 'avoidance' },
      { label: 'Confidence today', value: '32%' },
      { label: 'Estimated unlock', value: '~2 weeks' },
    ]}
    philosophy="character takes more than a week"
    cta="Talk to Tammy"
  />
);

// ─────────────────────────────────────────── MIRROR MOMENT · locked

const OrbGhost = () => (
  <div style={{ position: 'relative', width: 340, height: 340 }}>
    {/* Empty halo */}
    <div style={{
      position: 'absolute', inset: -20, borderRadius: '50%',
      background: 'radial-gradient(circle, var(--amber-soft), transparent 65%)',
      filter: 'blur(20px)',
    }} />
    {/* Ring of dashed bars */}
    <svg viewBox="-170 -170 340 340" width="340" height="340" style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 56 }).map((_, i) => {
        const angle = (i / 56) * Math.PI * 2 - Math.PI / 2;
        const r1 = 150, r2 = 158;
        const x1 = Math.cos(angle) * r1, y1 = Math.sin(angle) * r1;
        const x2 = Math.cos(angle) * r2, y2 = Math.sin(angle) * r2;
        const lit = i < 14; // 4/14 of the ring
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={lit ? 'var(--ink)' : 'var(--mauve)'}
            strokeWidth={lit ? 2 : 1}
            opacity={lit ? 0.9 : 0.55}
            strokeLinecap="round"
          />
        );
      })}
      {/* Outer dashed ring */}
      <circle cx="0" cy="0" r="160" fill="none" stroke="var(--mauve)" strokeWidth="1" strokeDasharray="2 6" opacity="0.6" />
    </svg>
    {/* Hollow center */}
    <div style={{
      position: 'absolute', inset: 80, borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, rgba(192,172,255,0.18) 0%, rgba(148,125,237,0.06) 60%, transparent 100%)',
      border: '1px dashed var(--mauve)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="serif" style={{
        fontSize: 13, fontStyle: 'italic',
        color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.4, padding: '0 24px',
      }}>
        listening<br />still
      </div>
    </div>
  </div>
);

const LockedMirror = () => (
  <LockedShell
    eyebrow="Mirror Moment · weekly spoken reflection"
    gate="locked · 5 sessions / week"
    title={<>Your <em style={{ fontStyle: 'italic', color: 'var(--iris-deep)' }}>mirror</em> is gathering.</>}
    lede="Four minutes of fair, harsh, private read-back — every Sunday. She needs at least five sessions in a week to have something honest to say."
    hero={<OrbGhost />}
    progress={{ have: 4, need: 5, label: 'One more session this week and the mirror will record itself Sunday evening.' }}
    voice="I have a draft. It's not quite fair yet — I'm missing the part where you push back. One more talk and I'll be ready to play it for you."
    stats={[
      { label: 'Sessions this week', value: '4' },
      { label: 'Estimated unlock', value: 'Sunday 21:00' },
      { label: 'Length', value: '3:42 (draft)' },
      { label: 'Voice', value: 'Nova · low' },
    ]}
    philosophy="four minutes built on four sessions is just opinion"
    cta="Open a session"
  />
);

// ─────────────────────────────────────────── BLIND SPOTS · locked

const ConstellationGhost = () => {
  // Dots scattered; a few connected
  const dots = [
    { x: -110, y:  -80, lit: true,  label: 'rama call' },
    { x:  -40, y: -130, lit: true,  label: null },
    { x:   60, y:  -90, lit: true,  label: null },
    { x:   30, y:  -20, lit: false, label: null },
    { x: -130, y:   10, lit: false, label: null },
    { x: -100, y:   80, lit: false, label: null },
    { x:  -30, y:   60, lit: false, label: null },
    { x:   70, y:   30, lit: false, label: null },
    { x:  120, y:   90, lit: false, label: null },
    { x:    0, y:  130, lit: false, label: null },
    { x:  100, y: -130, lit: false, label: null },
  ];
  // Connections only between lit
  const conns = [[0, 1], [1, 2]];
  return (
    <svg viewBox="-180 -180 360 360" width="360" height="360">
      {/* Connections */}
      {conns.map(([a, b], i) => (
        <line key={i}
          x1={dots[a].x} y1={dots[a].y} x2={dots[b].x} y2={dots[b].y}
          stroke="var(--iris-deep)" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray="3 5" opacity="0.7"
        />
      ))}
      {/* Dots */}
      {dots.map((d, i) => (
        <g key={i}>
          {d.lit && (
            <circle cx={d.x} cy={d.y} r="10" fill="var(--amber-soft)" />
          )}
          <circle cx={d.x} cy={d.y} r={d.lit ? 4 : 2.5}
            fill={d.lit ? 'var(--ink)' : 'var(--mauve)'}
            opacity={d.lit ? 1 : 0.7}
          />
          {d.label && (
            <text x={d.x} y={d.y - 16}
              textAnchor="middle" fontSize="9"
              fontFamily="ui-monospace, monospace" letterSpacing="0.14em"
              fill="var(--ink-3)" style={{ textTransform: 'uppercase' }}>
              {d.label}
            </text>
          )}
        </g>
      ))}
      {/* Caption */}
      <text x="0" y="165" textAnchor="middle" fontSize="9"
        fontFamily="ui-monospace, monospace" letterSpacing="0.22em"
        fill="var(--ink-3)" style={{ textTransform: 'uppercase' }}>
        3 sightings · pattern unconfirmed
      </text>
    </svg>
  );
};

const LockedBlindSpots = () => (
  <LockedShell
    eyebrow="Blind Spots · what she keeps seeing"
    gate="locked · 7 sessions"
    title={<>She sees the dots.<br/><em style={{ fontStyle: 'italic', color: 'var(--iris-deep)' }}>Not the lines yet.</em></>}
    lede="Tammy won't call something a pattern until she's seen it four times. Right now she has three sightings of the same shape — close, but not yet."
    hero={<ConstellationGhost />}
    progress={{ have: 4, need: 7, label: 'Three more sessions and the strongest signal turns into a flagged pattern.' }}
    voice="I'm watching one thread closely. You moved a hard call to text three times now. One more and I'll name it for what it is."
    stats={[
      { label: 'Possible patterns tracked', value: '3' },
      { label: 'Strongest so far', value: 'Rama avoidance' },
      { label: 'Sightings needed', value: '4 (have 3)' },
      { label: 'Estimated unlock', value: 'this week' },
    ]}
    philosophy="three is a coincidence, four is a pattern"
    cta="Open a session"
  />
);

// ─────────────────────────────────────────── CALIBRATION · locked

const ScaleGhost = () => (
  <svg viewBox="-180 -150 360 320" width="360" height="320">
    {/* Beam */}
    <line x1="-150" y1="-30" x2="150" y2="-30" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
    {/* Pans (empty bowls) */}
    {[-1, 1].map((side, i) => (
      <g key={i}>
        <line x1={side * 100} y1="-30" x2={side * 100} y2="20"
          stroke="var(--mauve)" strokeWidth="1.5" />
        <ellipse cx={side * 100} cy="28" rx="56" ry="14"
          fill="none" stroke="var(--mauve)" strokeWidth="1.5"
          strokeDasharray={i === 0 ? "0" : "4 5"}
        />
        <ellipse cx={side * 100} cy="28" rx="56" ry="14"
          fill={i === 0 ? 'var(--amber-soft)' : 'transparent'}
        />
        <text x={side * 100} y={i === 0 ? 16 : 32}
          textAnchor="middle" fontSize="9"
          fontFamily="ui-monospace, monospace" letterSpacing="0.18em"
          fill="var(--ink-3)" style={{ textTransform: 'uppercase' }}>
          {i === 0 ? 'right' : 'wrong'}
        </text>
        {/* Single prediction on the "right" side */}
        {i === 0 && (
          <circle cx={side * 100} cy="22" r="5" fill="var(--ink)" />
        )}
      </g>
    ))}
    {/* Fulcrum */}
    <path d="M -22 60 L 0 -30 L 22 60 Z" fill="var(--ink)" opacity="0.85" />
    <line x1="-60" y1="60" x2="60" y2="60" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
    {/* Caption */}
    <text x="0" y="160" textAnchor="middle" fontSize="9"
      fontFamily="ui-monospace, monospace" letterSpacing="0.22em"
      fill="var(--ink-3)" style={{ textTransform: 'uppercase' }}>
      1 prediction · 4 needed before she grades you
    </text>
  </svg>
);

const LockedCalibration = () => (
  <LockedShell
    eyebrow="Calibration · how often you call it right"
    gate="locked · 5 predictions"
    title={<>She can't grade<br/>a single <em style={{ fontStyle: 'italic', color: 'var(--iris-deep)' }}>guess</em>.</>}
    lede="Tammy tracks the calls you make — the ones you say out loud — and tells you, weeks later, where you were sharp and where you were fooling yourself. She needs five before that becomes useful."
    hero={<ScaleGhost />}
    progress={{ have: 1, need: 5, label: 'Tap any chat message and mark it as a prediction. Four more and she\'ll start grading.' }}
    voice="You make calls every conversation — sharp ones and bluffs. Mark them and I'll keep score. Without that, I'm just remembering, not measuring."
    stats={[
      { label: 'Predictions logged', value: '1' },
      { label: 'Average confidence', value: 'n/a' },
      { label: 'Domains touched', value: 'product · 1' },
      { label: 'Estimated unlock', value: 'when you mark 4' },
    ]}
    philosophy="grading needs a sample size, not a story"
    cta="Mark a prediction"
  />
);

// ─────────────────────────────────────────── THE ARC · locked

const HorizonGhost = () => {
  const days = 14;
  const have = 6;
  const moods = [-0.3, -0.4, -0.2, 0.1, 0.0, -0.1]; // first 6 days, plotted
  const W = 360, H = 220;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {/* Horizon line (zero baseline) */}
      <line x1="0" y1={H/2} x2={W} y2={H/2} stroke="var(--ink)" strokeWidth="1" opacity="0.6" />
      {/* Future band (locked) */}
      <rect x={(have / days) * W} y="20" width={W - (have / days) * W} height={H - 40}
        fill="var(--mauve-soft)" opacity="0.6" />
      <line x1={(have / days) * W} y1="20" x2={(have / days) * W} y2={H - 20}
        stroke="var(--mauve)" strokeWidth="1" strokeDasharray="3 5" />
      {/* Day ticks */}
      {Array.from({ length: days }).map((_, i) => {
        const x = (i / (days - 1)) * W;
        const collected = i < have;
        return (
          <g key={i}>
            <line x1={x} y1={H/2 - 4} x2={x} y2={H/2 + 4}
              stroke={collected ? 'var(--ink)' : 'var(--mauve)'}
              strokeWidth={collected ? 1.5 : 1}
              opacity={collected ? 1 : 0.6}
            />
            {collected && (
              <circle cx={x} cy={H/2 - moods[i] * 100} r="4"
                fill="var(--iris-deep)" />
            )}
            {/* Day label every 2 */}
            {i % 2 === 0 && (
              <text x={x} y={H - 4} textAnchor="middle" fontSize="8"
                fontFamily="ui-monospace, monospace" letterSpacing="0.14em"
                fill="var(--ink-3)" style={{ textTransform: 'uppercase' }}>
                d{i + 1}
              </text>
            )}
          </g>
        );
      })}
      {/* Connect the dots so far */}
      <path
        d={moods.map((m, i) => {
          const x = (i / (days - 1)) * W;
          const y = H/2 - m * 100;
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ')}
        fill="none" stroke="var(--iris-deep)" strokeWidth="2" strokeLinecap="round"
      />
      {/* Label */}
      <text x="6" y="14" fontSize="9"
        fontFamily="ui-monospace, monospace" letterSpacing="0.18em"
        fill="var(--ink-3)" style={{ textTransform: 'uppercase' }}>
        6 days mapped · 8 days to story
      </text>
    </svg>
  );
};

const LockedArc = () => (
  <LockedShell
    eyebrow="The Arc · 28 days of mood and shift"
    gate="locked · 14 days"
    title={<>Six days isn't a <em style={{ fontStyle: 'italic', color: 'var(--iris-deep)' }}>story</em> yet.</>}
    lede="The Arc shows you how you've felt over four weeks — peaks, dips, the days you found clarity and the ones you lost it. She needs two weeks before she'll draw it."
    hero={<HorizonGhost />}
    progress={{ have: 6, need: 14, label: 'Eight more days of check-ins and the first arc renders.' }}
    voice="You're moving. Down at first, evening out now. But that's a sketch — give me eight more days and I'll show you the shape of the weather you're actually living in."
    stats={[
      { label: 'Days mapped', value: '6 / 14' },
      { label: 'Mood range so far', value: '−0.4 to +0.1' },
      { label: 'Trend direction', value: 'rising' },
      { label: 'Estimated unlock', value: '~8 days' },
    ]}
    philosophy="weather, not weather report"
    cta="Open a session"
  />
);

// ────────────── exports
window.LockedDNA = LockedDNA;
window.LockedMirror = LockedMirror;
window.LockedBlindSpots = LockedBlindSpots;
window.LockedCalibration = LockedCalibration;
window.LockedArc = LockedArc;
