// Landing (auth) screen.

const API_BASE = window.TAMMY_API || 'http://localhost:7861';

const ThemeToggle = () => {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('tammy_palette') || 'purple');

  const handleToggle = () => {
    const next = theme === 'light' ? 'purple' : 'light';
    setTheme(next);
    localStorage.setItem('tammy_palette', next);
    window.location.reload(); // Simple reload to let App handle the CSS vars correctly
  };

  return (
    <button onClick={handleToggle} style={{
      position: 'fixed', top: 20, right: 24, zIndex: 200,
      background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 99,
      padding: '6px 12px', fontSize: 12, fontFamily: 'var(--f-sans)', color: 'var(--ink-2)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme === 'light' ? '#E2E8F0' : '#C0ACFF' }} />
      {theme === 'light' ? 'Light' : 'Purple'}
    </button>
  );
};

const Input = ({ label, type = 'text', placeholder, value, onChange }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{label}</span>
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(178,157,217,0.45)', background: 'var(--ivory)', color: 'var(--ink)', fontFamily: 'var(--f-sans)', fontSize: 14, outline: 'none' }} />
  </label>
);

const Landing = ({ onNavigate }) => {
  const [mode, setMode] = React.useState('login');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleAuth = async () => {
    if (loading) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const ep = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = { username: email, password };
      if (mode === 'register') body.name = name;
      const r = await fetch(`${API_BASE}${ep}`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (r.ok) {
        const d = await r.json();
        if (window.TammyReset) window.TammyReset();
        await window.TammyBootstrap();
        onNavigate(mode === 'login' || d.onboarding_complete ? 'today' : 'onboarding');
      } else {
        const errText = await r.json().catch(() => ({ detail: 'Authentication failed' }));
        setErrorMsg(errText.detail || 'Authentication failed');
      }
    } catch (e) { setErrorMsg('Connection error: ' + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.2fr 1fr', position: 'relative' }}>
      <ThemeToggle />
      <div style={{ padding: '72px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="serif" style={{ fontSize: 30, fontStyle: 'italic', letterSpacing: '-0.02em' }}>tammy</div>
        <div>
          <h1 className="serif" style={{ fontSize: 80, lineHeight: 0.98, margin: '0 0 24px', fontWeight: 400, letterSpacing: '-0.02em', maxWidth: 720, textWrap: 'balance' }}>
            the sharp friend <br />who tells <span style={{ fontStyle: 'italic', color: 'var(--iris)' }}>the truth.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 520, lineHeight: 1.55, margin: '0 0 36px' }}>
            Not a chatbot. Not a therapist. A persistent, emotionally intelligent co-founder who remembers every conversation, tracks your patterns, and holds you to what you said in the last one.
          </p>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>tonight</span>
              <span className="serif" style={{ fontSize: 18, color: 'var(--ink)', fontStyle: 'italic' }}>"what's on your chest?"</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          Built in Amman · Arabic &amp; English · Voice-first · <span style={{ color: 'var(--amber)' }}>●</span> private by default
        </div>
      </div>

      <div style={{ position: 'relative', background: 'linear-gradient(135deg, rgba(148,125,237,0.12), rgba(148,125,237,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Orb size={420} state="idle" />
        </div>
        <div style={{ position: 'relative', zIndex: 2, width: 380, padding: 32, borderRadius: 24, background: 'rgba(255,253,248,0.75)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(178,157,217,0.35)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--canvas-tint)', padding: 3, borderRadius: 10, marginBottom: 22 }}>
            {[['login','Sign in'],['register','Create account']].map(([v, l]) => (
              <button key={v} onClick={() => setMode(v)} style={{ flex: 1, padding: '8px 12px', fontSize: 13, border: 'none', borderRadius: 7, background: mode === v ? 'var(--ivory)' : 'transparent', color: mode === v ? 'var(--ink)' : 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--f-sans)', boxShadow: mode === v ? '0 1px 4px rgba(31,17,56,0.08)' : 'none' }}>{l}</button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'register' && <Input label="your name" placeholder="tamer" value={name} onChange={e => setName(e.target.value)} />}
            <Input label="email" placeholder="you@somewhere.com" value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="password" type="password" placeholder="········" value={password} onChange={e => setPassword(e.target.value)} />
            {errorMsg && (
              <div style={{ fontSize: 12, color: '#c0392b', background: 'rgba(192,57,43,0.08)', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>{errorMsg}</div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading || !email.trim() || !password.trim()} style={{ justifyContent: 'center', padding: '14px 22px', marginTop: 8, opacity: (loading || !email.trim() || !password.trim()) ? 0.7 : 1, position: 'relative', zIndex: 10 }}>
              {loading ? '…' : mode === 'login' ? 'come in' : 'begin'}
            </button>
            <button type="button" onClick={() => onNavigate('today')} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 12, marginTop: 4, cursor: 'pointer' }}>
              or skip → enter the demo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

window.Landing = Landing;
