// Shared layout helpers for Extra screens.
// Loaded first so individual screen files can reference window._ExtraShared.

const EXTRA_API = window.TAMMY_API || 'http://localhost:7861';

const ScreenWrap = ({ children }) => (
  <main style={{ marginLeft: 88, minHeight: '100vh', padding: '64px 80px 96px', maxWidth: 1280 }}>
    {children}
  </main>
);
const Eyebrow = ({ children }) => (
  <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>{children}</div>
);
const H1 = ({ children }) => (
  <h1 className="serif" style={{ fontSize: 56, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>{children}</h1>
);
const Sub = ({ children }) => (
  <p style={{ fontSize: 16, color: 'var(--ink-2)', margin: '0 0 48px', maxWidth: 720, lineHeight: 1.55 }}>{children}</p>
);
const Stat = ({ n, label, amber, right }) => (
  <div style={{ padding: '28px 0', borderRight: right ? 'none' : '1px solid var(--mauve-soft)', paddingLeft: 28 }}>
    <div className="serif" style={{ fontSize: 56, fontWeight: 400, color: amber ? 'var(--amber)' : 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>{n}</div>
    <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 12 }}>{label}</div>
  </div>
);
const ScreenSkeleton = () => (
  <div style={{ padding: '40px 0', animation: 'fadeInUp 400ms ease' }}>
    <div style={{ height: 12, width: 220, background: 'var(--mauve-soft)', borderRadius: 4, marginBottom: 20, opacity: 0.5 }} />
    <div style={{ height: 56, width: 420, background: 'var(--mauve-soft)', borderRadius: 8, marginBottom: 16, opacity: 0.4 }} />
    <div style={{ height: 18, width: 600, background: 'var(--mauve-soft)', borderRadius: 4, marginBottom: 48, opacity: 0.3 }} />
    <div style={{ height: 260, background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 22, opacity: 0.5 }} />
  </div>
);
const LockedGate = ({ title, reason, sessions, sessions_needed }) => (
  <div style={{ padding: '80px 0', textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28, color: 'var(--ink-3)' }}>⟳</div>
    <h2 className="serif" style={{ fontSize: 30, fontWeight: 400, color: 'var(--ink)', marginBottom: 12, letterSpacing: '-0.02em' }}>{title}</h2>
    <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: 24 }}>{reason}</p>
    {sessions_needed && (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--mauve-soft)' }}>
        <div style={{ height: 6, width: 120, background: 'var(--mauve-soft)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(100, Math.round(((sessions || 0) / sessions_needed) * 100))}%`, background: 'var(--iris)', borderRadius: 3 }} />
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{sessions || 0} / {sessions_needed} sessions</span>
      </div>
    )}
  </div>
);
const STATUS_COLOR = { Live: '#947DED', Stalled: '#7B6BA8', Review: '#C0ACFF' };
const Glyph = ({ kind, color = 'currentColor', size = 28 }) => {
  const s = size;
  switch (kind) {
    case 'ring':    return <svg width={s} height={s} viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" stroke={color} strokeWidth="2" /><circle cx="14" cy="14" r="3" fill={color} /></svg>;
    case 'square':  return <svg width={s} height={s} viewBox="0 0 28 28" fill="none"><rect x="3" y="3" width="22" height="22" stroke={color} strokeWidth="2" /><rect x="10" y="10" width="8" height="8" fill={color} /></svg>;
    case 'triangle':return <svg width={s} height={s} viewBox="0 0 28 28" fill="none"><path d="M14 3 L25 24 L3 24 Z" stroke={color} strokeWidth="2" strokeLinejoin="round" /><circle cx="14" cy="18" r="2.5" fill={color} /></svg>;
    case 'dots':    return <svg width={s} height={s} viewBox="0 0 28 28" fill={color}><circle cx="6" cy="14" r="3" /><circle cx="14" cy="14" r="3" /><circle cx="22" cy="14" r="3" /></svg>;
    case 'line':    return <svg width={s} height={s} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M4 8 L24 8" /><path d="M4 14 L20 14" /><path d="M4 20 L16 20" /></svg>;
    case 'star':    return <svg width={s} height={s} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"><path d="M14 3 L17 11 L25 11 L19 16 L21 24 L14 19 L7 24 L9 16 L3 11 L11 11 Z" /></svg>;
    default:        return <svg width={s} height={s} viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="10" stroke={color} strokeWidth="2" /></svg>;
  }
};
const StatusPill = ({ status, color }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: `${color}1a`, color, borderRadius: 20, fontSize: 10, fontFamily: 'var(--font-mono,ui-monospace)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: status === 'Live' ? `0 0 8px ${color}` : 'none' }} />
    {status}
  </div>
);
const FilterChip = ({ label, active, color, onClick }) => (
  <button onClick={onClick} style={{ padding: '7px 14px', border: `1px solid ${active ? color : 'rgba(178,157,217,0.4)'}`, background: active ? color : 'transparent', color: active ? '#FFF' : 'var(--ink-2)', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.005em', transition: 'all 160ms ease' }}>
    {label}
  </button>
);

window.EXTRA_API = EXTRA_API;
window._ExtraShared = { ScreenWrap, Eyebrow, H1, Sub, Stat, ScreenSkeleton, LockedGate, STATUS_COLOR, Glyph, StatusPill, FilterChip };
