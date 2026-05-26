// Notifications.jsx — Full notifications page with filters, grouping, and infinite load.

const NotificationsScreen = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all'); // all | unread | high
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const PAGE_SIZE = 20;

  const fetchNotifications = async (reset = false) => {
    const base = window.TAMMY_API || '';
    const newOffset = reset ? 0 : offset;
    const params = new URLSearchParams({ limit: PAGE_SIZE, offset: newOffset });
    if (filter === 'unread') params.set('unread_only', 'true');
    if (filter === 'high') params.set('priority', 'high');

    try {
      const res = await fetch(`${base}/notifications?${params}`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (reset) {
        setNotifications(data);
        setOffset(data.length);
      } else {
        setNotifications(prev => [...prev, ...data]);
        setOffset(prev => prev + data.length);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  React.useEffect(() => {
    setLoading(true);
    setOffset(0);
    fetchNotifications(true);
  }, [filter]);

  const markAllRead = async () => {
    const base = window.TAMMY_API || '';
    await fetch(`${base}/notifications/mark-all-read`, { method: 'POST', credentials: 'include' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Update global count
    if (window.TammyData) window.TammyData.unread_count = 0;
  };

  const markRead = async (id) => {
    const base = window.TAMMY_API || '';
    fetch(`${base}/notifications/${id}`, { method: 'PATCH', credentials: 'include' }).catch(() => {});
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const handleClick = (notif) => {
    if (!notif.read) markRead(notif._id);
    const route = (notif.action_url || '/chat').replace(/^\//, '');
    if (window.TammyNavigate) window.TammyNavigate(route);
  };

  const timeAgo = (ts) => {
    const s = Math.floor(Date.now() / 1000 - ts);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const priorityColor = (p) => {
    if (p === 'high') return '#ED7D97';
    if (p === 'medium') return '#947DED';
    return 'var(--ink-3)';
  };

  // Group by date
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const oneWeekAgo = Date.now() - 7 * 86400000;

  const groups = React.useMemo(() => {
    const today = [], thisWeek = [], earlier = [];
    for (const n of notifications) {
      const d = new Date(n.created_at * 1000);
      if (d.toDateString() === todayStr) today.push(n);
      else if (d.toDateString() === yesterdayStr || d.getTime() > oneWeekAgo) thisWeek.push(n);
      else earlier.push(n);
    }
    return [
      { label: 'Today', items: today },
      { label: 'This week', items: thisWeek },
      { label: 'Earlier', items: earlier },
    ].filter(g => g.items.length);
  }, [notifications]);

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'high', label: 'High priority' },
  ];

  return (
    <div style={{
      maxWidth: 700,
      margin: '0 auto',
      padding: '40px 48px 80px',
      marginLeft: 120,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
      }}>
        <h1 className="serif" style={{
          fontSize: 32,
          fontStyle: 'italic',
          color: 'var(--ink)',
          margin: 0,
        }}>Notifications</h1>
        <button
          onClick={markAllRead}
          style={{
            background: 'rgba(148,125,237,0.10)',
            border: '1px solid rgba(148,125,237,0.25)',
            borderRadius: 10,
            padding: '8px 16px',
            fontSize: 12,
            fontFamily: 'var(--f-sans)',
            fontWeight: 500,
            color: 'var(--iris)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,125,237,0.20)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,125,237,0.10)'; }}
        >Mark all read</button>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginBottom: 24,
      }}>
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '7px 16px',
              borderRadius: 99,
              border: filter === tab.id ? '1px solid var(--iris)' : '1px solid var(--line)',
              background: filter === tab.id ? 'rgba(148,125,237,0.12)' : 'transparent',
              color: filter === tab.id ? 'var(--iris)' : 'var(--ink-3)',
              fontSize: 12,
              fontFamily: 'var(--f-sans)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-3)', fontSize: 14 }}>
          Loading...
        </div>
      )}

      {/* Empty state */}
      {!loading && notifications.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--ink-3)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔔</div>
          <div className="serif" style={{ fontSize: 18, fontStyle: 'italic', marginBottom: 8 }}>
            Nothing new.
          </div>
          <div style={{ fontSize: 13, fontFamily: 'var(--f-sans)' }}>
            Tammy will tell you when something matters.
          </div>
        </div>
      )}

      {/* Grouped list */}
      {groups.map(g => (
        <div key={g.label} style={{ marginBottom: 24 }}>
          <div className="mono" style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            padding: '0 0 10px',
          }}>{g.label}</div>

          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {g.items.map((n, i) => (
              <button
                key={n._id}
                onClick={() => handleClick(n)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 20px',
                  background: n.read ? 'transparent' : 'rgba(148,125,237,0.04)',
                  border: 'none',
                  borderBottom: i < g.items.length - 1 ? '1px solid var(--line)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,125,237,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(148,125,237,0.04)'; }}
              >
                {/* Icon */}
                <span style={{
                  fontSize: 22,
                  width: 38, height: 38,
                  borderRadius: 12,
                  background: 'rgba(148,125,237,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {n.icon || '🔔'}
                </span>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--f-sans)',
                    fontSize: 14,
                    fontWeight: n.read ? 400 : 500,
                    color: 'var(--ink)',
                    lineHeight: 1.3,
                    marginBottom: 3,
                  }}>{n.title}</div>
                  <div style={{
                    fontFamily: 'var(--f-sans)',
                    fontSize: 12.5,
                    color: 'var(--ink-3)',
                    lineHeight: 1.4,
                  }}>{n.body}</div>
                  <div className="mono" style={{
                    fontSize: 10,
                    color: priorityColor(n.priority),
                    marginTop: 5,
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    {timeAgo(n.created_at)}
                    {n.action_label && (
                      <span style={{
                        color: 'var(--iris)',
                        fontFamily: 'var(--f-sans)',
                        fontSize: 11,
                        fontWeight: 500,
                      }}>
                        {n.action_label} →
                      </span>
                    )}
                  </div>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <span style={{
                    width: 9, height: 9, borderRadius: '50%',
                    background: 'var(--amber)',
                    boxShadow: '0 0 8px var(--amber-glow)',
                    flexShrink: 0,
                    marginTop: 8,
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && !loading && notifications.length > 0 && (
        <div style={{ textAlign: 'center', paddingTop: 16 }}>
          <button
            onClick={() => fetchNotifications(false)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: '10px 24px',
              fontSize: 13,
              fontFamily: 'var(--f-sans)',
              color: 'var(--ink-2)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--iris)'; e.currentTarget.style.color = 'var(--iris)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
          >Load more</button>
        </div>
      )}
    </div>
  );
};

window.NotificationsScreen = NotificationsScreen;
