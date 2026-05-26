// Floating glass sidebar — collapsed by default, expands on hover with motion.
// Active icon sits in an amber disk with glow.
// User initial sits below the pill in an iris→amber gradient circle.

const NavIcon = ({ name }) => {
  const paths = {
    sunrise: <><path d="M4 18h16M6 14a6 6 0 0 1 12 0M12 3v3M4.5 8l1.5 1.5M19.5 8L18 9.5M2 18h20" /></>,
    chat: <><path d="M5 5h14v11H9l-4 4z" /></>,
    activity: <><polyline points="3 12 7 12 10 4 14 20 17 12 21 12" /></>,
    dna: <><path d="M7 3c0 4 10 4 10 8s-10 4-10 8" /><path d="M17 3c0 4-10 4-10 8s10 4 10 8" /><path d="M8 6h8M8 18h8M9 9h6M9 15h6" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></>,
    wave: <><path d="M2 12c2 0 2-4 4-4s2 8 4 8 2-10 4-10 2 10 4 10 2-4 4-4" /></>,
    lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    folder: <><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 19c0-3 3-5 6-5s6 2 6 5" /><circle cx="17" cy="7" r="2.5" /><path d="M15 14c2 0 6 1.5 6 5" /></>,
    archive: <><rect x="3" y="5" width="18" height="4" rx="1" /><path d="M5 9v10h14V9M10 13h4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
  };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

const Nav = ({ active = 'chat', onNavigate, userInitial = 'T' }) => {
  const [open, setOpen] = React.useState(false);
  const items = [
    { id: 'today', icon: 'sunrise', label: 'Today' },
    { id: 'chat', icon: 'chat', label: 'Chat' },
    { id: 'arc', icon: 'activity', label: 'The Arc' },
    { id: 'dna', icon: 'dna', label: 'Founder DNA' },
    { id: 'blindspots', icon: 'eye', label: 'Blind Spots' },
    { id: 'calibration', icon: 'target', label: 'Calibration' },
    { id: 'mirror', icon: 'wave', label: 'Mirror Moment' },
    { id: 'decisions', icon: 'lock', label: 'Decisions' },
    { id: 'projects', icon: 'folder', label: 'Projects' },
    { id: 'network', icon: 'users', label: 'Network' },
    { id: 'memory', icon: 'archive', label: 'Memory' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  const COLLAPSED = 58;
  const EXPANDED = 220;
  const EASE = 'cubic-bezier(0.32, 0.72, 0.24, 1)';
  const closeTimer = React.useRef(null);
  const handleEnter = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpen(true);
  };
  const handleLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  return (
    <>
    <nav
      style={{
        position: 'fixed',
        left: 24,
        top: 24,
        zIndex: 100,
        width: EXPANDED,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        pointerEvents: 'none',
      }}
    >
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{
          pointerEvents: 'auto',
          padding: 14,
          margin: -14,
        }}
      >
      <div
        style={{
        position: 'relative',
        width: open ? EXPANDED : COLLAPSED,
        padding: '14px 9px',
        background: 'var(--canvas)',
        border: '1px solid var(--mauve-soft)',
        borderRadius: open ? 28 : 999,
        boxShadow: open
          ? '0 30px 80px rgba(43, 20, 86, 0.18), 0 8px 24px rgba(43, 20, 86, 0.10)'
          : '0 20px 60px rgba(43, 20, 86, 0.10), 0 4px 16px rgba(43, 20, 86, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: open ? 4 : 14,
        transition: `width 380ms ${EASE}, border-radius 380ms ${EASE}, box-shadow 380ms ${EASE}, gap 380ms ${EASE}`,
        overflow: 'hidden',
      }}>
        {items.map(item => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              title={!open ? item.label : undefined}
              style={{
                position: 'relative',
                width: '100%',
                height: 40,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 0,
                border: 'none',
                borderRadius: open ? 12 : '50%',
                cursor: 'pointer',
                background: isActive ? 'var(--amber)' : 'transparent',
                color: 'var(--ink)',
                opacity: isActive ? 1 : 0.6,
                boxShadow: isActive
                  ? (open
                    ? '0 6px 18px var(--amber-glow)'
                    : '0 0 22px var(--amber-glow), 0 0 0 6px rgba(148, 125, 237, 0.12)')
                  : 'none',
                transition: `background 250ms ${EASE}, opacity 250ms ${EASE}, box-shadow 320ms ${EASE}, border-radius 380ms ${EASE}`,
                whiteSpace: 'nowrap',
                fontFamily: 'var(--f-sans)',
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                textAlign: 'left',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.opacity = 1;
                  e.currentTarget.style.background = open ? 'var(--surface-2)' : 'transparent';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.opacity = 0.6;
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <NavIcon name={item.icon} />
              </span>
              <span style={{
                width: open ? 'auto' : 0,
                opacity: open ? 1 : 0,
                transform: open ? 'translateX(0)' : 'translateX(-6px)',
                transition: `opacity 280ms ${EASE} ${open ? '120ms' : '0ms'}, transform 280ms ${EASE} ${open ? '120ms' : '0ms'}, width 380ms ${EASE}`,
                pointerEvents: open ? 'auto' : 'none',
                overflow: 'hidden',
                display: 'inline-block',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      </div>

    </nav>
    {/* User identity circle — fixed at bottom-left, separate from sidebar */}
    <button
      onClick={() => onNavigate && onNavigate('profile')}
      style={{
        position: 'fixed',
        left: 29,
        bottom: 28,
        zIndex: 100,
        width: 48, height: 48,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--ink) 0%, var(--amber) 100%)',
        border: '2px solid var(--canvas)',
        boxShadow: '0 0 0 1px var(--mauve-soft), 0 8px 24px var(--amber-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--canvas)',
        fontFamily: 'var(--f-sans)',
        fontSize: 20,
        fontWeight: 500,
        cursor: 'pointer',
        lineHeight: 1,
        paddingBottom: 3,
      }}
    >
      {userInitial}
    </button>
    </>
  );
};

window.Nav = Nav;
window.NavIcon = NavIcon;
