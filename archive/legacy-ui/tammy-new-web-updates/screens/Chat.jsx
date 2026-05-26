// Chat screen — the showpiece. Full-width prose, no bubbles.
// Tammy's lines in Instrument Serif. User lines in IBM Plex Sans, right-aligned subtle.
// Working Claude integration. Orb pinned top-right, listening state.
// Three layout variants via Tweaks: prose / asymmetric / editorial.

const ChatScreen = ({ layout = 'prose', onOpenVoice, activeBucket, setActiveBucket }) => {
  const D = window.TammyData;
  const [messages, setMessages] = React.useState(D.sample_chat);
  const [input, setInput] = React.useState('');
  const [streaming, setStreaming] = React.useState('');
  const [orbState, setOrbState] = React.useState('idle');
  const [historyOpen, setHistoryOpen] = React.useState(true);
  const [activeChatId, setActiveChatId] = React.useState(null);
  const [viewingPast, setViewingPast] = React.useState(false);
  const endRef = React.useRef(null);

  React.useEffect(() => {
    endRef.current?.parentElement?.parentElement?.scrollTo({ top: 99999, behavior: 'smooth' });
  }, [messages, streaming]);

  const send = async () => {
    const q = input.trim();
    if (!q || orbState === 'thinking' || orbState === 'speaking') return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setOrbState('thinking');

    const systemPrompt = `You are Tammy — a sharp AI clarity partner for MENA entrepreneurs. Not a chatbot, not a therapist. You are the sharp friend who tells the truth.

RESPONSE ARCHITECTURE: Insight → Tension → Question. Never empathy → validation → soft question.

RULES:
- No markdown. No bold. No headers. Plain prose only.
- Contractions always.
- One question per response, never two.
- 2–5 sentences usually. 8 sentence ceiling.
- Lowercase starts are fine. Sometimes "Yeah. I see it." is the right move.

BANNED: "Of course", "Absolutely", "Great question", "That's beautiful", "Give yourself permission", "What small step can you take today", "As an AI", "I understand that must be".

CONTEXT — the user is Tamer, building Tammy in Amman. He has a pending decision to hire a CTO (21 days circling it). He's been avoiding a call with Rama where he has to tell her the co-founder title isn't on the table. He believes "sharp is the care."

Respond as Tammy.`;

    try {
      setTimeout(() => setOrbState('speaking'), 600);
      const history = [...messages, { role: 'user', text: q }].map(m => ({
        role: m.role === 'tammy' ? 'assistant' : 'user',
        content: m.text,
      }));
      const response = await window.claude.complete({
        system: systemPrompt,
        messages: history,
      });
      // Split into natural paragraph chunks for the prose style
      const chunks = response.split(/\n\n+/).filter(Boolean);
      setStreaming('');
      // Faux-stream: fade in word by word of the whole thing
      let full = response;
      let i = 0;
      const interval = setInterval(() => {
        i += 2;
        setStreaming(full.slice(0, i));
        if (i >= full.length) {
          clearInterval(interval);
          setStreaming('');
          setMessages(m => [...m, ...chunks.map(c => ({ role: 'tammy', text: c }))]);
          setOrbState('idle');
        }
      }, 18);
    } catch (e) {
      setStreaming('');
      setMessages(m => [...m, { role: 'tammy', text: '...something cut out. Say it again?' }]);
      setOrbState('idle');
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{
      marginLeft: historyOpen ? 380 : 120,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      paddingBottom: 140,
      transition: 'margin-left 320ms cubic-bezier(0.32, 0.72, 0.24, 1)',
    }}>
      <ChatHistoryPanel
        open={historyOpen}
        onToggle={() => setHistoryOpen(o => !o)}
        activeId={activeChatId}
        viewingPast={viewingPast}
        onBack={() => { setViewingPast(false); setActiveChatId(null); }}
        onSelect={(id) => { setActiveChatId(id); setViewingPast(true); }}
        onNewChat={() => {
          setMessages([]);
          setActiveChatId(null);
          setViewingPast(false);
        }}
      />
      {/* Bucket switcher at top */}
      <Buckets active={activeBucket} onChange={setActiveBucket} showSignal={false} />

      {/* Transcript */}
      <main style={{
        flex: 1,
        maxWidth: layout === 'editorial' ? 760 : 820,
        margin: '0 auto',
        width: '100%',
        padding: '16px 48px 120px',
      }}>
        {messages.map((m, i) => <Line key={i} m={m} layout={layout} />)}
        {streaming && <Line m={{ role: 'tammy', text: streaming }} layout={layout} streaming />}
        {orbState === 'thinking' && !streaming && (
          <div className="serif" style={{ color: 'var(--mauve)', fontSize: 22, padding: '20px 0', fontStyle: 'italic' }}>
            <span style={{ animation: 'pulse 1.4s ease-in-out infinite' }}>…</span>
          </div>
        )}
        <div ref={endRef} />
      </main>

      {/* Composer */}
      <footer style={{
        position: 'fixed',
        bottom: 0, left: historyOpen ? 380 : 120, right: 0,
        padding: '20px 48px 28px',
        background: 'linear-gradient(180deg, transparent 0%, var(--canvas) 35%)',
        zIndex: 10,
        transition: 'left 320ms cubic-bezier(0.32, 0.72, 0.24, 1)',
      }}>
        <div style={{
          maxWidth: 820,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 12,
          padding: '14px 16px 14px 22px',
          background: 'var(--ivory)',
          border: '1px solid rgba(178, 157, 217, 0.45)',
          borderRadius: 24,
          boxShadow: '0 8px 28px rgba(31, 17, 56, 0.07), 0 2px 6px rgba(148, 125, 237, 0.05)',
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="say what's actually there…"
            rows={1}
            style={{
              flex: 1, resize: 'none',
              border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--f-sans)', fontSize: 15,
              color: 'var(--ink)', padding: '8px 0',
              lineHeight: 1.5, maxHeight: 140,
            }}
          />
          <button
            onClick={onOpenVoice}
            title="Voice mode"
            style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '1px solid rgba(178, 157, 217, 0.5)',
              background: 'var(--surface-2)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-2)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
          <button onClick={send} className="btn btn-primary" style={{ padding: '10px 18px' }}>
            send
          </button>
        </div>
        <div style={{ maxWidth: 820, margin: '10px auto 0', textAlign: 'center', fontSize: 11, color: 'var(--ink-3)' }}>
          enter to send · shift+enter for a new line · she remembers everything
        </div>
      </footer>
    </div>
  );
};

const Line = ({ m, layout, streaming }) => {
  if (m.role === 'tammy') {
    // Always serif, full-width, no bubble
    return (
      <div style={{
        padding: layout === 'editorial' ? '18px 0' : '20px 0',
        animation: streaming ? 'none' : 'fadeInUp 500ms ease',
      }}>
        <p className="serif" style={{
          margin: 0,
          fontSize: layout === 'editorial' ? 20 : 22,
          lineHeight: 1.35,
          color: 'var(--ink)',
          textWrap: 'pretty',
          fontWeight: 400,
        }}>
          {m.text}
          {streaming && <span style={{ display: 'inline-block', width: 8, height: 24, background: 'var(--amber)', marginLeft: 4, verticalAlign: '-4px', animation: 'blink 1s infinite' }} />}
        </p>
      </div>
    );
  }
  // User line — sans, smaller, right aligned subtle for asymmetric; left for prose
  const isAsym = layout === 'asymmetric';
  const isEditorial = layout === 'editorial';
  return (
    <div style={{
      padding: '16px 0',
      display: 'flex',
      justifyContent: isAsym ? 'flex-end' : 'flex-start',
      animation: 'fadeInUp 400ms ease',
    }}>
      <div style={{
        maxWidth: isAsym ? '70%' : '100%',
        padding: isEditorial ? '0 0 0 24px' : 0,
        borderLeft: isEditorial ? '2px solid var(--mauve)' : 'none',
      }}>
        {!isEditorial && (
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
            you
          </div>
        )}
        <p style={{
          margin: 0,
          fontFamily: 'var(--f-sans)',
          fontSize: 14,
          lineHeight: 1.55,
          color: isAsym ? 'var(--ink-2)' : 'var(--ink-2)',
          textWrap: 'pretty',
          background: isAsym ? 'rgba(138, 92, 196, 0.10)' : 'transparent',
          padding: isAsym ? '10px 16px' : 0,
          borderRadius: isAsym ? 14 : 0,
          border: isAsym ? '1px solid rgba(178, 157, 217, 0.3)' : 'none',
        }}>
          {m.text}
        </p>
      </div>
    </div>
  );
};

const ChatHistoryPanel = ({ open, onToggle, activeId, onSelect, onNewChat, onBack, viewingPast }) => {
  const D = window.TammyData;
  const history = D.chat_history || [];

  // Group: Today · This Week · Earlier
  const groups = React.useMemo(() => {
    const pinned = history.filter(h => h.pinned);
    const today = history.filter(h => !h.pinned && h.when.startsWith('Today'));
    const week = history.filter(h => !h.pinned && (h.when.startsWith('Yesterday') || /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test(h.when)));
    const earlier = history.filter(h => !h.pinned && /^[A-Z][a-z]{2} \d/.test(h.when));
    return [
      { label: 'Pinned', items: pinned },
      { label: 'Today', items: today },
      { label: 'This Week', items: week },
      { label: 'Earlier', items: earlier },
    ].filter(g => g.items.length);
  }, [history]);

  const empty = history.length === 0;

  return (
    <>
    <aside
      style={{
        position: 'fixed',
        left: 100,
        top: 24,
        bottom: 24,
        width: open ? 288 : 0,
        background: 'var(--ivory)',
        border: open ? '1px solid var(--mauve-soft)' : '1px solid transparent',
        borderRadius: 22,
        boxShadow: open ? '0 12px 40px rgba(43, 20, 86, 0.06)' : 'none',
        overflow: 'hidden',
        transition: 'width 320ms cubic-bezier(0.32, 0.72, 0.24, 1), border-color 320ms ease',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        padding: '18px 18px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--mauve-soft)',
        flexShrink: 0,
      }}>
        <div className="serif" style={{ fontSize: 19, color: 'var(--ink)', fontStyle: 'italic' }}>
          History
        </div>
        <button
          onClick={onNewChat}
          title="New chat"
          style={{
            width: 30, height: 30,
            borderRadius: 10,
            border: '1px solid var(--mauve-soft)',
            background: 'var(--canvas)',
            color: 'var(--ink-2)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {empty ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 18 }}>
          <Orb size={88} state="idle" />
          <div className="serif" style={{ fontSize: 16, color: 'var(--ink-2)', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.4 }}>
            your conversations<br />will appear here
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px 18px' }}>
          {groups.map(g => (
            <div key={g.label} style={{ marginTop: 14 }}>
              <div className="mono" style={{
                fontSize: 9,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                padding: '0 10px 8px',
              }}>
                {g.label}
              </div>
              {g.items.map(item => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 12px 12px 14px',
                      borderRadius: 12,
                      border: 'none',
                      borderLeft: item.hasDecision ? '2px solid var(--amber)' : '2px solid transparent',
                      background: isActive ? 'rgba(148, 125, 237, 0.14)' : 'transparent',
                      cursor: 'pointer',
                      marginBottom: 3,
                      transition: 'background 160ms ease',
                      display: 'block',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(178, 157, 217, 0.10)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.tint || 'var(--mauve)', flexShrink: 0 }} />
                      <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        {item.state || 'session'}
                      </span>
                      {item.pinned && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--amber)', marginLeft: 'auto' }}>
                          <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6z" />
                        </svg>
                      )}
                    </div>
                    <div style={{
                      fontFamily: 'var(--f-sans)',
                      fontSize: 13.5,
                      fontWeight: isActive ? 500 : 400,
                      color: 'var(--ink)',
                      marginBottom: 4,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontFamily: 'var(--f-sans)',
                      fontSize: 11.5,
                      color: 'var(--ink-3)',
                      fontStyle: 'italic',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.preview}
                    </div>
                    <div className="mono" style={{
                      fontSize: 10,
                      color: 'var(--ink-3)',
                      marginTop: 6,
                      letterSpacing: '0.04em',
                    }}>
                      {item.when}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
      </aside>

      {/* Back button when viewing a past chat — outside the history bar */}
      {viewingPast && (
        <button
          onClick={onBack}
          style={{
            position: 'fixed',
            top: 24,
            left: open ? 396 : 108,
            zIndex: 65,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px 7px 10px',
            border: '1px solid var(--mauve-soft)',
            background: 'var(--ivory)',
            color: 'var(--ink-2)',
            borderRadius: 999,
            fontSize: 12,
            fontFamily: 'var(--f-sans)',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(43, 20, 86, 0.10)',
            transition: 'all 240ms cubic-bezier(0.32, 0.72, 0.24, 1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'var(--mauve)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-2)'; e.currentTarget.style.borderColor = 'var(--mauve-soft)'; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          back to history
        </button>
      )}

      {/* Toggle handle — always visible, sits on the panel's right edge */}
      <button
        onClick={onToggle}
        title={open ? 'Hide history' : 'Show history'}
        style={{
          position: 'fixed',
          left: open ? 396 : 108,
          top: 52,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid var(--mauve-soft)',
          background: 'var(--canvas)',
          color: 'var(--ink-2)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(43, 20, 86, 0.08)',
          zIndex: 60,
          transition: 'left 320ms cubic-bezier(0.32, 0.72, 0.24, 1)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
        </svg>
      </button>
    </>
  );
};

window.ChatScreen = ChatScreen;