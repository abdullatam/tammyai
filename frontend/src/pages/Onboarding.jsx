// Onboarding screen.

const API_BASE = window.TAMMY_API || 'http://localhost:7861';

const OnboardingScreen = ({ onDone }) => {
  const steps = [
    { tammy: "hey. i'm tammy.", sub: "before we start — what do you want me to call you?", field: 'name', placeholder: 'your first name' },
    { tammy: "good to meet you.", sub: "what are you building right now?", field: 'venture', placeholder: 'a one-liner is enough' },
    { tammy: "and where's it stuck?", sub: "what's been sitting on your chest this week?", field: 'challenge', placeholder: 'the real thing, not the polished one' },
    { tammy: "one more. how direct do you want me?", sub: "i won't soften if you don't ask me to.", field: 'tone', options: ['very direct', 'direct', 'balanced', 'gentle'] },
  ];
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [val, setVal] = React.useState('');
  const s = steps[step];

  const submit = async (finalAnswers) => {
    try {
      await fetch(`${API_BASE}/onboarding/save`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalAnswers),
      });
      await window.TammyCheckAuth();
    } catch {}
    onDone();
  };

  const next = () => {
    if (!val && !s.options) return;
    const newAnswers = { ...answers, [s.field]: val };
    setAnswers(newAnswers);
    setVal('');
    if (step === steps.length - 1) submit(newAnswers);
    else setStep(step + 1);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: i === step ? 28 : 8, height: 6, borderRadius: 3, background: i <= step ? 'var(--amber)' : 'rgba(178,157,217,0.35)', transition: 'width 300ms' }} />
        ))}
      </div>
      <div style={{ maxWidth: 640, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Orb size={160} state={step === 0 ? 'listening' : step === steps.length - 1 ? 'milestone' : 'idle'} />
        <h1 className="serif" key={step} style={{ fontSize: 44, margin: '40px 0 8px', lineHeight: 1.1, fontWeight: 400, animation: 'fadeInUp 500ms ease' }}>{s.tammy}</h1>
        <p style={{ fontSize: 17, color: 'var(--ink-3)', margin: '0 0 36px' }}>{s.sub}</p>
        {s.options ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {s.options.map(o => (
              <button key={o} onClick={() => { const a = { ...answers, tone: o }; setAnswers(a); submit(a); }} className="btn btn-ghost" style={{ padding: '12px 22px', fontSize: 15 }}>{o}</button>
            ))}
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 480, display: 'flex', gap: 10 }}>
            <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && next()} placeholder={s.placeholder}
              style={{ flex: 1, padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(178,157,217,0.5)', background: 'var(--ivory)', color: 'var(--ink)', fontFamily: 'var(--f-sans)', fontSize: 16, outline: 'none' }} />
            <button onClick={next} className="btn btn-primary">next</button>
          </div>
        )}
        <button onClick={() => submit({ skip: true })} style={{ marginTop: 40, background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 12, cursor: 'pointer' }}>
          skip — i'll learn as we go
        </button>
      </div>
    </div>
  );
};

window.OnboardingScreen = OnboardingScreen;
