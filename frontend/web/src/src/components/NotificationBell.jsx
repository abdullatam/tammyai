// NotificationBell.jsx — Legendary animated notification system for Tammy.
// Bell rings, toasts slide in from the right with glass morphism and glow.

const NotificationBell = () => {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [toasts, setToasts] = React.useState([]);
  const [bellPulse, setBellPulse] = React.useState(false);
  const [bellRing, setBellRing] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const sseRef = React.useRef(null);
  const toastIdRef = React.useRef(0);
  const justFiredRef = React.useRef(false);

  // ── Icon map with emoji + bg color
  const ICON_MAP = {
    calendar_new:         { emoji: '📅', color: '#947DED', bg: 'rgba(148,125,237,0.15)' },
    calendar_reminder:    { emoji: '⏰', color: '#ED9A7D', bg: 'rgba(237,154,125,0.15)' },
    decision_new:         { emoji: '⚖️', color: '#7DADED', bg: 'rgba(125,173,237,0.15)' },
    decision_overdue:     { emoji: '⏳', color: '#ED5050', bg: 'rgba(237,80,80,0.12)'   },
    tammy_connect_request:{ emoji: '🤝', color: '#7DED94', bg: 'rgba(125,237,148,0.15)' },
    tammy_connect_accepted:{ emoji: '🎉', color: '#EDB87D', bg: 'rgba(237,184,125,0.15)'},
    tammy_connect_message:{ emoji: '💬', color: '#C0ACFF', bg: 'rgba(192,172,255,0.15)' },
    project_created:      { emoji: '🗂️', color: '#947DED', bg: 'rgba(148,125,237,0.15)' },
    project_stalled:      { emoji: '⚠️', color: '#EDB87D', bg: 'rgba(237,184,125,0.15)' },
    founder_dna_ready:    { emoji: '🧬', color: '#7DED94', bg: 'rgba(125,237,148,0.15)' },
    arc_ready:            { emoji: '📈', color: '#C0ACFF', bg: 'rgba(192,172,255,0.15)' },
    intervention:         { emoji: '💡', color: '#EDB87D', bg: 'rgba(237,184,125,0.12)' },
  };

  const getIcon = (type) => ICON_MAP[type] || { emoji: '🔔', color: '#947DED', bg: 'rgba(148,125,237,0.12)' };

  // ── Fetch initial data
  React.useEffect(() => {
    const base = window.TAMMY_API || '';
    fetch(`${base}/notifications/count`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUnreadCount(d.unread_count || 0); })
      .catch(() => {});

    fetch(`${base}/notifications?limit=20`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d)) setNotifications(d); })
      .catch(() => {});
  }, []);

  // ── SSE real-time stream
  React.useEffect(() => {
    const base = window.TAMMY_API || '';
    const connect = () => {
      const es = new EventSource(`${base}/notifications/stream`, { withCredentials: true });
      sseRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification' && data.notification) {
            const n = data.notification;
            
            // Auto-refresh specific data if it was updated in the background
            if (n.type === 'calibration_update') {
              fetch(`${base}/api/calibration`, { credentials: 'include' })
                .then(r => r.ok ? r.json() : null)
                .then(fresh => {
                  if (fresh && window.TammyData) {
                    window.TammyData.calibration = fresh;
                    window.dispatchEvent(new Event('tammy:dataready'));
                  }
                });
            }

            // Prepend to list
            setNotifications(prev => [n, ...prev].slice(0, 30));
            setUnreadCount(prev => prev + 1);

            // Ring bell animation
            setBellRing(true);
            setTimeout(() => setBellRing(false), 800);
            setBellPulse(true);
            setTimeout(() => setBellPulse(false), 2000);

            // Show toast
            const tid = ++toastIdRef.current;
            const toastItem = { ...n, _tid: tid, _progress: 100 };
            setToasts(prev => [...prev.slice(-2), toastItem]);

            // Auto dismiss after 6s
            setTimeout(() => {
              setToasts(prev => prev.filter(t => t._tid !== tid));
            }, 6000);
          }
        } catch (_) {}
      };

      es.onerror = () => {
        es.close();
        setTimeout(connect, 5000); // reconnect
      };
    };

    connect();
    return () => { sseRef.current?.close(); };
  }, []);

  // ── Click outside to close dropdown
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Actions
  const markRead = async (notifId) => {
    const base = window.TAMMY_API || '';
    fetch(`${base}/notifications/${notifId}`, { method: 'PATCH', credentials: 'include' }).catch(() => {});
    setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    const base = window.TAMMY_API || '';
    fetch(`${base}/notifications/mark-all-read`, { method: 'POST', credentials: 'include' }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClick = (notif) => {
    if (!notif.read) markRead(notif._id);
    setOpen(false);
    const route = (notif.action_url || '/chat').replace(/^\//, '');
    if (window.TammyNavigate) window.TammyNavigate(route);
  };

  const dismissToast = (tid) => setToasts(prev => prev.filter(t => t._tid !== tid));

  const handleToastClick = (t) => {
    dismissToast(t._tid);
    if (t._id && !t.read) markRead(t._id);
    const route = (t.action_url || '/chat').replace(/^\//, '');
    if (window.TammyNavigate) window.TammyNavigate(route);
  };

  // ── Time ago
  const timeAgo = (ts) => {
    const s = Math.floor(Date.now() / 1000 - ts);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <>
      {/* ── Bell Button ─────────────────────────────────────────────── */}
      <button
        id="tammy-notif-bell"
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          top: 18, right: 110,
          zIndex: 10000,
          width: 38, height: 38,
          borderRadius: 13,
          background: open
            ? 'linear-gradient(135deg, rgba(148,125,237,0.2), rgba(192,172,255,0.12))'
            : 'var(--surface)',
          border: open ? '1px solid rgba(148,125,237,0.35)' : '1px solid var(--line)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: open
            ? '0 0 0 4px rgba(148,125,237,0.12), 0 4px 12px rgba(43,20,86,0.12)'
            : '0 2px 8px rgba(43,20,86,0.08)',
          transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: bellPulse ? 'scale(1.1)' : 'scale(1)',
          animation: bellRing ? 'nbBellRing 600ms ease' : 'none',
        }}
        title="Notifications"
      >
        {/* Bell icon */}
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={unreadCount > 0 ? 'var(--iris)' : 'var(--ink-2)'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'stroke 200ms ease' }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          {/* Ring waves when pulsing */}
          {bellPulse && (
            <circle cx="18" cy="6" r="3" fill="#ED5050" stroke="none" />
          )}
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4, right: -4,
            minWidth: 18, height: 18,
            borderRadius: 99,
            background: 'linear-gradient(135deg, #ED5050, #C0335A)',
            color: '#fff',
            fontSize: 10, fontWeight: 800,
            fontFamily: 'var(--f-mono)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 0 0 2px var(--canvas), 0 2px 8px rgba(237,80,80,0.5)',
            animation: 'nbBadgePop 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ───────────────────────────────────────────── */}
      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: 64, right: 74,
            width: 380,
            maxHeight: 500,
            background: 'var(--surface)',
            border: '1px solid rgba(148,125,237,0.18)',
            borderRadius: 20,
            boxShadow: '0 24px 80px rgba(43,20,86,0.22), 0 8px 24px rgba(43,20,86,0.12)',
            zIndex: 10001,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'nbDropIn 280ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid rgba(148,125,237,0.1)',
            flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(148,125,237,0.04), transparent)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="serif" style={{ fontSize: 17, color: 'var(--ink)', fontStyle: 'italic' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  padding: '2px 8px', borderRadius: 99,
                  background: 'rgba(148,125,237,0.12)',
                  fontSize: 11, fontWeight: 600, color: 'var(--iris)',
                  fontFamily: 'var(--f-sans)',
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none', border: 'none',
                  fontSize: 11, color: 'var(--iris)',
                  cursor: 'pointer', fontFamily: 'var(--f-sans)',
                  padding: '4px 10px', borderRadius: 8,
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(148,125,237,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '48px 20px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
                <div className="serif" style={{
                  fontSize: 15, color: 'var(--ink-2)', fontStyle: 'italic', marginBottom: 4
                }}>
                  All quiet for now.
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--f-sans)' }}>
                  Tammy will let you know when something matters.
                </div>
              </div>
            ) : notifications.slice(0, 20).map((n, idx) => {
              const ic = getIcon(n.type);
              return (
                <button
                  key={n._id || idx}
                  onClick={() => handleClick(n)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 18px',
                    background: n.read ? 'transparent' : 'rgba(148,125,237,0.05)',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'background 150ms ease',
                    borderLeft: n.read ? '3px solid transparent' : `3px solid ${ic.color}`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,125,237,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(148,125,237,0.05)'; }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 11,
                    background: ic.bg,
                    border: `1px solid ${ic.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, flexShrink: 0,
                  }}>
                    {ic.emoji}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--f-sans)',
                      fontSize: 13, fontWeight: n.read ? 400 : 600,
                      color: 'var(--ink)', lineHeight: 1.3, marginBottom: 2,
                    }}>{n.title}</div>
                    <div style={{
                      fontFamily: 'var(--f-sans)',
                      fontSize: 12, color: 'var(--ink-3)',
                      lineHeight: 1.35,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{n.body}</div>
                    <div className="mono" style={{
                      fontSize: 10, color: ic.color, marginTop: 3, letterSpacing: '0.04em',
                    }}>
                      {timeAgo(n.created_at)}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: ic.color,
                      boxShadow: `0 0 8px ${ic.color}88`,
                      flexShrink: 0, marginTop: 8,
                      animation: 'nbDotPulse 2s ease infinite',
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid rgba(148,125,237,0.1)',
            textAlign: 'center', flexShrink: 0,
            background: 'linear-gradient(to top, rgba(148,125,237,0.03), transparent)',
          }}>
            <button
              onClick={() => { setOpen(false); if (window.TammyNavigate) window.TammyNavigate('notifications'); }}
              style={{
                background: 'none', border: 'none',
                fontSize: 12, color: 'var(--iris)',
                cursor: 'pointer', fontFamily: 'var(--f-sans)', fontWeight: 500,
              }}
            >
              See all notifications →
            </button>
          </div>
        </div>
      )}

      {/* ── Toast Stack ─────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: 28, right: 28,
        zIndex: 10100,
        display: 'flex', flexDirection: 'column',
        gap: 12,
        pointerEvents: 'none',
      }}>
        {toasts.map((t, i) => {
          const ic = getIcon(t.type);
          return (
            <div
              key={t._tid}
              onClick={() => handleToastClick(t)}
              style={{
                pointerEvents: 'auto',
                width: 360,
                borderRadius: 18,
                overflow: 'hidden',
                cursor: 'pointer',
                animation: 'nbToastIn 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
              }}
            >
              {/* Gradient border container */}
              <div style={{
                padding: 1.5,
                borderRadius: 18,
                background: `linear-gradient(135deg, ${ic.color}99, ${ic.color}33, ${ic.color}66)`,
                animation: 'nbBorderShift 3s ease infinite',
                backgroundSize: '200% 200%',
              }}>
                {/* Glass inner */}
                <div style={{
                  background: 'var(--surface)',
                  borderRadius: 17,
                  padding: '16px 18px',
                  backdropFilter: 'blur(20px)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Shimmer sweep */}
                  <div style={{
                    position: 'absolute', top: 0, left: '-100%',
                    width: '100%', height: '100%',
                    background: `linear-gradient(90deg, transparent, ${ic.color}22, transparent)`,
                    animation: 'nbShimmer 1.2s ease 0.3s forwards',
                    pointerEvents: 'none',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Icon with glow */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: ic.bg,
                      border: `1px solid ${ic.color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                      boxShadow: `0 4px 12px ${ic.color}44`,
                      animation: 'nbIconPop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 100ms both',
                    }}>
                      {ic.emoji}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Label */}
                      <div style={{
                        fontSize: 10, fontWeight: 700,
                        color: ic.color, fontFamily: 'var(--f-sans)',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        marginBottom: 3,
                        animation: 'nbTextFade 300ms ease 200ms both',
                      }}>
                        Tammy · {t.type?.replace(/_/g, ' ')}
                      </div>
                      {/* Title */}
                      <div className="serif" style={{
                        fontSize: 15, fontWeight: 500,
                        color: 'var(--ink)', fontStyle: 'italic',
                        lineHeight: 1.25, marginBottom: 3,
                        animation: 'nbTextFade 300ms ease 280ms both',
                      }}>
                        {t.title}
                      </div>
                      {/* Body */}
                      <div style={{
                        fontSize: 12, color: 'var(--ink-3)',
                        fontFamily: 'var(--f-sans)', lineHeight: 1.35,
                        animation: 'nbTextFade 300ms ease 350ms both',
                      }}>
                        {t.body}
                      </div>
                    </div>

                    {/* Close */}
                    <button
                      onClick={e => { e.stopPropagation(); dismissToast(t._tid); }}
                      style={{
                        width: 24, height: 24, borderRadius: 8,
                        background: 'rgba(148,125,237,0.08)', border: 'none',
                        color: 'var(--ink-3)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 14, transition: 'all 150ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(237,80,80,0.12)'; e.currentTarget.style.color = '#ED5050'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,125,237,0.08)'; e.currentTarget.style.color = 'var(--ink-3)'; }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* Action row */}
                  {t.action_label && (
                    <div style={{
                      marginTop: 12, paddingTop: 10,
                      borderTop: `1px solid ${ic.color}22`,
                      display: 'flex', justifyContent: 'flex-end',
                      animation: 'nbTextFade 300ms ease 450ms both',
                    }}>
                      <span style={{
                        fontSize: 11, color: ic.color,
                        fontFamily: 'var(--f-sans)', fontWeight: 500,
                      }}>
                        {t.action_label} →
                      </span>
                    </div>
                  )}

                  {/* Progress bar that drains in 6s */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0,
                    height: 2, background: ic.color,
                    width: '100%',
                    animation: 'nbProgress 6s linear forwards',
                    opacity: 0.5,
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Animations ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes nbBellRing {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(14deg); }
          30%  { transform: rotate(-12deg); }
          45%  { transform: rotate(9deg); }
          60%  { transform: rotate(-6deg); }
          75%  { transform: rotate(3deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes nbBadgePop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes nbDropIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nbToastIn {
          0%   { opacity: 0; transform: translateX(60px) scale(0.94); }
          60%  { transform: translateX(-4px) scale(1.01); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes nbBorderShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes nbShimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes nbIconPop {
          0%   { opacity: 0; transform: scale(0.4) rotate(-15deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes nbTextFade {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nbProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes nbDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </>
  );
};

window.NotificationBell = NotificationBell;
