// Tammy Admin — shared components
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ─── Icons (single-stroke, 18px) ─────────────────────────────────────────
const Icon = ({ name, size = 18, stroke = 1.6 }) => {
  const s = size;
  const props = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    overview: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></>,
    prompt: <><path d="M4 5h16M4 12h10M4 19h7" /><path d="M17 16l3 3m0-3l-3 3" /></>,
    rag: <><path d="M4 5a2 2 0 0 1 2-2h10l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" /><path d="M14 3v5h5M8 13h8M8 17h5" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0" /><circle cx="17" cy="9" r="2.5" /><path d="M15 20a5 5 0 0 1 6.5-4.8" /></>,
    convos: <><path d="M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4z" /><circle cx="9" cy="12" r=".5" fill="currentColor" /><circle cx="13" cy="12" r=".5" fill="currentColor" /><circle cx="17" cy="12" r=".5" fill="currentColor" /></>,
    test: <><path d="M9 3v6l-5 9a3 3 0 0 0 2.6 4.5h10.8A3 3 0 0 0 20 18l-5-9V3" /><path d="M9 3h6M9 12h6" /></>,
    eq: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3v18" strokeDasharray="2 3" /><circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none" /><circle cx="8" cy="14" r="1.5" fill="currentColor" stroke="none" /><circle cx="14" cy="16" r="1" fill="currentColor" stroke="none" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
    close: <><path d="M6 6l12 12M18 6l-12 12" /></>,
    play: <><path d="M6 4l14 8-14 8V4z" /></>,
    pause: <><path d="M7 4v16M17 4v16" /></>,
    stop: <><rect x="6" y="6" width="12" height="12" rx="2" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></>,
    refresh: <><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>,
    trash: <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>,
    eye: <><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
    rollback: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
    flag: <><path d="M4 21V4M4 4h13l-3 4 3 4H4" /></>,
    star: <><path d="m12 2 3 7 7 .5-5.5 4.5L18 22l-6-4-6 4 1.5-8L2 9.5 9 9z" /></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" /></>,
    pin: <><path d="M12 2v9M5 11h14M9 11l-2 5h10l-2-5M12 16v6" /></>,
    check: <><path d="M5 12l5 5L20 7" /></>,
    fork: <><path d="M6 3v6M18 3v6M6 9a6 6 0 0 0 12 0M12 15v6" /></>,
    wave: <><path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    chevron: <><path d="m9 18 6-6-6-6" /></>,
    chevronDown: <><path d="m6 9 6 6 6-6" /></>,
    arrow: <><path d="M5 12h14M13 5l7 7-7 7" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></>,
    file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
    impersonate: <><path d="M14 4l6 6-10 10H4v-6L14 4z" /><path d="M3 21h18" /></>,
    key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9 3 3-3 3 2 2-3 3-2-2-3 3-3-3" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></>,
    health: <><path d="M2 12h4l3-9 5 18 3-9h5" /></>,
  };
  return <svg {...props}>{paths[name] || null}</svg>;
};

// ─── Mini Orb (for prompt test chat) ──────────────────────────────────────
const MiniOrb = ({ state = 'idle', size = 38 }) => {
  const ringClass = state === 'thinking' ? 'orb-think' : state === 'speaking' ? 'orb-speak' : 'orb-idle';
  return (
    <div style={{ width: size, height: size, position: 'relative' }} className={ringClass}>
      <svg width={size} height={size} viewBox="0 0 40 40">
        <defs>
          <radialGradient id="miniorb" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#E8DFFF" />
            <stop offset="40%" stopColor="#C0ACFF" />
            <stop offset="100%" stopColor="#6B5BC8" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="20" r="15" fill="url(#miniorb)" />
        <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(192,172,255,0.3)" strokeWidth="0.6" strokeDasharray="2 4" />
      </svg>
      <style>{`
        @keyframes orb-pulse-think {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(148,125,237,0.4)); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 14px rgba(148,125,237,0.7)); }
        }
        @keyframes orb-pulse-speak {
          0%, 100% { transform: scale(1.02); filter: drop-shadow(0 0 10px rgba(192,172,255,0.6)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 18px rgba(192,172,255,0.9)); }
        }
        .orb-think { animation: orb-pulse-think 1.4s ease-in-out infinite; }
        .orb-speak { animation: orb-pulse-speak 0.7s ease-in-out infinite; }
        .orb-idle { filter: drop-shadow(0 0 4px rgba(148,125,237,0.3)); }
      `}</style>
    </div>
  );
};

// ─── Sparkline ────────────────────────────────────────────────────────────
const Sparkline = ({ data, w = 100, h = 28, color = 'var(--purple)', fill = true, stroke = 1.5 }) => {
  if (!data || !data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * stepX},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  const grad = `spark-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <polygon points={fillPts} fill={`url(#${grad})`} />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: 'overview' },
  { key: 'prompt', label: 'System Prompt', icon: 'prompt' },
  { key: 'rag', label: 'RAG Books', icon: 'rag' },
  { key: 'users', label: 'Active Users', icon: 'users' },
  { key: 'test', label: 'Self-Test', icon: 'test' },
  { key: 'health', label: 'Health', icon: 'health' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];

const Sidebar = ({ active, onSelect, admin }) => {
  return (
    <aside style={{
      position: 'fixed',
      top: 24, bottom: 24, left: 24,
      width: 64,
      background: 'color-mix(in srgb, var(--surface) 85%, transparent)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--mauve)',
      borderRadius: 999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '14px 0',
      gap: 4,
      zIndex: 50,
      boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(192, 172, 255, 0.08)',
    }}>
      {/* Tammy mark */}
      <div style={{
        width: 40, height: 40,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #C0ACFF, #6B5BC8)',
        boxShadow: '0 0 14px rgba(148,125,237,0.5)',
        marginBottom: 8,
      }} title="Tammy Admin" />

      <div style={{ width: 28, height: 1, background: 'var(--line)', margin: '4px 0 8px' }} />

      {NAV_ITEMS.map((it) => {
        const isActive = active === it.key;
        return (
          <button
            key={it.key}
            onClick={() => onSelect(it.key)}
            title={it.label}
            style={{
              width: 44, height: 44,
              border: 'none',
              background: isActive ? 'var(--purple-soft)' : 'transparent',
              color: isActive ? 'var(--purple-hi)' : 'var(--ink-3)',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 180ms',
              position: 'relative',
            }}
            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)'; } }}
            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-3)'; } }}
          >
            <Icon name={it.icon} size={20} />
            {isActive && <span style={{ position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, background: 'var(--purple)', borderRadius: 2 }} />}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <div title={`${admin.name} · ${admin.role}`} onClick={() => onSelect('profile')} style={{
        width: 40, height: 40,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--purple), var(--purple-deep))',
        color: '#FFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--f-serif)',
        fontSize: 18,
        cursor: 'pointer',
        border: '2px solid var(--surface)',
      }}>
        {admin.initial}
      </div>
    </aside>
  );
};

// ─── Top Header ───────────────────────────────────────────────────────────
const TopHeader = ({ title, subtitle, eyebrow, actions, count }) => {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 28 }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
        <h1 className="serif" style={{ fontSize: 38, fontWeight: 400, margin: 0, letterSpacing: '-0.015em', display: 'flex', alignItems: 'baseline', gap: 14 }}>
          {title}
          {count !== undefined && <span className="mono" style={{ fontSize: 14, color: 'var(--ink-3)', letterSpacing: 0.05 }}>{count}</span>}
        </h1>
        {subtitle && <p style={{ margin: '6px 0 0', color: 'var(--ink-2)', fontSize: 14, maxWidth: 720 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div>}
    </header>
  );
};

// ─── Confirm modal ────────────────────────────────────────────────────────
const ConfirmModal = ({ title, body, danger, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }) => {
  return (
    <div className="backdrop" onClick={onCancel}>
      <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: 440, padding: 28, animation: 'fadeUp 280ms cubic-bezier(0.32, 0.72, 0.24, 1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: danger ? 'rgba(248,113,113,0.12)' : 'var(--purple-soft)',
            color: danger ? 'var(--danger)' : 'var(--purple-hi)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon name={danger ? 'trash' : 'check'} size={18} />
          </div>
          <h3 className="serif" style={{ margin: 0, fontSize: 22, fontWeight: 400 }}>{title}</h3>
        </div>
        <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: '0 0 22px', lineHeight: 1.6 }}>{body}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onCancel}>{cancelLabel}</button>
          <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton row ─────────────────────────────────────────────────────────
const SkeletonRow = ({ cols = 5, h = 18 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
    {Array.from({ length: cols }).map((_, i) => <div key={i} className="skeleton" style={{ height: h }} />)}
  </div>
);

const useFakeLoad = (ms = 600) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
};

// ─── Stat card ────────────────────────────────────────────────────────────
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const str = String(value);
    const num = parseFloat(str.replace(/,/g, ''));
    if (isNaN(num)) {
      setDisplayValue(value);
      return;
    }
    
    let startTimestamp = null;
    const duration = 1200; // ms
    let animationFrameId;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = num * ease;
      
      const isFloat = str.includes('.');
      const hasComma = str.includes(',');
      
      let out = isFloat ? current.toFixed(1) : Math.floor(current).toString();
      if (hasComma && !isFloat) out = parseInt(out, 10).toLocaleString();
      
      setDisplayValue(out);
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value]);
  
  return displayValue;
};

const StatCard = ({ label, value, unit, delta, sub, accent }) => {
  // Use a random delay just for the initial stagger effect when multiple cards mount
  const delay = useMemo(() => Math.random() * 0.15, []);
  
  return (
    <div className="card" style={{ 
      padding: 22, position: 'relative', overflow: 'hidden',
      animation: `fadeUpStat 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${delay}s`,
      opacity: 0,
      transform: 'translateY(16px)'
    }}>
      <style>{`
        @keyframes fadeUpStat {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--purple), var(--purple-hi))' }} />}
      <div className="eyebrow" style={{ marginBottom: 14 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
        <span className="serif" style={{ fontSize: 38, lineHeight: 1, letterSpacing: '-0.02em' }}>
          <AnimatedNumber value={value} />
        </span>
        {unit && <span className="mono" style={{ fontSize: 13, color: 'var(--ink-3)' }}>{unit}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-3)' }}>
        {delta && (
          <span className="mono" style={{ color: delta.startsWith('+') ? 'var(--ok)' : delta.startsWith('−') || delta.startsWith('-') ? 'var(--danger)' : 'var(--ink-3)', fontSize: 11, letterSpacing: 0.05 }}>
            {delta}
          </span>
        )}
        <span>{sub}</span>
      </div>
    </div>
  );
};

// ─── Status dot ───────────────────────────────────────────────────────────
const StatusDot = ({ status }) => {
  const map = {
    ready: 'var(--ok)', connected: 'var(--ok)',
    indexing: 'var(--warn)',
    error: 'var(--danger)', failed: 'var(--danger)',
    pending: 'var(--info)',
  };
  return <span className="dot" style={{ background: map[status] || 'var(--ink-3)', boxShadow: status === 'ready' || status === 'connected' ? '0 0 6px ' + map[status] : 'none' }} />;
};

// Export to window
Object.assign(window, {
  Icon, MiniOrb, Sparkline, Sidebar, TopHeader, ConfirmModal, SkeletonRow, StatCard, StatusDot,
  useFakeLoad, NAV_ITEMS,
});
