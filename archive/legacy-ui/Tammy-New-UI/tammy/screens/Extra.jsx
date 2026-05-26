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

const DNAScreen = () => (
  <ScreenWrap>
    <Eyebrow>Unlocked · day 64 of conversations</Eyebrow>
    <H1>Founder DNA</H1>
    <Sub>
      Synthesized from 218 sessions over 64 days. Not a personality test. A pattern reading
      of how you actually behave when nobody's watching.
    </Sub>

    {/* Helix / portrait card */}
    <div style={{
      padding: 36, marginBottom: 40,
      background: 'var(--surface)',
      border: '1px solid var(--mauve-soft)',
      borderRadius: 22,
      display: 'grid', gridTemplateColumns: '180px 1fr', gap: 36, alignItems: 'center',
    }}>
      <DNAHelix />
      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 10 }}>
          Operating archetype
        </div>
        <div className="serif" style={{ fontSize: 38, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 12 }}>
          The Builder Who Negotiates With Himself
        </div>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
          Decisive about product. Soft about people. You move fast on the things that don't scare you,
          and circle the things that do.
        </p>
      </div>
    </div>

    {/* Four DNA panels */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <DNAPanel
        title="Decision patterns"
        bullets={[
          'You converge fast when the answer is technical. You stall when it has a face.',
          'You mistake gathering more input for making progress on the call.',
          'You decide best after a walk, before bed, or in voice — never on Slack.',
        ]}
      />
      <DNAPanel
        title="Emotional triggers"
        bullets={[
          'Being doubted by someone you respect spikes you for ~36 hours.',
          'Quiet from a co-founder reads as withdrawal even when it isn\'t.',
          'Money talk shifts your tone before you notice it shifting.',
        ]}
      />
      <DNAPanel
        title="Performance conditions"
        bullets={[
          'You are sharpest 8–11am, alone, with one clear decision in front of you.',
          'You write your best tension when you\'re slightly underslept.',
          'Group rooms dilute you. One-on-ones concentrate you.',
        ]}
      />
      <DNAPanel
        title="Avoidance patterns"
        bullets={[
          'You re-open the same hire decision instead of making it.',
          'You move conversations with Rama from voice to text when they get hard.',
          'You name burnout as "tired" until day 11, then it\'s already a hole.',
        ]}
        accent
      />
    </div>

    <div style={{ marginTop: 40, padding: 24, borderTop: '1px solid var(--mauve-soft)', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div className="serif" style={{ fontSize: 18, color: 'var(--ink)' }}>Refreshes weekly</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>Last synthesis Sunday at 21:00 · next run in 4 days</div>
      </div>
      <button className="btn btn-ghost">Re-run now</button>
    </div>
  </ScreenWrap>
);

const DNAHelix = () => (
  <svg width="160" height="220" viewBox="0 0 160 220" style={{ display: 'block' }}>
    {[...Array(11)].map((_, i) => {
      const y = 10 + i * 20;
      const t = (i / 10) * Math.PI * 3;
      const x1 = 80 + Math.sin(t) * 50;
      const x2 = 80 - Math.sin(t) * 50;
      return (
        <g key={i}>
          <line x1={x1} y1={y} x2={x2} y2={y} stroke="var(--mauve)" strokeWidth="1" />
          <circle cx={x1} cy={y} r="4" fill="var(--ink)" />
          <circle cx={x2} cy={y} r="4" fill={i % 3 === 0 ? 'var(--amber)' : 'var(--ink)'} />
        </g>
      );
    })}
  </svg>
);

const DNAPanel = ({ title, bullets, accent }) => (
  <div style={{
    padding: 28,
    background: 'var(--surface)',
    border: accent ? '1px solid var(--amber)' : '1px solid var(--mauve-soft)',
    boxShadow: accent ? '0 0 0 4px var(--amber-soft)' : 'none',
    borderRadius: 18,
  }}>
    <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent ? 'var(--amber)' : 'var(--ink-3)', marginBottom: 14 }}>
      {title}
    </div>
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {bullets.map((b, i) => (
        <li key={i} className="serif" style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1.4, paddingLeft: 18, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0, top: 12, width: 6, height: 1, background: 'var(--ink-3)' }} />
          {b}
        </li>
      ))}
    </ul>
  </div>
);

// ============================================================== Blind Spots

const BlindSpotsScreen = () => {
  const spots = [
    {
      title: "You're avoiding Rama again",
      severity: 'high',
      pattern: '4th time in 3 weeks',
      evidence: [
        { date: 'Mon', quote: '"i\'ll call her tomorrow."' },
        { date: 'Wed', quote: '"i need to figure out the title thing first."' },
        { date: 'Fri', quote: '"too tired tonight, will do it monday."' },
        { date: 'Mon', quote: '"i\'m drafting what to say."' },
      ],
      reading: "It's not the call. It's that you don't know what title to give her, and you'd rather circle than choose.",
    },
    {
      title: "Burnout language is back",
      severity: 'medium',
      pattern: '9 days in a row',
      evidence: [
        { date: '9d ago', quote: '"just running on fumes."' },
        { date: '5d ago', quote: '"head\'s mush."' },
        { date: '2d ago', quote: '"i can\'t think straight."' },
        { date: 'today', quote: '"i need a break but can\'t take one."' },
      ],
      reading: 'Last cycle this language ran 14 days before you crashed. You\'re on day 9.',
    },
    {
      title: "You praise the team in public, doubt them in private",
      severity: 'low',
      pattern: '7 mentions, 3 weeks',
      evidence: [
        { date: '3w ago', quote: '"crew is unreal" (linkedin post)' },
        { date: '2w ago', quote: '"i\'m doing too much of the thinking myself" (here)' },
        { date: 'this week', quote: '"shipped strong" (slack)' },
        { date: 'yesterday', quote: '"nobody\'s asking the hard questions" (here)' },
      ],
      reading: "Two readings of the same team. One you say out loud, one you say to me. Worth naming which is real.",
    },
  ];

  return (
    <ScreenWrap>
      <Eyebrow>Weekly scan · generated Sunday 21:00</Eyebrow>
      <H1>What I keep seeing</H1>
      <Sub>
        Three patterns I noticed this week. With the actual quotes, so you can argue with me if I'm wrong.
      </Sub>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {spots.map((s, i) => (
          <div key={i} style={{
            padding: 32,
            background: 'var(--surface)',
            border: s.severity === 'high' ? '1px solid var(--amber)' : '1px solid var(--mauve-soft)',
            boxShadow: s.severity === 'high' ? '0 0 0 4px var(--amber-soft)' : 'none',
            borderRadius: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, gap: 16 }}>
              <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: 0, letterSpacing: '-0.015em' }}>
                {s.title}
              </h2>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: s.severity === 'high' ? 'var(--amber)' : 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                {s.pattern}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>
                  Evidence
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {s.evidence.map((e, j) => (
                    <div key={j} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 12, alignItems: 'baseline' }}>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{e.date}</div>
                      <div className="serif" style={{ fontSize: 15, color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.5 }}>{e.quote}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>
                  My reading
                </div>
                <p className="serif" style={{ fontSize: 19, color: 'var(--ink)', lineHeight: 1.45, margin: 0 }}>
                  {s.reading}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                  <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>You're right</button>
                  <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>You're wrong</button>
                  <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Talk about it</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScreenWrap>
  );
};

// ============================================================== Calibration

const CalibrationScreen = () => {
  const stats = [
    { domain: 'Product', total: 14, right: 9, wrong: 3, partial: 2 },
    { domain: 'People', total: 11, right: 4, wrong: 5, partial: 2 },
    { domain: 'Timelines', total: 9, right: 2, wrong: 6, partial: 1 },
    { domain: 'Market', total: 6, right: 4, wrong: 1, partial: 1 },
  ];
  const total = stats.reduce((a, s) => a + s.total, 0);
  const totalRight = stats.reduce((a, s) => a + s.right, 0);
  const overall = Math.round((totalRight / total) * 100);

  const recent = [
    { date: '9d ago', text: 'Hire decision will resolve by end of month.', verdict: 'wrong', note: 'Still pending.' },
    { date: '14d ago', text: 'V2 launch will land 60% of beta users.', verdict: 'right', note: 'Hit 64%.' },
    { date: '21d ago', text: 'Rama will leave if I don\'t name her co-founder.', verdict: 'partial', note: 'She stayed; tension up.' },
    { date: '28d ago', text: 'The studio rebrand will take 3 weeks.', verdict: 'wrong', note: 'Took 7.' },
    { date: '35d ago', text: 'Investor X will pass.', verdict: 'right', note: 'Passed in 6 days.' },
  ];

  return (
    <ScreenWrap>
      <Eyebrow>40 predictions tracked · 9 weeks</Eyebrow>
      <H1>Calibration</H1>
      <Sub>
        How accurate you are about the future, by domain. Reality keeps the score, not me.
      </Sub>

      {/* Big number */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 56, alignItems: 'center', marginBottom: 56 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>
            Overall accuracy
          </div>
          <div className="serif" style={{ fontSize: 96, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {overall}<span style={{ fontSize: 48, color: 'var(--ink-3)' }}>%</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 10 }}>
            {totalRight} right · {total - totalRight} wrong-or-partial · across {total} predictions
          </div>
        </div>
        <div>
          {stats.map((s, i) => {
            const pct = (s.right / s.total) * 100;
            return (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="serif" style={{ fontSize: 17, color: 'var(--ink)' }}>{s.domain}</div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    {Math.round(pct)}% · {s.right}/{s.total}
                  </div>
                </div>
                <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${(s.right / s.total) * 100}%`, background: 'var(--ink)' }} />
                  <div style={{ width: `${(s.partial / s.total) * 100}%`, background: 'var(--amber)' }} />
                  <div style={{ width: `${(s.wrong / s.total) * 100}%`, background: 'var(--mauve)' }} />
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 11, color: 'var(--ink-3)' }}>
            <Legend swatch="var(--ink)" label="right" />
            <Legend swatch="var(--amber)" label="partial" />
            <Legend swatch="var(--mauve)" label="wrong" />
          </div>
        </div>
      </div>

      <h3 className="serif" style={{ fontSize: 24, color: 'var(--ink)', fontWeight: 400, margin: '0 0 20px', letterSpacing: '-0.015em' }}>Recent calls</h3>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 18 }}>
        {recent.map((r, i) => (
          <div key={i} style={{
            padding: '20px 24px',
            borderBottom: i < recent.length - 1 ? '1px solid var(--mauve-soft)' : 'none',
            display: 'grid', gridTemplateColumns: '90px 1fr 110px 1fr', gap: 20, alignItems: 'center',
          }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.date}</div>
            <div className="serif" style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.35 }}>{r.text}</div>
            <div>
              <span className="mono" style={{
                fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                padding: '4px 10px', borderRadius: 999,
                background: r.verdict === 'right' ? 'var(--surface-2)' : r.verdict === 'wrong' ? 'var(--mauve-soft)' : 'var(--amber-soft)',
                color: r.verdict === 'partial' ? 'var(--amber)' : 'var(--ink-2)',
                border: r.verdict === 'partial' ? '1px solid var(--amber)' : '1px solid var(--mauve-soft)',
              }}>
                {r.verdict}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>{r.note}</div>
          </div>
        ))}
      </div>
    </ScreenWrap>
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
  const [data, setData] = React.useState(window.TammyData);
  const [filter, setFilter] = React.useState('all');
  React.useEffect(() => {
    const onReady = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', onReady);
    return () => window.removeEventListener('tammy:dataready', onReady);
  }, []);
  React.useEffect(() => {
    fetch(`http://localhost:7861/api/decisions?status=${filter}`, {credentials: 'include'})
      .then(r => r.json()).then(d => {
        window.TammyData.decisions = d;
        setData({ ...window.TammyData });
      }).catch(()=>{});
  }, [filter]);

  const D = data;
  const decisions = D.decisions || [];
  const pending = decisions.filter(d => d.status === 'pending').sort((a, b) => (a.follow_up_in_days || 99) - (b.follow_up_in_days || 99));
  const made = decisions.filter(d => d.status === 'made').sort((a, b) => a.age_days - b.age_days);
  const overdue = pending.filter(d => d.follow_up_in_days <= 0);
  const spotlight = overdue[0] || pending[0];
  const others = pending.filter(d => d !== spotlight);

  const markDone = async (id) => {
    try {
      await fetch(`http://localhost:7861/api/decisions/${id}`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'made' })
      });
      window.TammyBootstrap();
    } catch {}
  };

  // Avg days-to-decide for made (using age_days as proxy)
  const avgDays = made.length ? Math.round(made.reduce((a, d) => a + d.age_days, 0) / made.length) : 0;
  const oldest = pending.reduce((a, d) => Math.max(a, d.age_days), 0);

  return (
    <ScreenWrap>
      <Eyebrow>Decision journal</Eyebrow>
      <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
        What you're<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>still weighing.</em>
      </h1>
      <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: '0 0 20px', maxWidth: 640, lineHeight: 1.5 }}>
        Every open call lives here until it closes. Some need a conversation. Some need a coin flip.
        Some you've been carrying so long they've started carrying you.
      </p>
      <select value={filter} onChange={e=>setFilter(e.target.value)} style={{marginBottom:36, padding:'8px', borderRadius:'8px'}}>
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="made">Made</option>
      </select>

      {/* Stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        borderTop: '1px solid var(--mauve-soft)',
        borderBottom: '1px solid var(--mauve-soft)',
        marginBottom: 56,
      }}>
        <Stat n={pending.length} label="open" />
        <Stat n={overdue.length} label="overdue" amber={overdue.length > 0} />
        <Stat n={oldest} label="oldest open · days" />
        <Stat n={`${avgDays}d`} label="avg time-to-decide" right />
      </div>

      {/* Spotlight — most urgent */}
      {spotlight && (
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
            <button className="btn btn-ghost" onClick={() => markDone(spotlight.id)}>Mark as made</button>
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
      {others.length > 0 && (
        <div style={{ marginBottom: 56 }}>
          <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Also open</h3>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>
            {others.length} more {others.length === 1 ? 'decision' : 'decisions'} on the table
          </div>
          <div>
            {others.map((d, i) => (
              <DecisionRow key={d.id} d={d} last={i === others.length - 1} markDone={markDone} />
            ))}
          </div>
        </div>
      )}

      {/* Recently made */}
      {made.length > 0 && (
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

const DecisionRow = ({ d, last, markDone }) => {
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
              <button className="btn btn-ghost" onClick={() => markDone(d.id)} style={{ padding: '8px 14px', fontSize: 12 }}>Mark as made</button>
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
  const [data, setData] = React.useState(window.TammyData);
  React.useEffect(() => {
    const onReady = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', onReady);
    return () => window.removeEventListener('tammy:dataready', onReady);
  }, []);
  const projects = data.projects || [];

  const totalOpen = projects.reduce((a, p) => a + p.open, 0);
  const stalled = projects.filter(p => p.status === 'Stalled').length;

  return (
    <ScreenWrap>
      {/* Header row with action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 18 }}>
        <div>
          <Eyebrow>{projects.length} buckets · {totalOpen} open threads · {stalled} stalled</Eyebrow>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            The shape of<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>everything you carry.</em>
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

      {/* Constellation hero */}
      <div style={{ marginTop: 56, marginBottom: 64 }}>
        <Constellation projects={projects} />
      </div>

      {/* Project cards */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          All projects
        </h2>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 28 }}>
          sorted by gravity · momentum colored
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
        {projects.map(p => <ProjectCard key={p.id} p={p} />)}
        <NewProjectCard />
      </div>
    </ScreenWrap>
  );
};

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
  Live: 'var(--sage, #C0ACFF)',
  Stalled: 'var(--amber)',
  Review: 'var(--mauve-mid, #C0ACFF)',
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
