const { useState, useEffect, useMemo } = window.React || React;

const MiniChart = ({ color, values }) => (
  <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '16px', marginTop: '12px' }}>
    {values.map((v, i) => (
      <div key={i} style={{ 
        width: '12px', 
        height: `${v}%`, 
        background: color, 
        borderRadius: '2px',
        opacity: 0.8
      }}></div>
    ))}
  </div>
);

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await window.AdminAPI._fetch('/api/admin/feedback');
        setFeedbacks(res || []);
      } catch (err) {
        console.error('Failed to fetch feedback:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const total = feedbacks.length;
  const liked = feedbacks.filter(f => f.verdict === 'like').length;
  const disliked = feedbacks.filter(f => f.verdict === 'dislike').length;
  const satisfaction = total > 0 ? Math.round((liked / total) * 100) : 0;

  const filteredFeedbacks = useMemo(() => {
    if (filter === 'all') return feedbacks;
    return feedbacks.filter(f => f.verdict === filter);
  }, [feedbacks, filter]);

  return (
    <div className="page" style={{ padding: '48px 64px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--f-sans)' }}>
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--purple)' }}></div>
          <span className="mono faint" style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            REACTIONS • LAST 30 DAYS
          </span>
        </div>
        <h1 style={{ margin: 0, fontSize: '40px', fontWeight: '700', color: 'var(--ink)', letterSpacing: '-0.03em' }}>Message Feedback</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--ink-3)', fontSize: '16px' }}>
          Insights and reactions to Tammy's responses, directly from the people she talks to.
        </p>
      </header>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', background: 'transparent' }}>
          <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
            <svg width="64" height="64" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <path stroke="var(--surface-3)" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke="var(--ok)" strokeWidth="3" strokeDasharray={`${satisfaction}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700' }}>
              {satisfaction}<span style={{ fontSize: '10px' }}>%</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>Satisfaction</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: '1.4' }}>She's landing well. Up 6 points from last month.</div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'transparent' }}>
          <div className="mono faint" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px' }}>TOTAL REACTIONS</div>
          <div style={{ fontSize: '32px', fontWeight: '700', lineHeight: 1 }}>{total}</div>
          <MiniChart color="var(--purple)" values={[30, 40, 50, 45, 60, 55, 70]} />
        </div>

        <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'transparent' }}>
          <div className="mono faint" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px' }}>LIKED</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--ok)', lineHeight: 1 }}>{liked}</div>
            <div className="faint" style={{ fontSize: '13px' }}>• {satisfaction}%</div>
          </div>
          <MiniChart color="var(--ok)" values={[40, 50, 45, 60, 55, 70, 80]} />
        </div>

        <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'transparent' }}>
          <div className="mono faint" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px' }}>DISLIKED</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--danger)', lineHeight: 1 }}>{disliked}</div>
            <div className="faint" style={{ fontSize: '13px' }}>• {100 - satisfaction}%</div>
          </div>
          <MiniChart color="rgba(248, 113, 113, 0.6)" values={[60, 40, 50, 40, 30, 20, 10]} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--mauve)' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', padding: '4px', borderRadius: '99px', border: '1px solid var(--mauve-soft)' }}>
          <button onClick={() => setFilter('all')} style={{ background: filter === 'all' ? 'var(--surface-3)' : 'transparent', color: filter === 'all' ? 'var(--ink)' : 'var(--ink-3)', border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}>
            All <span className="mono" style={{ opacity: 0.5, fontSize: '11px' }}>{total}</span>
          </button>
          <button onClick={() => setFilter('like')} style={{ background: filter === 'like' ? 'var(--surface-3)' : 'transparent', color: filter === 'like' ? 'var(--ink)' : 'var(--ink-3)', border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}>
            Liked <span className="mono" style={{ opacity: 0.5, fontSize: '11px' }}>{liked}</span>
          </button>
          <button onClick={() => setFilter('dislike')} style={{ background: filter === 'dislike' ? 'var(--surface-3)' : 'transparent', color: filter === 'dislike' ? 'var(--ink)' : 'var(--ink-3)', border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}>
            Disliked <span className="mono" style={{ opacity: 0.5, fontSize: '11px' }}>{disliked}</span>
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search responses..." style={{ background: 'var(--surface)', border: '1px solid var(--mauve)', color: 'var(--ink)', padding: '8px 16px 8px 32px', borderRadius: '99px', fontSize: '13px', width: '240px', outline: 'none' }} />
        </div>
      </div>

      {/* Feedback List */}
      <div style={{ marginTop: '32px', display: 'grid', gap: '24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gap: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }}></div>)}</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>No feedback found.</div>
        ) : (
          filteredFeedbacks.map((f, i) => {
            const isLike = f.verdict === 'like';
            return (
              <div key={i} className="card" style={{
                padding: '28px',
                borderRadius: '16px',
                background: 'transparent',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: isLike ? 'var(--ok)' : 'rgba(248, 113, 113, 0.6)' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingLeft: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ 
                      padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: isLike ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                      color: isLike ? 'var(--ok)' : 'var(--danger)',
                      border: isLike ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(248, 113, 113, 0.2)'
                    }}>
                      {isLike ? '👍 Liked' : '👎 Disliked'}
                    </div>
                    <div style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '11px', background: 'var(--surface-3)', color: 'var(--purple-hi)', border: '1px solid var(--mauve)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--purple-hi)' }}></div>
                      {f.session_id ? f.session_id.substring(0,8) : 'Unknown Session'}
                    </div>
                  </div>
                  <div className="mono faint" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {new Date(f.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(f.created_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', paddingLeft: '8px', marginBottom: '24px' }}>
                  <div style={{ color: 'var(--ink-4)', fontSize: '32px', fontFamily: 'serif', lineHeight: 1 }}>“</div>
                  <p dir="auto" style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'var(--ink-2)', whiteSpace: 'pre-wrap', paddingTop: '4px' }}>
                    {f.text}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '8px', paddingTop: '20px', borderTop: '1px solid var(--mauve-soft)' }}>
                  <div className="mono faint" style={{ fontSize: '10px', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    VOICE SESSION &nbsp; INSIGHT → TENSION → QUESTION
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'transparent', border: '1px solid var(--mauve)', color: 'var(--ink-3)', padding: '6px 12px', borderRadius: '6px', fontSize: '10px', fontFamily: 'var(--f-mono)', letterSpacing: '0.1em', cursor: 'pointer' }}>VIEW THREAD</button>
                    <button style={{ background: 'transparent', border: '1px solid var(--mauve)', color: 'var(--ink-3)', padding: '6px 12px', borderRadius: '6px', fontSize: '10px', fontFamily: 'var(--f-mono)', letterSpacing: '0.1em', cursor: 'pointer' }}>FLAG</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

window.FeedbackPage = FeedbackPage;
