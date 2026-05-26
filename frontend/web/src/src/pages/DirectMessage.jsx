// DirectMessage.jsx — Peer-to-peer messaging between connected users
// Full chat UI: message bubbles, input, auto-scroll, polling for new messages.

const DirectMessageScreen = () => {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const endRef = React.useRef(null);
  const pollRef = React.useRef(null);
  const myUserId = window.TammyData?.user?.user_id || '';

  // Connection info passed via window.TammyData.activeConnectionChat
  const connInfo = React.useRef(window.TammyData?.activeConnectionChat || null);
  const connectionId = connInfo.current?.connection_id;
  const otherName = connInfo.current?.other_user_name || 'User';
  const matchReason = connInfo.current?.match_reason || '';

  // Clear on mount
  React.useEffect(() => {
    if (window.TammyData?.activeConnectionChat) {
      delete window.TammyData.activeConnectionChat;
    }
  }, []);

  // Load messages
  const fetchMessages = React.useCallback(async () => {
    if (!connectionId) return;
    try {
      const API = window.TAMMY_API || '';
      const res = await fetch(`${API}/network/thread/${connectionId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Fetch messages failed', e);
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  // Initial load + polling
  React.useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  // Auto-scroll to bottom
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput('');
    // Optimistic add
    setMessages(prev => [...prev, { sender_id: myUserId, sender_name: 'You', text, timestamp: Date.now() / 1000 }]);

    try {
      const API = window.TAMMY_API || '';
      await fetch(`${API}/network/thread/${connectionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text }),
      });
    } catch (e) {
      console.error('Send failed', e);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!connectionId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--ink-3)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18 }}>No connection selected</p>
          <button className="btn btn-ghost" onClick={() => { if (window.TammyNavigate) window.TammyNavigate('network'); }}>Back to Network</button>
        </div>
      </div>
    );
  }

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      marginLeft: 90,
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px',
        borderBottom: '1px solid var(--mauve-soft)',
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'var(--canvas)',
        zIndex: 5,
      }}>
        <button
          onClick={() => { if (window.TammyNavigate) window.TammyNavigate('network'); }}
          style={{
            background: 'none', border: 'none', color: 'var(--ink-3)',
            cursor: 'pointer', fontSize: 18, padding: '4px 8px',
          }}
        >←</button>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #947DED, #C0ACFF)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontFamily: 'var(--font-serif,Georgia)', flexShrink: 0,
        }}>
          {otherName.split(' ').map(s => s[0]).join('')}
        </div>
        <div>
          <div className="serif" style={{ fontSize: 20, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{otherName}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Connected via Tammy
          </div>
        </div>
      </div>

      {/* Match context banner */}
      {matchReason && (
        <div style={{
          margin: '16px 32px 0', padding: '12px 18px',
          background: 'rgba(148,125,237,0.05)',
          border: '1px solid rgba(148,125,237,0.15)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 14 }}>✦</span>
          <span style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.4 }}>
            Tammy connected you: <em style={{ color: 'var(--ink-2)' }}>{matchReason}</em>
          </span>
        </div>
      )}

      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '24px 32px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 40 }}>
            <span style={{ animation: 'pulse 1.4s ease-in-out infinite' }}>Loading…</span>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p className="serif" style={{ fontSize: 24, color: 'var(--ink-3)', margin: '0 0 8px', fontStyle: 'italic' }}>
              Start the conversation
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
              Say hi to {otherName}. You are both connected through Tammy.
            </p>
          </div>
        )}

        {messages.map((m, i) => {
          const isMe = m.sender_id === myUserId;
          return (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
              alignSelf: isMe ? 'flex-end' : 'flex-start',
            }}>
              {/* Sender name for other user */}
              {!isMe && (i === 0 || messages[i - 1]?.sender_id !== m.sender_id) && (
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 4, marginLeft: 14, letterSpacing: '0.08em' }}>
                  {m.sender_name}
                </span>
              )}
              <div style={{
                padding: '10px 16px',
                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isMe
                  ? 'linear-gradient(135deg, #947DED, #B8A5F0)'
                  : 'var(--surface-2)',
                color: isMe ? '#fff' : 'var(--ink)',
                fontSize: 14,
                lineHeight: 1.55,
                fontFamily: 'var(--f-sans)',
                boxShadow: isMe
                  ? '0 2px 8px rgba(148,125,237,0.25)'
                  : '0 1px 3px rgba(0,0,0,0.04)',
                wordBreak: 'break-word',
              }}>
                {m.text}
              </div>
              <span style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 3, opacity: 0.6, padding: '0 14px' }}>
                {formatTime(m.timestamp)}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 32px 24px',
        borderTop: '1px solid var(--mauve-soft)',
        background: 'var(--canvas)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          background: 'var(--surface)',
          border: '1px solid rgba(178, 157, 217, 0.45)',
          borderRadius: 20,
          padding: '10px 14px 10px 20px',
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${otherName}…`}
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', color: 'var(--ink)',
              fontSize: 14, fontFamily: 'var(--f-sans)',
              resize: 'none', lineHeight: 1.5,
              minHeight: 24, maxHeight: 120,
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: input.trim() ? 'linear-gradient(135deg, #947DED, #C0ACFF)' : 'var(--surface-2)',
              border: 'none', cursor: input.trim() ? 'pointer' : 'default',
              color: input.trim() ? '#fff' : 'var(--ink-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 200ms ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

window.DirectMessageScreen = DirectMessageScreen;
