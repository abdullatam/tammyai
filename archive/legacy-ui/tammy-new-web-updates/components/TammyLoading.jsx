// Tammy Loading splash — switches with active theme via CSS vars.
// 2 sec max display, fades out 400ms. Orb breathes 5s cycle. No spinner.

const TammyLoading = ({ visible = true }) => {
  const [show, setShow] = React.useState(visible);
  const [fade, setFade] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      setFade(true);
      const t = setTimeout(() => setShow(false), 420);
      return () => clearTimeout(t);
    } else {
      setShow(true);
      setFade(false);
    }
  }, [visible]);

  if (!show) return null;

  // Detect theme from current palette token (--canvas)
  const isLight = (() => {
    if (typeof window === 'undefined') return false;
    const c = getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();
    return c.startsWith('#FFF') || c.startsWith('#F') || c.startsWith('#E');
  })();

  const bg = isLight ? '#F2EBDC' : '#0E0817';
  const ink = isLight ? '#0E0817' : '#F2EBDC';
  const muted = isLight ? 'rgba(14, 8, 23, 0.55)' : 'rgba(242, 235, 220, 0.55)';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fade ? 0 : 1,
      transition: 'opacity 400ms ease',
      pointerEvents: fade ? 'none' : 'auto',
    }}>
      <div style={{
        width: 140, height: 140,
        animation: 'tloadBreathe 5s ease-in-out infinite',
      }}>
        <Orb size={140} state="idle" theme={isLight ? 'iris' : 'amber'} />
      </div>
      <div className="serif" style={{
        marginTop: 40,
        fontSize: 32,
        color: ink,
        letterSpacing: '-0.01em',
      }}>
        tammy<span style={{ opacity: 0.4 }}>.</span>
      </div>
      <div style={{
        marginTop: 12,
        fontSize: 14,
        color: muted,
        fontFamily: 'var(--f-sans)',
      }}>
        she remembers everything
      </div>

      <style>{`
        @keyframes tloadBreathe {
          0%, 100% { transform: scale(0.95); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

window.TammyLoading = TammyLoading;
