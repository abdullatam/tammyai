// Profile screen — account, subscription, preferences, data, sign out.
// Pattern follows Claude / ChatGPT: a sidebar list of sections + a content panel.

const ProfileScreen = ({ onNavigate }) => {
  const [section, setSection] = React.useState('account');
  const [signOutConfirm, setSignOutConfirm] = React.useState(false);
  const [, rerender] = React.useState(0);

  React.useEffect(() => {
    const h = () => rerender(n => n + 1);
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  const D = window.TammyData || {};
  const user = D.user || {};
  const name = user.name || user.username || 'User';
  const initial = name.charAt(0).toUpperCase() || '?';
  const email = user.email || user.username || '—';

  const sections = [
    { id: 'account', label: 'Account', icon: 'user' },
    { id: 'subscription', label: 'Subscription', icon: 'spark' },
    { id: 'personalization', label: 'Personalization', icon: 'sliders' },
    { id: 'memory', label: 'Memory & data', icon: 'archive' },
    { id: 'voice', label: 'Voice', icon: 'wave' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'privacy', label: 'Privacy', icon: 'lock' },
    { id: 'help', label: 'Help & feedback', icon: 'help' },
  ];

  return (
    <main style={{
      marginLeft: 88,
      minHeight: '100vh',
      padding: '64px 80px 80px',
      maxWidth: 1280,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 48 }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--ink) 0%, var(--amber) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--canvas)', fontSize: 36, fontWeight: 500,
          boxShadow: '0 12px 32px var(--amber-glow)',
        }}>{initial}</div>
        <div>
          <h1 className="serif" style={{ fontSize: 38, fontWeight: 400, margin: 0, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            {name}
          </h1>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 6, fontFamily: 'var(--f-mono)', letterSpacing: '0.06em' }}>
            {email}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {(() => {
            const tier = user.subscription_tier || user.tier || 'free';
            const label = { free: 'Free', pro: 'Pro', founding: 'Founding member' }[tier] || tier;
            return (
              <span style={{
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                padding: '6px 12px', borderRadius: 999,
                background: 'var(--amber-soft)', color: 'var(--amber)',
                border: '1px solid var(--amber)',
              }}>
                {label}
              </span>
            );
          })()}
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 56 }}>
        {/* Section nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{
              padding: '12px 14px',
              textAlign: 'left',
              background: section === s.id ? 'var(--surface-2)' : 'transparent',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              color: section === s.id ? 'var(--ink)' : 'var(--ink-2)',
              fontFamily: 'var(--f-sans)',
              fontSize: 14,
              fontWeight: section === s.id ? 500 : 400,
              transition: 'all 200ms ease',
            }}>
              {s.label}
            </button>
          ))}
          <div style={{ height: 24 }} />
          <button onClick={() => setSignOutConfirm(true)} style={{
            padding: '12px 14px',
            textAlign: 'left',
            background: 'transparent', border: 'none', borderRadius: 10,
            cursor: 'pointer',
            color: 'var(--ink-3)',
            fontFamily: 'var(--f-sans)', fontSize: 14,
          }}>
            Sign out
          </button>
          {signOutConfirm && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--mauve)', borderRadius: 16,
                padding: '32px 36px', width: 400, boxShadow: '0 20px 48px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'left'
              }}>
                <div>
                  <h3 className="serif" style={{ margin: '0 0 12px', fontSize: 24, color: 'var(--ink)', fontWeight: 400 }}>Sign out</h3>
                  <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5 }}>
                    Are you sure you want to sign out? You will need to log back in to access your sessions and settings.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button onClick={() => setSignOutConfirm(false)} className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }}>Cancel</button>
                  <button onClick={async () => {
                    try {
                      await fetch(`${window.TAMMY_API}/auth/logout`, { method: 'POST', credentials: 'include' });
                    } catch {}
                    window.TammyReset && window.TammyReset();
                    try { localStorage.removeItem('tammy_route'); } catch {}
                    // Hard reload so every screen, cache, and React state resets cleanly.
                    window.location.href = '/landing';
                  }} className="btn btn-primary" style={{ padding: '10px 16px', fontSize: 13 }}>Sign out</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content panel */}
        <div>
          {section === 'account' && <AccountPanel user={user} name={name} email={email} />}
          {section === 'subscription' && <SubscriptionPanel user={user} />}
          {section === 'personalization' && <PersonalizationPanel user={user} />}
          {section === 'memory' && <MemoryDataPanel D={D} />}
          {section === 'voice' && <VoicePanel user={user} />}
          {section === 'notifications' && <NotificationsPanel user={user} />}
          {section === 'privacy' && <PrivacyPanel />}
          {section === 'help' && <HelpPanel />}
        </div>
      </div>
    </main>
  );
};

// ---------------------------------------------------------------- panels

const Panel = ({ title, children }) => (
  <div>
    <h2 className="serif" style={{ fontSize: 26, fontWeight: 400, margin: '0 0 28px', color: 'var(--ink)', letterSpacing: '-0.01em' }}>{title}</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
  </div>
);

const Row = ({ label, value, sub, action }) => (
  <div style={{
    padding: '18px 0',
    borderBottom: '1px solid var(--mauve-soft)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
  }}>
    <div>
      <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>{sub}</div>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {value && <div style={{ fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--f-mono)', letterSpacing: '0.04em' }}>{value}</div>}
      {action}
    </div>
  </div>
);

const AccountPanel = ({ user, name, email }) => {
  const tz = user.timezone
    || (Intl?.DateTimeFormat?.().resolvedOptions().timeZone || 'System default');
  const lang = user.language_preference === 'ar' ? 'Arabic' : 'English';
  return (
    <Panel title="Account">
      <Row label="Name" value={name} action={<EditBtn />} />
      <Row label="Email" value={email} action={<EditBtn />} />
      <Row label="Phone" value={user.phone || 'Not set'} action={<EditBtn />} />
      <Row label="Venture" value={user.venture || 'Not set'} sub={user.stage ? `Stage: ${user.stage}` : null} action={<EditBtn />} />
      <Row label="Language" value={lang} sub="She'll mirror whichever you write in." action={<EditBtn />} />
      <Row label="Timezone" value={tz} />
      <Row label="User ID" value={user.user_id || user._id || '—'} sub="Used for syncing memory across devices." />
    </Panel>
  );
};

const SubscriptionPanel = ({ user }) => {
  const tier  = user.subscription_tier || user.tier || 'free';
  const renew = user.subscription_renews_at;
  const renewStr = renew ? new Date(renew * 1000).toLocaleDateString() : null;
  const planLabel = { free: 'Free', pro: 'Tammy Pro', founding: 'Founding member' }[tier] || tier;
  const priceLabel = { free: 'No card on file', pro: 'Paid plan', founding: 'Lifetime · founding rate' }[tier] || '';

  return (
    <Panel title="Subscription">
      <div style={{
        padding: 28, marginBottom: 24,
        background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)',
        border: '1px solid var(--amber)',
        boxShadow: '0 0 0 6px var(--amber-soft)',
        borderRadius: 18,
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 8 }}>
          Current plan
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
          <div className="serif" style={{ fontSize: 36, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{planLabel}</div>
          {priceLabel && <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>{priceLabel}</div>}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 520 }}>
          {tier === 'free'
            ? 'You are on the free tier. Upgrade to unlock unlimited memory and voice.'
            : renewStr
              ? <>Renews <strong style={{ color: 'var(--ink)' }}>{renewStr}</strong>.</>
              : 'Active.'
          }
        </div>
        {tier !== 'free' && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn btn-ghost" style={{ padding: '10px 18px' }}>Manage billing</button>
          </div>
        )}
      </div>
      <Row label="Plan" value={planLabel} />
      {renewStr && <Row label="Next renewal" value={renewStr} />}
      <Row label="Account created" value={user.created_at ? new Date(user.created_at * 1000).toLocaleDateString() : '—'} />
    </Panel>
  );
};

const PERSONALITY_LABELS = {
  1: 'Very direct · sharp',
  2: 'Direct',
  3: 'Balanced',
  4: 'Warm',
  5: 'Gentle · soft',
};

const PersonalizationPanel = ({ user }) => {
  const wl    = user.warmth_level || 3;
  const tone  = PERSONALITY_LABELS[wl] || 'Balanced';
  const goalsArr = Array.isArray(user.goals) ? user.goals : [];
  return (
    <Panel title="Personalization">
      <Row label="What she calls you" value={user.name || user.username || 'Not set'} action={<EditBtn />} />
      <Row label="Tone" value={tone} sub="Adjust in Settings → Tone." />
      <Row label="Profile summary" value={user.profile_summary ? `${user.profile_summary.substring(0, 80)}${user.profile_summary.length > 80 ? '…' : ''}` : 'Not set yet'} sub="Updated automatically as Tammy learns more about you." />
      <Row label="Active goals" value={`${goalsArr.length} ${goalsArr.length === 1 ? 'goal' : 'goals'}`} sub={goalsArr.slice(0, 2).join(' · ') || 'Add some on the Today screen.'} />
    </Panel>
  );
};

const MemoryDataPanel = ({ D }) => {
  const memCount = (D.memories || []).length;
  const sessCount = (D.recent_sessions || []).length;
  const decisionCount = (D.decisions || []).length;
  return (
    <Panel title="Memory & data">
      <Row label="Memories" value={`${memCount} stored`} sub="She remembers what matters across sessions. Edit or delete any memory on the Memory screen." action={<EditBtn label="Open memory" />} />
      <Row label="Conversations" value={`${sessCount} sessions`} sub="All your past chats are searchable." />
      <Row label="Decisions tracked" value={`${decisionCount} ${decisionCount === 1 ? 'decision' : 'decisions'}`} />
      <Row label="Export your data" sub="A zip of every session, decision, and memory." action={<EditBtn label="Request export" />} />
      <Row label="Delete account" sub="Permanently remove everything. There is no undo." action={<EditBtn label="Delete" danger />} />
    </Panel>
  );
};

const VoicePanel = ({ user }) => (
  <Panel title="Voice">
    <Row label="Voice mode" value={user.voice_mode || 'Push to talk'} action={<EditBtn />} />
    <Row label="Speech speed" value={user.voice_speed || 'Natural'} action={<EditBtn />} />
    <Row label="Transcripts" value="Saved · always" sub="Voice sessions are transcribed and searchable in your memory." />
  </Panel>
);

const NotificationsPanel = ({ user }) => {
  const prefs = user.notification_prefs || {};
  return (
    <Panel title="Notifications">
      <Row label="Daily check-in" value={prefs.daily_checkin || 'Smart · she decides'} />
      <Row label="Decision follow-ups" value={prefs.decision_followups === false ? 'Off' : 'On'} sub="When a decision you made hasn't been revisited." />
      <Row label="Pattern alerts" value={prefs.pattern_alerts === false ? 'Off' : 'On'} sub='When she notices "this is the third time this week."' />
      <Row label="Quiet hours" value={prefs.quiet_hours || 'Not set'} action={<EditBtn />} />
    </Panel>
  );
};

const PrivacyPanel = () => (
  <Panel title="Privacy">
    <Row label="Improve Tammy with my data" value="Off" sub="Your sessions are never used to train models. This is permanently off for Pro." />
    <Row label="End-to-end encryption" value="On" sub="Memory is encrypted at rest. Even Tammy's team can't read it." />
    <Row label="Two-factor authentication" value="On · authenticator app" action={<EditBtn />} />
    <Row label="Active sessions" value="2 devices" sub="iPhone 15 · MacBook Pro" action={<EditBtn label="Manage" />} />
    <Row label="Login history" action={<EditBtn label="View" />} />
  </Panel>
);

const HelpPanel = () => (
  <Panel title="Help & feedback">
    <Row label="What's new" sub="Recent additions to Tammy." action={<EditBtn label="Open" />} />
    <Row label="Help center" sub="Guides, tips, the philosophy doc." action={<EditBtn label="Open" />} />
    <Row label="Send feedback" sub="Direct line to the team building her." action={<EditBtn label="Write" />} />
    <Row label="Report a problem" action={<EditBtn label="Open" />} />
    <Row label="Terms · Privacy · Acknowledgements" action={<EditBtn label="View" />} />
    <Row label="Version" value="0.18.3 · build 4421" />
  </Panel>
);

const EditBtn = ({ label = 'Edit', danger }) => (
  <button style={{
    background: 'transparent', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--f-sans)', fontSize: 13,
    color: danger ? 'var(--amber)' : 'var(--ink-2)',
    padding: '6px 10px', borderRadius: 8,
    transition: 'all 150ms ease',
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    {label} →
  </button>
);

window.ProfileScreen = ProfileScreen;
