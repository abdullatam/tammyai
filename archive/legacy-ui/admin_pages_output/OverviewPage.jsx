// ═══ PAGE 1 — OVERVIEW ════════════════════════════════════════════════════
const D = window.AdminData;

const OverviewPage = () => {
  const [stats, setStats] = useState(D.meta);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      window.AdminAPI.getStats().catch(() => null),
      window.AdminAPI.getSessions(20).catch(() => []),
    ]).then(([s, sess]) => {
      if (s) setStats(s);
      setSessions(sess || []);
      setLoading(false);
    });
    const t = setInterval(() => {
      window.AdminAPI.getSessions(20).catch(() => []).then(s => setSessions(s || []));
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const eventColor = {
    session: 'var(--info)', decision: 'var(--purple-hi)',
    milestone: 'var(--ok)', voice: 'var(--calm)',
    flag: 'var(--danger)', memory: 'var(--warn)', arc: 'var(--purple)',
  };

  return (
    <div className="page">
      <TopHeader
        eyebrow="Live · Production"
        title="Overview"
        subtitle="Everything Tammy is doing right now. Refreshes live."
        actions={<>
          <span className="pill"><span className="live-dot" /> Live</span>
          <span className="pill mono">{stats.region || D.meta.region}</span>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Active users now" value={stats.activeNow ?? D.meta.activeNow} sub="last 10 min" accent />
        <StatCard label="Total users" value={(stats.totalUsers ?? D.meta.totalUsers).toLocaleString()} sub="registered" />
        <StatCard label="Conversations today" value={(stats.convosToday ?? D.meta.convosToday).toLocaleString()} sub="last 24h" />
        <StatCard label="Avg response time" value={stats.avgResponse ?? D.meta.avgResponse} unit="s" sub="estimated" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ChartCard title="Daily active users" sub="last 7 days" data={D.dauTrend} labels={D.dauLabels} suffix="" />
          <ChartCard title="Response time" sub="last 7 days · seconds" data={D.responseTrend} labels={D.dauLabels} suffix="s" inverted />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 660 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Recent sessions</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Live · all users</div>
            </div>
            <span className="live-dot" />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={2} />) :
              sessions.length === 0 ? (
                <div style={{ padding: 24, color: 'var(--ink-3)', fontSize: 13 }}>No recent activity</div>
              ) :
              sessions.map((ev, i) => (
                <div key={ev.id || i} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '12px 20px', borderBottom: '1px solid var(--line)',
                }}>
                  <span className="dot" style={{ background: 'var(--purple)', marginTop: 6 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.45 }}>
                      <strong style={{ fontWeight: 500 }}>{ev.user}</strong>
                      <span style={{ color: 'var(--ink-2)' }}> · {ev.session_name || ev.userMsg?.slice(0, 60) || 'new session'}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2, letterSpacing: 0.06 }}>{ev.when} · SESSION</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, sub, data, labels, suffix = '', inverted }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 720, h = 200, pad = { l: 40, r: 16, t: 20, b: 28 };
  const innerW = w - pad.l - pad.r, innerH = h - pad.t - pad.b;
  const pts = data.map((v, i) => ({
    x: pad.l + (i / (data.length - 1)) * innerW,
    y: pad.t + (1 - (v - min) / (max - min || 1)) * innerH,
    v,
  }));
  const path = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const fill = `${path} L${pts[pts.length - 1].x},${h - pad.b} L${pts[0].x},${h - pad.b} Z`;
  const last = data[data.length - 1];
  const first = data[0];
  const change = last - first;
  const dirGood = inverted ? change < 0 : change > 0;

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="serif" style={{ fontSize: 28 }}>{last}{suffix}</span>
            <span className="mono" style={{ fontSize: 11, color: dirGood ? 'var(--ok)' : 'var(--danger)', letterSpacing: 0.05 }}>
              {change >= 0 ? '+' : ''}{change.toFixed(suffix === 's' ? 2 : 0)}{suffix} 7d
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 200 }}>
        <defs>
          <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#947DED" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#947DED" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line key={p} x1={pad.l} x2={w - pad.r} y1={pad.t + p * innerH} y2={pad.t + p * innerH} stroke="rgba(192,172,255,0.06)" strokeWidth="1" />
        ))}
        <path d={fill} fill={`url(#grad-${title})`} />
        <path d={path} fill="none" stroke="#C0ACFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3} fill={i === pts.length - 1 ? '#C0ACFF' : '#947DED'} />
            {i === pts.length - 1 && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#C0ACFF" strokeOpacity="0.4" strokeWidth="1" />}
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={l} x={pts[i].x} y={h - 8} fontSize="10" fill="#7A7595" fontFamily="IBM Plex Mono" textAnchor="middle" letterSpacing="0.5">{l.toUpperCase()}</text>
        ))}
      </svg>
    </div>
  );
};

window.OverviewPage = OverviewPage;
