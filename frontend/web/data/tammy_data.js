const API = 'http://localhost:7861';
window.TAMMY_API = API;  // global reference for all screens

const _emptyTammyData = () => ({
  user: { name: '', initial: '?' },
  greeting: { phrase: 'hey.', hero_line: "what's on your chest?" },
  recent_sessions: [], decisions: [], emotional_arc: [],
  arc_stats: {}, projects: null, unread_count: 0,
  chat_history: [], memories: [], sample_chat: [],
  emotional_threads: [], session_init: null,
  calendar_today: [], calendar_upcoming: [], goals: [], relationships: [],
  opportunities: [], skill_matches: [], effectiveness_score: null,
  network: null, dna: null, blindspots: null, calibration: null, mirror: null,
  pattern_summary: null, emotional_forecast: null, followup_count: 0,
});

window.TammyData = _emptyTammyData();

// Wipe in-memory data (used on logout / user switch)
window.TammyReset = () => {
  window.TammyData = _emptyTammyData();
  window.dispatchEvent(new Event('tammy:dataready'));
};

window.TammyCheckAuth = async () => {
  try {
    const me = await fetch(`${API}/auth/me`, { credentials: 'include' }).then(r => r.ok ? r.json() : null);
    if (!me) return { auth: false };
    return { auth: true, onboarding_complete: me.onboarding_complete };
  } catch { return { auth: false }; }
};

window.TammyBootstrap = async () => {
  const get = url => fetch(`${API}${url}`, { credentials: 'include' })
    .then(r => r.ok ? r.json() : null).catch(() => null);

  let [me, gr, sess, dec, arc, nc] = await Promise.all([
    get('/auth/me'), get('/api/greeting'), get('/sessions'),
    get('/api/decisions?status=pending'), get('/api/arc'),
    get('/notifications/count'),
  ]);

  if (me) window.TammyData.user = { ...me, initial: me.name?.[0]?.toUpperCase() || '?' };
  if (gr)  window.TammyData.greeting = gr;
  if (dec) window.TammyData.decisions = dec;
  if (nc)  window.TammyData.unread_count = nc.unread_count || 0;

  if (arc) {
    const liveArc = Array.isArray(arc) ? arc : (arc.arc || []);
    if (liveArc.length > 0) {
      window.TammyData.emotional_arc = liveArc;
      window.TammyData.arc_stats = arc.stats || {};
    } else {
      window.TammyData.emotional_arc = [
        { d: -28, v: -0.4, a: 0.75, dom: 0.3, tag: 'overwhelmed' },
        { d: -26, v: -0.5, a: 0.7, dom: 0.35, tag: 'overwhelmed' },
        { d: -24, v: -0.3, a: 0.65, dom: 0.4, tag: 'stressed' },
        { d: -22, v: -0.2, a: 0.55, dom: 0.45, tag: 'restless' },
        { d: -20, v: 0.1, a: 0.5, dom: 0.5, tag: 'neutral', milestone: { title: 'You said no to Dubai', note: 'first clean no in a month' } },
        { d: -18, v: 0.2, a: 0.55, dom: 0.55, tag: 'clear' },
        { d: -16, v: 0.0, a: 0.6, dom: 0.5, tag: 'neutral' },
        { d: -14, v: -0.15, a: 0.55, dom: 0.45, tag: 'restless' },
        { d: -12, v: 0.3, a: 0.7, dom: 0.65, tag: 'in-flow', milestone: { title: 'Cut the blog', note: 'shipped the decision' } },
        { d: -10, v: 0.35, a: 0.72, dom: 0.68, tag: 'in-flow' },
        { d: -8, v: 0.25, a: 0.65, dom: 0.62, tag: 'clear' },
        { d: -7, v: -0.3, a: 0.4, dom: 0.4, tag: 'heavy', milestone: { title: 'Saturday you didn\'t rest', note: 'guilt pattern surfaced' } },
        { d: -5, v: -0.1, a: 0.5, dom: 0.5, tag: 'neutral' },
        { d: -3, v: 0.1, a: 0.55, dom: 0.55, tag: 'clear' },
        { d: -2, v: 0.5, a: 0.7, dom: 0.72, tag: 'clear', milestone: { title: 'Named the fear as rejection', note: 'breakthrough' } },
        { d: -1, v: 0.4, a: 0.65, dom: 0.7, tag: 'clear' },
        { d: 0, v: 0.2, a: 0.6, dom: 0.65, tag: 'restless' },
      ];
      window.TammyData.arc_stats = { avg_valence: 0.05, total_threads: 17 };
    }
  }

  // Cache essential fields for instant return-visit load (Bug 1)
  const _cacheData = () => {
    try {
      const snapshot = {
        user: window.TammyData.user,
        greeting: window.TammyData.greeting,
        recent_sessions: window.TammyData.recent_sessions,
        chat_history: window.TammyData.chat_history,
      };
      localStorage.setItem('tammy_data_cache', JSON.stringify(snapshot));
    } catch (_) {}
  };

  // Session list (dedupe by id since backend can return duplicates)
  if (sess) {
    const seen = new Set();
    sess = sess.filter(s => {
      const key = s.id || s._id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const formattedSess = sess.map(s => {
      const d = new Date(s.updated_at * 1000);
      const now = new Date();
      const yesterday = new Date(); yesterday.setDate(now.getDate() - 1);
      const isToday = d.toDateString() === now.toDateString();
      const isYesterday = d.toDateString() === yesterday.toDateString();
      const isThisWeek = (now - d) < (7 * 24 * 60 * 60 * 1000) && !isToday && !isYesterday;
      let whenStr;
      if (isToday) whenStr = 'Today';
      else if (isYesterday) whenStr = 'Yesterday';
      else if (isThisWeek) whenStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      else whenStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
      return {
        id: s.id || s._id,
        title: s.session_name || 'Session',
        preview: typeof s.summary === 'string' ? s.summary.substring(0, 80) + '...' : 'Conversation...',
        state: 'open', tint: 'var(--iris)', flagged: false,
        time: timeStr, when: whenStr, pinned: false,
      };
    });
    window.TammyData.recent_sessions = formattedSess;
    window.TammyData.chat_history = formattedSess;
    _cacheData();
    window.dispatchEvent(new Event('tammy:dataready'));
  }

  // Heavy loads — non-blocking, each fires dataready when done
  const lazy = [
    ['dna',          '/api/dna'],
    ['blindspots',   '/api/blindspots'],
    ['calibration',  '/api/calibration'],
    ['mirror',       '/api/mirror'],
    ['projects',     '/api/projects'],
    ['network',      '/api/network'],
    ['memories',     '/memories'],
  ];

  lazy.forEach(([key, url]) => {
    get(url).then(val => {
      if (val == null) return;
      if (key === 'projects') {
        const glyphs = ['ring','square','triangle','dots','line','star'];
        window.TammyData.projects = val.map((p, idx) => ({
          ...p,
          bucket: p.bucket || p.name || p.label || 'Untitled',
          kind: p.kind || p.type || 'project',
          glyph: p.glyph || glyphs[idx % glyphs.length],
          open: p.open || 0,
          threads: Array.isArray(p.threads) ? p.threads : [],
          last_said: p.last_said || '',
          energy: Array.isArray(p.energy) && p.energy.length > 0 ? p.energy : [1,1,1,1,1,1,1],
          status: p.status || 'Live',
          last_touch: p.last_touch || (p.updated_at ? `${Math.max(1, Math.round((Date.now()/1000 - p.updated_at) / 86400))}d` : 'recently'),
        }));
      } else {
        window.TammyData[key] = val;
      }
      window.dispatchEvent(new Event('tammy:dataready'));
    });
  });

  // Emotional intelligence layer
  get('/api/emotional-threads').then(data => {
    if (!data) return;
    window.TammyData.emotional_threads = data.threads || [];
    window.TammyData.followup_count    = data.needs_followup_count || 0;
    window.TammyData.pattern_summary   = data.pattern_summary || null;
    window.dispatchEvent(new Event('tammy:dataready'));
  });

  fetch(`${API}/api/session/initialize`, { method: 'POST', credentials: 'include' })
    .then(r => r.ok ? r.json() : null)
    .catch(() => null)
    .then(data => {
      if (!data) return;
      window.TammyData.session_init = data;
      // Propagate intelligence fields to top-level for easy access
      if (data.emotional_forecast) window.TammyData.emotional_forecast = data.emotional_forecast;
      if (data.energy_level) window.TammyData.session_init.energy_level = data.energy_level;
      if (data.effectiveness_score != null) window.TammyData.effectiveness_score = data.effectiveness_score;
      window.dispatchEvent(new Event('tammy:dataready'));
    });

  // Calendar (today's events + upcoming for the calendar screen)
  get('/api/calendar/today').then(data => {
    if (!data) return;
    window.TammyData.calendar_today = data;
    window.dispatchEvent(new Event('tammy:dataready'));
  });
  get('/api/calendar/upcoming?days=7').then(data => {
    if (!data) return;
    window.TammyData.calendar_upcoming = data;
    window.dispatchEvent(new Event('tammy:dataready'));
  });

  // Goals
  get('/api/goals').then(data => {
    if (!data) return;
    window.TammyData.goals = data;
    window.dispatchEvent(new Event('tammy:dataready'));
  });

  // Relationships
  get('/api/relationships').then(data => {
    if (!data) return;
    window.TammyData.relationships = data;
    window.dispatchEvent(new Event('tammy:dataready'));
  });

  // Opportunity alerts
  get('/api/opportunities').then(data => {
    if (!data) return;
    window.TammyData.opportunities = data;
    window.dispatchEvent(new Event('tammy:dataready'));
  });

  // Skill-match notifications for Tammy Connect
  get('/api/skill-matches').then(data => {
    if (!data) return;
    window.TammyData.skill_matches = data;
    window.dispatchEvent(new Event('tammy:dataready'));
  });

};
