// New screens added to match the full nav: Founder DNA, Blind Spots, Calibration,
// Mirror Moment, Projects, Network. Each is a finished editorial view, not a stub.

const ScreenWrap = ({ children }) => (
  <main style={{
    marginLeft: 88,
    minHeight: '100vh',
    padding: '64px 80px 96px',
    maxWidth: 1280,
  }}>
    {children}
  </main>
);

const Eyebrow = ({ children }) => (
  <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>
    {children}
  </div>
);

const H1 = ({ children }) => (
  <h1 className="serif" style={{ fontSize: 56, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
    {children}
  </h1>
);

const Sub = ({ children }) => (
  <p style={{ fontSize: 16, color: 'var(--ink-2)', margin: '0 0 48px', maxWidth: 720, lineHeight: 1.55 }}>
    {children}
  </p>
);

// ============================================================== Founder DNA

// Each base pair on the helix is a real trait, derived from sessions.
// category drives color. Hover to inspect. Click to expand evidence.
const DNA_PAIRS = [
  { cat: 'decision', left: 'Converges fast', right: 'Stalls when it has a face', strength: 0.8,
    evidence: 'You decided pricing in 2 days. The hire decision is on day 21.', when: 'Last 30 days · 9 instances' },
  { cat: 'decision', left: 'Walks before deciding', right: 'Slack kills decisions', strength: 0.7,
    evidence: 'Best decisions came after morning walks or in voice memos. None landed in Slack threads.', when: '12 sessions traced' },
  { cat: 'emotion', left: 'Doubt spikes 36hrs', right: 'Recovers via making', strength: 0.75,
    evidence: 'After investor pushback, you went quiet for a day, then shipped V11 prompt the next morning.', when: 'Confirmed pattern · 4 cycles' },
  { cat: 'emotion', left: 'Money talk shifts tone', right: 'Won\'t name it as money', strength: 0.65,
    evidence: 'You used "runway" 7 times before saying "fear." Tone goes flat first.', when: 'Cross-session pattern' },
  { cat: 'performance', left: 'Sharpest 8–11am alone', right: 'Group rooms dilute', strength: 0.85,
    evidence: 'Your best work consistently lands before 11am, solo. Meetings after 2pm read as drag.', when: '64 days observed' },
  { cat: 'performance', left: 'One question at a time', right: 'Multitask = stuck', strength: 0.7,
    evidence: 'When juggling 3+ open threads, you pause longer between messages. Output drops.', when: 'Behavioral signal' },
  { cat: 'avoidance', left: 'Re-opens hire decision', right: 'Won\'t close it', strength: 0.9,
    evidence: 'Same decision opened, paused, re-asked 4 times. Same evidence each time.', when: 'Active loop' },
  { cat: 'avoidance', left: 'Voice → text when hard', right: 'Distance with Rama', strength: 0.8,
    evidence: 'When conversations with Rama turn tense, you switch from call to message within minutes.', when: '7 instances tracked' },
  { cat: 'avoidance', left: 'Names burnout as "tired"', right: 'Until day 11', strength: 0.75,
    evidence: 'You said "tired" 14 times before saying "burnout." There\'s a delay you\'re losing time in.', when: 'Pattern over 3 months' },
  { cat: 'strength', left: 'Reads tension early', right: 'Acts on it late', strength: 0.7,
    evidence: 'You name what\'s wrong before others. You wait too long to do something about it.', when: 'Self-aware blind spot' },
  { cat: 'strength', left: 'Tells the truth in writing', right: 'Smooths it in person', strength: 0.65,
    evidence: 'Your written notes are sharper than your spoken ones. You round corners in rooms.', when: 'Cross-medium pattern' },
  { cat: 'strength', left: 'Builds for one user', right: 'Loses scale instinct', strength: 0.6,
    evidence: 'Tammy\'s best decisions came from one specific user (you). The general use case lags.', when: 'Product signal' },
];

const DNA_CATEGORIES = {
  decision: { label: 'Decision', color: '#947DED' },
  emotion: { label: 'Emotion', color: '#C0ACFF' },
  performance: { label: 'Performance', color: '#6B5BC8' },
  avoidance: { label: 'Avoidance', color: '#7B6BA8' },
  strength: { label: 'Strength', color: '#A89BB3' },
};

const DNAScreen = () => {
  const [selected, setSelected] = React.useState(0);
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'all' ? DNA_PAIRS : DNA_PAIRS.filter(p => p.cat === filter);
  const active = filtered[selected] || filtered[0];

  return (
    <ScreenWrap>
      <Eyebrow>Unlocked · 218 sessions · 64 days</Eyebrow>
      <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
        Your <span style={{ fontStyle: 'italic', color: '#947DED' }}>Founder DNA</span>.
      </h1>
      <Sub>
        Twelve base pairs. Each one is a trait Tammy has watched repeat across your sessions —
        not a personality test, a pattern reading. Hover any rung to inspect. Click to expand.
      </Sub>

      {/* Archetype card */}
      <div style={{
        padding: '32px 36px', marginBottom: 40,
        background: 'linear-gradient(135deg, rgba(192, 172, 255, 0.16), rgba(148, 125, 237, 0.06))',
        border: '1px solid rgba(192, 172, 255, 0.3)',
        borderRadius: 22,
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#947DED', marginBottom: 10 }}>
          Operating archetype
        </div>
        <div className="serif" style={{ fontSize: 40, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14, fontStyle: 'italic' }}>
          The Builder Who Negotiates With Himself
        </div>
        <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0, maxWidth: 660 }}>
          Decisive about product. Soft about people. You move fast on the things that don't scare you,
          and circle the things that do. Strength: pattern reading. Tax: avoidance disguised as deliberation.
        </p>
      </div>

      {/* Category filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <FilterChip label={`All · ${DNA_PAIRS.length}`} active={filter === 'all'} color="#1F1C30" onClick={() => { setFilter('all'); setSelected(0); }} />
        {Object.entries(DNA_CATEGORIES).map(([key, cat]) => {
          const count = DNA_PAIRS.filter(p => p.cat === key).length;
          return (
            <FilterChip
              key={key}
              label={`${cat.label} · ${count}`}
              active={filter === key}
              color={cat.color}
              onClick={() => { setFilter(key); setSelected(0); }}
            />
          );
        })}
      </div>

      {/* Strand + inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 32, alignItems: 'flex-start' }}>
        <DNAStrand pairs={filtered} selected={selected} setSelected={setSelected} />
        <DNAInspector pair={active} pairs={filtered} idx={selected} setSelected={setSelected} />
      </div>

      <div style={{ marginTop: 48, padding: 24, borderTop: '1px solid rgba(178, 157, 217, 0.3)', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="serif" style={{ fontSize: 18, color: 'var(--ink)' }}>Refreshes weekly</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>Last synthesis Sunday 21:00 · next run in 4 days</div>
        </div>
        <button className="btn btn-ghost">Re-run synthesis</button>
      </div>
    </ScreenWrap>
  );
};

const FilterChip = ({ label, active, color, onClick }) => (
  <button onClick={onClick} style={{
    padding: '7px 14px',
    border: `1px solid ${active ? color : 'rgba(178, 157, 217, 0.4)'}`,
    background: active ? color : 'transparent',
    color: active ? '#FFFFFF' : 'var(--ink-2)',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '-0.005em',
    transition: 'all 160ms ease',
  }}>
    {label}
  </button>
);

const DNAStrand = ({ pairs, selected, setSelected }) => {
  const W = 380;
  const ROW_H = 52;
  const CENTER = W / 2;
  const AMP = 110; // amplitude of helix
  const PERIOD = 4; // rungs per twist

  const H = pairs.length * ROW_H + 60;

  // Compute positions
  const positions = pairs.map((p, i) => {
    const t = (i / PERIOD) * Math.PI * 2;
    const offset = Math.sin(t) * AMP;
    return {
      y: 30 + i * ROW_H,
      lx: CENTER - offset,
      rx: CENTER + offset,
    };
  });

  // Smooth spline through left/right points
  const leftPath = positions.map((p, i) => i === 0 ? `M ${p.lx} ${p.y}` : `L ${p.lx} ${p.y}`).join(' ');
  const rightPath = positions.map((p, i) => i === 0 ? `M ${p.rx} ${p.y}` : `L ${p.rx} ${p.y}`).join(' ');

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid rgba(178, 157, 217, 0.3)',
      borderRadius: 22,
      padding: '20px 12px 24px',
      boxShadow: '0 8px 28px rgba(31, 28, 48, 0.05)',
      position: 'sticky',
      top: 24,
    }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', textAlign: 'center', marginBottom: 6 }}>
        The strand · {pairs.length} pairs
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* Backbones */}
        <path d={leftPath} fill="none" stroke="rgba(148, 125, 237, 0.45)" strokeWidth="2.5" strokeLinecap="round" />
        <path d={rightPath} fill="none" stroke="rgba(148, 125, 237, 0.45)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Rungs (base pairs) */}
        {positions.map((pos, i) => {
          const p = pairs[i];
          const cat = DNA_CATEGORIES[p.cat];
          const isSelected = selected === i;
          const isFront = Math.abs(pos.lx - pos.rx) > AMP * 0.4; // simulate depth

          return (
            <g key={i} onClick={() => setSelected(i)} style={{ cursor: 'pointer' }}>
              {/* Hit area */}
              <rect x={Math.min(pos.lx, pos.rx) - 12} y={pos.y - 18} width={Math.abs(pos.rx - pos.lx) + 24} height={36} fill="transparent" />

              {/* Rung line */}
              <line
                x1={pos.lx}
                y1={pos.y}
                x2={pos.rx}
                y2={pos.y}
                stroke={isSelected ? cat.color : 'rgba(148, 125, 237, 0.35)'}
                strokeWidth={isSelected ? 2.5 : 1.5}
                opacity={isFront ? 1 : 0.45}
              />

              {/* Strength tick on rung */}
              <line
                x1={(pos.lx + pos.rx) / 2 - (Math.abs(pos.rx - pos.lx) / 2) * p.strength}
                y1={pos.y}
                x2={(pos.lx + pos.rx) / 2 + (Math.abs(pos.rx - pos.lx) / 2) * p.strength}
                y2={pos.y}
                stroke={cat.color}
                strokeWidth={isSelected ? 4 : 2.5}
                strokeLinecap="round"
                opacity={isSelected ? 1 : 0.7}
              />

              {/* Left node */}
              <circle
                cx={pos.lx}
                cy={pos.y}
                r={isSelected ? 7 : 5}
                fill={isSelected ? cat.color : 'var(--surface)'}
                stroke={cat.color}
                strokeWidth={isSelected ? 0 : 2}
                style={{ transition: 'r 160ms ease' }}
              />
              {/* Right node */}
              <circle
                cx={pos.rx}
                cy={pos.y}
                r={isSelected ? 7 : 5}
                fill={isSelected ? cat.color : 'var(--surface)'}
                stroke={cat.color}
                strokeWidth={isSelected ? 0 : 2}
                style={{ transition: 'r 160ms ease' }}
              />
              {/* Glow ring on selected */}
              {isSelected && (
                <>
                  <circle cx={pos.lx} cy={pos.y} r="11" fill="none" stroke={cat.color} strokeOpacity="0.4" strokeWidth="1" />
                  <circle cx={pos.rx} cy={pos.y} r="11" fill="none" stroke={cat.color} strokeOpacity="0.4" strokeWidth="1" />
                </>
              )}

              {/* Index label */}
              <text x={4} y={pos.y + 4} fontSize="10" fill="var(--ink-3)" fontFamily="ui-monospace, monospace" opacity={isSelected ? 1 : 0.5}>
                {String(i + 1).padStart(2, '0')}
              </text>
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
  const cat = DNA_CATEGORIES[pair.cat];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Active pair */}
      <div style={{
        padding: '28px 32px',
        background: 'var(--surface)',
        border: `1px solid ${cat.color}40`,
        borderRadius: 22,
        boxShadow: `0 12px 32px ${cat.color}1c`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${cat.color}, ${cat.color}80)`,
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: cat.color, fontWeight: 600 }}>
            Pair {String(idx + 1).padStart(2, '0')} · {cat.label}
          </div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
            Strength {Math.round(pair.strength * 100)}%
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 18, alignItems: 'center', marginBottom: 22 }}>
          <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: '-0.005em', textAlign: 'right' }}>
            {pair.left}
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: cat.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFF', fontSize: 14,
          }}>↔</div>
          <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: '-0.005em' }}>
            {pair.right}
          </div>
        </div>

        {/* Strength bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 6 }}>
            <span>weak signal</span>
            <span>defining</span>
          </div>
          <div style={{ height: 4, background: 'rgba(178, 157, 217, 0.2)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
            <div style={{ width: `${pair.strength * 100}%`, height: '100%', background: cat.color, borderRadius: 999 }} />
          </div>
        </div>

        {/* Evidence */}
        <div style={{
          padding: '16px 18px',
          background: 'rgba(192, 172, 255, 0.08)',
          borderLeft: `2px solid ${cat.color}`,
          borderRadius: '0 10px 10px 0',
        }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
            Evidence
          </div>
          <div style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.55, fontStyle: 'italic', marginBottom: 8 }}>
            "{pair.evidence}"
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            {pair.when}
          </div>
        </div>
      </div>

      {/* All pairs index */}
      <div style={{
        padding: '20px 24px',
        background: 'var(--surface)',
        border: '1px solid rgba(178, 157, 217, 0.3)',
        borderRadius: 18,
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>
          All pairs · click to inspect
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
          {pairs.map((p, i) => {
            const c = DNA_CATEGORIES[p.cat];
            const isSel = i === idx;
            return (
              <button key={i} onClick={() => setSelected(i)} style={{
                display: 'grid', gridTemplateColumns: '24px 8px 1fr auto', gap: 12, alignItems: 'center',
                padding: '8px 8px',
                background: isSel ? `${c.color}10` : 'transparent',
                border: 'none', borderRadius: 8,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit',
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ width: 4, height: 16, background: c.color, borderRadius: 2 }} />
                <span style={{ fontSize: 13, color: 'var(--ink-2)', fontStyle: isSel ? 'normal' : 'normal', fontWeight: isSel ? 500 : 400 }}>
                  {p.left} <span style={{ color: 'var(--ink-3)', margin: '0 4px' }}>↔</span> {p.right}
                </span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{Math.round(p.strength * 100)}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================== Blind Spots

const BlindSpotsScreen = () => {
  const spots = [
    { title: 'Avoiding Rama again', detected: 4, lastSeen: '2d ago', desc: "Each time the conversation with Rama gets close to titles, you postpone — \"tomorrow,\" \"after I figure it out,\" \"too tired.\" It's the fourth time in three weeks. The avoidance isn't about the call. It's about not knowing what to offer her, and not wanting to choose between two answers that both cost something." },
    { title: 'Burnout language is back', detected: 9, lastSeen: 'today', desc: "Phrases like \"running on fumes,\" \"head's mush,\" \"can't think straight\" have shown up nine days in a row. Last time this pattern ran fourteen days before you crashed. You're on day nine." },
    { title: "Praising the team in public, doubting them in private", detected: 7, lastSeen: 'yesterday', desc: "On LinkedIn and Slack you say \"crew is unreal.\" Here you say \"I'm doing too much of the thinking myself\" and \"nobody's asking the hard questions.\" Two readings of the same people. Worth naming which one is real." },
  ];

  const weeklyReport = {
    range: 'May 6 — May 12',
    bullets: [
      'You moved three conversations from voice to text the moment they got harder.',
      'You named the word "fear" once this week — last week you named it five times. Watch this drop.',
      'Three decisions you said you\'d close by Friday slipped into next week without a note about why.',
    ],
  };

  if (spots.length === 0) {
    return (
      <ScreenWrap>
        <Eyebrow>Patterns</Eyebrow>
        <H1>What I keep seeing</H1>
        <div style={{
          marginTop: 32,
          padding: '64px 32px',
          textAlign: 'center',
          border: '1px dashed var(--mauve)',
          borderRadius: 18,
        }}>
          <div className="serif" style={{ fontSize: 22, color: 'var(--ink-2)', fontStyle: 'italic', marginBottom: 8 }}>
            blind spots surface after a few weeks of conversations.
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            keep talking. patterns emerge from repetition, not single moments.
          </div>
        </div>
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <Eyebrow>Patterns · weekly · generated Sunday 21:00</Eyebrow>
      <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
        what tammy<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>keeps seeing.</em>
      </h1>
      <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: '0 0 48px', maxWidth: 640, lineHeight: 1.55 }}>
        These aren't observations. They're patterns — things that have happened enough times to count as the way you move. Read them. Argue back if I'm wrong.
      </p>

      {/* Pattern cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 56 }}>
        {spots.map((s, i) => (
          <div key={i} style={{
            padding: '28px 32px',
            background: 'var(--surface)',
            border: '1px solid var(--mauve-soft)',
            borderRadius: 18,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 28, alignItems: 'flex-start',
          }}>
            <div>
              <h2 className="serif" style={{ fontSize: 26, fontWeight: 400, color: 'var(--ink)', margin: '0 0 14px', letterSpacing: '-0.015em', lineHeight: 1.2 }}>
                {s.title}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: 0, lineHeight: 1.65, maxWidth: 660 }}>
                {s.desc}
              </p>
            </div>
            <div style={{ textAlign: 'right', minWidth: 110 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
                detected
              </div>
              <div className="serif" style={{ fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.02em', fontWeight: 400, lineHeight: 1 }}>
                {s.detected}×
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 14, letterSpacing: '0.04em' }}>
                last seen {s.lastSeen}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly report */}
      <div style={{
        padding: '28px 32px',
        background: 'var(--surface)',
        border: '1px solid var(--mauve-soft)',
        borderLeft: '3px solid var(--amber)',
        borderRadius: 18,
      }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 6 }}>
          weekly report
        </div>
        <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 18, letterSpacing: '0.06em' }}>
          {weeklyReport.range}
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {weeklyReport.bullets.map((b, i) => (
            <li key={i} className="serif" style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.5, paddingLeft: 22, position: 'relative', letterSpacing: '-0.005em' }}>
              <span style={{ position: 'absolute', left: 0, top: 12, width: 8, height: 1, background: 'var(--amber)' }} />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </ScreenWrap>
  );
};

// ============================================================== Calibration

// ============================================================== Calibration

const CALIBRATION_STATS = [
  { domain: 'Product', total: 14, right: 9, wrong: 3, partial: 2, trend: [60, 58, 62, 64, 66, 64, 68], note: 'Sharpest here. You read product reality well.' },
  { domain: 'People', total: 11, right: 4, wrong: 5, partial: 2, trend: [42, 38, 36, 38, 40, 36, 36], note: 'You overestimate how others read you.' },
  { domain: 'Timelines', total: 9, right: 2, wrong: 6, partial: 1, trend: [30, 25, 22, 28, 22, 20, 22], note: 'Chronic 2× optimism. Multiply your estimates.' },
  { domain: 'Market', total: 6, right: 4, wrong: 1, partial: 1, trend: [55, 60, 64, 66, 68, 65, 67], note: 'Strong instincts when stakes are external.' },
];

const CALIBRATION_RECENT = [
  { date: '2d ago', domain: 'Product', text: 'V11 prompt rewrite will land 80% positive in user tests.', verdict: 'right', confidence: 80, actual: '83%', note: 'Slight beat. You\'re reading product reality well.' },
  { date: '9d ago', domain: 'People', text: 'Hire decision will resolve by end of month.', verdict: 'wrong', confidence: 70, actual: 'Still pending', note: 'Day 21 of circling. The avoidance is not the input.' },
  { date: '14d ago', domain: 'Product', text: 'V2 launch will land 60% of beta users.', verdict: 'right', confidence: 65, actual: '64%', note: 'Hit the band. Calibrated correctly.' },
  { date: '21d ago', domain: 'People', text: 'Rama will leave if I don\'t name her co-founder.', verdict: 'partial', confidence: 75, actual: 'Stayed; tension up', note: 'You read the temperature, missed the threshold.' },
  { date: '23d ago', domain: 'Market', text: 'Competitor X raises Series A this quarter.', verdict: 'right', confidence: 60, actual: 'Closed last week', note: 'Public signals you read clearly.' },
  { date: '28d ago', domain: 'Timelines', text: 'The studio rebrand will take 3 weeks.', verdict: 'wrong', confidence: 80, actual: 'Took 7', note: 'High confidence, way off. Pattern-level miss.' },
  { date: '35d ago', domain: 'Market', text: 'Investor X will pass.', verdict: 'right', confidence: 55, actual: 'Passed in 6d', note: 'Hedged correctly. Could have gone harder.' },
  { date: '42d ago', domain: 'Timelines', text: 'V11 prompt redesign in 5 days.', verdict: 'wrong', confidence: 70, actual: 'Took 12 days', note: 'Same 2× pattern. Always.' },
];

const VERDICT_COLOR = {
  right: '#947DED',
  partial: '#C0ACFF',
  wrong: '#6B5BC8',
};

const CalibrationScreen = () => {
  const [activeDomain, setActiveDomain] = React.useState('all');
  const [showOpenForm, setShowOpenForm] = React.useState(false);

  const filtered = activeDomain === 'all' ? CALIBRATION_RECENT : CALIBRATION_RECENT.filter(r => r.domain === activeDomain);

  const total = CALIBRATION_STATS.reduce((a, s) => a + s.total, 0);
  const totalRight = CALIBRATION_STATS.reduce((a, s) => a + s.right, 0);
  const totalPartial = CALIBRATION_STATS.reduce((a, s) => a + s.partial, 0);
  const overall = Math.round((totalRight / total) * 100);

  // Animated arc value
  const [arcAnim, setArcAnim] = React.useState(0);
  React.useEffect(() => {
    let raf, start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / 1400);
      const eased = 1 - Math.pow(1 - p, 3);
      setArcAnim(eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Build calibration arc
  const C_R = 96;
  const C_C = 110;
  const C_CIRC = 2 * Math.PI * C_R;
  const arcLen = (overall / 100) * C_CIRC * arcAnim;

  return (
    <ScreenWrap>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 24 }}>
        <div>
          <Eyebrow>{total} predictions tracked · 9 weeks</Eyebrow>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 16px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            How well you <span style={{ fontStyle: 'italic', color: '#947DED' }}>see ahead.</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0, maxWidth: 640, lineHeight: 1.5 }}>
            Reality keeps the score, not me. Every claim you make about the future gets logged and resolved.
            Patterns surface — where you're sharp, where your optimism costs you.
          </p>
        </div>
        <button onClick={() => setShowOpenForm(true)} className="btn btn-primary" style={{ flexShrink: 0, marginTop: 12, padding: '14px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: -2 }}>+</span>
          Log a prediction
        </button>
      </div>

      {/* Hero — score + summary */}
      <div style={{
        marginTop: 32,
        padding: '36px 40px',
        background: 'linear-gradient(135deg, rgba(192, 172, 255, 0.14) 0%, rgba(148, 125, 237, 0.04) 100%)',
        border: '1px solid rgba(178, 157, 217, 0.3)',
        borderRadius: 24,
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 48,
        alignItems: 'center',
      }}>
        {/* Animated calibration ring */}
        <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto' }}>
          <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={C_C} cy={C_C} r={C_R} fill="none" stroke="rgba(148, 125, 237, 0.16)" strokeWidth="14" />
            <circle
              cx={C_C} cy={C_C} r={C_R}
              fill="none"
              stroke="url(#calGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${arcLen} ${C_CIRC}`}
              style={{ filter: 'drop-shadow(0 0 8px rgba(148, 125, 237, 0.4))' }}
            />
            <defs>
              <linearGradient id="calGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C0ACFF" />
                <stop offset="100%" stopColor="#6B5BC8" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <div className="serif" style={{ fontSize: 64, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {Math.round(overall * arcAnim)}<span style={{ fontSize: 28, color: '#947DED' }}>%</span>
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: 6 }}>
              calibrated
            </div>
          </div>
        </div>

        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 12 }}>
            Tammy's read
          </div>
          <p className="serif" style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.45, margin: '0 0 20px', letterSpacing: '-0.005em', fontStyle: 'italic' }}>
            "You're sharpest about product, blindest about timelines. The 2× optimism on dates has shown up
            in every project — it's not a bug, it's a base rate. Adjust accordingly."
          </p>
          <div style={{ display: 'flex', gap: 32 }}>
            <ScoreLine label="Right" value={totalRight} total={total} color={VERDICT_COLOR.right} />
            <ScoreLine label="Partial" value={totalPartial} total={total} color={VERDICT_COLOR.partial} />
            <ScoreLine label="Wrong" value={total - totalRight - totalPartial} total={total} color={VERDICT_COLOR.wrong} />
          </div>
        </div>
      </div>

      {/* Domain cards — clickable filter */}
      <div style={{ marginTop: 56, marginBottom: 24 }}>
        <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          By domain.
        </h2>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>
          click any domain to filter calls below
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        <DomainCard
          domain="all"
          label="All domains"
          stat={`${overall}%`}
          subtotal={`${totalRight}/${total}`}
          trend={[overall, overall, overall, overall, overall, overall, overall]}
          note="The whole picture."
          active={activeDomain === 'all'}
          onClick={() => setActiveDomain('all')}
        />
        {CALIBRATION_STATS.map((s, i) => {
          const pct = Math.round((s.right / s.total) * 100);
          return (
            <DomainCard
              key={i}
              domain={s.domain}
              label={s.domain}
              stat={`${pct}%`}
              subtotal={`${s.right}/${s.total}`}
              trend={s.trend}
              note={s.note}
              active={activeDomain === s.domain}
              onClick={() => setActiveDomain(s.domain)}
            />
          );
        })}
      </div>

      {/* Recent calls */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          {activeDomain === 'all' ? 'Recent calls.' : `Recent calls · ${activeDomain}.`}
        </h2>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 20 }}>
          {filtered.length} predictions
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((r, i) => <PredictionCard key={i} r={r} />)}
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', fontSize: 14, color: 'var(--ink-3)', fontStyle: 'italic' }}>
            No predictions in this domain yet.
          </div>
        )}
      </div>

      {/* Open form modal */}
      {showOpenForm && <NewPredictionForm onClose={() => setShowOpenForm(false)} />}
    </ScreenWrap>
  );
};

const ScoreLine = ({ label, value, total, color }) => {
  const pct = Math.round((value / total) * 100);
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span className="serif" style={{ fontSize: 22, color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>· {pct}%</span>
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ height: 3, background: 'rgba(148, 125, 237, 0.15)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
};

const DomainCard = ({ label, stat, subtotal, trend, note, active, onClick }) => {
  const W = 200, H = 36;
  const max = Math.max(...trend);
  const min = Math.min(...trend);
  const norm = (v) => H - ((v - min) / (max - min || 1)) * H;
  const path = trend.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (trend.length - 1)) * W} ${norm(v)}`).join(' ');
  const pctNum = parseInt(stat);

  return (
    <button onClick={onClick} style={{
      padding: '20px 22px',
      background: active ? 'var(--ink)' : 'var(--surface)',
      border: active ? '1px solid var(--ink)' : '1px solid rgba(178, 157, 217, 0.3)',
      borderRadius: 18,
      textAlign: 'left',
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 200ms ease',
      boxShadow: active ? '0 12px 32px rgba(31, 28, 48, 0.18)' : '0 1px 2px rgba(31, 28, 48, 0.03)',
      transform: active ? 'translateY(-2px)' : 'none',
    }}>
      <div className="mono" style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.6)' : 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <span className="serif" style={{ fontSize: 36, color: active ? '#FFFFFF' : 'var(--ink)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1 }}>
          {stat}
        </span>
        <span className="mono" style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.6)' : 'var(--ink-3)' }}>
          · {subtotal}
        </span>
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', marginBottom: 10 }}>
        <path d={path} fill="none" stroke={active ? '#C0ACFF' : '#947DED'} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.65)' : 'var(--ink-3)', lineHeight: 1.4, fontStyle: 'italic' }}>
        {note}
      </div>
    </button>
  );
};

const PredictionCard = ({ r }) => {
  const [open, setOpen] = React.useState(false);
  const c = VERDICT_COLOR[r.verdict];
  return (
    <button onClick={() => setOpen(o => !o)} style={{
      padding: '20px 24px',
      background: 'var(--surface)',
      border: `1px solid rgba(178, 157, 217, 0.3)`,
      borderLeft: `3px solid ${c}`,
      borderRadius: 14,
      textAlign: 'left',
      cursor: 'pointer',
      fontFamily: 'inherit',
      width: '100%',
      transition: 'all 160ms ease',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 80px 110px', gap: 20, alignItems: 'center' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.date}</div>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>{r.domain}</div>
          <div className="serif" style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.35, letterSpacing: '-0.005em' }}>{r.text}</div>
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center' }}>
          conf {r.confidence}%
        </div>
        <div>
          <span className="mono" style={{
            fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
            padding: '5px 12px', borderRadius: 999,
            background: `${c}1f`, color: c,
            border: `1px solid ${c}40`, fontWeight: 600,
          }}>
            {r.verdict}
          </span>
        </div>
      </div>
      {open && (
        <div style={{
          marginTop: 16, paddingTop: 16,
          borderTop: '1px dashed rgba(178, 157, 217, 0.35)',
          display: 'grid', gridTemplateColumns: '90px 1fr', gap: 20,
        }}>
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

const NewPredictionForm = ({ onClose }) => {
  const [text, setText] = React.useState('');
  const [confidence, setConfidence] = React.useState(70);
  const [domain, setDomain] = React.useState('Product');
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(31, 28, 48, 0.5)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 560,
        padding: 32,
        background: 'var(--surface)',
        borderRadius: 22,
        boxShadow: '0 32px 80px rgba(31, 28, 48, 0.35)',
      }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 8 }}>
          Log a prediction
        </div>
        <h3 className="serif" style={{ fontSize: 28, fontWeight: 400, margin: '0 0 18px', letterSpacing: '-0.015em' }}>
          What do you believe will happen?
        </h3>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g. The hire decision will land by Friday."
          style={{
            width: '100%', minHeight: 80,
            padding: '12px 14px',
            fontSize: 15, fontFamily: 'inherit', color: 'var(--ink)',
            background: 'rgba(192, 172, 255, 0.06)',
            border: '1px solid rgba(178, 157, 217, 0.3)',
            borderRadius: 12,
            resize: 'vertical', outline: 'none',
            marginBottom: 18,
            boxSizing: 'border-box',
          }}
        />
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
              <button key={d} onClick={() => setDomain(d)} style={{
                padding: '6px 12px', fontSize: 12, fontFamily: 'inherit',
                border: `1px solid ${domain === d ? '#947DED' : 'rgba(178, 157, 217, 0.4)'}`,
                background: domain === d ? '#947DED' : 'transparent',
                color: domain === d ? '#FFF' : 'var(--ink-2)',
                borderRadius: 999, cursor: 'pointer',
              }}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={onClose} className="btn btn-primary">Log it</button>
        </div>
      </div>
    </div>
  );
};

const Legend = ({ swatch, label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <span style={{ width: 10, height: 10, borderRadius: 2, background: swatch }} /> {label}
  </span>
);

// ============================================================== Mirror Moment

const MirrorScreen = () => {
  const [playing, setPlaying] = React.useState(false);
  const [pos, setPos] = React.useState(0);
  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setPos(p => p >= 100 ? (clearInterval(t), 100) : p + 0.4), 80);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <ScreenWrap>
      <Eyebrow>Audio reflection · Nova voice</Eyebrow>
      <H1>Mirror moment</H1>
      <Sub>
        A 4-minute spoken read of where you are right now. Harsh, fair, private.
        Generated weekly. Listen on a walk, not at your desk.
      </Sub>

      {/* Player */}
      <div style={{
        padding: 40,
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
        border: '1px solid var(--mauve-soft)',
        borderRadius: 24,
        marginBottom: 40,
      }}>
        <WaveBars active={playing} />

        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => setPlaying(p => !p)} style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--amber)',
            border: 'none', cursor: 'pointer',
            color: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 32px var(--amber-glow)',
            flexShrink: 0,
          }}>
            {playing
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 19 12 7 20" /></svg>}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ height: 4, background: 'var(--mauve-soft)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${pos}%`, height: '100%', background: 'var(--ink)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{Math.floor(pos * 2.4 / 60).toString().padStart(2, '0')}:{Math.floor((pos * 2.4) % 60).toString().padStart(2, '0')}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>04:00</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 18 }}>
            Excerpt
          </div>
          <p className="serif" style={{ fontSize: 26, color: 'var(--ink)', lineHeight: 1.45, margin: '0 0 24px', letterSpacing: '-0.01em' }}>
            "Tamer. You've been busy this week. You shipped the V2 cut, you handled the investor follow-up,
            you were sharp in the Tuesday standup. Good."
          </p>
          <p className="serif" style={{ fontSize: 26, color: 'var(--ink)', lineHeight: 1.45, margin: '0 0 24px', letterSpacing: '-0.01em' }}>
            "And — you still haven't called Rama. You moved her to text again on Thursday.
            That's the fourth time this month. The reason you keep moving her to text is because
            you don't know what title to give her, and you'd rather avoid the choice than make it."
          </p>
          <p className="serif" style={{ fontSize: 26, color: 'var(--ink-2)', lineHeight: 1.45, margin: 0, letterSpacing: '-0.01em' }}>
            "Pick the title. Or pick the conversation about why you can't. But stop hiding inside busy."
          </p>
        </div>

        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 18 }}>
            Generated from
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SourceRow label="Sessions this week" value="11" />
            <SourceRow label="Decisions touched" value="6" />
            <SourceRow label="Avoidance signals" value="4" />
            <SourceRow label="Mood baseline" value="−0.2 → +0.3" />
            <SourceRow label="Voice : text ratio" value="38% : 62%" />
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 24, width: '100%' }}>Download · MP3</button>
        </div>
      </div>
    </ScreenWrap>
  );
};

const WaveBars = ({ active }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 100, justifyContent: 'center' }}>
    {[...Array(60)].map((_, i) => {
      const h = 16 + Math.sin(i * 0.4) * 30 + Math.cos(i * 0.7) * 18;
      return (
        <div key={i} style={{
          width: 3,
          height: Math.abs(h) + 8,
          background: i < 24 ? 'var(--ink)' : 'var(--mauve)',
          borderRadius: 999,
          animation: active ? `pulse 1.${i % 9}s ease-in-out infinite` : 'none',
        }} />
      );
    })}
  </div>
);

const SourceRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--mauve-soft)' }}>
    <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{label}</div>
    <div className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>{value}</div>
  </div>
);

// ============================================================== Decisions

const DecisionsScreen = () => {
  const D = window.TammyData;
  const decisions = D.decisions || [];
  const [filter, setFilter] = React.useState('pending');
  const pending = decisions.filter(d => d.status === 'pending').sort((a, b) => (a.follow_up_in_days || 99) - (b.follow_up_in_days || 99));
  const made = decisions.filter(d => d.status === 'made').sort((a, b) => a.age_days - b.age_days);
  const overdue = pending.filter(d => d.follow_up_in_days <= 0);
  const spotlight = overdue[0] || pending[0];
  const others = pending.filter(d => d !== spotlight);

  // Avg days-to-decide for made (using age_days as proxy)
  const avgDays = made.length ? Math.round(made.reduce((a, d) => a + d.age_days, 0) / made.length) : 0;
  const oldest = pending.reduce((a, d) => Math.max(a, d.age_days), 0);

  const showPending = filter === 'pending' || filter === 'all';
  const showMade = filter === 'made' || filter === 'all';

  return (
    <ScreenWrap>
      <Eyebrow>Decision journal</Eyebrow>
      <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
        What you're<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>still weighing.</em>
      </h1>
      <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: '0 0 32px', maxWidth: 640, lineHeight: 1.5 }}>
        Every open call lives here until it closes. Some need a conversation. Some need a coin flip.
        Some you've been carrying so long they've started carrying you.
      </p>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {[
          { k: 'pending', l: 'Pending', c: pending.length },
          { k: 'made', l: 'Made', c: made.length },
          { k: 'all', l: 'All', c: decisions.length },
        ].map(p => (
          <button key={p.k} onClick={() => setFilter(p.k)} style={{
            padding: '9px 18px',
            borderRadius: 999,
            border: filter === p.k ? '1px solid var(--amber)' : '1px solid var(--mauve-soft)',
            background: filter === p.k ? 'var(--amber)' : 'transparent',
            color: filter === p.k ? '#FFFFFF' : 'var(--ink-2)',
            fontSize: 13, fontWeight: 500, fontFamily: 'var(--f-sans)',
            cursor: 'pointer', transition: 'all 160ms ease',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            {p.l}
            <span style={{ fontSize: 10, opacity: filter === p.k ? 0.85 : 0.55, fontFamily: 'var(--f-mono)' }}>{p.c}</span>
          </button>
        ))}
      </div>

      {/* Stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        borderTop: '1px solid var(--mauve-soft)',
        borderBottom: '1px solid var(--mauve-soft)',
        marginBottom: 40,
      }}>
        <Stat n={pending.length} label="open" />
        <Stat n={overdue.length} label="overdue" amber={overdue.length > 0} />
        <Stat n={oldest} label="oldest open · days" />
        <Stat n={`${avgDays}d`} label="avg time-to-decide" right />
      </div>

      {/* Spotlight — most urgent (only when pending filter) */}
      {showPending && spotlight && (
        <div style={{
          padding: '44px 48px',
          background: 'var(--surface)',
          border: '1px solid var(--amber)',
          boxShadow: '0 0 0 6px var(--amber-soft), 0 30px 80px rgba(43, 20, 86, 0.10)',
          borderRadius: 24,
          marginBottom: 56,
          position: 'relative',
        }}>
          <div className="mono" style={{
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--amber)', marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 12px var(--amber)' }} />
            most urgent · {spotlight.age_days} days circling {spotlight.follow_up_in_days <= 0 ? `· ${Math.abs(spotlight.follow_up_in_days)}d past your own follow-up` : ''}
          </div>

          <h2 className="serif" style={{ fontSize: 40, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em', margin: '0 0 24px', lineHeight: 1.15 }}>
            {spotlight.text}
          </h2>

          <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 32px', maxWidth: 720 }}>
            {spotlight.context}
          </p>

          <div style={{
            padding: '20px 24px',
            background: 'var(--amber-soft)',
            borderRadius: 14,
            marginBottom: 28,
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--amber)', whiteSpace: 'nowrap', paddingTop: 4 }}>
              what's blocking
            </div>
            <p className="serif" style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1.45, margin: 0, fontStyle: 'italic' }}>
              You said it isn't readiness. It's the conversation itself. The retraction, not the decision.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary">Talk it through with Tammy</button>
            <button className="btn btn-ghost">Mark as made</button>
            <button className="btn btn-ghost">Snooze 7 days</button>
          </div>
        </div>
      )}

      {/* Timeline — last 90 days */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>Last 90 days</h3>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', gap: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ink)' }} /> made
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} /> still open
            </span>
          </div>
        </div>
        <DecisionTimeline decisions={decisions} />
      </div>

      {/* Other open */}
      {showPending && others.length > 0 && (
        <div style={{ marginBottom: 56 }}>
          <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Also open</h3>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>
            {others.length} more {others.length === 1 ? 'decision' : 'decisions'} on the table
          </div>
          <div>
            {others.map((d, i) => (
              <DecisionRow key={d.id} d={d} last={i === others.length - 1} />
            ))}
          </div>
        </div>
      )}

      {/* Recently made */}
      {showMade && made.length > 0 && (
        <div>
          <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Recently made</h3>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>
            the calls you've already closed
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {made.map((d, i) => (
              <MadeRow key={d.id} d={d} last={i === made.length - 1} />
            ))}
          </div>
        </div>
      )}
    </ScreenWrap>
  );
};

const Stat = ({ n, label, amber, right }) => (
  <div style={{
    padding: '28px 0',
    borderRight: right ? 'none' : '1px solid var(--mauve-soft)',
    paddingLeft: 28,
  }}>
    <div className="serif" style={{
      fontSize: 56, fontWeight: 400,
      color: amber ? 'var(--amber)' : 'var(--ink)',
      letterSpacing: '-0.03em', lineHeight: 1,
    }}>
      {n}
    </div>
    <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 12 }}>
      {label}
    </div>
  </div>
);

const DecisionTimeline = ({ decisions }) => {
  const W = 1080, H = 80, pad = 10;
  const today = 0;
  const earliest = -90;
  const x = d => pad + ((d - earliest) / (today - earliest)) * (W - pad * 2);

  return (
    <div style={{
      padding: '24px 12px',
      background: 'var(--surface)',
      border: '1px solid var(--mauve-soft)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* baseline */}
        <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="var(--mauve-soft)" strokeWidth="1" />
        {/* week ticks */}
        {[-90, -60, -30, 0].map((d, i) => (
          <g key={i}>
            <line x1={x(d)} y1={H / 2 - 6} x2={x(d)} y2={H / 2 + 6} stroke="var(--mauve)" strokeWidth="1" />
            <text x={x(d)} y={H - 4} fontSize="10" fill="var(--ink-3)" textAnchor="middle" fontFamily="ui-monospace, monospace" letterSpacing="0.1em">
              {d === 0 ? 'TODAY' : `${d}d`}
            </text>
          </g>
        ))}
        {/* dots */}
        {decisions.map((d, i) => {
          const pos = -d.age_days;
          if (pos < earliest) return null;
          const open = d.status === 'pending';
          const overdue = open && d.follow_up_in_days <= 0;
          const r = overdue ? 9 : open ? 7 : 5;
          return (
            <g key={d.id}>
              {overdue && <circle cx={x(pos)} cy={H / 2} r={r + 6} fill="var(--amber-soft)" />}
              <circle cx={x(pos)} cy={H / 2} r={r}
                fill={open ? 'var(--amber)' : 'var(--ink)'}
                stroke="var(--surface)" strokeWidth="2"
              />
              {open && <line x1={x(pos)} y1={H / 2 - r - 2} x2={x(pos)} y2={H / 2 - 22} stroke={overdue ? 'var(--amber)' : 'var(--mauve)'} strokeWidth="1" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const DecisionRow = ({ d, last }) => {
  const [expanded, setExpanded] = React.useState(false);
  const overdue = d.follow_up_in_days <= 0;

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        padding: '22px 4px',
        borderBottom: last ? 'none' : '1px solid var(--mauve-soft)',
        cursor: 'pointer',
        transition: 'all 200ms ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 140px', gap: 20, alignItems: 'baseline' }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: overdue ? 'var(--amber)' : 'var(--mauve)',
          boxShadow: overdue ? '0 0 12px var(--amber-glow)' : 'none',
          marginTop: 10,
        }} />
        <div>
          <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
            {d.text}
          </div>
          <div style={{
            maxHeight: expanded ? 200 : 0,
            opacity: expanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 300ms cubic-bezier(0.32, 0.72, 0.24, 1)',
          }}>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: '12px 0 16px' }}>{d.context}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Open in chat</button>
              <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Mark as made</button>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 12, color: overdue ? 'var(--amber)' : 'var(--ink-2)' }}>
            {d.age_days}d circling
          </div>
          {d.last_circled && (
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.06em', marginTop: 4 }}>
              touched {d.last_circled}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MadeRow = ({ d, last }) => (
  <div style={{
    padding: '20px 4px',
    borderBottom: last ? 'none' : '1px solid var(--mauve-soft)',
    display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 24, alignItems: 'baseline',
  }}>
    <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
      {d.age_days}d ago
    </div>
    <div className="serif" style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1.4 }}>
      {d.text}
    </div>
    <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic', lineHeight: 1.55 }}>
      {d.outcome || '—'}
    </div>
  </div>
);

// ============================================================== Projects

const ProjectsScreen = () => {
  const projects = [
    {
      id: 'tammy', bucket: 'Tammy', kind: 'Product · pre-launch',
      status: 'Live', glyph: 'ring',
      summary: 'The product itself. Highest cognitive load.',
      open: 4, threads: ['CTO hire', 'Pricing model', 'Day-100 plan', 'V11 prompt'],
      last_said: 'I keep opening the doc for Rama and closing it.',
      energy: [3, 4, 5, 4, 6, 7, 6, 8, 9, 7, 8, 9, 8, 9],
      momentum: 'rising', last_touch: '2h',
    },
    {
      id: 'studio', bucket: 'Studio Masri', kind: 'Consulting · paying',
      status: 'Live', glyph: 'square',
      summary: 'Three retainers, two new pitches. Steady.',
      open: 2, threads: ['Rebrand pitch', 'Q2 retainer review'],
      last_said: 'The rebrand timeline is tight but the team is up for it.',
      energy: [5, 5, 6, 5, 6, 6, 5, 6, 6, 5, 6, 5, 6, 6],
      momentum: 'steady', last_touch: '3d',
    },
    {
      id: 'health', bucket: 'Personal · Health', kind: 'Sleep · movement',
      status: 'Stalled', glyph: 'triangle',
      summary: 'Sleep window slipped 3 weeks running. Workouts dropped to 1×/wk.',
      open: 1, threads: ['Sleep audit'],
      last_said: 'I told myself I\'d run Saturday. I didn\'t.',
      energy: [7, 6, 7, 5, 5, 4, 4, 3, 3, 2, 3, 2, 2, 2],
      momentum: 'falling', last_touch: '6d',
    },
    {
      id: 'family', bucket: 'Personal · Family', kind: 'Mom · sister · dad',
      status: 'Review', glyph: 'dots',
      summary: 'Mom\'s checkup follow-up. Sister moving in May.',
      open: 2, threads: ['Mom hospital', 'Sister move'],
      last_said: 'Dad called twice this week. I haven\'t called back.',
      energy: [4, 4, 3, 4, 5, 4, 5, 4, 3, 4, 3, 4, 4, 4],
      momentum: 'steady', last_touch: '2w',
    },
    {
      id: 'craft', bucket: 'The Quiet Book', kind: 'Writing · idea',
      status: 'Stalled', glyph: 'line',
      summary: 'Two essays half-drafted. Hasn\'t opened the doc in 11 days.',
      open: 0, threads: ['Essay drafts'],
      last_said: 'Maybe the book is just an excuse not to ship.',
      energy: [6, 5, 4, 4, 3, 3, 2, 2, 1, 1, 1, 0, 0, 0],
      momentum: 'falling', last_touch: '11d',
    },
    {
      id: 'social', bucket: 'Personal · Social', kind: 'Friends · community',
      status: 'Live', glyph: 'star',
      summary: 'Three close friends seen this month. Healthy.',
      open: 0, threads: [],
      last_said: 'Lunch with Karim was the lightest I\'ve felt in a week.',
      energy: [4, 5, 4, 5, 6, 5, 6, 6, 5, 6, 7, 6, 7, 6],
      momentum: 'steady', last_touch: '4d',
    },
  ];

  const totalOpen = projects.reduce((a, p) => a + p.open, 0);
  const stalled = projects.filter(p => p.status === 'Stalled').length;
  const live = projects.filter(p => p.status === 'Live').length;
  const totalEnergy = projects.reduce((a, p) => a + p.energy.reduce((x, y) => x + y, 0), 0);
  const heaviest = [...projects].sort((a, b) => b.energy.reduce((x, y) => x + y, 0) - a.energy.reduce((x, y) => x + y, 0))[0];

  // Sort: Live first, then Review, then Stalled. Within group, by total energy desc.
  const sorted = [...projects].sort((a, b) => {
    const order = { Live: 0, Review: 1, Stalled: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return b.energy.reduce((x, y) => x + y, 0) - a.energy.reduce((x, y) => x + y, 0);
  });

  const [view, setView] = React.useState('cards'); // 'cards' | 'list'

  return (
    <ScreenWrap>
      {/* Header row with action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 18 }}>
        <div>
          <Eyebrow>{projects.length} buckets · {totalOpen} open threads · {stalled} stalled</Eyebrow>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            The shape of<br /><em style={{ fontStyle: 'italic', color: '#947DED' }}>everything you carry.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: '0 0 0', maxWidth: 560, lineHeight: 1.5 }}>
            Each bucket has its own gravity. The big ones pull more. The stalled ones still cost you,
            quietly, even when you're not looking.
          </p>
        </div>
        <button className="btn btn-primary" style={{ flexShrink: 0, marginTop: 12, padding: '14px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: -2 }}>+</span>
          New project
        </button>
      </div>

      {/* Premium stat strip */}
      <div style={{
        marginTop: 36,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        background: 'rgba(178, 157, 217, 0.25)',
        border: '1px solid rgba(178, 157, 217, 0.3)',
        borderRadius: 18,
        overflow: 'hidden',
      }}>
        <ProjStat label="Active buckets" value={live} sub={`of ${projects.length} total`} accent="#947DED" />
        <ProjStat label="Open threads" value={totalOpen} sub="across all buckets" accent="#6B5BC8" />
        <ProjStat label="Stalled" value={stalled} sub={stalled === 0 ? 'all moving' : 'quietly costing you'} accent={stalled > 0 ? '#7B6BA8' : '#A89BB3'} />
        <ProjStat label="Heaviest" value={heaviest.bucket} sub={`${heaviest.energy.reduce((x, y) => x + y, 0)} energy units`} accent="#C0ACFF" small />
      </div>

      {/* Constellation hero */}
      <div style={{ marginTop: 36, marginBottom: 56 }}>
        <Constellation projects={projects} />
      </div>

      {/* Project cards / list switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h2 className="serif" style={{ fontSize: 32, fontWeight: 400, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            All projects.
          </h2>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            sorted by status · then by gravity
          </div>
        </div>
        <div style={{
          display: 'inline-flex',
          padding: 3,
          background: 'rgba(178, 157, 217, 0.15)',
          borderRadius: 10,
        }}>
          <button onClick={() => setView('cards')} style={{
            padding: '7px 14px', fontSize: 12, fontFamily: 'inherit',
            background: view === 'cards' ? 'var(--surface)' : 'transparent',
            color: view === 'cards' ? 'var(--ink)' : 'var(--ink-3)',
            border: 'none', borderRadius: 7, cursor: 'pointer',
            fontWeight: 500, letterSpacing: '-0.005em',
            boxShadow: view === 'cards' ? '0 1px 3px rgba(31,28,48,0.08)' : 'none',
          }}>Cards</button>
          <button onClick={() => setView('list')} style={{
            padding: '7px 14px', fontSize: 12, fontFamily: 'inherit',
            background: view === 'list' ? 'var(--surface)' : 'transparent',
            color: view === 'list' ? 'var(--ink)' : 'var(--ink-3)',
            border: 'none', borderRadius: 7, cursor: 'pointer',
            fontWeight: 500, letterSpacing: '-0.005em',
            boxShadow: view === 'list' ? '0 1px 3px rgba(31,28,48,0.08)' : 'none',
          }}>List</button>
        </div>
      </div>

      {view === 'cards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
          {sorted.map(p => <ProjectCard key={p.id} p={p} />)}
          <NewProjectCard />
        </div>
      ) : (
        <ProjectList projects={sorted} />
      )}
    </ScreenWrap>
  );
};

const ProjStat = ({ label, value, sub, accent, small }) => (
  <div style={{ background: 'var(--surface)', padding: '20px 24px' }}>
    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
      {label}
    </div>
    <div className="serif" style={{
      fontSize: small ? 22 : 36, color: accent, fontWeight: 400,
      lineHeight: 1.05, letterSpacing: '-0.02em',
    }}>
      {value}
    </div>
    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
      {sub}
    </div>
  </div>
);

const ProjectList = ({ projects }) => (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid rgba(178, 157, 217, 0.3)',
    borderRadius: 18,
    overflow: 'hidden',
  }}>
    {projects.map((p, i) => {
      const color = STATUS_COLOR[p.status];
      const energySum = p.energy.reduce((a, b) => a + b, 0);
      return (
        <div key={p.id} style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 80px 90px 100px 60px',
          gap: 16, alignItems: 'center',
          padding: '16px 20px',
          borderBottom: i < projects.length - 1 ? '1px solid rgba(178, 157, 217, 0.2)' : 'none',
          cursor: 'pointer',
          transition: 'background 160ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(192, 172, 255, 0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}1a`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
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

// Glyph per project — visual identifier
const Glyph = ({ kind, color = 'currentColor', size = 28 }) => {
  const s = size;
  switch (kind) {
    case 'ring':
      return <svg width={s} height={s} viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" stroke={color} strokeWidth="2" /><circle cx="14" cy="14" r="3" fill={color} /></svg>;
    case 'square':
      return <svg width={s} height={s} viewBox="0 0 28 28" fill="none"><rect x="3" y="3" width="22" height="22" stroke={color} strokeWidth="2" /><rect x="10" y="10" width="8" height="8" fill={color} /></svg>;
    case 'triangle':
      return <svg width={s} height={s} viewBox="0 0 28 28" fill="none"><path d="M14 3 L25 24 L3 24 Z" stroke={color} strokeWidth="2" strokeLinejoin="round" /><circle cx="14" cy="18" r="2.5" fill={color} /></svg>;
    case 'dots':
      return <svg width={s} height={s} viewBox="0 0 28 28" fill={color}><circle cx="6" cy="14" r="3" /><circle cx="14" cy="14" r="3" /><circle cx="22" cy="14" r="3" /></svg>;
    case 'line':
      return <svg width={s} height={s} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M4 8 L24 8" /><path d="M4 14 L20 14" /><path d="M4 20 L16 20" /></svg>;
    case 'star':
      return <svg width={s} height={s} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"><path d="M14 3 L17 11 L25 11 L19 16 L21 24 L14 19 L7 24 L9 16 L3 11 L11 11 Z" /></svg>;
    default:
      return null;
  }
};

const STATUS_COLOR = {
  Live: '#947DED',
  Stalled: '#7B6BA8',
  Review: '#C0ACFF',
};

const Constellation = ({ projects }) => {
  // Position projects radially around center, weighted by activity
  const W = 1080, H = 320;
  const cx = W / 2, cy = H / 2;
  const sumE = projects.map(p => p.energy.reduce((a, b) => a + b, 0));
  const maxE = Math.max(...sumE);

  return (
    <div style={{
      position: 'relative',
      padding: '32px 24px',
      background: 'var(--surface)',
      border: '1px solid var(--mauve-soft)',
      borderRadius: 24,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 24, left: 28,
        fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
        color: 'var(--ink-3)', fontFamily: 'var(--font-mono, ui-monospace)',
      }}>
        Gravity map · this week
      </div>
      <div style={{
        position: 'absolute', top: 24, right: 28,
        fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono, ui-monospace)',
        display: 'flex', gap: 20,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR.Live }} /> Live
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR.Stalled }} /> Stalled
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR.Review }} /> Review
        </span>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Concentric guide rings */}
        {[80, 130, 180].map((r, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="var(--mauve-soft)" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
        ))}

        {/* Connection lines from center */}
        {projects.map((p, i) => {
          const angle = (i / projects.length) * Math.PI * 2 - Math.PI / 2;
          const e = p.energy.reduce((a, b) => a + b, 0);
          const dist = 90 + (1 - e / maxE) * 90;  // less active = further out
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          return (
            <line key={`l-${p.id}`} x1={cx} y1={cy} x2={px} y2={py}
              stroke={p.status === 'Stalled' ? 'var(--amber)' : 'var(--mauve)'}
              strokeWidth="1" strokeDasharray={p.status === 'Stalled' ? '3 4' : '0'} opacity="0.45" />
          );
        })}

        {/* Project nodes */}
        {projects.map((p, i) => {
          const angle = (i / projects.length) * Math.PI * 2 - Math.PI / 2;
          const e = p.energy.reduce((a, b) => a + b, 0);
          const dist = 90 + (1 - e / maxE) * 90;
          const r = 14 + (e / maxE) * 22;
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          const color = STATUS_COLOR[p.status];
          const labelOnRight = px >= cx;
          return (
            <g key={`n-${p.id}`}>
              {p.status === 'Live' && (
                <circle cx={px} cy={py} r={r + 8} fill={color} opacity="0.12" />
              )}
              <circle cx={px} cy={py} r={r} fill="var(--surface)" stroke={color} strokeWidth="2.5" />
              <circle cx={px} cy={py} r={r * 0.45} fill={color} opacity={p.status === 'Stalled' ? 0.4 : 0.85} />
              <text
                x={labelOnRight ? px + r + 12 : px - r - 12}
                y={py + 4}
                fontSize="13"
                fill="var(--ink)"
                textAnchor={labelOnRight ? 'start' : 'end'}
                fontFamily="var(--font-serif, Georgia)"
                letterSpacing="-0.01em"
              >
                {p.bucket}
              </text>
              <text
                x={labelOnRight ? px + r + 12 : px - r - 12}
                y={py + 20}
                fontSize="10"
                fill="var(--ink-3)"
                textAnchor={labelOnRight ? 'start' : 'end'}
                fontFamily="var(--font-mono, ui-monospace)"
                letterSpacing="0.1em"
              >
                {p.open} OPEN · {p.last_touch}
              </text>
            </g>
          );
        })}

        {/* Center — you */}
        <circle cx={cx} cy={cy} r="22" fill="var(--ink)" />
        <text x={cx} y={cy + 6} fontSize="18" fill="var(--surface)" textAnchor="middle" fontFamily="var(--font-serif, Georgia)" fontStyle="italic">
          T
        </text>
      </svg>
    </div>
  );
};

const ProjectCard = ({ p }) => {
  const [hover, setHover] = React.useState(false);
  const color = STATUS_COLOR[p.status];
  const max = Math.max(...p.energy);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        padding: '28px 28px 24px 36px',
        background: 'var(--surface)',
        border: '1px solid var(--mauve-soft)',
        borderRadius: 20,
        cursor: 'pointer',
        transition: 'all 240ms cubic-bezier(0.32, 0.72, 0.24, 1)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hover ? '0 24px 60px rgba(43, 20, 86, 0.10)' : '0 0 0 rgba(0,0,0,0)',
        overflow: 'hidden',
      }}
    >
      {/* Colored spine */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: 4,
        background: `linear-gradient(180deg, ${color} 0%, ${color}66 100%)`,
        opacity: p.status === 'Stalled' ? 1 : 0.85,
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${color}1a`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Glyph kind={p.glyph} color={color} size={24} />
          </div>
          <div>
            <div className="serif" style={{ fontSize: 24, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.1 }}>
              {p.bucket}
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
              {p.kind}
            </div>
          </div>
        </div>
        <StatusPill status={p.status} color={color} />
      </div>

      {/* Summary */}
      <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 16px' }}>
        {p.summary}
      </p>

      {/* Sparkline */}
      <div style={{ marginBottom: 16, height: 36, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
        {p.energy.map((v, i) => (
          <div key={i} style={{
            flex: 1,
            height: `${(v / Math.max(max, 1)) * 100}%`,
            minHeight: 2,
            background: i === p.energy.length - 1 ? color : `${color}66`,
            borderRadius: 1.5,
            opacity: 0.4 + (i / p.energy.length) * 0.6,
          }} />
        ))}
      </div>

      {/* Last said quote */}
      <div style={{
        padding: '14px 16px',
        background: 'var(--surface-2)',
        borderRadius: 10,
        borderLeft: `2px solid ${color}`,
        marginBottom: 16,
      }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>
          last said
        </div>
        <div className="serif" style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5, fontStyle: 'italic' }}>
          "{p.last_said}"
        </div>
      </div>

      {/* Threads + footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 14, borderTop: '1px solid var(--mauve-soft)' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {p.threads.length === 0 && (
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>
              no open threads
            </span>
          )}
          {p.threads.slice(0, 3).map((t, i) => (
            <span key={i} style={{
              fontSize: 11,
              padding: '4px 9px',
              background: 'var(--mauve-soft)',
              color: 'var(--ink-2)',
              borderRadius: 6,
              whiteSpace: 'nowrap',
            }}>{t}</span>
          ))}
          {p.threads.length > 3 && (
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', alignSelf: 'center', letterSpacing: '0.1em' }}>
              +{p.threads.length - 3}
            </span>
          )}
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
          {p.last_touch} ago
        </div>
      </div>
    </div>
  );
};

const StatusPill = ({ status, color }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 10px',
    background: `${color}1a`,
    color: color,
    borderRadius: 20,
    fontSize: 10,
    fontFamily: 'var(--font-mono, ui-monospace)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontWeight: 500,
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: '50%', background: color,
      boxShadow: status === 'Live' ? `0 0 8px ${color}` : 'none',
    }} />
    {status}
  </div>
);

const NewProjectCard = () => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        padding: 28,
        background: hover ? 'var(--surface)' : 'transparent',
        border: `1.5px dashed ${hover ? 'var(--ink-2)' : 'var(--mauve)'}`,
        borderRadius: 20,
        cursor: 'pointer',
        transition: 'all 240ms cubic-bezier(0.32, 0.72, 0.24, 1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        minHeight: 320,
      }}
    >
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: hover ? 'var(--ink)' : 'var(--mauve-soft)',
        color: hover ? 'var(--surface)' : 'var(--ink-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, fontWeight: 300, lineHeight: 1,
        marginBottom: 18,
        transition: 'all 240ms ease',
        transform: hover ? 'scale(1.06) rotate(90deg)' : 'scale(1) rotate(0deg)',
      }}>
        +
      </div>
      <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.015em', marginBottom: 8 }}>
        Start a new bucket
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55, margin: '0 0 16px', maxWidth: 240 }}>
        A relationship, a side project, a thing you're trying to figure out. Tammy will hold the context.
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Project', 'Person', 'Practice', 'Decision'].map(t => (
          <span key={t} className="mono" style={{
            fontSize: 10,
            padding: '4px 9px',
            background: 'var(--surface)',
            border: '1px solid var(--mauve-soft)',
            color: 'var(--ink-3)',
            borderRadius: 6,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
};

// ============================================================== Network

const NetworkScreen = () => {
  const intros = [
    { name: 'Yara A.', role: 'Product · Cairo', status: 'made', date: '6d ago', for: 'CTO conversation', warmth: 0.9 },
    { name: 'Hisham K.', role: 'Founder · Riyadh', status: 'pending', date: '11d ago', for: 'V2 review', warmth: 0.7 },
    { name: 'Lina O.', role: 'Designer · Beirut', status: 'made', date: '18d ago', for: 'Studio collab', warmth: 0.85 },
    { name: 'Karim S.', role: 'Investor · Dubai', status: 'pending', date: '21d ago', for: 'Series A intro', warmth: 0.6 },
  ];

  const skills = [
    { skill: 'Storytelling', endorsements: 7, peers: ['Lina O.', 'Yara A.', 'Hisham K.', '+4'] },
    { skill: 'Shipping under pressure', endorsements: 5, peers: ['Karim S.', 'Yara A.', '+3'] },
    { skill: 'Hard conversations', endorsements: 1, peers: ['Lina O.'], pending: true },
    { skill: 'Hiring', endorsements: 2, peers: ['Hisham K.', '+1'] },
  ];

  // Tammy Connect — incoming requests
  const incoming = [
    {
      id: 'r1', name: 'Reem Daher', role: 'Marketing strategist · Beirut',
      avatar_color: '#C0ACFF',
      reason: 'I help MENA pre-launch products find their first 1,000 users. Saw Tammy in a Riyadh thread — I think your launch story has more shape than you\'re giving it.',
      asking_for: ['Stage + venture summary', 'Open growth questions', 'Audience hypothesis'],
      mutuals: ['Lina O.', 'Yara A.'],
      verified: true,
      sent: '2h ago',
      tammy_take: 'She works with founders at your exact stage. The reason this lands now: you said last week you were avoiding the marketing question.',
    },
    {
      id: 'r2', name: 'Faris Al-Rashid', role: 'CTO candidate · ex-Careem',
      avatar_color: '#947DED',
      reason: 'Layla mentioned you\'re looking at CTOs. I left Careem 4 months ago, I want to build something that matters in MENA, not Silicon Valley.',
      asking_for: ['Hiring criteria', 'Tech stack + scale', 'Equity range'],
      mutuals: ['Layla M.', 'Hisham K.'],
      verified: true,
      sent: '6h ago',
      tammy_take: 'Real candidate. The mutuals are strong. Worth a 30-minute conversation before you keep circling on the role doc.',
    },
    {
      id: 'r3', name: 'Nadia Othman', role: 'Journalist · The National',
      avatar_color: '#947DED',
      reason: 'Writing a piece on emotionally intelligent AI in MENA. Would love to feature Tammy and your point of view on care vs. softness.',
      asking_for: ['Founder bio', 'Tammy positioning', '1-2 quotes'],
      mutuals: [],
      verified: false,
      sent: '1d ago',
      tammy_take: 'No mutuals. Press is flattering early but expensive in time. You said you\'d skip press until V2.',
    },
  ];

  return (
    <ScreenWrap>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 18 }}>
        <div>
          <Eyebrow>14 founders · {intros.filter(i => i.status === 'pending').length} pending intros · {incoming.length} new requests</Eyebrow>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            The people<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>around the work.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0, maxWidth: 560, lineHeight: 1.5 }}>
            Some you talked to last week. Some are knocking now. Tammy holds the context for both —
            so when you respond, you remember exactly who they are.
          </p>
        </div>
        <button className="btn btn-ghost" style={{ flexShrink: 0, marginTop: 12, padding: '14px 22px', fontSize: 14 }}>
          Invite someone
        </button>
      </div>

      {/* TAMMY CONNECT — Incoming requests */}
      <div style={{ marginTop: 56, marginBottom: 64 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <h2 className="serif" style={{ fontSize: 30, fontWeight: 400, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Tammy Connect
            </h2>
            <span style={{
              padding: '4px 10px',
              background: 'var(--ink)',
              color: 'var(--surface)',
              borderRadius: 20,
              fontSize: 10,
              fontFamily: 'var(--font-mono, ui-monospace)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}>
              {incoming.length} new
            </span>
          </div>
          <a href="#" className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>
            connect settings →
          </a>
        </div>
        <p className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 24px' }}>
          People who want to reach you · Tammy filters & summarizes
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {incoming.map(r => <IncomingCard key={r.id} r={r} />)}
        </div>
      </div>

      {/* Network orbit */}
      <NetworkOrbit intros={intros} />

      {/* Intros + endorsements row */}
      <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40 }}>
        <div>
          <h3 className="serif" style={{ fontSize: 24, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.015em' }}>Intros you've asked for</h3>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 20 }}>
            outgoing · sorted by recency
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 16 }}>
            {intros.map((p, i) => (
              <div key={i} style={{
                padding: '20px 22px',
                borderBottom: i < intros.length - 1 ? '1px solid var(--mauve-soft)' : 'none',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'var(--surface-2)', border: '1px solid var(--mauve-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: 'var(--ink-2)', fontFamily: 'var(--f-sans)',
                }}>{p.name.split(' ').map(s => s[0]).join('')}</div>
                <div style={{ flex: 1 }}>
                  <div className="serif" style={{ fontSize: 17, color: 'var(--ink)' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.role} · for {p.for}</div>
                </div>
                <div className="mono" style={{
                  fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: 999,
                  background: p.status === 'pending' ? 'var(--amber-soft)' : 'var(--surface-2)',
                  color: p.status === 'pending' ? 'var(--amber)' : 'var(--ink-2)',
                  border: p.status === 'pending' ? '1px solid var(--amber)' : '1px solid var(--mauve-soft)',
                }}>
                  {p.status}
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', minWidth: 50, textAlign: 'right' }}>{p.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="serif" style={{ fontSize: 24, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.015em' }}>What peers say you're good at</h3>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 20 }}>
            endorsements · last 90 days
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {skills.map((s, i) => (
              <div key={i} style={{
                padding: 18,
                background: 'var(--surface)',
                border: s.pending ? '1px solid var(--amber)' : '1px solid var(--mauve-soft)',
                boxShadow: s.pending ? '0 0 0 3px var(--amber-soft)' : 'none',
                borderRadius: 14,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <div className="serif" style={{ fontSize: 18, color: 'var(--ink)' }}>{s.skill}</div>
                  <div className="mono" style={{ fontSize: 10, color: s.pending ? 'var(--amber)' : 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {s.pending ? 'awaiting confirmation' : `${s.endorsements} endorsement${s.endorsements > 1 ? 's' : ''}`}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.peers.join(' · ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenWrap>
  );
};

// Tammy Connect incoming card
const IncomingCard = ({ r }) => {
  const [state, setState] = React.useState('pending'); // pending | shared | declined

  if (state === 'shared') {
    return (
      <div style={{
        padding: '24px 28px',
        background: 'var(--surface)',
        border: '1px solid var(--mauve-soft)',
        borderRadius: 18,
        display: 'flex', alignItems: 'center', gap: 16,
        opacity: 0.85,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', color: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✓</div>
        <div style={{ flex: 1 }}>
          <div className="serif" style={{ fontSize: 16, color: 'var(--ink)' }}>Info shared with {r.name}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
            They'll get a Tammy-curated brief · revoke any time
          </div>
        </div>
        <button onClick={() => setState('pending')} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Undo</button>
      </div>
    );
  }

  if (state === 'declined') {
    return (
      <div style={{
        padding: '20px 24px',
        background: 'transparent',
        border: '1px dashed var(--mauve)',
        borderRadius: 18,
        display: 'flex', alignItems: 'center', gap: 14,
        opacity: 0.6,
      }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Declined · {r.name}
        </div>
        <button onClick={() => setState('pending')} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 11, marginLeft: 'auto' }}>Reconsider</button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      padding: '28px 30px',
      background: 'var(--surface)',
      border: '1px solid var(--mauve-soft)',
      borderRadius: 20,
      overflow: 'hidden',
    }}>
      {/* Top: avatar + identity + sent time */}
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: `linear-gradient(135deg, ${r.avatar_color} 0%, ${r.avatar_color}66 100%)`,
          color: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontFamily: 'var(--font-serif, Georgia)',
          flexShrink: 0,
          boxShadow: `0 8px 20px ${r.avatar_color}40`,
        }}>
          {r.name.split(' ').map(s => s[0]).join('')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
              {r.name}
            </div>
            {r.verified && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px',
                background: 'var(--surface-2)',
                border: '1px solid var(--mauve-soft)',
                borderRadius: 12,
                fontSize: 10,
                fontFamily: 'var(--font-mono, ui-monospace)',
                color: 'var(--ink-2)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                <span style={{ color: '#C0ACFF' }}>✓</span> verified
              </span>
            )}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
            {r.role}
          </div>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {r.sent}
        </div>
      </div>

      {/* Why */}
      <div style={{ marginBottom: 16 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
          Why they're reaching out
        </div>
        <p className="serif" style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
          "{r.reason}"
        </p>
      </div>

      {/* Tammy's take */}
      <div style={{
        padding: '14px 18px',
        background: 'var(--surface-2)',
        borderRadius: 12,
        borderLeft: '2px solid var(--ink)',
        marginBottom: 18,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--ink)', color: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontFamily: 'var(--font-serif, Georgia)', fontStyle: 'italic',
          flexShrink: 0, marginTop: 2,
        }}>T</div>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
            tammy's take
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
            {r.tammy_take}
          </div>
        </div>
      </div>

      {/* Asking for + mutuals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 22, paddingBottom: 20, borderBottom: '1px solid var(--mauve-soft)' }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
            They're asking for
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {r.asking_for.map((a, i) => (
              <div key={i} style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ink-3)' }} />
                {a}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
            Mutuals
          </div>
          {r.mutuals.length === 0 ? (
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', fontStyle: 'italic' }}>
              none — cold reach
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: -4 }}>
              {r.mutuals.map((m, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--surface-2)', border: '2px solid var(--surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: 'var(--ink-2)',
                  marginLeft: i === 0 ? 0 : -8,
                  fontFamily: 'var(--f-sans)',
                }}>{m.split(' ').map(s => s[0]).join('')}</div>
              ))}
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', marginLeft: 10, letterSpacing: '0.05em' }}>
                {r.mutuals.join(' · ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={() => setState('shared')} className="btn btn-primary" style={{ padding: '12px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7 L6 11 L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Share my info
        </button>
        <button className="btn btn-ghost" style={{ padding: '12px 18px', fontSize: 13 }}>
          Reply via Tammy
        </button>
        <button onClick={() => setState('declined')} className="btn btn-ghost" style={{ padding: '12px 18px', fontSize: 13, marginLeft: 'auto', color: 'var(--ink-3)' }}>
          Decline
        </button>
      </div>
    </div>
  );
};

// Network orbit visual
const NetworkOrbit = ({ intros }) => {
  const W = 1080, H = 280;
  const cx = W / 2, cy = H / 2;
  return (
    <div style={{ marginBottom: 12 }}>
      <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
        Your circle
      </h2>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>
        {intros.length} active relationships · ring distance = warmth
      </div>
      <div style={{
        padding: '24px',
        background: 'var(--surface)',
        border: '1px solid var(--mauve-soft)',
        borderRadius: 24,
      }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
          {[60, 100, 140].map((r, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="var(--mauve-soft)" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
          ))}
          {intros.map((p, i) => {
            const angle = (i / intros.length) * Math.PI * 2 - Math.PI / 2;
            const dist = 50 + (1 - p.warmth) * 100;
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist;
            const right = px >= cx;
            const pending = p.status === 'pending';
            return (
              <g key={i}>
                <line x1={cx} y1={cy} x2={px} y2={py} stroke={pending ? 'var(--amber)' : 'var(--mauve)'} strokeDasharray={pending ? '3 4' : '0'} opacity="0.5" />
                <circle cx={px} cy={py} r="20" fill="var(--surface)" stroke={pending ? 'var(--amber)' : 'var(--ink)'} strokeWidth="2" />
                <text x={px} y={py + 4} fontSize="11" fill={pending ? 'var(--amber)' : 'var(--ink)'} textAnchor="middle" fontFamily="var(--f-sans)">
                  {p.name.split(' ').map(s => s[0]).join('')}
                </text>
                <text x={right ? px + 30 : px - 30} y={py - 2} fontSize="13" fill="var(--ink)" textAnchor={right ? 'start' : 'end'} fontFamily="var(--font-serif, Georgia)" letterSpacing="-0.01em">
                  {p.name}
                </text>
                <text x={right ? px + 30 : px - 30} y={py + 14} fontSize="10" fill="var(--ink-3)" textAnchor={right ? 'start' : 'end'} fontFamily="var(--font-mono, ui-monospace)" letterSpacing="0.1em">
                  {p.role.toUpperCase()}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r="22" fill="var(--ink)" />
          <text x={cx} y={cy + 6} fontSize="18" fill="var(--surface)" textAnchor="middle" fontFamily="var(--font-serif, Georgia)" fontStyle="italic">T</text>
        </svg>
      </div>
    </div>
  );
};

window.DNAScreen = DNAScreen;
window.BlindSpotsScreen = BlindSpotsScreen;
window.CalibrationScreen = CalibrationScreen;
window.MirrorScreen = MirrorScreen;
window.DecisionsScreen = DecisionsScreen;
window.ProjectsScreen = ProjectsScreen;
window.NetworkScreen = NetworkScreen;
