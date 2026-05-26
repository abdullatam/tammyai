const { useState, useEffect, useCallback } = React;

const HealthPage = () => {
  const [healthData, setHealthData] = useState(null);
  const [lastChecked, setLastChecked] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);

  const REFRESH_MS = 30000;

  const fetchHealth = useCallback(async () => {
    setBusy(true);
    try {
      const [svcRes, dbRes, pcRes, llmRes, errRes, redisRes] = await Promise.all([
        window.AdminAPI._fetch('/admin/api/health/services').catch(() => null),
        window.AdminAPI._fetch('/admin/api/health/mongodb').catch(() => null),
        window.AdminAPI._fetch('/admin/api/health/pinecone').catch(() => null),
        window.AdminAPI._fetch('/admin/api/health/llm').catch(() => null),
        window.AdminAPI._fetch('/admin/api/health/errors').catch(() => []),
        window.AdminAPI._fetch('/admin/api/health/redis').catch(() => null)
      ]);
      setHealthData({
        services: svcRes?.services || [],
        uptime: svcRes?.uptime || '—',
        overallUptime: svcRes?.overallUptime || '—',
        mongodb: dbRes || null,
        pinecone: pcRes || null,
        redis: redisRes || null,
        llm: llmRes || null,
        errors: errRes || []
      });
      setLastChecked(Date.now());
    } catch (e) {
      console.error("Health fetch failed", e);
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  useEffect(() => {
    if (now - lastChecked >= REFRESH_MS && !busy) {
      fetchHealth();
    }
  }, [now, lastChecked, busy, fetchHealth]);

  const remaining = Math.max(0, REFRESH_MS - (now - lastChecked));
  const remSec = Math.ceil(remaining / 1000);
  const ringC = 2 * Math.PI * 9;
  const dashOffset = (1 - remaining / REFRESH_MS) * ringC;

  const ageSec = Math.floor((now - lastChecked) / 1000);
  const ageStr = ageSec < 60 
    ? `${ageSec} second${ageSec === 1 ? '' : 's'} ago` 
    : `${Math.floor(ageSec / 60)} minute${Math.floor(ageSec/60) === 1 ? '' : 's'} ago`;

  // Process banner state
  let bad = 0, warn = 0;
  if (healthData?.services) {
    healthData.services.forEach(s => {
      if (s.status === 'bad') bad++;
      else if (s.status === 'warn') warn++;
    });
  }
  let bannerClass = "banner ok";
  let bannerTitle = "All systems operational";
  let bannerMark = "✓";
  if (bad > 0) {
    bannerClass = "banner critical";
    bannerTitle = `Critical — <em>${bad}</em> service${bad>1?'s':''} down · immediate attention`;
    bannerMark = "!";
  } else if (warn > 0) {
    bannerClass = "banner degraded";
    bannerTitle = `Degraded — <em>${warn}</em> service${warn>1?'s':''} need attention`;
    bannerMark = "~";
  }

  return (
    <>
      <style>{`
  /* ──────────────────────────────────────────────
     Tammy admin — same DNA + fonts as the consumer app.
     Two modes: light paper (default) and purple-night. */
  :root,
  html[data-theme="light"] {
    --canvas:        #FFFFFF;
    --canvas-tint:   #F6F3FF;
    --surface:       #FFFFFF;
    --surface-2:     #F0EAFF;
    --surface-3:     #E8DFFB;

    --ink:           #1F1C30;
    --ink-2:         #3E3D40;
    --ink-3:         rgba(31,28,48,0.55);
    --mauve:         rgba(31,28,48,0.18);
    --mauve-soft:    rgba(31,28,48,0.07);

    --amber:         #947DED;
    --amber-hi:      #C0ACFF;
    --amber-soft:    rgba(148,125,237,0.14);
    --amber-glow:    rgba(148,125,237,0.38);
    --iris-deep:     #6B5BC8;

    --atm-grad-1:    rgba(192,172,255,0.32);
    --atm-grad-2:    rgba(148,125,237,0.18);
    --chrome-bg:     rgba(255,255,255,0.72);

    /* Status palette — tuned for light canvas */
    --ok:            #5E9577;
    --ok-soft:       rgba(94,149,119,0.14);
    --ok-glow:       rgba(94,149,119,0.45);
    --warn:          #C77F2E;
    --warn-soft:     rgba(199,127,46,0.14);
    --warn-glow:     rgba(199,127,46,0.45);
    --bad:           #B95A3D;
    --bad-soft:      rgba(185,90,61,0.14);
    --bad-glow:      rgba(185,90,61,0.45);
  }

  html[data-theme="purple"] {
    --canvas:        #1F1C30;
    --canvas-tint:   #262339;
    --surface:       #2A2740;
    --surface-2:     #332F4A;
    --surface-3:     #3B3756;

    --ink:           #F2EDFF;
    --ink-2:         rgba(242,237,255,0.78);
    --ink-3:         rgba(242,237,255,0.50);
    --mauve:         rgba(242,237,255,0.20);
    --mauve-soft:    rgba(242,237,255,0.08);

    --amber:         #C0ACFF;
    --amber-hi:      #E0D2FF;
    --amber-soft:    rgba(192,172,255,0.16);
    --amber-glow:    rgba(192,172,255,0.45);
    --iris-deep:     #C0ACFF;

    --atm-grad-1:    rgba(192,172,255,0.18);
    --atm-grad-2:    rgba(107,91,200,0.28);
    --chrome-bg:     rgba(31,28,48,0.72);

    /* Status — slightly brighter on dark */
    --ok:            #8FCFA8;
    --ok-soft:       rgba(143,207,168,0.16);
    --ok-glow:       rgba(143,207,168,0.55);
    --warn:          #E8A24B;
    --warn-soft:     rgba(232,162,75,0.16);
    --warn-glow:     rgba(232,162,75,0.55);
    --bad:           #D97757;
    --bad-soft:      rgba(217,119,87,0.18);
    --bad-glow:      rgba(217,119,87,0.55);
  }

  :root {

    --f-sans:  'Inter', -apple-system, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif;
    --f-serif: 'Inter', -apple-system, system-ui, sans-serif;
    --f-mono:  'IBM Plex Mono', ui-monospace, 'SF Mono', monospace;

    --r-sm: 10px; --r-md: 16px; --r-lg: 24px; --r-xl: 32px;
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--canvas); color: var(--ink); font-family: var(--f-sans); }

  body {
    min-height: 100vh;
    background:
      radial-gradient(1000px 700px at 88% 8%, var(--atm-grad-1), transparent 60%),
      radial-gradient(700px 500px at 12% 100%, var(--atm-grad-2), transparent 60%),
      linear-gradient(180deg, var(--canvas) 0%, var(--canvas-tint) 100%);
    font-size: 15px; line-height: 1.55;
    letter-spacing: -0.005em;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    transition: background 600ms cubic-bezier(0.32,0.72,0.24,1);
  }
  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.12 0 0 0 0 0.11 0 0 0 0 0.19 0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
    opacity: 0.04; mix-blend-mode: multiply;
  }

  /* ────────── Admin chrome ────────── */
  .admin-chrome {
    position: fixed; left: 0; right: 0; top: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 32px;
    background: var(--chrome-bg);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--mauve-soft);
  }
  /* Light/Purple mode toggle */
  .mode-toggle {
    display: inline-flex; align-items: center;
    background: var(--surface);
    border: 1px solid var(--mauve-soft);
    border-radius: 999px;
    padding: 3px;
    margin-right: 14px;
  }
  .mode-toggle button {
    padding: 6px 12px;
    border: none; background: transparent;
    border-radius: 999px;
    font-family: var(--f-mono);
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--ink-3);
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 180ms ease;
  }
  .mode-toggle button[aria-pressed="true"] {
    background: var(--ink); color: var(--canvas);
  }
  .mode-toggle .swatch {
    width: 8px; height: 8px; border-radius: 50%;
  }
  .mode-toggle .swatch.light  { background: linear-gradient(135deg, #FFFFFF 0%, #C0ACFF 100%); border: 1px solid var(--mauve); }
  .mode-toggle .swatch.purple { background: linear-gradient(135deg, #C0ACFF, #6B5BC8); }
  .crumb {
    display: inline-flex; align-items: center; gap: 14px;
    font-family: var(--f-mono); font-size: 11px;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--ink-3);
  }
  .crumb .brand {
    display: inline-flex; align-items: center; gap: 10px; color: var(--ink);
  }
  .crumb .orb {
    width: 12px; height: 12px; border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #FFFFFF, #C0ACFF 30%, #947DED 65%, #6B5BC8 100%);
    box-shadow: 0 0 12px var(--amber-glow);
    animation: orbBreathe 4.5s cubic-bezier(0.32,0.72,0.24,1) infinite;
  }
  .crumb .sep { color: var(--ink-3); opacity: 0.5; }
  .crumb .here { color: var(--ink); }
  .who {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--f-mono); font-size: 11px;
    color: var(--ink-3); letter-spacing: 0.14em; text-transform: uppercase;
  }
  .who .avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: linear-gradient(135deg, var(--ink), var(--amber));
    color: var(--canvas);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--f-sans); font-weight: 500; font-size: 13px;
  }
  @keyframes orbBreathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.12); }
  }



  /* Refresh button */
  .refresh {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 10px 14px 10px 12px;
    background: var(--surface);
    border: 1px solid var(--mauve);
    border-radius: var(--r-md);
    color: var(--ink);
    cursor: pointer;
    font-family: var(--f-mono); font-size: 11px;
    letter-spacing: 0.18em; text-transform: uppercase;
    transition: all 180ms cubic-bezier(0.32,0.72,0.24,1);
  }
  .refresh:hover {
    background: var(--surface-2); border-color: var(--amber);
  }
  .refresh.busy svg { animation: spin 700ms linear infinite; }
  .refresh .ring {
    width: 22px; height: 22px; position: relative; flex-shrink: 0;
  }
  .refresh .ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .refresh .ring circle.track { fill: none; stroke: var(--mauve); stroke-width: 1.5; }
  .refresh .ring circle.bar { fill: none; stroke: var(--amber); stroke-width: 1.5;
    stroke-dasharray: 56.5; stroke-dashoffset: 0;
    transition: stroke-dashoffset 1s linear;
  }
  .refresh .ring .count {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: var(--f-mono); font-size: 8px; color: var(--ink-2);
    letter-spacing: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* ────────── Status banner ────────── */
  .banner {
    position: relative;
    padding: 20px 24px;
    border-radius: var(--r-lg);
    margin-bottom: 36px;
    display: flex; align-items: center; gap: 18px;
    border: 1px solid var(--mauve-soft);
    background: var(--surface);
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(31,28,48,0.06);
  }
  .banner.ok      { background: linear-gradient(90deg, var(--ok-soft) 0%, var(--surface) 60%); border-color: rgba(94,149,119,0.30); }
  .banner.degraded{ background: linear-gradient(90deg, var(--warn-soft) 0%, var(--surface) 60%); border-color: rgba(199,127,46,0.32); }
  .banner.critical{ background: linear-gradient(90deg, var(--bad-soft) 0%, var(--surface) 60%); border-color: rgba(185,90,61,0.42); }

  .banner .mark {
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-family: var(--f-sans); font-weight: 600;
    font-size: 20px;
  }
  .banner.ok .mark      { background: var(--ok); color: var(--canvas); box-shadow: 0 0 22px var(--ok-glow); }
  .banner.degraded .mark{ background: var(--warn); color: var(--canvas); box-shadow: 0 0 22px var(--warn-glow); }
  .banner.critical .mark{ background: var(--bad); color: var(--canvas); box-shadow: 0 0 22px var(--bad-glow); }

  .banner .label {
    font-family: var(--f-mono); font-size: 10px;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--ink-3); margin-bottom: 4px;
  }
  .banner .title {
    font-family: var(--f-sans); font-weight: 500;
    font-size: 22px; color: var(--ink); letter-spacing: -0.01em;
  }
  .banner.degraded .title em,
  .banner.critical .title em { font-style: normal; color: var(--warn); font-weight: 600; }
  .banner.critical .title em { color: var(--bad); }

  .banner .uptime {
    margin-left: auto;
    text-align: right;
  }
  .banner .uptime .n {
    font-family: var(--f-sans); font-weight: 500;
    font-size: 32px; line-height: 1; letter-spacing: -0.02em;
    color: var(--ink);
  }
  .banner .uptime .l {
    font-family: var(--f-mono); font-size: 10px;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--ink-3); margin-top: 6px;
  }

  /* ────────── Section heading ────────── */
  .section-h {
    display: flex; align-items: baseline; justify-content: space-between;
    margin: 40px 0 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--mauve-soft);
  }
  .section-h h2 {
    font-family: var(--f-sans); font-weight: 500;
    font-size: 18px; letter-spacing: -0.01em;
    margin: 0; color: var(--ink);
  }
  .section-h .h-meta {
    font-family: var(--f-mono); font-size: 10px;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--ink-3);
  }

  /* ────────── Service grid ────────── */
  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
  @media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 720px)  { .grid { grid-template-columns: 1fr; } }

  .svc {
    position: relative;
    padding: 20px 22px;
    background: var(--surface);
    border: 1px solid var(--mauve-soft);
    border-radius: var(--r-lg);
    box-shadow: 0 4px 14px rgba(31,28,48,0.04);
    transition: all 220ms cubic-bezier(0.32,0.72,0.24,1);
  }
  .svc:hover { border-color: var(--mauve); transform: translateY(-2px); box-shadow: 0 12px 30px rgba(31,28,48,0.08); }

  .svc .row1 {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
    margin-bottom: 12px;
  }
  .svc .name {
    font-family: var(--f-sans); font-weight: 600;
    font-size: 15px; color: var(--ink); letter-spacing: -0.005em;
    margin-bottom: 2px;
  }
  .svc .provider {
    font-family: var(--f-mono); font-size: 10px;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--ink-3);
  }
  .svc .stat {
    display: inline-flex; align-items: center; gap: 8px;
    flex-shrink: 0;
  }
  .stat-dot {
    width: 8px; height: 8px; border-radius: 50%;
    position: relative; flex-shrink: 0;
  }
  .stat-dot.ok   { background: var(--ok);   box-shadow: 0 0 10px var(--ok-glow); }
  .stat-dot.warn { background: var(--warn); box-shadow: 0 0 10px var(--warn-glow); }
  .stat-dot.bad  { background: var(--bad);  box-shadow: 0 0 10px var(--bad-glow); }
  .stat-dot.checking::after {
    content: ''; position: absolute; inset: -4px;
    border-radius: 50%; border: 1px solid currentColor;
    color: var(--amber);
    animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
    opacity: 0;
  }
  @keyframes ping {
    0% { transform: scale(0.6); opacity: 0.8; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  .stat .label {
    font-family: var(--f-mono); font-size: 10px;
    letter-spacing: 0.18em; text-transform: uppercase;
  }
  .stat-dot.ok + .label   { color: var(--ok); }
  .stat-dot.warn + .label { color: var(--warn); }
  .stat-dot.bad + .label  { color: var(--bad); }

  .svc .row2 {
    display: flex; align-items: baseline; justify-content: space-between;
    padding-top: 14px;
    border-top: 1px dashed var(--mauve-soft);
  }
  .svc .ms {
    font-family: var(--f-mono); font-weight: 500;
    font-size: 22px; color: var(--ink); letter-spacing: -0.01em;
  }
  .svc .ms .u {
    font-size: 11px; color: var(--ink-3); margin-left: 2px;
    letter-spacing: 0.05em;
  }
  .svc .age {
    font-family: var(--f-mono); font-size: 10px;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--ink-3);
  }
  .svc.bad-svc  { border-color: rgba(185,90,61,0.32); background: linear-gradient(180deg, var(--surface) 0%, var(--bad-soft) 100%); }
  .svc.warn-svc { border-color: rgba(199,127,46,0.32); }

  /* tiny sparkline */
  .spark { display: flex; align-items: flex-end; gap: 2px; height: 18px; margin-top: 10px; }
  .spark span {
    width: 4px; background: var(--mauve);
    border-radius: 1px;
  }

  /* ────────── DB details ────────── */
  .db-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  }
  @media (max-width: 900px) { .db-grid { grid-template-columns: 1fr; } }
  .db {
    padding: 22px;
    background: var(--surface);
    border: 1px solid var(--mauve-soft);
    border-radius: var(--r-lg);
    box-shadow: 0 4px 14px rgba(31,28,48,0.04);
  }
  .db .head {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 14px; margin-bottom: 14px;
    border-bottom: 1px solid var(--mauve-soft);
  }
  .db .head .name {
    font-family: var(--f-sans); font-weight: 600; font-size: 16px;
    color: var(--ink); display: flex; align-items: center; gap: 10px;
  }
  .db .row {
    display: flex; align-items: baseline; justify-content: space-between;
    padding: 9px 0; font-family: var(--f-mono);
    border-bottom: 1px dashed var(--mauve-soft);
  }
  .db .row:last-child { border-bottom: none; }
  .db .row .k {
    font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--ink-3);
  }
  .db .row .v {
    font-size: 13px; color: var(--ink); font-weight: 500;
  }
  .db .row .v em { font-style: normal; color: var(--ink-3); font-weight: 400; }

  /* ────────── LLM chain (WOW DESIGN) ────────── */
  .chain {
    position: relative;
    padding: 30px 0 60px;
    display: grid;
    grid-template-columns: 1fr 60px 1fr 60px 1fr;
    align-items: center;
  }
  @media (max-width: 720px) { 
    .chain { grid-template-columns: 1fr; padding: 20px 0 60px; gap: 40px; }
    .chain .connector { transform: rotate(90deg); height: 80px; } 
  }

  .llm {
    position: relative;
    padding: 28px;
    background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid var(--mauve-soft);
    border-radius: var(--r-lg);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.1);
    transition: all 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
    overflow: hidden;
  }
  
  .llm::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(circle at top left, var(--amber-soft), transparent 50%);
    opacity: 0; transition: opacity 400ms ease;
  }

  .llm.active {
    border: 1px solid var(--ok);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px var(--ok), 0 12px 40px rgba(143, 207, 168, 0.25), 0 0 20px rgba(143, 207, 168, 0.2);
    transform: translateY(-4px);
    background: linear-gradient(145deg, rgba(143, 207, 168, 0.08) 0%, rgba(255,255,255,0.01) 100%);
  }
  .llm.active::before {
    background: radial-gradient(circle at top left, var(--ok-soft), transparent 70%);
    opacity: 1;
  }

  .llm .tier {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--f-mono); font-size: 10px;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--ink-3); margin-bottom: 16px;
  }
  .llm.active .tier { color: var(--ok); font-weight: 500; }
  .llm.active .tier::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%;
    background: var(--ok); box-shadow: 0 0 10px var(--ok-glow);
  }
  
  .llm .name {
    font-family: var(--f-sans); font-weight: 600; font-size: 20px;
    color: var(--ink); letter-spacing: -0.01em; margin-bottom: 24px;
  }
  .llm .row {
    display: flex; justify-content: space-between; align-items: baseline;
    font-family: var(--f-mono); font-size: 11px;
    padding: 10px 0;
    border-bottom: 1px dashed rgba(255,255,255,0.06);
  }
  .llm .row:last-child { border-bottom: none; padding-bottom: 0; }
  .llm .row .k { color: var(--ink-3); letter-spacing: 0.1em; text-transform: uppercase; }
  .llm .row .v { color: var(--ink); font-weight: 500; }
  
  .chain .connector {
    position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 2px;
  }
  .chain .connector svg { width: 100%; height: 40px; overflow: visible; position: absolute; top: 50%; transform: translateY(-50%); }
  .chain .connector path.line {
    fill: none; stroke: var(--mauve-soft); stroke-width: 2; stroke-dasharray: 4 6;
  }
  .chain .connector path.pulse {
    fill: none; stroke: var(--ok); stroke-width: 3;
    filter: drop-shadow(0 0 6px var(--ok));
    stroke-dasharray: 20 120;
    animation: flowPulse 1.5s linear infinite;
  }
  @keyframes flowPulse {
    0% { stroke-dashoffset: 140; }
    100% { stroke-dashoffset: 0; }
  }

  .chain .using {
    position: absolute;
    bottom: 0; left: 50%; transform: translateX(-50%);
    padding: 10px 24px;
    background: var(--surface);
    backdrop-filter: blur(12px);
    border: 1px solid var(--mauve);
    border-radius: 999px;
    font-family: var(--f-mono); font-size: 11px;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--ink-2); text-align: center;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    white-space: nowrap; z-index: 10;
  }
  .chain .using strong { color: var(--ok); font-weight: 600; text-shadow: 0 0 10px var(--ok-soft); }

  /* ────────── Error log ────────── */
  .log {
    background: var(--surface);
    border: 1px solid var(--mauve-soft);
    border-radius: var(--r-lg);
    box-shadow: 0 4px 14px rgba(31,28,48,0.04);
    overflow: hidden;
  }
  .log .empty {
    padding: 32px 24px;
    text-align: center;
    color: var(--ok);
    font-family: var(--f-mono); font-size: 11px;
    letter-spacing: 0.18em; text-transform: uppercase;
    display: flex; align-items: center; justify-content: center; gap: 12px;
  }
  .log .empty .pin {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--ok); box-shadow: 0 0 10px var(--ok-glow);
    animation: pulse 2s ease-in-out infinite;
  }
  .err {
    display: grid;
    grid-template-columns: 140px 160px 1fr;
    gap: 20px; align-items: baseline;
    padding: 12px 18px 12px 14px;
    border-bottom: 1px solid var(--mauve-soft);
    border-left: 2px solid var(--bad);
    transition: background 180ms ease;
  }
  .err:hover { background: var(--surface-2); }
  .err:last-child { border-bottom: none; }
  .err .when { font-family: var(--f-mono); font-size: 11px; color: var(--ink-3); }
  .err .svc-name { font-family: var(--f-mono); font-size: 11px; color: var(--ink-2); letter-spacing: 0.06em; }
  .err .msg { font-family: var(--f-sans); font-size: 13px; color: var(--ink-2); line-height: 1.5;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .err .msg strong { color: var(--bad); font-weight: 500; }
  @media (max-width: 720px) {
    .err { grid-template-columns: 1fr; gap: 6px; }
  }

  /* utility */
  .num { font-variant-numeric: tabular-nums; }
`}</style>
      <div className="page health-page">
        
        {/* Header */}
        <TopHeader
          eyebrow="ADMIN: HEALTH"
          title="System Health"
          subtitle={<>Monitor all microservices, databases, and fallback LLM chains. &nbsp;<span style={{opacity:0.5}}>·</span>&nbsp; last checked <span className="num">{ageStr}</span> &nbsp;<span style={{opacity:0.5}}>·</span>&nbsp; uptime <span className="num">{healthData?.uptime || '—'}</span></>}
          actions={
            <button className={`refresh ${busy ? 'busy' : ''}`} onClick={fetchHealth}>
              <span className="ring" aria-hidden="true">
                <svg viewBox="0 0 22 22">
                  <circle className="track" cx="11" cy="11" r="9" />
                  <circle className="bar" cx="11" cy="11" r="9" style={{ strokeDashoffset: dashOffset }} />
                </svg>
                <span className="count">{remSec}</span>
              </span>
              <span>Refresh</span>
            </button>
          }
        />

        {/* Status banner */}
        <div className={bannerClass}>
          <div className="mark">{bannerMark}</div>
          <div>
            <div className="label">overall</div>
            <div className="title" dangerouslySetInnerHTML={{__html: bannerTitle}}></div>
          </div>
          <div className="uptime">
            <div className="n num">{healthData?.overallUptime || '99.97%'}</div>
            <div className="l">30-day uptime</div>
          </div>
        </div>

        {/* Service grid */}
        <div className="section-h">
          <h2>Services</h2>
          <span className="h-meta">{healthData?.services?.length || 0} monitored · checked every 30s</span>
        </div>
        <div className="grid">
          {(healthData?.services || []).map(s => (
            <div key={s.id} className={`svc ${s.status === 'bad' ? 'bad-svc' : s.status === 'warn' ? 'warn-svc' : ''}`}>
              <div className="row1">
                <div>
                  <div className="name">{s.name}</div>
                  <div className="provider">{s.provider}</div>
                </div>
                <div className="stat">
                  <span className={`stat-dot ${s.status} ${busy ? 'checking' : ''}`} aria-hidden="true"></span>
                  <span className="label">{s.status === 'ok' ? 'operational' : s.status === 'warn' ? 'degraded' : 'down'}</span>
                </div>
              </div>
              <div className="row2">
                <div className="ms num">{s.ms}<span className="u">ms</span></div>
                <div className="age">{s.ageStr}</div>
              </div>
              <div className="spark" aria-hidden="true">
                {(s.spark || []).map((h, i) => (
                  <span key={i} style={{ height: h + '%', background: s.status === 'ok' ? 'var(--ok)' : s.status === 'warn' ? 'var(--warn)' : 'var(--bad)', opacity: 0.4 + (i%5)*0.1 }}></span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Database */}
        <div className="section-h">
          <h2>Database stores</h2>
          <span className="h-meta">live counters</span>
        </div>
        <div className="db-grid">
          <div className="db">
            <div className="head">
              <div className="name">
                <span className={`stat-dot ${healthData?.mongodb?.status || 'ok'}`} aria-hidden="true"></span>
                MongoDB Atlas
              </div>
              <span className="h-meta">Primary DB</span>
            </div>
            <div className="row"><span className="k">Connection</span><span className="v"><span className="num">{healthData?.mongodb?.connOpen || 0}</span> open / <em>{healthData?.mongodb?.connPool || 200} pool</em></span></div>
            <div className="row"><span className="k">Collections</span><span className="v num">{healthData?.mongodb?.collections || 0}</span></div>
            <div className="row"><span className="k">Documents</span><span className="v num">{Number(healthData?.mongodb?.documents || 0).toLocaleString()}</span></div>
            <div className="row"><span className="k">Storage</span><span className="v"><span className="num">{healthData?.mongodb?.storageGB || 0}</span> GB <em>/ 50 GB</em></span></div>
            <div className="row"><span className="k">Slowest query (1h)</span><span className="v"><span className="num">{healthData?.mongodb?.slowestMs || 0}</span>ms <em>· {healthData?.mongodb?.slowestOp || 'none'}</em></span></div>
          </div>
          <div className="db">
            <div className="head">
              <div className="name">
                <span className={`stat-dot ${healthData?.pinecone?.status || 'ok'}`} aria-hidden="true"></span>
                Pinecone
              </div>
              <span className="h-meta">Vector memory</span>
            </div>
            <div className="row"><span className="k">tammy-memories</span><span className="v"><span className="num">{Number(healthData?.pinecone?.memoriesVec || 0).toLocaleString()}</span> vectors <em>· {healthData?.pinecone?.memoriesAge || 'n/a'}</em></span></div>
            <div className="row"><span className="k">tammy-books</span><span className="v"><span className="num">{Number(healthData?.pinecone?.booksVec || 0).toLocaleString()}</span> vectors</span></div>
            <div className="row"><span className="k">Index dim</span><span className="v num">{healthData?.pinecone?.dim || 1536}</span></div>
            <div className="row"><span className="k">Query latency (avg)</span><span className="v"><span className="num">{healthData?.pinecone?.latencyMs || 0}</span>ms</span></div>
            <div className="row"><span className="k">Top-K p95</span><span className="v"><span className="num">{healthData?.pinecone?.p95Ms || 0}</span>ms</span></div>
          </div>
          <div className="db">
            <div className="head">
              <div className="name">
                <span className={`stat-dot ${healthData?.redis?.status || 'ok'}`} aria-hidden="true"></span>
                Redis Cloud
              </div>
              <span className="h-meta">Short-term cache</span>
            </div>
            <div className="row"><span className="k">Memory usage</span><span className="v"><span className="num">{healthData?.redis?.usedMemory || '0B'}</span> <em>/ {healthData?.redis?.maxMemory || 'Unlimited'}</em></span></div>
            <div className="row"><span className="k">Connected clients</span><span className="v num">{healthData?.redis?.clients || 0}</span></div>
            <div className="row"><span className="k">Keyspace hits</span><span className="v num">{Number(healthData?.redis?.keyspaceHits || 0).toLocaleString()}</span></div>
            <div className="row"><span className="k">Keyspace misses</span><span className="v num">{Number(healthData?.redis?.keyspaceMisses || 0).toLocaleString()}</span></div>
            <div className="row"><span className="k">Hit rate</span><span className="v num">{
              healthData?.redis?.keyspaceHits && (healthData.redis.keyspaceHits + (healthData.redis.keyspaceMisses || 0)) > 0 
              ? Math.round((healthData.redis.keyspaceHits / (healthData.redis.keyspaceHits + (healthData.redis.keyspaceMisses || 0))) * 100) 
              : 0
            }%</span></div>
          </div>
        </div>

        {/* LLM chain */}
        <div className="section-h">
          <h2>LLM fallback chain</h2>
          <span className="h-meta" id="chainBadge">{healthData?.llm?.activeTier || 'primary active'}</span>
        </div>
        <div className="chain">
          <div className={`llm ${(!healthData?.llm?.activeTier || healthData.llm.activeTier.includes('primary')) ? 'active' : ''}`}>
            <div className="tier">primary cluster</div>
            <div className="name">Anthropic · {healthData?.llm?.primaryName || 'Claude Sonnet'}</div>
            <div className="row"><span className="k">status</span>
              <span className="v" style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                <span className={`stat-dot ${healthData?.llm?.primaryStatus || 'ok'}`}></span><span className="num">{healthData?.llm?.primaryMs || 0}</span>ms
              </span>
            </div>
            <div className="row"><span className="k">requests · 1h</span><span className="v num">{Number(healthData?.llm?.primaryReqs || 0).toLocaleString()}</span></div>
            <div className="row"><span className="k">rate limit</span><span className="v"><span className="num">{healthData?.llm?.primaryLimitPct || 0}</span>% used</span></div>
          </div>

          <div className="connector" aria-hidden="true">
            <svg viewBox="0 0 140 40" preserveAspectRatio="none">
              <path className="line" d="M 0 20 L 140 20" />
              <path className="pulse" d="M 0 20 L 140 20" />
            </svg>
          </div>

          <div className={`llm ${healthData?.llm?.activeTier === 'fallback' || healthData?.llm?.activeTier === 'fallback_1' ? 'active' : ''}`}>
            <div className="tier">fallback 1</div>
            <div className="name">OpenAI · {healthData?.llm?.fallback1Name || 'gpt-4o-mini'}</div>
            <div className="row"><span className="k">status</span>
              <span className="v" style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                <span className={`stat-dot ${healthData?.llm?.fallback1Status || 'ok'}`}></span><span className="num">{healthData?.llm?.fallback1Ms || 142}</span>ms
              </span>
            </div>
            <div className="row"><span className="k">requests · 1h</span><span className="v num">{Number(healthData?.llm?.fallback1Reqs || 0).toLocaleString()}</span></div>
            <div className="row"><span className="k">last triggered</span><span className="v"><em>{healthData?.llm?.fallback1LastTriggered || healthData?.llm?.fallbackLastTriggered || 'n/a'}</em></span></div>
          </div>

          <div className="connector" aria-hidden="true">
            <svg viewBox="0 0 140 40" preserveAspectRatio="none">
              <path className="line" d="M 0 20 L 140 20" />
              <path className="pulse" d="M 0 20 L 140 20" />
            </svg>
          </div>

          <div className={`llm ${healthData?.llm?.activeTier === 'fallback_2' ? 'active' : ''}`}>
            <div className="tier">fallback 2</div>
            <div className="name">Gemini · {healthData?.llm?.fallback2Name || 'gemini-1.5-flash'}</div>
            <div className="row"><span className="k">status</span>
              <span className="v" style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                <span className={`stat-dot ${healthData?.llm?.fallback2Status || 'ok'}`}></span><span className="num">{healthData?.llm?.fallback2Ms || 120}</span>ms
              </span>
            </div>
            <div className="row"><span className="k">requests · 1h</span><span className="v num">{Number(healthData?.llm?.fallback2Reqs || 0).toLocaleString()}</span></div>
            <div className="row"><span className="k">last triggered</span><span className="v"><em>{healthData?.llm?.fallback2LastTriggered || 'n/a'}</em></span></div>
          </div>

          <div className="using" dangerouslySetInnerHTML={{__html: healthData?.llm?.routingMsg || 'currently routing through <strong>primary</strong> · fallback healthy and ready'}} />
        </div>

        {/* Error log */}
        <div className="section-h">
          <h2>Recent errors</h2>
          <span className="h-meta">last 24 h</span>
        </div>
        <div className="log">
          {!healthData?.errors?.length ? (
            <div className="empty"><span className="pin"></span>no errors in the last 24 hours</div>
          ) : (
            healthData.errors.map((e, i) => (
              <div key={i} className="err">
                <span className="when">{e.when}</span>
                <span className="svc-name">{e.svc}</span>
                <span className="msg" dangerouslySetInnerHTML={{__html: e.msg}}></span>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
};
window.HealthPage = HealthPage;
