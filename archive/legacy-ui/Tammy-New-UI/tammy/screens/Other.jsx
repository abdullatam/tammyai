// Memory view, Settings, Landing, Onboarding — in one file to keep things tidy.

const MEM_API = 'http://localhost:7861';

const MemoryScreen = () => {
  const [rawMemories, setRawMemories] = React.useState(window.TammyData.memories || []);
  const [loading, setLoading] = React.useState(rawMemories.length === 0);
  const [filter, setFilter] = React.useState('all');
  const [editing, setEditing] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [forgotten, setForgotten] = React.useState({});
  const [edits, setEdits] = React.useState({});

  React.useEffect(() => {
    // Refresh from API on mount
    fetch(`${MEM_API}/memories`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          const norm = data.map((m, i) => ({
            id:   m.id || String(i),
            cat:  m.cat || m.category || (m.source === 'session' ? 'identity' : 'pattern'),
            text: m.text || '',
            time: m.ts ? _relTime(m.ts) : 'from session',
          }));
          setRawMemories(norm);
          window.TammyData.memories = norm;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const onReady = () => setRawMemories([...(window.TammyData.memories || [])]);
    window.addEventListener('tammy:dataready', onReady);
    return () => window.removeEventListener('tammy:dataready', onReady);
  }, []);

  const cats = ['all', 'identity', 'venture', 'pattern', 'relationship', 'decision', 'emotional', 'value'];
  const memories = rawMemories.map(m => ({ ...m, text: edits[m.id] || m.text })).filter(m => !forgotten[m.id]);
  const shown = filter === 'all' ? memories : memories.filter(m => m.cat === filter);

  const catCounts = rawMemories.reduce((a, m) => { a[m.cat] = (a[m.cat] || 0) + 1; return a; }, {});
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  const recent = rawMemories.filter(m => /hour|day/i.test(m.time)).length;

  const startEdit = (m) => { setEditing(m.id); setEditText(m.text); };

  const saveEdit = (id) => {
    setEdits(e => ({ ...e, [id]: editText }));
    setEditing(null);
  };

  const forgetMemory = (id) => {
    setForgotten(f => ({ ...f, [id]: true }));
    if (id && !id.startsWith('semantic-')) {
      fetch(`${MEM_API}/memories/${id}`, { method: 'DELETE', credentials: 'include' }).catch(() => {});
    }
  };

  if (loading) return (
    <div style={{ marginLeft: 120, padding: '48px 64px', color: 'var(--ink-3)' }}>
      <div className="serif" style={{ fontSize: 24 }}>loading memories…</div>
    </div>
  );

  return (
    <div style={{ marginLeft: 120, padding: '48px 64px 80px', maxWidth: 1100, margin: '0 auto 0 120px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 18 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 14 }}>
            memory · {memories.length} things tammy holds about you
          </div>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Here's what I<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>remember about you.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0, maxWidth: 580, lineHeight: 1.5 }}>
            Edit anything I got wrong. Correct what's drifted. Forget what I shouldn't be holding.
            Everything stays until you say otherwise.
          </p>
        </div>
        <button className="btn btn-primary" style={{ flexShrink: 0, marginTop: 12, padding: '14px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: -2 }}>+</span>
          Tell me something
        </button>
      </div>

      {/* Stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        borderTop: '1px solid var(--mauve-soft)',
        borderBottom: '1px solid var(--mauve-soft)',
        marginTop: 56, marginBottom: 40,
      }}>
        <MemStat n={memories.length} label="total memories" />
        <MemStat n={Object.keys(catCounts).length} label="categories" />
        <MemStat n={topCat} label="most about" small />
        <MemStat n={recent} label="added this week" right />
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 32, alignItems: 'center' }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginRight: 6 }}>
          filter
        </span>
        {cats.map(c => {
          const count = c === 'all' ? memories.length : catCounts[c] || 0;
          if (count === 0 && c !== 'all') return null;
          return (
            <button key={c} onClick={() => setFilter(c)}
              style={{
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontFamily: 'var(--f-sans)',
                background: filter === c ? 'var(--ink)' : 'var(--surface)',
                color: filter === c ? 'var(--ivory)' : 'var(--ink-2)',
                border: filter === c ? '1px solid var(--ink)' : '1px solid var(--mauve-soft)',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 160ms ease',
              }}>
              {c}
              <span style={{
                fontSize: 10,
                fontFamily: 'var(--f-mono)',
                opacity: filter === c ? 0.7 : 0.5,
                letterSpacing: '0.05em',
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Memory list */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {shown.map((m, i) => (
          <MemoryRow
            key={m.id}
            m={m}
            last={i === shown.length - 1}
            editing={editing === m.id}
            editText={editText}
            setEditText={setEditText}
            onEdit={() => startEdit(m)}
            onSave={() => saveEdit(m.id)}
            onCancel={() => setEditing(null)}
            onForget={() => forgetMemory(m.id)}
          />
        ))}
        {shown.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--mauve)', borderRadius: 16, color: 'var(--ink-3)', fontStyle: 'italic' }}>
            Nothing here in this category yet.
          </div>
        )}
      </div>

      {/* Add memory hint */}
      <div style={{
        marginTop: 40,
        padding: '24px 28px',
        background: 'var(--surface)',
        border: '1px dashed var(--mauve)',
        borderRadius: 18,
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--ink)', color: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontFamily: 'var(--font-serif, Georgia)', fontStyle: 'italic',
          flexShrink: 0,
        }}>T</div>
        <div style={{ flex: 1 }}>
          <div className="serif" style={{ fontSize: 18, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            Anything else I should hold onto?
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
            Tell me a fact, a value, a person, a thing you want me to remember about you.
          </div>
        </div>
        <button className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }}>Add memory</button>
      </div>
    </div>
  );
};

function _relTime(ts) {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const MemStat = ({ n, label, right, small }) => (
  <div style={{
    padding: '24px 0',
    borderRight: right ? 'none' : '1px solid var(--mauve-soft)',
    paddingLeft: 24,
  }}>
    <div className="serif" style={{
      fontSize: small ? 28 : 44, fontWeight: 400,
      color: 'var(--ink)',
      letterSpacing: '-0.025em', lineHeight: 1.1,
      textTransform: small ? 'capitalize' : 'none',
    }}>
      {n}
    </div>
    <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 10 }}>
      {label}
    </div>
  </div>
);

const MemoryRow = ({ m, last, editing, editText, setEditText, onEdit, onSave, onCancel, onForget }) => {
  const [hover, setHover] = React.useState(false);
  const [confirmForget, setConfirmForget] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setConfirmForget(false); }}
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr 110px',
        alignItems: 'flex-start',
        gap: 24,
        padding: '22px 8px',
        borderBottom: last ? 'none' : '1px solid var(--mauve-soft)',
        background: editing ? 'var(--surface)' : 'transparent',
        borderLeft: editing ? '2px solid var(--ink)' : '2px solid transparent',
        paddingLeft: editing ? 16 : 8,
        transition: 'all 200ms ease',
      }}
    >
      {/* Category */}
      <div style={{ paddingTop: 6 }}>
        <span className="mono" style={{
          fontSize: 10, color: 'var(--ink-3)',
          textTransform: 'uppercase', letterSpacing: '0.14em',
          padding: '4px 9px',
          background: 'var(--surface-2)',
          borderRadius: 6,
        }}>
          {m.cat}
        </span>
      </div>

      {/* Text + actions */}
      <div>
        {editing ? (
          <div>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                minHeight: 60,
                padding: '10px 14px',
                fontSize: 18,
                fontFamily: 'var(--font-serif, Georgia)',
                color: 'var(--ink)',
                background: 'var(--ivory)',
                border: '1px solid var(--mauve)',
                borderRadius: 10,
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.4,
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={onSave} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>
                Save
              </button>
              <button onClick={onCancel} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="serif" style={{ fontSize: 19, color: 'var(--ink)', lineHeight: 1.45, letterSpacing: '-0.005em' }}>
              {m.text}
            </div>
            <div style={{
              display: 'flex',
              gap: 4,
              marginTop: 10,
              opacity: hover ? 1 : 0,
              transform: hover ? 'translateY(0)' : 'translateY(-4px)',
              transition: 'all 180ms ease',
              pointerEvents: hover ? 'auto' : 'none',
            }}>
              <button onClick={onEdit} style={memActionBtn}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginRight: 4 }}>
                  <path d="M8 1 L11 4 L4 11 L1 11 L1 8 Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                edit
              </button>
              <button style={memActionBtn}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginRight: 4 }}>
                  <path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                correct
              </button>
              {confirmForget ? (
                <>
                  <button onClick={onForget} style={{ ...memActionBtn, color: 'var(--amber)', background: 'var(--amber-soft)' }}>
                    confirm forget
                  </button>
                  <button onClick={() => setConfirmForget(false)} style={memActionBtn}>cancel</button>
                </>
              ) : (
                <button onClick={() => setConfirmForget(true)} style={{ ...memActionBtn, color: 'var(--ink-3)' }}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginRight: 4 }}>
                    <path d="M2 3 L10 3 M4 3 L4 1 L8 1 L8 3 M3 3 L3 11 L9 11 L9 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  forget
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Time */}
      <div style={{ textAlign: 'right', paddingTop: 6 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
          {m.time}
        </span>
      </div>
    </div>
  );
};

const memActionBtn = {
  background: 'transparent',
  border: '1px solid var(--mauve-soft)',
  fontSize: 11,
  color: 'var(--ink-2)',
  cursor: 'pointer',
  fontFamily: 'var(--f-mono)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  padding: '5px 10px',
  borderRadius: 6,
  display: 'inline-flex',
  alignItems: 'center',
  transition: 'all 160ms ease',
};

const STYLE_TO_WARMTH = { very_direct: 1, direct: 2, balanced: 3, gentle: 4 };
const WARMTH_TO_STYLE = { 1: 'very_direct', 2: 'direct', 3: 'balanced', 4: 'balanced', 5: 'gentle' };
const API_BASE = 'http://localhost:7861';

// Settings -----------------------------------------------------
const SettingsScreen = () => {
  const [voice, setVoice] = React.useState('push_to_talk');
  const [checkIn, setCheckIn] = React.useState('tammy_decides');
  const [style, setStyle] = React.useState('very_direct');
  const [clickup, setClickup] = React.useState(true);
  const [notif, setNotif] = React.useState({ push: true, email: true, inapp: true });
  const [activeSection, setActiveSection] = React.useState('profile');

  const D = window.TammyData;

  // Load current settings from backend on mount
  React.useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        if (data.warmth_level != null) setStyle(WARMTH_TO_STYLE[data.warmth_level] || 'balanced');
        // Update TammyData user info
        window.TammyData.user = {
          ...window.TammyData.user,
          name: data.name || data.username || '',
          initial: (data.name || data.username || '?')[0].toUpperCase(),
          venture: data.venture || '',
          goals: data.goals || '',
        };
      })
      .catch(() => {});
  }, []);

  const handleStyleChange = (newStyle) => {
    setStyle(newStyle);
    const wl = STYLE_TO_WARMTH[newStyle] || 3;
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ warmth_level: wl }),
    }).catch(() => {});
  };

  const sections = [
    { id: 'profile', label: 'Profile' },
    { id: 'voice', label: 'Voice' },
    { id: 'tone', label: 'Tone' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'data', label: 'Privacy & data' },
  ];

  // Sample quotes that change with directness
  const toneSamples = {
    very_direct: 'Four times today. I\'m counting because you are, but you won\'t say it.',
    direct: 'You opened the doc four times. The thing you\'re avoiding is the conversation, not the writing.',
    balanced: 'You\'ve been circling this all day — what do you think is making it hard to write?',
    gentle: 'It seems like this one\'s sitting heavy. Want to talk through what\'s underneath it?',
  };

  return (
    <div style={{ marginLeft: 120, padding: '48px 64px 80px', maxWidth: 1180, margin: '0 auto 0 120px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 56 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 14 }}>
            settings · tammy v0.94
          </div>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Tune the way I<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>show up for you.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0, maxWidth: 580, lineHeight: 1.5 }}>
            Your voice. Your tone. Your boundaries. Tammy adjusts to fit you — these are the dials.
          </p>
        </div>
      </div>

      {/* Layout: sticky nav + content */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 56, alignItems: 'flex-start' }}>
        {/* Sticky nav */}
        <nav style={{ position: 'sticky', top: 32 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>
            on this page
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                style={{
                  padding: '10px 14px',
                  fontSize: 13,
                  color: activeSection === s.id ? 'var(--ink)' : 'var(--ink-3)',
                  textDecoration: 'none',
                  borderLeft: activeSection === s.id ? '2px solid var(--ink)' : '2px solid var(--mauve-soft)',
                  background: activeSection === s.id ? 'var(--surface)' : 'transparent',
                  fontWeight: activeSection === s.id ? 500 : 400,
                  transition: 'all 160ms ease',
                  fontFamily: 'var(--f-sans)',
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div>
          {/* Profile */}
          <SetSection id="profile" eyebrow="01" title="Profile" sub="The basics Tammy uses to ground every conversation.">
            <div style={{
              padding: 28,
              background: 'var(--surface)',
              border: '1px solid var(--mauve-soft)',
              borderRadius: 18,
              display: 'flex', gap: 24, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 84, height: 84, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--ink) 0%, #947DED 100%)',
                color: 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontFamily: 'var(--font-serif, Georgia)', fontStyle: 'italic',
                flexShrink: 0,
                boxShadow: '0 8px 24px rgba(43, 20, 86, 0.18)',
              }}>
                {D.user.initial}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                  <div className="serif" style={{ fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
                    {D.user.name}
                  </div>
                  <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>edit</button>
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
                  Building {D.user.venture} · {D.user.stage}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, paddingTop: 18, borderTop: '1px solid var(--mauve-soft)' }}>
                  <ProfFact label="Timezone" value={D.user.timezone} />
                  <ProfFact label="Member since" value={D.user.joined} />
                  <ProfFact label="Streak" value={`${D.user.streak_days} days`} />
                </div>
              </div>
            </div>
          </SetSection>

          {/* Voice */}
          <SetSection id="voice" eyebrow="02" title="Voice" sub="How we talk. Push to talk keeps things deliberate; auto detect keeps things flowing.">
            <SetCard>
              <SetRow label="Voice mode" hint="when to listen">
                <BigRadio value={voice} set={setVoice} opts={[
                  ['push_to_talk', 'Push to talk', 'press space'],
                  ['auto_detect', 'Auto detect', 'always listening'],
                  ['off', 'Off', 'text only'],
                ]} />
              </SetRow>
              <SetRow label="Language" hint="conversation language">
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{
                    padding: '7px 14px',
                    background: 'var(--ink)',
                    color: 'var(--ivory)',
                    borderRadius: 999,
                    fontSize: 12,
                    fontFamily: 'var(--f-sans)',
                  }}>English</span>
                  <span style={{
                    padding: '7px 14px',
                    background: 'var(--surface-2)',
                    color: 'var(--ink-3)',
                    border: '1px solid var(--mauve-soft)',
                    borderRadius: 999,
                    fontSize: 12,
                    fontFamily: 'var(--f-sans)',
                  }}>العربية · soon</span>
                </div>
              </SetRow>
              <SetRow label="Tammy's voice" hint="how she sounds" last>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1 L9 5 L2 9 Z" /></svg>
                    preview
                  </button>
                  <Radio value="warm" set={() => {}} opts={[['warm', 'Warm'], ['neutral', 'Neutral'], ['low', 'Low']]} />
                </div>
              </SetRow>
            </SetCard>
          </SetSection>

          {/* Tone */}
          <SetSection id="tone" eyebrow="03" title="Tone" sub="How sharp she should be. The sample shows what this directness sounds like in practice.">
            <SetCard>
              <SetRow label="Directness" hint="sharp ↔ gentle">
                <Radio value={style} set={handleStyleChange} opts={[
                  ['very_direct', 'Very direct'],
                  ['direct', 'Direct'],
                  ['balanced', 'Balanced'],
                  ['gentle', 'Gentle'],
                ]} />
              </SetRow>
              <div style={{
                padding: '20px 22px',
                background: 'var(--surface-2)',
                borderRadius: 12,
                borderLeft: '2px solid var(--ink)',
                margin: '8px 0 18px',
              }}>
                <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
                  what this sounds like
                </div>
                <p className="serif" style={{ fontSize: 19, color: 'var(--ink)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                  "{toneSamples[style]}"
                </p>
              </div>
              <SetRow label="Check-in frequency" hint="how often she pings you" last>
                <Radio value={checkIn} set={setCheckIn} opts={[
                  ['daily', 'Daily'],
                  ['weekly', 'Weekly'],
                  ['tammy_decides', 'Tammy decides'],
                ]} />
              </SetRow>
            </SetCard>
          </SetSection>

          {/* Integrations */}
          <SetSection id="integrations" eyebrow="04" title="Integrations" sub="Apps Tammy reads from to know what's actually on your plate.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <IntegrationCard
                name="ClickUp"
                desc="Tasks, lists, due dates"
                connected={clickup}
                onToggle={setClickup}
                meta={clickup ? '4 tasks today · 2 overdue · last sync 12 min ago' : null}
                color="#7B68EE"
                glyph="C"
              />
              <IntegrationCard name="Calendar" desc="Google · iCloud · Outlook" connected={false} onToggle={() => {}} color="#947DED" glyph="📅" placeholder />
              <IntegrationCard name="Slack" desc="DMs & threads you flag" connected={false} onToggle={() => {}} color="#C0ACFF" glyph="#" placeholder />
              <IntegrationCard name="Linear" desc="Issues, sprints, blockers" connected={false} onToggle={() => {}} color="#5E6AD2" glyph="L" placeholder />
            </div>
          </SetSection>

          {/* Notifications */}
          <SetSection id="notifications" eyebrow="05" title="Notifications" sub="Where Tammy reaches you when she has something worth saying.">
            <SetCard>
              <SetRow label="Push" hint="phone & desktop">
                <Toggle v={notif.push} on={x => setNotif({ ...notif, push: x })} />
              </SetRow>
              <SetRow label="Email digest" hint="weekly · Sunday evenings">
                <Toggle v={notif.email} on={x => setNotif({ ...notif, email: x })} />
              </SetRow>
              <SetRow label="In-app" hint="when Tammy's open" last>
                <Toggle v={notif.inapp} on={x => setNotif({ ...notif, inapp: x })} />
              </SetRow>
            </SetCard>
          </SetSection>

          {/* Subscription */}
          <SetSection id="subscription" eyebrow="06" title="Subscription" sub="Your plan with Tammy.">
            <div style={{
              position: 'relative',
              padding: 32,
              background: 'linear-gradient(135deg, var(--ink) 0%, #4B2A8E 60%, #947DED 100%)',
              color: 'var(--ivory)',
              borderRadius: 22,
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              }} />
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 24 }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 10 }}>
                    current plan
                  </div>
                  <div className="serif" style={{ fontSize: 36, letterSpacing: '-0.02em', marginBottom: 6 }}>
                    Tammy <em style={{ fontStyle: 'italic' }}>Pro</em>
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.8 }}>
                    Unlimited conversations · full memory · voice · all integrations · weekly arc reports
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="serif" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>$39<span style={{ fontSize: 14, opacity: 0.7 }}>/mo</span></div>
                  <div className="mono" style={{ fontSize: 10, opacity: 0.7, letterSpacing: '0.12em', marginTop: 4 }}>
                    RENEWS MAY 3
                  </div>
                </div>
              </div>
              <div style={{ position: 'relative', display: 'flex', gap: 10, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <button style={{
                  padding: '10px 18px',
                  background: 'var(--ivory)',
                  color: 'var(--ink)',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: 'var(--f-sans)',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>Manage billing</button>
                <button style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  color: 'var(--ivory)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: 'var(--f-sans)',
                  cursor: 'pointer',
                }}>Change plan</button>
              </div>
            </div>
          </SetSection>

          {/* Data */}
          <SetSection id="data" eyebrow="07" title="Privacy & data" sub="What you give Tammy, you can take back. Always.">
            <SetCard>
              <SetRow label="Export everything" hint="full memory + transcripts as JSON">
                <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Download</button>
              </SetRow>
              <SetRow label="Encrypt at rest" hint="your data, scrambled on disk">
                <Toggle v={true} on={() => {}} />
              </SetRow>
              <SetRow label="Sign out everywhere" hint="logs you out of all sessions">
                <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Sign out</button>
              </SetRow>
              <SetRow label="Delete account" hint="erases everything. unrecoverable." last>
                <button style={{
                  padding: '8px 14px',
                  background: 'transparent',
                  color: 'var(--amber)',
                  border: '1px solid var(--amber)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'var(--f-sans)',
                  cursor: 'pointer',
                }}>Delete</button>
              </SetRow>
            </SetCard>
          </SetSection>
        </div>
      </div>
    </div>
  );
};

const SetSection = ({ id, eyebrow, title, sub, children }) => (
  <section id={id} style={{ marginBottom: 56, scrollMarginTop: 32 }}>
    <div style={{ marginBottom: 18 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mauve)', marginBottom: 6 }}>
        — {eyebrow}
      </div>
      <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0, maxWidth: 540, lineHeight: 1.5 }}>
        {sub}
      </p>
    </div>
    {children}
  </section>
);

const SetCard = ({ children }) => (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--mauve-soft)',
    borderRadius: 18,
    padding: '6px 24px',
  }}>
    {children}
  </div>
);

const SetRow = ({ label, hint, children, last }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 0',
    gap: 24,
    borderBottom: last ? 'none' : '1px solid var(--mauve-soft)',
  }}>
    <div>
      <div style={{ fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--f-sans)' }}>{label}</div>
      {hint && (
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
          {hint}
        </div>
      )}
    </div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>{children}</div>
  </div>
);

const ProfFact = ({ label, value }) => (
  <div>
    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--f-sans)' }}>{value}</div>
  </div>
);

const BigRadio = ({ value, set, opts }) => (
  <div style={{ display: 'flex', gap: 6 }}>
    {opts.map(([v, l, sub]) => (
      <button key={v} onClick={() => set(v)} style={{
        padding: '10px 14px',
        borderRadius: 10,
        border: value === v ? '1.5px solid var(--ink)' : '1px solid var(--mauve-soft)',
        background: value === v ? 'var(--ink)' : 'var(--surface)',
        color: value === v ? 'var(--ivory)' : 'var(--ink)',
        cursor: 'pointer',
        fontFamily: 'var(--f-sans)',
        textAlign: 'left',
        transition: 'all 160ms ease',
      }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{l}</div>
        {sub && (
          <div className="mono" style={{
            fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
            opacity: 0.6, marginTop: 2,
          }}>{sub}</div>
        )}
      </button>
    ))}
  </div>
);

const IntegrationCard = ({ name, desc, connected, onToggle, meta, color, glyph, placeholder }) => (
  <div style={{
    padding: '18px 22px',
    background: 'var(--surface)',
    border: '1px solid var(--mauve-soft)',
    borderRadius: 14,
    display: 'flex', alignItems: 'center', gap: 16,
    opacity: placeholder ? 0.7 : 1,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: `${color}1a`,
      color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, fontWeight: 700, fontFamily: 'var(--f-sans)',
      flexShrink: 0,
    }}>
      {glyph}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--f-sans)', fontWeight: 500 }}>
        {name}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
        {connected && meta ? meta : desc}
      </div>
    </div>
    {placeholder ? (
      <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>Connect</button>
    ) : (
      <Toggle v={connected} on={onToggle} />
    )}
  </div>
);
const Radio = ({ value, set, opts }) => (
  <div style={{ display: 'flex', gap: 4, background: 'var(--canvas-tint)', padding: 3, borderRadius: 10, border: '1px solid rgba(178, 157, 217, 0.25)' }}>
    {opts.map(([v, l]) => (
      <button key={v} onClick={() => set(v)} style={{
        padding: '6px 12px', fontSize: 12, borderRadius: 7, border: 'none',
        background: value === v ? 'var(--ivory)' : 'transparent',
        color: value === v ? 'var(--ink)' : 'var(--ink-3)',
        cursor: 'pointer', fontFamily: 'var(--f-sans)',
        boxShadow: value === v ? '0 1px 4px rgba(31,17,56,0.08)' : 'none',
      }}>{l}</button>
    ))}
  </div>
);
const Toggle = ({ v, on }) => (
  <button onClick={() => on(!v)} style={{
    width: 42, height: 24, borderRadius: 12, border: 'none',
    background: v ? 'var(--amber)' : 'rgba(178, 157, 217, 0.35)',
    position: 'relative', cursor: 'pointer', transition: 'background 200ms',
  }}>
    <span style={{
      position: 'absolute', top: 2, left: v ? 20 : 2,
      width: 20, height: 20, borderRadius: '50%', background: 'var(--ivory)',
      transition: 'left 200ms', boxShadow: '0 1px 3px rgba(31,17,56,0.2)',
    }} />
  </button>
);

// Landing ----------------------------------------------------
const Landing = ({ onNavigate }) => {
  const [mode, setMode] = React.useState('login');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const API = 'http://localhost:7861';

  const handleAuth = async () => {
    try {
      const ep = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = { username: email, password };
      if (mode === 'register') body.name = name;
      const r = await fetch(`${API}${ep}`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      if (r.ok) {
        const d = await r.json();
        await window.TammyBootstrap();
        onNavigate(d.onboarding_complete ? 'today' : 'onboarding');
      } else {
        alert('Auth failed');
      }
    } catch { alert('Auth failed'); }
  };
  const onEnter = (where) => onNavigate(where === 'demo' ? 'today' : where);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.2fr 1fr', position: 'relative' }}>
      <div style={{ padding: '72px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="serif" style={{ fontSize: 30, fontStyle: 'italic', letterSpacing: '-0.02em' }}>
          tammy
        </div>
        <div>
          <h1 className="serif" style={{ fontSize: 80, lineHeight: 0.98, margin: '0 0 24px', fontWeight: 400, letterSpacing: '-0.02em', maxWidth: 720, textWrap: 'balance' }}>
            the sharp friend <br />who tells <span style={{ fontStyle: 'italic', color: 'var(--iris)' }}>the truth.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 520, lineHeight: 1.55, margin: '0 0 36px' }}>
            Not a chatbot. Not a therapist. A persistent, emotionally intelligent co-founder who remembers every conversation, tracks your patterns, and holds you to what you said in the last one.
          </p>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>tonight</span>
              <span className="serif" style={{ fontSize: 18, color: 'var(--ink)', fontStyle: 'italic' }}>"what's on your chest?"</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          Built in Amman · Arabic & English · Voice-first ·  <span style={{ color: 'var(--amber)' }}>●</span> private by default
        </div>
      </div>

      <div style={{ position: 'relative', background: 'linear-gradient(135deg, rgba(148, 125, 237, 0.12), rgba(148, 125, 237, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Orb size={420} state="idle" />
        </div>
        <div style={{
          position: 'relative', zIndex: 2,
          width: 380, padding: 32, borderRadius: 24,
          background: 'rgba(255, 253, 248, 0.75)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(178, 157, 217, 0.35)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--canvas-tint)', padding: 3, borderRadius: 10, marginBottom: 22 }}>
            {[['login', 'Sign in'], ['register', 'Create account']].map(([v, l]) => (
              <button key={v} onClick={() => setMode(v)} style={{
                flex: 1, padding: '8px 12px', fontSize: 13, border: 'none', borderRadius: 7,
                background: mode === v ? 'var(--ivory)' : 'transparent',
                color: mode === v ? 'var(--ink)' : 'var(--ink-3)',
                cursor: 'pointer', fontFamily: 'var(--f-sans)',
                boxShadow: mode === v ? '0 1px 4px rgba(31,17,56,0.08)' : 'none',
              }}>{l}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'register' && <Input label="your name" placeholder="tamer" value={name} onChange={e=>setName(e.target.value)} />}
            <Input label="email" placeholder="you@somewhere.com" value={email} onChange={e=>setEmail(e.target.value)} />
            <Input label="password" type="password" placeholder="········" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="btn btn-primary" onClick={handleAuth} style={{ justifyContent: 'center', padding: '14px 22px', marginTop: 8 }}>
              {mode === 'login' ? 'come in' : 'begin'}
            </button>
            <button onClick={() => onEnter('demo')} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 12, marginTop: 4, cursor: 'pointer' }}>
              or skip → enter the demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const Input = ({ label, type = 'text', placeholder, value, onChange }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{label}</span>
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{
      padding: '12px 14px', borderRadius: 10,
      border: '1px solid rgba(178, 157, 217, 0.45)',
      background: 'var(--ivory)', color: 'var(--ink)', fontFamily: 'var(--f-sans)', fontSize: 14,
      outline: 'none',
    }} />
  </label>
);

// Onboarding --------------------------------------------------
const OnboardingScreen = ({ onDone }) => {
  const steps = [
    { tammy: "hey. i'm tammy.", sub: "before we start — what do you want me to call you?", field: 'name', placeholder: 'your first name' },
    { tammy: "good to meet you.", sub: "what are you building right now?", field: 'venture', placeholder: 'a one-liner is enough' },
    { tammy: "and where's it stuck?", sub: "what's been sitting on your chest this week?", field: 'challenge', placeholder: 'the real thing, not the polished one' },
    { tammy: "one more. how direct do you want me?", sub: "i won't soften if you don't ask me to.", field: 'tone', options: ['very direct', 'direct', 'balanced', 'gentle'] },
  ];
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [val, setVal] = React.useState('');
  const s = steps[step];

  const next = () => {
    if (!val && !s.options) return;
    setAnswers(a => ({ ...a, [s.field]: val }));
    setVal('');
    if (step === steps.length - 1) onDone();
    else setStep(step + 1);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative' }}>
      {/* Progress dots */}
      <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: i === step ? 28 : 8, height: 6, borderRadius: 3, background: i <= step ? 'var(--amber)' : 'rgba(178, 157, 217, 0.35)', transition: 'width 300ms' }} />
        ))}
      </div>

      <div style={{ maxWidth: 640, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Orb size={160} state={step === 0 ? 'listening' : step === steps.length - 1 ? 'milestone' : 'idle'} />
        <h1 className="serif" key={step} style={{ fontSize: 44, margin: '40px 0 8px', lineHeight: 1.1, fontWeight: 400, animation: 'fadeInUp 500ms ease' }}>
          {s.tammy}
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-3)', margin: '0 0 36px' }}>{s.sub}</p>

        {s.options ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {s.options.map(o => (
              <button key={o} onClick={() => { setAnswers(a => ({ ...a, tone: o })); onDone(); }}
                className="btn btn-ghost" style={{ padding: '12px 22px', fontSize: 15 }}>{o}</button>
            ))}
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 480, display: 'flex', gap: 10 }}>
            <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && next()}
              placeholder={s.placeholder}
              style={{
                flex: 1, padding: '14px 18px', borderRadius: 14,
                border: '1px solid rgba(178, 157, 217, 0.5)',
                background: 'var(--ivory)', color: 'var(--ink)', fontFamily: 'var(--f-sans)', fontSize: 16,
                outline: 'none',
              }} />
            <button onClick={next} className="btn btn-primary">next</button>
          </div>
        )}

        <button onClick={onDone} style={{ marginTop: 40, background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 12, cursor: 'pointer' }}>
          skip — i'll learn as we go
        </button>
      </div>
    </div>
  );
};

// Voice mode --------------------------------------------------
const VoiceMode = ({ onExit }) => {
  const [state, setState] = React.useState('listening');
  const [transcript, setTranscript] = React.useState('');

  React.useEffect(() => {
    const seq = [
      { after: 1200, do: () => { setState('listening'); setTranscript('i keep opening the doc for rama and closing it.'); } },
      { after: 3000, do: () => { setState('thinking'); } },
      { after: 4200, do: () => { setState('speaking'); setTranscript('Four times today. I\'m counting because you are, but you won\'t say it.'); } },
      { after: 8500, do: () => { setState('speaking'); setTranscript('What\'s the sentence you don\'t want to write?'); } },
      { after: 12000, do: () => { setState('listening'); setTranscript(''); } },
    ];
    const timers = seq.map(s => setTimeout(s.do, s.after));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, var(--canvas) 0%, var(--canvas-tint) 100%)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onExit} style={{
        position: 'absolute', top: 24, right: 28,
        background: 'rgba(255, 253, 248, 0.7)', border: '1px solid rgba(178, 157, 217, 0.35)',
        width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: 16, color: 'var(--ink-2)',
      }}>✕</button>

      <Orb size={360} state={state} />
      <div className="mono" style={{ marginTop: 32, fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        {state}
      </div>
      <div style={{ marginTop: 32, maxWidth: 720, textAlign: 'center', padding: '0 32px', minHeight: 100 }}>
        {transcript && (
          <p className="serif" key={transcript} style={{ fontSize: 30, lineHeight: 1.3, color: 'var(--ink)', fontWeight: 400, animation: 'fadeInUp 500ms ease' }}>
            {transcript}
          </p>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: 48, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn btn-ghost" style={{ padding: '10px 18px' }}>hold to speak</button>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>press space · esc to leave</div>
      </div>
    </div>
  );
};

window.MemoryScreen = MemoryScreen;
window.SettingsScreen = SettingsScreen;
window.Landing = Landing;
window.OnboardingScreen = OnboardingScreen;
window.VoiceMode = VoiceMode;
