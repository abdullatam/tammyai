// BucketSwitcher — top-of-screen context switcher.
// Buckets are how the user compartmentalizes (Tammy AI vs Personal vs Consulting).
// Tammy's memory layer reads across all of them — surfaced as a quiet line below.

const Buckets = ({ active, onChange, showSignal = true }) => {
  const data = window.TammyData;
  const buckets = (data && data.buckets) || [];
  if (buckets.length === 0) return null;
  const activeBucket = buckets.find(b => b.id === active) || buckets[0];
  const isPersonal = activeBucket.kind === 'personal';
  const [activeSub, setActiveSub] = React.useState(null);

  return (
    <div style={{
      width: '100%',
      maxWidth: 1100,
      margin: '0 auto',
      padding: '24px 48px 0',
    }}>
      {/* Bucket pills row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        {buckets.map((b, i) => {
          const isActive = b.id === active;
          const isProject = b.kind === 'project';
          return (
            <React.Fragment key={b.id}>
              {/* Insert a faint divider between projects and personal */}
              {i > 0 && b.kind !== buckets[i - 1].kind && (
                <div style={{ width: 1, height: 28, background: 'var(--mauve-soft)', margin: '0 6px' }} />
              )}
              <button
                onClick={() => onChange && onChange(b.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 16px',
                  background: isActive ? 'var(--ink)' : 'transparent',
                  border: isActive ? '1px solid var(--ink)' : '1px solid var(--mauve-soft)',
                  borderRadius: 999,
                  color: isActive ? 'var(--canvas)' : 'var(--ink-2)',
                  cursor: 'pointer',
                  fontFamily: 'var(--f-sans)',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 200ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: isActive ? 'var(--canvas)' : (isProject ? 'var(--ink)' : 'var(--ink-3)'),
                  opacity: isActive ? 1 : 0.6,
                }} />
                <span>{b.label}</span>
                {isProject && b.open_decisions > 0 && (
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 999,
                    background: isActive ? 'rgba(255,255,255,0.18)' : 'var(--surface-2)',
                    color: isActive ? 'var(--canvas)' : 'var(--ink-3)',
                    fontWeight: 500, letterSpacing: 0,
                  }}>{b.open_decisions} open</span>
                )}
              </button>
            </React.Fragment>
          );
        })}

        <button style={{
          marginLeft: 4,
          width: 32, height: 32, borderRadius: '50%',
          border: '1px dashed var(--mauve)',
          background: 'transparent', color: 'var(--ink-3)',
          cursor: 'pointer', fontSize: 16, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} title="New bucket">+</button>
      </div>

      {/* Personal sub-areas — shown when Personal is active */}
      {isPersonal && activeBucket.sub_areas && (
        <div style={{
          marginTop: 14,
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          paddingLeft: 4,
        }}>
          <button
            onClick={() => setActiveSub(null)}
            style={subChipStyle(activeSub === null)}>
            All of personal
          </button>
          {activeBucket.sub_areas.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSub(s.id)}
              style={subChipStyle(activeSub === s.id)}>
              <span>{s.label}</span>
              <span style={{ opacity: 0.55, fontSize: 10, marginLeft: 6 }}>{s.signal}</span>
            </button>
          ))}
        </div>
      )}

      {/* Cross-bucket signal — proof Tammy sees across */}
      {showSignal && (
        <div style={{
          marginTop: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 12,
          background: 'transparent',
          border: '1px dashed var(--mauve-soft)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
               style={{ color: 'var(--ink-3)', flexShrink: 0 }}>
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="18" cy="18" r="2.5" />
            <path d="M8 8 Q14 8 14 14 Q14 16 16 16" />
          </svg>
          <span style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
            tammy reads across all of this. she'll cross the line when a pattern asks her to.
          </span>
        </div>
      )}
    </div>
  );
};

const subChipStyle = (active) => ({
  padding: '6px 12px',
  background: active ? 'var(--surface-2)' : 'transparent',
  border: active ? '1px solid var(--ink-2)' : '1px solid var(--mauve-soft)',
  borderRadius: 999,
  color: active ? 'var(--ink)' : 'var(--ink-3)',
  cursor: 'pointer',
  fontFamily: 'var(--f-sans)',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.02em',
  display: 'inline-flex',
  alignItems: 'center',
});

window.Buckets = Buckets;
