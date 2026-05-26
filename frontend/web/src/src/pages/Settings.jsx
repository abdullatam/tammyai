// Settings screen.

const API_BASE = window.TAMMY_API || 'http://localhost:7861';

const STYLE_TO_WARMTH = { very_direct: 1, direct: 2, balanced: 3, gentle: 4 };
const WARMTH_TO_STYLE = { 1: 'very_direct', 2: 'direct', 3: 'balanced', 4: 'balanced', 5: 'gentle' };

const SetSection = ({ id, eyebrow, title, sub, children }) => (
  <section id={id} style={{ marginBottom: 56, scrollMarginTop: 32 }}>
    <div style={{ marginBottom: 18 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mauve)', marginBottom: 6 }}>— {eyebrow}</div>
      <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{title}</h2>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0, maxWidth: 540, lineHeight: 1.5 }}>{sub}</p>
    </div>
    {children}
  </section>
);
const SetCard = ({ children }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 18, padding: '6px 24px' }}>{children}</div>
);
const SetRow = ({ label, hint, children, last }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', gap: 24, borderBottom: last ? 'none' : '1px solid var(--mauve-soft)' }}>
    <div>
      <div style={{ fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--f-sans)' }}>{label}</div>
      {hint && <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>{hint}</div>}
    </div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>{children}</div>
  </div>
);
const ProfFact = ({ label, value }) => (
  <div>
    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--f-sans)' }}>{value}</div>
  </div>
);
const BigRadio = ({ value, set, opts }) => (
  <div style={{ display: 'flex', gap: 6 }}>
    {opts.map(([v, l, sub]) => (
      <button key={v} onClick={() => set(v)} style={{ padding: '10px 14px', borderRadius: 10, border: value === v ? '1.5px solid var(--ink)' : '1px solid var(--mauve-soft)', background: value === v ? 'var(--ink)' : 'var(--surface)', color: value === v ? 'var(--ivory)' : 'var(--ink)', cursor: 'pointer', fontFamily: 'var(--f-sans)', textAlign: 'left', transition: 'all 160ms ease' }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{l}</div>
        {sub && <div className="mono" style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6, marginTop: 2 }}>{sub}</div>}
      </button>
    ))}
  </div>
);
const IntegrationCard = ({ name, desc, connected, onToggle, meta, color, glyph, placeholder }) => (
  <div style={{ padding: '18px 22px', background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16, opacity: placeholder ? 0.7 : 1 }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}1a`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, fontFamily: 'var(--f-sans)', flexShrink: 0 }}>{glyph}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--f-sans)', fontWeight: 500 }}>{name}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{connected && meta ? meta : desc}</div>
    </div>
    {placeholder ? <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>Connect</button> : <Toggle v={connected} on={onToggle} />}
  </div>
);
const Radio = ({ value, set, opts }) => (
  <div style={{ display: 'flex', gap: 4, background: 'var(--canvas-tint)', padding: 3, borderRadius: 10, border: '1px solid rgba(178,157,217,0.25)' }}>
    {opts.map(([v, l]) => (
      <button key={v} onClick={() => set(v)} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 7, border: 'none', background: value === v ? 'var(--ivory)' : 'transparent', color: value === v ? 'var(--ink)' : 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--f-sans)', boxShadow: value === v ? '0 1px 4px rgba(31,17,56,0.08)' : 'none' }}>{l}</button>
    ))}
  </div>
);
const Toggle = ({ v, on }) => (
  <button onClick={() => on(!v)} style={{ width: 42, height: 24, borderRadius: 12, border: 'none', background: v ? 'var(--amber)' : 'rgba(178,157,217,0.35)', position: 'relative', cursor: 'pointer', transition: 'background 200ms' }}>
    <span style={{ position: 'absolute', top: 2, left: v ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: 'var(--ivory)', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(31,17,56,0.2)' }} />
  </button>
);

const SettingsScreen = ({ onNavigate }) => {
  const [voice, setVoice] = React.useState('push_to_talk');
  const [checkIn, setCheckIn] = React.useState('tammy_decides');
  const [style, setStyle] = React.useState('very_direct');
  const [clickup, setClickup] = React.useState(true);
  const [notif, setNotif] = React.useState({ push: true, email: true, inapp: true });
  const [activeSection, setActiveSection] = React.useState('profile');
  const [, rerender] = React.useState(0);

  const D = window.TammyData;

  React.useEffect(() => {
    const h = () => rerender(n => n + 1);
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  React.useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.warmth_level != null) setStyle(WARMTH_TO_STYLE[data.warmth_level] || 'balanced'); })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {}
    if (window.TammyReset) window.TammyReset();
    if (onNavigate) onNavigate('landing');
  };

  const handleStyleChange = (newStyle) => {
    setStyle(newStyle);
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ warmth_level: STYLE_TO_WARMTH[newStyle] || 3 }),
    }).catch(() => {});
  };

  const toneSamples = {
    very_direct: "Four times today. I'm counting because you are, but you won't say it.",
    direct: "You opened the doc four times. The thing you're avoiding is the conversation, not the writing.",
    balanced: "You've been circling this all day — what do you think is making it hard to write?",
    gentle: "It seems like this one's sitting heavy. Want to talk through what's underneath it?",
  };

  const hasIntelligence = D.effectiveness_score != null || D.emotional_forecast?.predicted_emotion || D.session_init?.energy_level;
  const sections = [
    { id: 'profile', label: 'Profile' },
    { id: 'voice', label: 'Voice' },
    { id: 'tone', label: 'Tone' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'subscription', label: 'Subscription' },
    ...(hasIntelligence ? [{ id: 'intelligence', label: "Tammy's read" }] : []),
    { id: 'data', label: 'Privacy & data' },
  ];

  return (
    <div style={{ marginLeft: 120, padding: '48px 64px 80px', maxWidth: 1180, margin: '0 auto 0 120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 56 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 14 }}>settings · tammy v0.94</div>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Tune the way I<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>show up for you.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0, maxWidth: 580, lineHeight: 1.5 }}>
            Your voice. Your tone. Your boundaries. Tammy adjusts to fit you — these are the dials.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 56, alignItems: 'flex-start' }}>
        <nav style={{ position: 'sticky', top: 32 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>on this page</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSection(s.id)} style={{ padding: '10px 14px', fontSize: 13, color: activeSection === s.id ? 'var(--ink)' : 'var(--ink-3)', textDecoration: 'none', borderLeft: activeSection === s.id ? '2px solid var(--ink)' : '2px solid var(--mauve-soft)', background: activeSection === s.id ? 'var(--surface)' : 'transparent', fontWeight: activeSection === s.id ? 500 : 400, transition: 'all 160ms ease', fontFamily: 'var(--f-sans)' }}>
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        <div>
          <SetSection id="profile" eyebrow="01" title="Profile" sub="The basics Tammy uses to ground every conversation.">
            <div style={{ padding: 28, background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 18, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(135deg, var(--ink) 0%, #947DED 100%)', color: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontFamily: 'var(--font-serif,Georgia)', fontStyle: 'italic', flexShrink: 0, boxShadow: '0 8px 24px rgba(43,20,86,0.18)' }}>
                {D.user.initial || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                  <div className="serif" style={{ fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.015em' }}>{D.user.name || '—'}</div>
                  <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>edit</button>
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
                  {D.user.venture ? `Building ${D.user.venture}` : 'Founder'}{D.user.stage ? ` · ${D.user.stage}` : ''}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, paddingTop: 18, borderTop: '1px solid var(--mauve-soft)' }}>
                  <ProfFact label="Timezone"     value={D.user.timezone   || '—'} />
                  <ProfFact label="Member since" value={D.user.joined     || '—'} />
                  <ProfFact label="Streak"       value={D.user.streak_days != null ? `${D.user.streak_days} days` : '—'} />
                </div>
              </div>
            </div>
          </SetSection>

          <SetSection id="voice" eyebrow="02" title="Voice" sub="How we talk. Push to talk keeps things deliberate; auto detect keeps things flowing.">
            <SetCard>
              <SetRow label="Voice mode" hint="when to listen">
                <BigRadio value={voice} set={setVoice} opts={[['push_to_talk','Push to talk','press space'],['auto_detect','Auto detect','always listening'],['off','Off','text only']]} />
              </SetRow>
              <SetRow label="Language" hint="conversation language">
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '7px 14px', background: 'var(--ink)', color: 'var(--ivory)', borderRadius: 999, fontSize: 12, fontFamily: 'var(--f-sans)' }}>English</span>
                  <span style={{ padding: '7px 14px', background: 'var(--surface-2)', color: 'var(--ink-3)', border: '1px solid var(--mauve-soft)', borderRadius: 999, fontSize: 12, fontFamily: 'var(--f-sans)' }}>العربية · soon</span>
                </div>
              </SetRow>
              <SetRow label="Tammy's voice" hint="how she sounds" last>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1 L9 5 L2 9 Z" /></svg>
                    preview
                  </button>
                  <Radio value="warm" set={() => {}} opts={[['warm','Warm'],['neutral','Neutral'],['low','Low']]} />
                </div>
              </SetRow>
            </SetCard>
          </SetSection>

          <SetSection id="tone" eyebrow="03" title="Tone" sub="How sharp she should be. The sample shows what this directness sounds like in practice.">
            <SetCard>
              <SetRow label="Directness" hint="sharp ↔ gentle">
                <Radio value={style} set={handleStyleChange} opts={[['very_direct','Very direct'],['direct','Direct'],['balanced','Balanced'],['gentle','Gentle']]} />
              </SetRow>
              <div style={{ padding: '20px 22px', background: 'var(--surface-2)', borderRadius: 12, borderLeft: '2px solid var(--ink)', margin: '8px 0 18px' }}>
                <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>what this sounds like</div>
                <p className="serif" style={{ fontSize: 19, color: 'var(--ink)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>"{toneSamples[style]}"</p>
              </div>
              <SetRow label="Check-in frequency" hint="how often she pings you" last>
                <Radio value={checkIn} set={setCheckIn} opts={[['daily','Daily'],['weekly','Weekly'],['tammy_decides','Tammy decides']]} />
              </SetRow>
            </SetCard>
          </SetSection>

          <SetSection id="integrations" eyebrow="04" title="Integrations" sub="Apps Tammy reads from to know what's actually on your plate.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <IntegrationCard name="ClickUp" desc="Tasks, lists, due dates" connected={clickup} onToggle={setClickup} meta={clickup ? '4 tasks today · 2 overdue · last sync 12 min ago' : null} color="#7B68EE" glyph="C" />
              <IntegrationCard name="Calendar" desc="Google · iCloud · Outlook" connected={false} onToggle={() => {}} color="#947DED" glyph="📅" placeholder />
              <IntegrationCard name="Slack" desc="DMs & threads you flag" connected={false} onToggle={() => {}} color="#C0ACFF" glyph="#" placeholder />
              <IntegrationCard name="Linear" desc="Issues, sprints, blockers" connected={false} onToggle={() => {}} color="#5E6AD2" glyph="L" placeholder />
            </div>
          </SetSection>

          <SetSection id="notifications" eyebrow="05" title="Notifications" sub="Where Tammy reaches you when she has something worth saying.">
            <SetCard>
              <SetRow label="Push" hint="phone & desktop"><Toggle v={notif.push} on={x => setNotif({ ...notif, push: x })} /></SetRow>
              <SetRow label="Email digest" hint="weekly · Sunday evenings"><Toggle v={notif.email} on={x => setNotif({ ...notif, email: x })} /></SetRow>
              <SetRow label="In-app" hint="when Tammy's open" last><Toggle v={notif.inapp} on={x => setNotif({ ...notif, inapp: x })} /></SetRow>
            </SetCard>
          </SetSection>

          <SetSection id="subscription" eyebrow="06" title="Subscription" sub="Your plan with Tammy.">
            <div style={{ position: 'relative', padding: 32, background: 'linear-gradient(135deg, var(--ink) 0%, #4B2A8E 60%, #947DED 100%)', color: 'var(--ivory)', borderRadius: 22, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />
              {(() => {
                const u = D.user || {};
                const tier = u.subscription_tier || 'Pro';
                const isPaid = tier && tier.toLowerCase() !== 'free';
                const renewsAt = u.subscription_renews_at;
                const renewStr = renewsAt ? new Date(renewsAt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : null;
                const price = u.subscription_price;
                const blurb = isPaid ? 'Unlimited conversations · full memory · voice · all integrations · weekly arc reports' : 'Conversations and memory at the free tier. Upgrade for voice, integrations, and weekly arc reports.';
                return (
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 24 }}>
                    <div>
                      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 10 }}>current plan</div>
                      <div className="serif" style={{ fontSize: 36, letterSpacing: '-0.02em', marginBottom: 6 }}>Tammy <em style={{ fontStyle: 'italic' }}>{tier}</em></div>
                      <div style={{ fontSize: 14, opacity: 0.8 }}>{blurb}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {price != null && <div className="serif" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>${price}<span style={{ fontSize: 14, opacity: 0.7 }}>/mo</span></div>}
                      {renewStr && <div className="mono" style={{ fontSize: 10, opacity: 0.7, letterSpacing: '0.12em', marginTop: 4 }}>RENEWS {renewStr}</div>}
                    </div>
                  </div>
                );
              })()}
              <div style={{ position: 'relative', display: 'flex', gap: 10, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <button style={{ padding: '10px 18px', background: 'var(--ivory)', color: 'var(--ink)', border: 'none', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f-sans)', fontWeight: 500, cursor: 'pointer' }}>Manage billing</button>
                <button style={{ padding: '10px 18px', background: 'transparent', color: 'var(--ivory)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f-sans)', cursor: 'pointer' }}>Change plan</button>
              </div>
            </div>
          </SetSection>

          {hasIntelligence && (() => {
            const score    = D.effectiveness_score;
            const forecast = D.emotional_forecast;
            const energy   = D.session_init?.energy_level;
            return (
              <SetSection id="intelligence" eyebrow="07" title="Tammy's read on you" sub="Live signals Tammy uses to calibrate how she shows up for you.">
                <SetCard>
                  {score != null && (
                    <SetRow label="Effectiveness score" hint="% of emotional threads trending toward resolution">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 120, height: 4, background: 'var(--mauve-soft)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${score}%`, height: '100%', background: score > 60 ? 'var(--iris)' : score > 30 ? 'var(--amber)' : '#c0392b', borderRadius: 2 }} />
                        </div>
                        <span className="mono" style={{ fontSize: 13, color: score > 60 ? 'var(--iris)' : score > 30 ? 'var(--amber)' : '#c0392b' }}>{Math.round(score)}%</span>
                      </div>
                    </SetRow>
                  )}
                  {energy && (
                    <SetRow label="Detected energy level" hint="inferred from your last conversation signals">
                      <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', background: energy === 'high' ? 'rgba(148,125,237,0.12)' : 'rgba(139,136,152,0.1)', color: energy === 'high' ? 'var(--iris)' : 'var(--ink-3)', border: `1px solid ${energy === 'high' ? 'rgba(148,125,237,0.25)' : 'rgba(139,136,152,0.2)'}` }}>{energy}</span>
                    </SetRow>
                  )}
                  {forecast?.predicted_emotion && (
                    <SetRow label="Emotional forecast" hint="predicted next emotional state based on your patterns" last>
                      <span style={{ fontSize: 13, color: 'var(--ink-2)', textTransform: 'capitalize' }}>
                        {forecast.predicted_emotion}
                        {forecast.days_until > 0 ? ` in ~${Math.round(forecast.days_until)}d` : ' (overdue)'}
                        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 8 }}>{forecast.confidence} confidence</span>
                      </span>
                    </SetRow>
                  )}
                </SetCard>
              </SetSection>
            );
          })()}

          <SetSection id="data" eyebrow={hasIntelligence ? '08' : '07'} title="Privacy & data" sub="What you give Tammy, you can take back. Always.">
            <SetCard>
              <SetRow label="Export everything" hint="full memory + transcripts as JSON">
                <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Download</button>
              </SetRow>
              <SetRow label="Encrypt at rest" hint="your data, scrambled on disk">
                <Toggle v={true} on={() => {}} />
              </SetRow>
              <SetRow label="Sign out everywhere" hint="logs you out of all sessions">
                <button className="btn btn-ghost" onClick={handleSignOut} style={{ padding: '8px 14px', fontSize: 12 }}>Sign out</button>
              </SetRow>
              <SetRow label="Delete account" hint="erases everything. unrecoverable." last>
                <button style={{ padding: '8px 14px', background: 'transparent', color: 'var(--amber)', border: '1px solid var(--amber)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f-sans)', cursor: 'pointer' }}>Delete</button>
              </SetRow>
            </SetCard>
          </SetSection>
        </div>
      </div>
    </div>
  );
};

window.SettingsScreen = SettingsScreen;
