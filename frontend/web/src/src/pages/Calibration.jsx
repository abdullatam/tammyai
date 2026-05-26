// Calibration screen.

const EXTRA_API = window.EXTRA_API || window.TAMMY_API || 'http://localhost:7861';
const { ScreenWrap, Eyebrow, ScreenSkeleton, LockedGate } = window._ExtraShared;

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

const NewPredictionForm = ({ onClose }) => {
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

  const [arcAnim, setArcAnim] = React.useState(0);
  
  React.useEffect(() => {
    const h = () => rerender(n => n + 1);
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  React.useEffect(() => {
    let raf, start;
    const tick = t => { if (!start) start = t; const p = Math.min(1, (t - start) / 1400); setArcAnim(1 - Math.pow(1 - p, 3)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const D = window.TammyData;
  const cal = D.calibration;

  if (cal === undefined || cal === null) return <ScreenWrap><ScreenSkeleton /></ScreenWrap>;
  if (cal.locked) return <LockedCalibration />;

  const stats  = cal.stats  || cal.domains || [];
  const recent = cal.recent || cal.predictions || [];
  const overall = cal.overall || (stats.length ? Math.round(stats.reduce((a, s) => a + (s.right / Math.max(s.total || 1, 1)), 0) / stats.length * 100) : 0);
  const total  = stats.reduce((a, s) => a + (s.total || 0), 0) || recent.length;
  const totalRight   = stats.reduce((a, s) => a + (s.right || 0), 0);
  const totalPartial = stats.reduce((a, s) => a + (s.partial || 0), 0);
  const tammyRead = cal.tammy_read || cal.summary || `You're at ${overall}% calibration across ${total} predictions.`;

  const filtered = activeDomain === 'all' ? recent : recent.filter(r => r.domain === activeDomain);

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

window.CalibrationScreen = CalibrationScreen;
