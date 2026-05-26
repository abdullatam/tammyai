// Profile screen — account, subscription, preferences, data, sign out.
// Pattern follows Claude / ChatGPT: a sidebar list of sections + a content panel.

const ProfileScreen = ({ onNavigate }) => {
  const [section, setSection] = React.useState('account');

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
        }}>T</div>
        <div>
          <h1 className="serif" style={{ fontSize: 38, fontWeight: 400, margin: 0, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Tamer Halawani
          </h1>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 6, fontFamily: 'var(--f-mono)', letterSpacing: '0.06em' }}>
            tamer@studiomasri.com · Amman, Jordan
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
            padding: '6px 12px', borderRadius: 999,
            background: 'var(--amber-soft)', color: 'var(--amber)',
            border: '1px solid var(--amber)',
          }}>
            Pro · founding member
          </span>
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
          <button onClick={() => { localStorage.removeItem('tammy_route'); onNavigate && onNavigate('landing'); }} style={{
            padding: '12px 14px',
            textAlign: 'left',
            background: 'transparent', border: 'none', borderRadius: 10,
            cursor: 'pointer',
            color: 'var(--ink-3)',
            fontFamily: 'var(--f-sans)', fontSize: 14,
          }}>
            Sign out
          </button>
        </div>

        {/* Content panel */}
        <div>
          {section === 'account' && <AccountPanel />}
          {section === 'subscription' && <SubscriptionPanel />}
          {section === 'personalization' && <PersonalizationPanel />}
          {section === 'memory' && <MemoryDataPanel />}
          {section === 'voice' && <VoicePanel />}
          {section === 'notifications' && <NotificationsPanel />}
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

const AccountPanel = () => (
  <Panel title="Account">
    <Row label="Name" value="Tamer Halawani" action={<EditBtn />} />
    <Row label="Email" value="tamer@studiomasri.com" action={<EditBtn />} />
    <Row label="Phone" value="+962 79 ··· ··21" action={<EditBtn />} />
    <Row label="Language" value="English · Arabic" sub="She'll mirror whichever you write in." action={<EditBtn />} />
    <Row label="Timezone" value="Asia / Amman (GMT+3)" action={<EditBtn />} />
    <Row label="Connected accounts" value="ClickUp · Google" sub="2 connected" action={<EditBtn label="Manage" />} />
  </Panel>
);

const SubscriptionPanel = () => (
  <Panel title="Subscription">
    {/* Plan card */}
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
        <div className="serif" style={{ fontSize: 36, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Tammy Pro</div>
        <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>$24 / month</div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 520 }}>
        Unlimited voice. Unlimited memory. Multi-bucket. Renews <strong style={{ color: 'var(--ink)' }}>April 18, 2026</strong> · Visa ending 4421.
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn btn-ghost" style={{ padding: '10px 18px' }}>Manage billing</button>
        <button className="btn btn-ghost" style={{ padding: '10px 18px', color: 'var(--ink-3)' }}>Cancel plan</button>
      </div>
    </div>

    <Row label="Usage this month" value="48% · 21 voice hours" sub="Pro includes unlimited; this is just for your awareness." />
    <Row label="Memory stored" value="1,247 entries · 38 MB" />
    <Row label="Buckets" value="3 active" sub="Tammy · Studio Masri · Personal" />
    <Row label="Next invoice" value="$24.00 on Apr 18" action={<EditBtn label="View invoices" />} />
    <Row label="Payment method" value="Visa ···· 4421" action={<EditBtn />} />
  </Panel>
);

const PersonalizationPanel = () => (
  <Panel title="Personalization">
    <Row label="What she calls you" value="Tamer" action={<EditBtn />} />
    <Row label="Tone" value="Sharp · honest" sub="Never flattering. Never therapist-soft." action={<EditBtn />} />
    <Row label="Response shape" value="Insight → Tension → Question" action={<EditBtn />} />
    <Row label="Daily check-in time" value="She decides" sub="Tammy reaches out when the pattern says you need her." action={<EditBtn />} />
    <Row label="Custom instructions" sub="Anything she should always remember about you, your work, the people in your life." action={<EditBtn label="Open editor" />} />
  </Panel>
);

const MemoryDataPanel = () => (
  <Panel title="Memory & data">
    <Row label="Memory" value="On" sub="She remembers what matters across sessions. You can edit or delete any memory." action={<EditBtn label="Review memory" />} />
    <Row label="Auto-summarize sessions" value="On" />
    <Row label="Cross-bucket memory" value="On" sub="She can connect dots between Tammy, Studio Masri, and Personal — only when it matters." />
    <Row label="Export your data" sub="A zip of every session, decision, and memory." action={<EditBtn label="Request export" />} />
    <Row label="Delete account" sub="Permanently remove everything. There is no undo." action={<EditBtn label="Delete" danger />} />
  </Panel>
);

const VoicePanel = () => (
  <Panel title="Voice">
    <Row label="Voice mode" value="Push to talk" action={<EditBtn />} />
    <Row label="Tammy's voice" value="Calm · low" sub="Trained on a single voice actor. Not synthesized." action={<EditBtn label="Preview" />} />
    <Row label="Speech speed" value="Natural" action={<EditBtn />} />
    <Row label="Background noise filter" value="Auto" />
    <Row label="Transcripts" value="Saved · always" sub="Voice sessions are transcribed and searchable in your memory." />
  </Panel>
);

const NotificationsPanel = () => (
  <Panel title="Notifications">
    <Row label="Daily check-in" value="Smart · she decides" />
    <Row label="Decision follow-ups" value="On" sub="When a decision you made hasn't been revisited and it's time." />
    <Row label="Pattern alerts" value="On" sub='When she notices "this is the third time this week."' />
    <Row label="Quiet hours" value="22:00 → 07:00" action={<EditBtn />} />
    <Row label="Notification channel" value="Push · Email" action={<EditBtn />} />
  </Panel>
);

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
