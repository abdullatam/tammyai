// Chat screen — the showpiece. Full-width prose, no bubbles.
// Tammy's lines in Instrument Serif. User lines in IBM Plex Sans, right-aligned subtle.
// Working Claude integration. Orb pinned top-right, listening state.
// Three layout variants via Tweaks: prose / asymmetric / editorial.

const API = 'http://localhost:7861';

const ChatScreen = ({ layout = 'prose', onOpenVoice, activeBucket, setActiveBucket }) => {
  const [data, setData] = React.useState(window.TammyData);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [streaming, setStreaming] = React.useState('');
  const [orbState, setOrbState] = React.useState('idle');
  const [historyOpen, setHistoryOpen] = React.useState(true);
  const [activeChatId, setActiveChatId] = React.useState(null);
  const endRef = React.useRef(null);

  React.useEffect(() => {
    const onReady = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', onReady);
    return () => window.removeEventListener('tammy:dataready', onReady);
  }, []);

  React.useEffect(() => {
    endRef.current?.parentElement?.parentElement?.scrollTo({ top: 99999, behavior: 'smooth' });
  }, [messages, streaming]);

  const send = async () => {
    const q = input.trim();
    if (!q || orbState === 'thinking' || orbState === 'speaking') return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setOrbState('thinking');

    try {
      setTimeout(() => setOrbState('speaking'), 400);
      const history = [...messages, { role: 'user', text: q }].map(m => ({
        role: m.role === 'tammy' ? 'assistant' : 'user',
        content: m.text,
      }));

      const resp = await fetch(`${API}/chat/stream`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.token) {
              accumulated += payload.token;
              setStreaming(accumulated);
            } else if (payload.done) {
              const chunks = accumulated.split(/\n\n+/).filter(Boolean);
              setStreaming('');
              setMessages(m => [...m, ...(chunks.length ? chunks : [accumulated]).map(c => ({ role: 'tammy', text: c }))]);
              setOrbState('idle');
            } else if (payload.error) {
              throw new Error(payload.error);
            }
          } catch (_) {}
        }
      }
      setOrbState('idle');
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
        onSelect={(id) => setActiveChatId(id)}
        onNewChat={() => {
          setMessages([]);
          setActiveChatId('new');
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

const ChatHistoryPanel = ({ open, onToggle, activeId, onSelect, onNewChat }) => {
  const [data, setData] = React.useState(window.TammyData);
  React.useEffect(() => {
    const onReady = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', onReady);
    return () => window.removeEventListener('tammy:dataready', onReady);
  }, []);

  // Normalize sessions from live API or legacy mock
  const rawSessions = data.recent_sessions || data.chat_history || [];
  const history = rawSessions.map(s => ({
    id: s.id || s._id || String(Math.random()),
    title: s.title || s.preview || 'Session',
    preview: s.preview || '',
    when: s.when || s.time || '',
    pinned: s.pinned || false,
  }));

  // Group by recency window
  const groups = React.useMemo(() => {
    const pinned = history.filter(h => h.pinned);
    const today = history.filter(h => !h.pinned && (h.when || '').startsWith('Today'));
    const yest = history.filter(h => (h.when || '').startsWith('Yesterday'));
    const week = history.filter(h => /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test(h.when || ''));
    const earlier = history.filter(h => /^[A-Z][a-z]{2} \d/.test(h.when || ''));
    return [
      { label: 'Pinned', items: pinned },
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yest },
      { label: 'This week', items: week },
      { label: 'Earlier', items: earlier },
    ].filter(g => g.items.length);
  }, [history]);

  return (
    <>
    <aside
      style={{
        position: 'fixed',
        left: 100,
        top: 24,
        bottom: 24,
        width: open ? 268 : 0,
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
        padding: '18px 18px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(178, 157, 217, 0.25)',
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px 18px' }}>
        {groups.map(g => (
          <div key={g.label} style={{ marginTop: 14 }}>
            <div className="mono" style={{
              fontSize: 9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              padding: '0 10px 6px',
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
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: 'none',
                    background: isActive ? 'rgba(148, 125, 237, 0.18)' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: 2,
                    transition: 'background 160ms ease',
                    display: 'block',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(178, 157, 217, 0.12)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    fontFamily: 'var(--f-sans)',
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: 'var(--ink)',
                    marginBottom: 3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {g.label === 'Pinned' && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6, verticalAlign: 'baseline', color: 'var(--amber)' }}>
                        <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6z" />
                      </svg>
                    )}
                    {item.title}
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-sans)',
                    fontSize: 11.5,
                    color: 'var(--ink-3)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontStyle: 'italic',
                  }}>
                    {item.preview}
                  </div>
                  <div className="mono" style={{
                    fontSize: 9.5,
                    color: 'var(--ink-3)',
                    marginTop: 4,
                    letterSpacing: '0.05em',
                  }}>
                    {item.when}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      </aside>

      {/* Toggle handle — always visible, sits on the panel's right edge */}
      <button
        onClick={onToggle}
        title={open ? 'Hide history' : 'Show history'}
        style={{
          position: 'fixed',
          left: open ? 100 + 268 - 14 : 100,
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