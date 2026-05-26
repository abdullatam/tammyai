// Tweaks panel — chat layout variants, plus extras (palette hints, orb state).
const TweaksPanel = ({ tweaks, setTweaks, visible }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 500,
      width: 280, padding: 20, borderRadius: 18,
      background: 'rgba(255, 253, 248, 0.92)',
      backdropFilter: 'blur(18px)',
      border: '1px solid rgba(178, 157, 217, 0.45)',
      boxShadow: '0 20px 60px rgba(31, 17, 56, 0.18)',
      fontFamily: 'var(--f-sans)',
    }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>
        Tweaks
      </div>

      <TLabel>Palette</TLabel>
      <TSeg v={tweaks.palette} on={v => setTweaks({ ...tweaks, palette: v })}
        opts={[['cool', 'cool lavender'], ['warmed', 'warmed mauve']]} />

      <TLabel>Chat layout</TLabel>
      <TSeg v={tweaks.chatLayout} on={v => setTweaks({ ...tweaks, chatLayout: v })}
        opts={[['prose', 'prose'], ['asymmetric', 'asym'], ['editorial', 'editorial']]} />

      <TLabel>Nav</TLabel>
      <TSeg v={tweaks.navVisible} on={v => setTweaks({ ...tweaks, navVisible: v })}
        opts={[[true, 'floating'], [false, 'hidden']]} />

      <TLabel>Orb state preview</TLabel>
      <TSeg v={tweaks.orbPreview} on={v => setTweaks({ ...tweaks, orbPreview: v })}
        opts={[['idle', 'idle'], ['listening', 'listen'], ['speaking', 'speak'], ['milestone', 'milestone']]} />
    </div>
  );
};
const TLabel = ({ children }) => <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '14px 0 6px' }}>{children}</div>;
const TSeg = ({ v, on, opts }) => (
  <div style={{ display: 'flex', gap: 3, background: 'var(--canvas-tint)', padding: 3, borderRadius: 9 }}>
    {opts.map(([val, l]) => (
      <button key={String(val)} onClick={() => on(val)} style={{
        flex: 1, padding: '6px 8px', fontSize: 11, border: 'none', borderRadius: 6,
        background: v === val ? 'var(--ivory)' : 'transparent',
        color: v === val ? 'var(--ink)' : 'var(--ink-3)',
        cursor: 'pointer', fontFamily: 'var(--f-sans)',
        boxShadow: v === val ? '0 1px 3px rgba(31,17,56,0.1)' : 'none',
      }}>{l}</button>
    ))}
  </div>
);
window.TweaksPanel = TweaksPanel;
