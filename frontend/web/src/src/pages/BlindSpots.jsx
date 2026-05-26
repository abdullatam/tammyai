// Blind Spots screen.

const { ScreenWrap, Eyebrow, H1, Sub, ScreenSkeleton, LockedGate } = window._ExtraShared;

const BlindSpotsScreen = () => {
  const [, rerender] = React.useState(0);
  React.useEffect(() => {
    const h = () => rerender(n => n + 1);
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  const D = window.TammyData;
  const bs = D.blindspots;

  if (bs === undefined || bs === null) return <ScreenWrap><ScreenSkeleton /></ScreenWrap>;
  if (bs.locked || (bs && !Array.isArray(bs) && bs.locked)) return <LockedBlindSpots />;

  const spots = Array.isArray(bs) ? bs : (bs.spots || []);
  const generatedAt = bs.generated_at || bs.week || 'this week';

  return (
    <ScreenWrap>
      <Eyebrow>Weekly scan · {typeof generatedAt === 'string' ? generatedAt : new Date(generatedAt * 1000).toLocaleDateString()}</Eyebrow>
      <H1>What I keep seeing</H1>
      <Sub>Patterns I noticed this week. With the actual quotes, so you can argue with me if I'm wrong.</Sub>

      {spots.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', fontSize: 15, color: 'var(--ink-3)', fontStyle: 'italic' }}>
          Tammy hasn't detected any clear patterns yet. Keep talking.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {spots.map((s, i) => (
            <div key={i} style={{ padding: 32, background: 'var(--surface)', border: s.severity === 'high' ? '1px solid var(--amber)' : '1px solid var(--mauve-soft)', boxShadow: s.severity === 'high' ? '0 0 0 4px var(--amber-soft)' : 'none', borderRadius: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, gap: 16 }}>
                <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: 0, letterSpacing: '-0.015em' }}>{s.title}</h2>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: s.severity === 'high' ? 'var(--amber)' : 'var(--ink-3)', whiteSpace: 'nowrap' }}>{s.pattern}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>Evidence</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(s.evidence || []).map((e, j) => (
                      <div key={j} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 12, alignItems: 'baseline' }}>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{e.date}</div>
                        <div className="serif" style={{ fontSize: 15, color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.5 }}>{e.quote}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>My reading</div>
                  <p className="serif" style={{ fontSize: 19, color: 'var(--ink)', lineHeight: 1.45, margin: 0 }}>{s.reading}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                    <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>You're right</button>
                    <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>You're wrong</button>
                    <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => { window.dispatchEvent(new CustomEvent('tammy:open_chat', { detail: null })); if (window.TammyNavigate) window.TammyNavigate('chat'); }}>Talk about it</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScreenWrap>
  );
};

window.BlindSpotsScreen = BlindSpotsScreen;
