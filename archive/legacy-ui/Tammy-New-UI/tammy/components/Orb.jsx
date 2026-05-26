// The Orb — Tammy's face.
// Translucent outer sphere on light lavender canvas, luminous smoke-like forms
// flowing inside. Pure SVG with animated filters + Bezier wisps.
// Props: size, state ('idle'|'listening'|'thinking'|'speaking'|'milestone'|'quiet'), hue override.

const Orb = ({ size = 220, state = 'idle', hueShift = 0 }) => {
  const id = React.useId().replace(/:/g, '');
  const breathe = state === 'speaking' ? '3s' : state === 'thinking' ? '7s' : '5.5s';
  const amplitude = state === 'speaking' ? 0.08 : state === 'thinking' ? 0.02 : 0.05;

  // Color per state — light-canvas-tuned
  const colorMap = {
    idle: { core: '#947DED', wisp: '#B08BE0', glow: '#6B5BC8' },
    listening: { core: '#947DED', wisp: '#947DED', glow: '#947DED' },
    thinking: { core: '#6B5BC8', wisp: '#947DED', glow: '#6B5BC8' },
    speaking: { core: '#A88FFF', wisp: '#C0ACFF', glow: '#947DED' },
    milestone: { core: '#947DED', wisp: '#C0ACFF', glow: '#947DED' },
    quiet: { core: '#3E3D40', wisp: '#8B8898', glow: '#3E3D40' },
  };
  const c = colorMap[state] || colorMap.idle;

  return (
    <div style={{
      width: size, height: size,
      position: 'relative',
      display: 'inline-block',
    }}>
      {/* Ambient pool of light */}
      <div style={{
        position: 'absolute', inset: '-20%',
        background: `radial-gradient(circle, ${c.glow}22 0%, transparent 60%)`,
        filter: 'blur(20px)',
        animation: `orb-breathe-bg ${breathe} ease-in-out infinite`,
      }} />
      <svg
        width={size} height={size}
        viewBox="0 0 200 200"
        style={{
          position: 'relative',
          filter: `drop-shadow(0 0 ${size * 0.2}px ${c.glow}66)`,
          animation: `orb-breathe ${breathe} ease-in-out infinite`,
        }}
      >
        <defs>
          {/* Glass sphere gradient */}
          <radialGradient id={`glass-${id}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="35%" stopColor={c.core} stopOpacity="0.15" />
            <stop offset="80%" stopColor={c.core} stopOpacity="0.05" />
            <stop offset="100%" stopColor={c.core} stopOpacity="0.25" />
          </radialGradient>

          {/* Inner wisp blur */}
          <filter id={`blur-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>

          {/* Turbulent wisp displacement */}
          <filter id={`displace-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed={state.length}>
              <animate attributeName="baseFrequency" dur="20s" values="0.012;0.018;0.012" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="12" />
          </filter>

          {/* Rim highlight */}
          <radialGradient id={`rim-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="90%" stopColor="transparent" />
            <stop offset="98%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          <clipPath id={`clip-${id}`}>
            <circle cx="100" cy="100" r="78" />
          </clipPath>
        </defs>

        {/* Outer atmospheric glow ring */}
        <circle cx="100" cy="100" r="80" fill={c.glow} opacity="0.06" />

        {/* Sphere body */}
        <circle cx="100" cy="100" r="78" fill={`url(#glass-${id})`} />

        {/* Interior wisps — clipped to sphere */}
        <g clipPath={`url(#clip-${id})`} filter={`url(#blur-${id})`}>
          <g filter={`url(#displace-${id})`}>
            <ellipse cx="90" cy="85" rx="45" ry="30" fill={c.wisp} opacity="0.55">
              <animate attributeName="cx" dur="14s" values="90;115;75;90" repeatCount="indefinite" />
              <animate attributeName="cy" dur="16s" values="85;95;80;85" repeatCount="indefinite" />
              <animate attributeName="rx" dur="12s" values="45;55;40;45" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="110" cy="115" rx="35" ry="25" fill={c.core} opacity="0.6">
              <animate attributeName="cx" dur="18s" values="110;85;120;110" repeatCount="indefinite" />
              <animate attributeName="cy" dur="13s" values="115;100;125;115" repeatCount="indefinite" />
              <animate attributeName="ry" dur="15s" values="25;35;22;25" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="100" cy="100" rx="30" ry="40" fill={c.wisp} opacity="0.45">
              <animate attributeName="cx" dur="19s" values="100;120;80;100" repeatCount="indefinite" />
              <animate attributeName="cy" dur="17s" values="100;115;90;100" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="40s" repeatCount="indefinite" />
            </ellipse>
          </g>
        </g>

        {/* Rim of glass */}
        <circle cx="100" cy="100" r="78" fill={`url(#rim-${id})`} />
        {/* Top specular */}
        <ellipse cx="78" cy="70" rx="22" ry="10" fill="#FFFFFF" opacity="0.3" transform="rotate(-20 78 70)" />
        <ellipse cx="82" cy="68" rx="8" ry="3" fill="#FFFFFF" opacity="0.55" transform="rotate(-20 82 68)" />
      </svg>
    </div>
  );
};

window.Orb = Orb;
