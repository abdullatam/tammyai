// Chat screen — the showpiece. Full-width prose, no bubbles.
// Tammy's lines in Instrument Serif. User lines in IBM Plex Sans, right-aligned subtle.
// Working Claude integration. Orb pinned top-right, listening state.
// Three layout variants via Tweaks: prose / asymmetric / editorial.

const FILE_ICONS = {
  pdf: '📄', docx: '📝', doc: '📝',
  csv: '📊', xlsx: '📊', xls: '📊',
  py: '🐍', js: '📜', ts: '📜', jsx: '📜', tsx: '📜',
  json: '📋', yaml: '📋', yml: '📋',
  sql: '🗄️', 
  mp3: '🎵', m4a: '🎵', wav: '🎵', ogg: '🎵',
};

const getFileIcon = (filename) => {
  if (!filename) return '📎';
  const ext = filename.split('.').pop().toLowerCase();
  return FILE_ICONS[ext] || '📎';
};

const ChatScreen = ({ layout = 'prose', onOpenVoice, activeBucket, setActiveBucket }) => {
  const D = window.TammyData;
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [attachments, setAttachments] = React.useState([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = React.useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = React.useState(false);
  const isSearchingWeb = React.useRef(false);
  const fileInputRef = React.useRef(null);
  const textareaRef = React.useRef(null);
  const [streaming, setStreaming] = React.useState('');
  const [orbState, setOrbState] = React.useState('idle');
  const [historyOpen, setHistoryOpen] = React.useState(true);
  const [calToast, setCalToast] = React.useState(null); // { title, date, time }
  const getInitialChatId = () => {
    if (window.TammyData?.pendingChatId) return window.TammyData.pendingChatId;
    const isRefresh = window.performance?.getEntriesByType?.('navigation')?.[0]?.type === 'reload';
    if (isRefresh) return sessionStorage.getItem('tammy_current_chat') || 'new';
    return 'new';
  };
  const [activeChatId, setActiveChatId] = React.useState(getInitialChatId);
  // Ref mirrors state so the async send() closure always reads the current session ID
  const activeChatIdRef = React.useRef(activeChatId);
  const endRef = React.useRef(null);
  const skipNextHistoryFetch = React.useRef(false);


  // Typing telemetry — tracks WPM, deletions, pauses for emotional signal detection
  const typingMeta = React.useRef({ keypressTimes: [], deletions: 0, pauses: 0, lastKeyTs: 0 });

  const onInputChange = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';

    const val = e.target.value;
    const prev = input;
    const now = Date.now();
    const meta = typingMeta.current;

    // Count deletions (backspace/delete detected as value shrinking)
    if (val.length < prev.length) meta.deletions += (prev.length - val.length);

    // Detect pause (>1500ms gap between keystrokes)
    if (meta.lastKeyTs && (now - meta.lastKeyTs) > 1500) meta.pauses += 1;
    meta.lastKeyTs = now;
    meta.keypressTimes.push(now);

    setInput(val);
  };

  const _collectAndResetTypingMeta = () => {
    const meta = typingMeta.current;
    const times = meta.keypressTimes;
    let wpm = 0;
    if (times.length >= 2) {
      const durationMs = times[times.length - 1] - times[0];
      const chars = times.length;
      wpm = durationMs > 0 ? Math.round((chars / 5) / (durationMs / 60000)) : 0;
    }
    const result = { wpm, deletions: meta.deletions, pauses: meta.pauses, duration_ms: times.length >= 2 ? times[times.length-1] - times[0] : 0 };
    typingMeta.current = { keypressTimes: [], deletions: 0, pauses: 0, lastKeyTs: 0 };
    return result;
  };

  React.useEffect(() => {
    sessionStorage.setItem('tammy_current_chat', activeChatId);
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  React.useEffect(() => {
    if (window.TammyData) window.TammyData.pendingChatId = null;
  }, []);

  // Load messages whenever the active session changes
  React.useEffect(() => {
    if (!activeChatId || activeChatId === 'new') {
      setMessages([]);
      return;
    }
    
    let hasCache = false;
    const cacheKey = `tammy_chat_cache_${activeChatId}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setMessages(JSON.parse(cached));
        hasCache = true;
      }
    } catch(e) {}

    if (skipNextHistoryFetch.current) {
      skipNextHistoryFetch.current = false;
      return;
    }

    if (!hasCache) {
      setMessages([]); // Instant visual feedback: clear old chat while fetching
    }
    const safeId = String(activeChatId).trim();
    const baseUrl = window.TAMMY_API || '';
    fetch(`${baseUrl}/sessions/${safeId}/messages`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject('Status: ' + r.status))
      .then(msgs => {
        if (!Array.isArray(msgs)) msgs = [];
        const flat = msgs.flatMap ? msgs : [];
        if (flat.length > 0) {
          setMessages(flat);
          try { sessionStorage.setItem(cacheKey, JSON.stringify(flat)); } catch(e){}
        } else {
          setMessages([]);
        }
      })
      .catch(() => setMessages([]));
  }, [activeChatId]);

  // Update cache whenever messages change
  React.useEffect(() => {
    if (activeChatId && activeChatId !== 'new' && messages.length > 0) {
      try { sessionStorage.setItem(`tammy_chat_cache_${activeChatId}`, JSON.stringify(messages)); } catch(e){}
    }
  }, [messages, activeChatId]);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  // Poll for async network messages injected by background workers
  React.useEffect(() => {
    const poll = setInterval(async () => {
      if (!activeChatIdRef.current || activeChatIdRef.current === 'new') return;
      try {
        const res = await fetch(`${window.TAMMY_API || ''}/network/poll`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.filter(m => m.id).map(m => m.id));
            const newMsgs = data.messages.filter(m => m.id && !existingIds.has(m.id));
            if (newMsgs.length === 0) return prev;
            return [...prev, ...newMsgs];
          });
        }
      } catch (e) {}
    }, 10000); // Every 10 seconds
    return () => clearInterval(poll);
  }, []);

  React.useEffect(() => {
    const handleOpenChat = (e) => {
      if (e.detail) {
        setActiveChatId(e.detail);
        activeChatIdRef.current = e.detail;
      }
    };
    window.addEventListener('tammy:open_chat', handleOpenChat);
    return () => window.removeEventListener('tammy:open_chat', handleOpenChat);
  }, []);

  const handleFiles = async (files) => {
    const newAtts = Array.from(files).map(f => ({
      file: f,
      id: Math.random().toString(36).substring(7),
      status: 'uploading',
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      filename: f.name,
      type: f.type,
    }));

    setAttachments(prev => [...prev, ...newAtts]);

    for (const att of newAtts) {
      const formData = new FormData();
      formData.append('file', att.file);
      try {
        const res = await fetch('/attachments/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setAttachments(prev => prev.map(a => 
          a.id === att.id ? { ...a, status: 'done', serverId: data.attachment_id } : a
        ));
      } catch (err) {
        setAttachments(prev => prev.map(a => 
          a.id === att.id ? { ...a, status: 'error', error: 'Failed' } : a
        ));
      }
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const att = prev.find(a => a.id === id);
      if (att && att.url) URL.revokeObjectURL(att.url);
      return prev.filter(a => a.id !== id);
    });
  };

  const send = async () => {
    const q = input.trim();
    if ((!q && attachments.length === 0) || orbState === 'thinking' || orbState === 'speaking') return;
    if (attachments.some(a => a.status === 'uploading')) return;

    const currentAttachments = [...attachments];
    const serverIds = currentAttachments.map(a => a.serverId).filter(Boolean);

    isSearchingWeb.current = webSearchEnabled;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setAttachments([]);
    setWebSearchEnabled(false);
    setMessages(m => [...m, { role: 'user', text: q, attachments: currentAttachments, webSearch: webSearchEnabled }]);
    setOrbState('thinking');

    // Capture the current session ID from the ref (safe in async context)
    const currentSid = activeChatIdRef.current;
    const isNew = !currentSid || currentSid === 'new';
    const typingSignal = _collectAndResetTypingMeta();

    try {
      setTimeout(() => setOrbState('speaking'), 600);
      const history = messages.map(m => [
        m.role === 'user' ? m.text : null,
        m.role === 'tammy' ? m.text : null,
      ]).filter(pair => pair[0] || pair[1]);

      const userId = (window.TammyData?.user?.user_id) || '123';

      const resp = await fetch('/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          message: q,
          history,
          user_id: userId,
          session_id: isNew ? null : currentSid,
          typing_meta: typingSignal,
          attachment_ids: serverIds.length > 0 ? serverIds : undefined,
          web_search: webSearchEnabled,
        }),
      });

      if (!resp.ok) throw new Error('stream failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buf = '';

      setStreaming('');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop(); // keep partial line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));

            // Server created a new session — persist its ID immediately
            if (payload.session_id) {
              const newSid = payload.session_id;
              
              if (activeChatIdRef.current !== newSid) {
                const newName = payload.session_name || q.split(' ').slice(0, 6).join(' ');
                if (activeChatIdRef.current === 'new') skipNextHistoryFetch.current = true;
                activeChatIdRef.current = newSid;
                setActiveChatId(newSid);

                // Add to sidebar immediately so it shows without a full refresh
                const now = new Date();
                const newEntry = {
                  id: newSid,
                  title: newName,
                  preview: q.substring(0, 80) + (q.length > 80 ? '…' : ''),
                  state: 'open',
                  tint: 'var(--iris)',
                  flagged: false,
                  time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
                  when: 'Today',
                  pinned: false,
                };
                if (window.TammyData) {
                  const history = window.TammyData.chat_history || [];
                  if (!history.some(h => h.id === newSid)) {
                    window.TammyData.chat_history = [newEntry, ...history];
                    window.TammyData.recent_sessions = window.TammyData.chat_history;
                  }
                }
                window.dispatchEvent(new Event('tammy:dataready'));
              }
            }

            if (payload.token) {
              accumulated += payload.token;
              setStreaming(accumulated);
            }

            // Server generated a meaningful title after 2nd exchange
            if (payload.title_updated && payload.session_name) {
              const updatedSid = payload.session_id || activeChatIdRef.current;
              if (window.TammyData?.chat_history) {
                window.TammyData.chat_history = window.TammyData.chat_history.map(s =>
                  s.id === updatedSid ? { ...s, title: payload.session_name } : s
                );
                if (window.TammyData.recent_sessions) {
                  window.TammyData.recent_sessions = window.TammyData.chat_history;
                }
              }
              window.dispatchEvent(new Event('tammy:dataready'));
            }

            if (payload.calendar_action === 'added' && payload.event) {
              const ev = payload.event;
              // Update TammyData calendar so Today screen reflects it
              if (!window.TammyData.calendar_today) window.TammyData.calendar_today = [];
              const today = new Date().toISOString().split('T')[0];
              if (ev.date === today) window.TammyData.calendar_today.push(ev);
              window.dispatchEvent(new Event('tammy:dataready'));
              // Show a toast confirmation
              setCalToast(ev);
              setTimeout(() => setCalToast(null), 5000);
            }

            if (payload.network_action === 'ready') {
               setMessages(m => [...m, { 
                 role: 'tammy', 
                 text: '', 
                 type: 'network_connection_ready', 
                 match_reason: payload.match_reason, 
                 network_request_id: payload.network_request_id 
               }]);
            }

            if (payload.done) {
              setStreaming('');
              // Store the full text as ONE message — the markdown renderer handles paragraphs
              // But only if there is text!
              if (accumulated.trim()) {
                setMessages(m => [...m, { role: 'tammy', text: accumulated }]);
              }
              setOrbState('idle');
            }

            if (payload.error) throw new Error(payload.error);
          } catch (_) {}
        }
      }
    } catch (e) {
      setStreaming('');
      setMessages(m => [...m, { role: 'tammy', text: '…something cut out. Say it again?' }]);
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

      {/* ── Calendar event confirmation — premium animated toast ── */}
      {calToast && (
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0, top: 0,
          zIndex: 10050,
          pointerEvents: 'none',
        }}>
          {/* Backdrop glow pulse */}
          <div style={{
            position: 'fixed',
            bottom: 32, right: 32,
            width: 400, height: 200,
            background: 'radial-gradient(circle, rgba(148,125,237,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'calGlowPulse 2s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          {/* Main card */}
          <div style={{
            position: 'fixed',
            bottom: 36,
            right: 36,
            zIndex: 10051,
            width: 380,
            pointerEvents: 'auto',
            animation: 'calCardEntrance 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}>
            {/* Animated border gradient container */}
            <div style={{
              position: 'relative',
              borderRadius: 20,
              padding: 1.5,
              background: 'linear-gradient(135deg, rgba(148,125,237,0.6), rgba(192,172,255,0.3), rgba(148,125,237,0.5))',
              backgroundSize: '200% 200%',
              animation: 'calBorderShift 3s ease infinite',
            }}>
              {/* Inner glass card */}
              <div style={{
                background: 'var(--surface)',
                borderRadius: 19,
                padding: '22px 24px 20px',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Shimmer sweep */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: '-100%',
                  width: '100%', height: '100%',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(192,172,255,0.08) 40%, rgba(192,172,255,0.15) 50%, rgba(192,172,255,0.08) 60%, transparent 100%)',
                  animation: 'calShimmer 2s ease 0.5s forwards',
                  pointerEvents: 'none',
                }} />

                {/* Top row: icon + status + close */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                  {/* Animated calendar icon */}
                  <div style={{
                    width: 48, height: 48,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(148,125,237,0.15), rgba(192,172,255,0.08))',
                    border: '1px solid rgba(148,125,237,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    animation: 'calIconPop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms both',
                  }}>
                    {/* Calendar glyph */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--iris)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                      <rect x="3" y="4" width="18" height="18" rx="3" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <circle cx="12" cy="15" r="1.5" fill="var(--amber)" stroke="none" />
                    </svg>
                    {/* Check badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: -4, right: -4,
                      width: 20, height: 20,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7DED94, #4ECB71)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(78,203,113,0.4)',
                      border: '2px solid var(--surface)',
                      animation: 'calCheckPop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 500ms both',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--f-sans)',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#7DED94',
                      marginBottom: 4,
                      animation: 'calTextFade 400ms ease 300ms both',
                    }}>
                      ✓ Added to calendar
                    </div>
                    <div className="serif" style={{
                      fontSize: 17,
                      fontWeight: 500,
                      color: 'var(--ink)',
                      fontStyle: 'italic',
                      lineHeight: 1.25,
                      animation: 'calTextFade 400ms ease 400ms both',
                    }}>
                      {calToast.title || 'New event'}
                    </div>
                  </div>

                  {/* Close button */}
                  <button onClick={() => setCalToast(null)} style={{
                    width: 28, height: 28,
                    borderRadius: 8,
                    background: 'rgba(148,125,237,0.08)',
                    border: '1px solid rgba(148,125,237,0.15)',
                    color: 'var(--ink-3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                    transition: 'all 150ms ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,125,237,0.15)'; e.currentTarget.style.color = 'var(--ink)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,125,237,0.08)'; e.currentTarget.style.color = 'var(--ink-3)'; }}
                  >×</button>
                </div>

                {/* Date/time detail strip */}
                <div style={{
                  display: 'flex',
                  gap: 8,
                  animation: 'calStripSlide 500ms cubic-bezier(0.16, 1, 0.3, 1) 500ms both',
                }}>
                  {/* Date chip */}
                  {calToast.date && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 10,
                      background: 'rgba(148,125,237,0.08)',
                      border: '1px solid rgba(148,125,237,0.12)',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--iris)" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="mono" style={{
                        fontSize: 11,
                        color: 'var(--ink-2)',
                        letterSpacing: '0.03em',
                      }}>
                        {(() => {
                          try {
                            const d = new Date(calToast.date + 'T00:00:00');
                            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                          } catch { return calToast.date; }
                        })()}
                      </span>
                    </div>
                  )}

                  {/* Time chip */}
                  {calToast.time && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 10,
                      background: 'rgba(148,125,237,0.08)',
                      border: '1px solid rgba(148,125,237,0.12)',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="mono" style={{
                        fontSize: 11,
                        color: 'var(--ink-2)',
                        letterSpacing: '0.03em',
                      }}>{calToast.time}</span>
                    </div>
                  )}

                  {/* Type chip */}
                  {calToast.type && (
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: 10,
                      background: 'rgba(125,237,148,0.08)',
                      border: '1px solid rgba(125,237,148,0.15)',
                    }}>
                      <span className="mono" style={{
                        fontSize: 10,
                        color: '#7DED94',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}>{calToast.type}</span>
                    </div>
                  )}
                </div>

                {/* Bottom action row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: '1px solid var(--line)',
                  animation: 'calTextFade 400ms ease 700ms both',
                }}>
                  <span style={{
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    fontFamily: 'var(--f-sans)',
                    fontStyle: 'italic',
                  }}>Tammy's got it 🤝</span>
                  <button
                    onClick={() => { setCalToast(null); if (window.TammyNavigate) window.TammyNavigate('calendar'); }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, rgba(148,125,237,0.15), rgba(192,172,255,0.08))',
                      border: '1px solid rgba(148,125,237,0.25)',
                      color: 'var(--iris)',
                      fontSize: 11,
                      fontWeight: 500,
                      fontFamily: 'var(--f-sans)',
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(148,125,237,0.25), rgba(192,172,255,0.15))'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(148,125,237,0.15), rgba(192,172,255,0.08))'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    View calendar →
                  </button>
                </div>

                {/* Confetti particles */}
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    width: i % 2 === 0 ? 6 : 4,
                    height: i % 2 === 0 ? 6 : 8,
                    borderRadius: i % 3 === 0 ? '50%' : 2,
                    background: ['#947DED', '#C0ACFF', '#7DED94', '#ED7D97', '#EDB87D', '#7DEDE4', '#7B9BED', '#ED7DC0'][i],
                    top: '50%',
                    left: '50%',
                    opacity: 0,
                    animation: `calConfetti${i} 800ms cubic-bezier(0.16, 1, 0.3, 1) 300ms forwards`,
                    pointerEvents: 'none',
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Animations */}
          <style>{`
            @keyframes calCardEntrance {
              0% { opacity: 0; transform: translateY(30px) scale(0.92); }
              60% { opacity: 1; transform: translateY(-4px) scale(1.01); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes calGlowPulse {
              0%, 100% { opacity: 0.5; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.15); }
            }
            @keyframes calBorderShift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes calShimmer {
              0% { left: -100%; }
              100% { left: 200%; }
            }
            @keyframes calIconPop {
              0% { opacity: 0; transform: scale(0.3) rotate(-20deg); }
              100% { opacity: 1; transform: scale(1) rotate(0deg); }
            }
            @keyframes calCheckPop {
              0% { opacity: 0; transform: scale(0); }
              60% { transform: scale(1.3); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes calTextFade {
              0% { opacity: 0; transform: translateY(6px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes calStripSlide {
              0% { opacity: 0; transform: translateX(-16px); }
              100% { opacity: 1; transform: translateX(0); }
            }
            @keyframes calConfetti0 { 0% { opacity:1; transform: translate(0,0) rotate(0); } 100% { opacity:0; transform: translate(-60px,-80px) rotate(200deg); } }
            @keyframes calConfetti1 { 0% { opacity:1; transform: translate(0,0) rotate(0); } 100% { opacity:0; transform: translate(70px,-70px) rotate(-180deg); } }
            @keyframes calConfetti2 { 0% { opacity:1; transform: translate(0,0) rotate(0); } 100% { opacity:0; transform: translate(-40px,-110px) rotate(140deg); } }
            @keyframes calConfetti3 { 0% { opacity:1; transform: translate(0,0) rotate(0); } 100% { opacity:0; transform: translate(90px,-50px) rotate(-220deg); } }
            @keyframes calConfetti4 { 0% { opacity:1; transform: translate(0,0) rotate(0); } 100% { opacity:0; transform: translate(-80px,-40px) rotate(160deg); } }
            @keyframes calConfetti5 { 0% { opacity:1; transform: translate(0,0) rotate(0); } 100% { opacity:0; transform: translate(50px,-100px) rotate(-140deg); } }
            @keyframes calConfetti6 { 0% { opacity:1; transform: translate(0,0) rotate(0); } 100% { opacity:0; transform: translate(-30px,-90px) rotate(260deg); } }
            @keyframes calConfetti7 { 0% { opacity:1; transform: translate(0,0) rotate(0); } 100% { opacity:0; transform: translate(60px,-60px) rotate(-200deg); } }
          `}</style>
        </div>
      )}

      <ChatHistoryPanel
        open={historyOpen}
        onToggle={() => setHistoryOpen(o => !o)}
        activeId={activeChatId}
        onSelect={(id) => {
          activeChatIdRef.current = id;
          setActiveChatId(id);
        }}
        onNewChat={() => {
          setMessages([]);
          activeChatIdRef.current = 'new';
          setActiveChatId('new');
        }}
        onDelete={(id) => {
          // If we deleted the active chat, go to new
          if (id === activeChatIdRef.current) {
            setMessages([]);
            activeChatIdRef.current = 'new';
            setActiveChatId('new');
          }
        }}
      />
      {/* Bucket switcher at top */}
      <Buckets active={activeBucket} onChange={setActiveBucket} showSignal={false} />

      {/* Transcript */}
      <main style={{
        flex: 1,
        maxWidth: layout === 'editorial' ? 720 : 800,
        margin: '0 auto',
        width: '100%',
        padding: '24px 48px 140px',
      }}>
        {messages.length === 0 && !streaming && orbState === 'idle' && (
          <div style={{ paddingTop: 80, textAlign: 'center' }}>
            <p className="serif" style={{ fontSize: 28, color: 'var(--ink-3)', margin: '0 0 10px', fontStyle: 'italic' }}>
              she's listening.
            </p>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>
              say what's actually there.
            </p>
          </div>
        )}
        {messages.map((m, i) => <Line key={i} m={m} layout={layout} />)}
        {streaming && <Line m={{ role: 'tammy', text: streaming }} layout={layout} streaming />}
        {orbState === 'thinking' && !streaming && (
          <div className="serif" style={{ color: 'var(--mauve)', fontSize: 22, padding: '20px 0', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 10 }}>
            {isSearchingWeb.current && (
              <span className="mono" style={{ fontSize: 11, color: '#947DED', letterSpacing: '0.08em', fontStyle: 'normal', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(148,125,237,0.08)', padding: '5px 12px', borderRadius: 20 }}>
                <span style={{ fontSize: 14 }}>🌐</span> Searching the web…
              </span>
            )}
            {!isSearchingWeb.current && <span style={{ animation: 'pulse 1.4s ease-in-out infinite' }}>…</span>}
          </div>
        )}
        <div ref={endRef} />
      </main>

      {/* Composer */}
      <footer 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        style={{
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
          flexDirection: 'column',
          padding: '14px 16px 14px 22px',
          background: isDragging ? 'var(--surface-2)' : 'var(--ivory)',
          border: isDragging ? '1px dashed var(--iris)' : '1px solid rgba(178, 157, 217, 0.45)',
          borderRadius: 24,
          boxShadow: '0 8px 28px rgba(31, 17, 56, 0.07), 0 2px 6px rgba(148, 125, 237, 0.05)',
          transition: 'all 200ms ease',
        }}>

          {/* Web search indicator pill */}
          {webSearchEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--mauve-soft)' }}>
              <div
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 14px 5px 10px',
                  background: 'rgba(148,125,237,0.1)',
                  border: '1px solid rgba(148,125,237,0.25)',
                  borderRadius: 20,
                  fontSize: 12, fontFamily: 'var(--f-sans)',
                  color: '#947DED',
                }}
              >
                <span style={{ fontSize: 14 }}>🌐</span>
                <span>Web search on</span>
                <button
                  onClick={() => setWebSearchEnabled(false)}
                  style={{
                    background: 'none', border: 'none', color: '#947DED',
                    cursor: 'pointer', padding: '0 0 0 4px', fontSize: 14,
                    lineHeight: 1, opacity: 0.7,
                  }}
                  title="Turn off web search"
                >×</button>
              </div>
            </div>
          )}
          
          {attachments.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--mauve-soft)' }}>
              {attachments.map(att => (
                <div key={att.id} style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: att.url ? '6px 40px 6px 6px' : '10px 42px 10px 14px',
                  background: 'var(--surface)',
                  border: att.status === 'error' ? '1px solid rgba(220, 80, 80, 0.4)' : '1px solid rgba(148,125,237,0.25)',
                  boxShadow: '0 4px 12px rgba(43,20,86,0.05)',
                  borderRadius: att.url ? 12 : 14,
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                }}>
                  {att.url ? (
                    <img src={att.url} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <>
                      {/* Icon wrapper with glow */}
                      <div style={{
                        width: 32, height: 32,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, rgba(148,125,237,0.15), rgba(192,172,255,0.08))',
                        border: '1px solid rgba(148,125,237,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16,
                      }}>
                        {getFileIcon(att.filename)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className="mono" style={{ 
                          fontSize: 12, fontWeight: 500, color: 'var(--ink)', 
                          maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                        }}>
                          {att.filename}
                        </span>
                        <span style={{
                          fontSize: 9, color: att.status === 'error' ? '#dc5050' : 'var(--iris)',
                          fontFamily: 'var(--f-sans)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase'
                        }}>
                          {att.status === 'uploading' ? 'Uploading...' : att.status === 'error' ? 'Failed' : 'Attached'}
                        </span>
                      </div>
                    </>
                  )}
                  {att.status === 'uploading' && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, height: 2, background: 'var(--iris)', width: '30%',
                      animation: 'pulse 1s ease infinite alternate'
                    }} />
                  )}
                  <button onClick={() => removeAttachment(att.id)} style={{
                    position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)',
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(148,125,237,0.08)', color: 'var(--ink-3)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220, 80, 80, 0.12)'; e.currentTarget.style.color = '#dc5050'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,125,237,0.08)'; e.currentTarget.style.color = 'var(--ink-3)'; }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, position: 'relative' }}>
            <input 
              type="file" multiple ref={fileInputRef} style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }}
            />
            {attachMenuOpen && (
              <>
                <div 
                  onClick={() => setAttachMenuOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 54, left: 0,
                  width: 250,
                  background: 'var(--surface)',
                  border: '1px solid rgba(178, 157, 217, 0.45)',
                  borderRadius: 16,
                  padding: '8px 0',
                  boxShadow: '0 12px 32px rgba(31, 17, 56, 0.12), 0 4px 12px rgba(148, 125, 237, 0.08)',
                  zIndex: 101,
                  animation: 'menuPop 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transformOrigin: 'bottom left',
                }}>
                  <style>{`
                    @keyframes menuPop {
                      from { opacity: 0; transform: scale(0.96) translateY(8px); }
                      to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .attach-menu-item {
                      display: flex; align-items: center; gap: 14px;
                      padding: 10px 18px; width: 100%; border: none; background: transparent;
                      text-align: left; cursor: pointer; color: var(--ink-2);
                      font-family: var(--f-sans); font-size: 14px;
                      transition: background 150ms ease, color 150ms ease;
                    }
                    .attach-menu-item:hover { background: rgba(148, 125, 237, 0.08); color: var(--ink); }
                    .attach-menu-divider { height: 1px; background: rgba(178, 157, 217, 0.2); margin: 6px 0; }
                  `}</style>
                  
                  <button className="attach-menu-item" onClick={() => { fileInputRef.current?.click(); setAttachMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ opacity: 0.8 }}>
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    Add files or photos
                  </button>
                  
                  <div className="attach-menu-divider" />
                  
                  <button className="attach-menu-item" onClick={() => { setWebSearchEnabled(!webSearchEnabled); setAttachMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ opacity: 0.8, color: webSearchEnabled ? 'var(--iris)' : 'currentColor' }}>
                      <circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span style={{ color: webSearchEnabled ? 'var(--iris)' : 'inherit' }}>Web search</span>
                    {webSearchEnabled && <span style={{ marginLeft: 'auto', color: 'var(--iris)' }}>✓</span>}
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => setAttachMenuOpen(!attachMenuOpen)}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '1px solid transparent', background: attachMenuOpen ? 'var(--surface-2)' : 'transparent',
                color: (attachments.length > 0 || attachMenuOpen) ? 'var(--iris)' : 'var(--ink-3)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 200ms ease',
                flexShrink: 0, paddingBottom: 2,
              }}
              title="Add files or actions"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          <textarea
            ref={textareaRef}
            dir="auto"
            value={input}
            onChange={onInputChange}
            onKeyDown={onKey}
            placeholder="say what's actually there…"
            rows={1}
            style={{
              flex: 1, resize: 'none',
              border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--f-sans)', fontSize: 15,
              color: 'var(--ink)', padding: '8px 0',
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={() => {
              // Bug 9: hand active session to voice mode via global
              if (window.TammyData) window.TammyData.pendingVoiceSessionId = (activeChatIdRef.current === 'new' ? null : activeChatIdRef.current);
              onOpenVoice();
            }}
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
          <button onClick={send} className="btn btn-primary" style={{ padding: '10px 18px', opacity: attachments.some(a => a.status === 'uploading') ? 0.5 : 1 }}>
            send
          </button>
          </div>
        </div>
        <div style={{ maxWidth: 820, margin: '10px auto 0', textAlign: 'center', fontSize: 11, color: 'var(--ink-3)' }}>
          enter to send · shift+enter for a new line · she remembers everything
        </div>
      </footer>
    </div>
  );
};

const NetworkActionButtons = ({ m }) => {
  const [actionState, setActionState] = React.useState('idle'); // idle | loading | done
  const [resultText, setResultText] = React.useState('');
  const API = window.TAMMY_API || '';
  const reqId = m.network_request_id;

  const doAction = async (endpoint, successText) => {
    setActionState('loading');
    try {
      const res = await fetch(`${API}${endpoint}`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        setActionState('done');
        setResultText(successText);
      } else {
        setActionState('idle');
      }
    } catch (e) {
      setActionState('idle');
    }
  };

  if (actionState === 'done') {
    return (
      <div style={{ marginTop: 12, padding: '10px 16px', background: 'rgba(148,125,237,0.08)', border: '1px solid rgba(148,125,237,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#947DED', fontSize: 16 }}>✓</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>{resultText}</span>
      </div>
    );
  }

  const btnStyle = (primary) => ({
    padding: '10px 18px',
    borderRadius: 10,
    border: primary ? 'none' : '1px solid var(--mauve-soft)',
    background: primary ? 'var(--ink)' : 'transparent',
    color: primary ? 'var(--surface)' : 'var(--ink-2)',
    fontSize: 13,
    fontFamily: 'var(--f-sans)',
    cursor: actionState === 'loading' ? 'wait' : 'pointer',
    opacity: actionState === 'loading' ? 0.6 : 1,
    transition: 'all 200ms ease',
  });

  if (m.type === 'network_intro_offer') {
    return (
      <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button style={btnStyle(true)} onClick={() => doAction(`/network/accept-intro/${reqId}`, 'Reaching out now…')} disabled={actionState === 'loading'}>
          Yes, reach out
        </button>
        <button style={btnStyle(false)} onClick={() => doAction(`/network/decline-intro/${reqId}`, 'No problem.')} disabled={actionState === 'loading'}>
          Not right now
        </button>
      </div>
    );
  }

  if (m.type === 'network_permission_request') {
    return (
      <div style={{ marginTop: 10 }}>
        {m.need_description && (
          <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 10, marginBottom: 12, borderLeft: '2px solid var(--iris)' }}>
            <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>What they need</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{m.need_description}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={btnStyle(true)} onClick={() => doAction(`/network/accept-permission/${reqId}`, 'Name shared — you are connected!')} disabled={actionState === 'loading'}>
            Yes, share my name
          </button>
          <button style={btnStyle(false)} onClick={() => doAction(`/network/decline-permission/${reqId}`, 'Got it — staying anonymous.')} disabled={actionState === 'loading'}>
            No, keep me anonymous
          </button>
        </div>
      </div>
    );
  }

  if (m.type === 'network_connection_ready') {
    return (
      <div style={{ marginTop: 14 }}>
        {m.match_reason && (
          <div style={{ padding: '10px 14px', background: 'rgba(148,125,237,0.06)', borderRadius: 10, marginBottom: 12, borderLeft: '2px solid var(--iris)' }}>
            <div className="mono" style={{ fontSize: 9, color: 'var(--iris)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>Why they're a match</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, fontStyle: 'italic' }}>{m.match_reason}</div>
          </div>
        )}
        <button
          style={btnStyle(true)}
          onClick={() => {
            // Navigate to network page to see the connection
            if (window.TammyNavigate) window.TammyNavigate('network');
          }}
        >
          View connection →
        </button>
      </div>
    );
  }

  return null;
};

// ── Lightweight markdown renderer — handles **bold**, numbered lists, bullet lists, paragraphs
const renderMarkdown = (text) => {
  if (!text) return [];

  // Split into paragraphs on double newline
  const rawParas = text.split(/\n\n+/);
  const elements = [];

  rawParas.forEach((para, pi) => {
    const trimmed = para.trim();
    if (!trimmed) return;

    // Detect numbered list block (lines starting with 1. 2. 3. etc)
    const lines = trimmed.split('\n');
    const isNumberedList = lines.every(l => /^\d+\.\s/.test(l.trim()));
    const isBulletList = lines.every(l => /^[-*]\s/.test(l.trim()));

    if (isNumberedList || isBulletList) {
      const Tag = isNumberedList ? 'ol' : 'ul';
      elements.push(
        React.createElement(Tag, {
          key: `list-${pi}`,
          style: { margin: '0 0 4px', paddingLeft: 22, listStyle: isNumberedList ? 'decimal' : 'disc' }
        },
          lines.map((l, li) => {
            const content = l.replace(/^(\d+\.|[-*])\s/, '');
            return React.createElement('li', {
              key: li,
              style: { marginBottom: 10, lineHeight: 1.65 }
            }, renderInline(content));
          })
        )
      );
    } else {
      // Regular paragraph — may contain inline formatting
      const inlineNodes = renderInline(trimmed);
      elements.push(
        React.createElement('p', {
          key: `p-${pi}`,
          style: { margin: '0 0 14px', lineHeight: 1.65 }
        }, ...inlineNodes)
      );
    }
  });

  return elements;
};

// Render inline: **bold**, *italic*, and plain text
const renderInline = (text) => {
  const parts = [];
  // Split on **bold** or *italic* markers
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match;
  let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(React.createElement('span', { key: idx++ }, text.slice(last, match.index)));
    }
    const raw = match[0];
    if (raw.startsWith('**')) {
      parts.push(React.createElement('strong', { key: idx++, style: { fontWeight: 650, color: 'var(--ink)' } }, raw.slice(2, -2)));
    } else {
      parts.push(React.createElement('em', { key: idx++ }, raw.slice(1, -1)));
    }
    last = match.index + raw.length;
  }
  if (last < text.length) {
    parts.push(React.createElement('span', { key: idx++ }, text.slice(last)));
  }
  return parts.length > 0 ? parts : [text];
};

const Line = ({ m, layout, streaming }) => {
  const isNetworkMsg = m.type && m.type.startsWith('network_');

  if (m.role === 'tammy') {
    return (
      <div style={{
        padding: layout === 'editorial' ? '18px 0' : '20px 0',
        animation: streaming ? 'none' : 'fadeInUp 500ms ease',
      }}>
        {isNetworkMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #947DED, #C0ACFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>✦</span>
            <span className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#947DED' }}>Tammy Connect</span>
          </div>
        )}
        <div className="serif" dir="auto" style={{
          margin: 0,
          fontSize: layout === 'editorial' ? 15 : 16,
          lineHeight: 1.65,
          color: 'var(--ink)',
          fontWeight: 400,
        }}>
          {renderMarkdown(m.text)}
          {streaming && <span style={{ display: 'inline-block', width: 8, height: 24, background: 'var(--amber)', marginLeft: 4, verticalAlign: '-4px', animation: 'blink 1s infinite' }} />}
        </div>
        {isNetworkMsg && <NetworkActionButtons m={m} />}
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
        <p dir="auto" style={{
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
        {m.attachments && m.attachments.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, justifyContent: isAsym ? 'flex-end' : 'flex-start' }}>
            {m.attachments.map(att => (
              att.url ? (
                <img key={att.id} src={att.url} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--mauve-soft)' }} />
              ) : (
                <div key={att.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 14px', background: 'linear-gradient(135deg, rgba(148,125,237,0.05), rgba(192,172,255,0.02))',
                  border: '1px solid rgba(148,125,237,0.15)', borderRadius: 14,
                  boxShadow: '0 2px 8px rgba(43,20,86,0.04)',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'var(--surface)', border: '1px solid rgba(148,125,237,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>
                    {getFileIcon(att.filename)}
                  </div>
                  <span className="mono" style={{ 
                    fontSize: 12, color: 'var(--ink)', fontWeight: 500,
                    maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                  }}>
                    {att.filename}
                  </span>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


const SessionItem = ({ item, isActive, isDeleting, isPinned, onSelect, onDeleteSession, onRenameSession }) => {
  const [hovered, setHovered] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  const defaultTitle = (item.title && !/^(Chat|Session)\s[\d:]+$/.test(item.title.trim()) && item.title !== 'Session')
    ? item.title
    : (item.preview ? item.preview.replace(/…$/, '').split(' ').slice(0, 5).join(' ') : 'Conversation');

  const [editValue, setEditValue] = React.useState(defaultTitle);

  const submitRename = () => {
    const val = editValue.trim();
    if (val && val !== defaultTitle) onRenameSession(item.id, val);
    else setEditValue(defaultTitle);
    setIsEditing(false);
  };

  return (
    <div
      style={{ 
        position: 'relative',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isDeleting ? 0 : 1,
        transform: isDeleting ? 'translateX(-20px) scale(0.95)' : 'none',
        pointerEvents: isDeleting ? 'none' : 'auto',
        marginBottom: isDeleting ? -60 : 0
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); if (!isEditing) setEditValue(defaultTitle); }}
    >
      <div
        onClick={() => { if (!isEditing) onSelect(item.id); }}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '10px 12px',
          paddingRight: hovered && !isEditing ? 68 : 12,
          minHeight: 60,
          borderRadius: 12,
          border: 'none',
          background: isActive ? 'rgba(148, 125, 237, 0.18)' : hovered ? 'rgba(178, 157, 217, 0.12)' : 'transparent',
          cursor: isEditing ? 'default' : 'pointer',
          marginBottom: 2,
          transition: 'background 160ms ease, padding-right 160ms ease',
          display: 'block',
          pointerEvents: 'auto',
          opacity: isDeleting ? 0.4 : 1,
        }}
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
          {isPinned && !isEditing && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6, verticalAlign: 'baseline', color: 'var(--amber)' }}>
              <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6z" />
            </svg>
          )}
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
              <input
                autoFocus
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') submitRename();
                  if (e.key === 'Escape') { setEditValue(defaultTitle); setIsEditing(false); }
                }}
                onBlur={submitRename}
                style={{
                  flex: 1, border: 'none', background: 'var(--surface-1)', color: 'var(--ink)',
                  fontSize: 13, fontWeight: 500, padding: '2px 6px', borderRadius: 4, outline: '1px solid var(--iris)'
                }}
                onClick={e => e.stopPropagation()}
              />
              <button 
                title="Save"
                onMouseDown={e => e.preventDefault()}
                onClick={e => { e.stopPropagation(); submitRename(); }}
                style={{
                  background: 'rgba(148, 125, 237, 0.1)', border: 'none', color: 'var(--iris)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 4
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          ) : defaultTitle}
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
      </div>
      {hovered && !isDeleting && !isEditing && (
        <div style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', gap: 4,
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            title="Rename chat"
            style={{
              width: 26, height: 26, borderRadius: 8, border: 'none',
              background: 'rgba(148, 125, 237, 0.08)', color: 'var(--iris)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148, 125, 237, 0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148, 125, 237, 0.08)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={(e) => onDeleteSession(e, item.id)}
            title="Delete chat"
            style={{
              width: 26, height: 26, borderRadius: 8,
              border: '1px solid rgba(220, 80, 80, 0.25)', background: 'rgba(220, 80, 80, 0.08)',
              color: '#dc5050', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,80,80,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,80,80,0.08)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      )}
      {isDeleting && (
        <div style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          width: 14, height: 14, borderRadius: '50%',
          border: '2px solid rgba(220,80,80,0.3)',
          borderTopColor: '#dc5050',
          animation: 'spin 0.6s linear infinite',
        }} />
      )}
    </div>
  );
};

const ChatHistoryPanel = ({ open, onToggle, activeId, onSelect, onNewChat, onDelete }) => {
  const [deletingId, setDeletingId] = React.useState(null);
  const [localHistory, setLocalHistory] = React.useState(null); // null = use TammyData
  React.useEffect(() => {
    const h = () => setLocalHistory(null); // force re-read from TammyData
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(id);
    try {
      const base = window.TAMMY_API || '';
      await fetch(`${base}/sessions/${id}`, { method: 'DELETE', credentials: 'include' });
      
      // Delay removal for 300ms to allow CSS animation to complete
      setTimeout(() => {
        const current = localHistory || (window.TammyData?.chat_history || []);
        const updated = current.filter(h => h.id !== id);
        setLocalHistory(updated);
        if (window.TammyData) {
          window.TammyData.chat_history = updated;
          window.TammyData.recent_sessions = window.TammyData.recent_sessions?.filter(h => h.id !== id);
          
          try {
            const snapshot = {
              user: window.TammyData.user,
              greeting: window.TammyData.greeting,
              recent_sessions: window.TammyData.recent_sessions,
              chat_history: window.TammyData.chat_history,
            };
            localStorage.setItem('tammy_data_cache', JSON.stringify(snapshot));
          } catch (e) {}
          
          window.dispatchEvent(new Event('tammy:dataready'));
        }
        if (onDelete) onDelete(id);
        setDeletingId(null);
      }, 300);
      
    } catch (e) {
      // silent fail — item stays
      setDeletingId(null);
    }
  };

  const renameSession = async (id, newTitle) => {
    // Optimistic UI Update - immediately reflect change
    const current = localHistory || (window.TammyData?.chat_history || []);
    const updated = current.map(h => h.id === id ? { ...h, title: newTitle } : h);
    setLocalHistory(updated);
    if (window.TammyData) {
      window.TammyData.chat_history = updated;
      if (window.TammyData.recent_sessions) {
        window.TammyData.recent_sessions = window.TammyData.recent_sessions.map(h => h.id === id ? { ...h, title: newTitle } : h);
      }
      try {
        const snapshot = {
          user: window.TammyData.user,
          greeting: window.TammyData.greeting,
          recent_sessions: window.TammyData.recent_sessions,
          chat_history: window.TammyData.chat_history,
        };
        localStorage.setItem('tammy_data_cache', JSON.stringify(snapshot));
      } catch(e) {}
    }

    try {
      const base = window.TAMMY_API || '';
      await fetch(`${base}/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTitle }),
        credentials: 'include'
      });
      // Always dispatch event after API completes (success or failure) to sync other components
      window.dispatchEvent(new Event('tammy:dataready'));
    } catch(e) {}
  };

  // Bug 15: poll sessions every 30 seconds so sidebar stays live
  React.useEffect(() => {
    const poll = () => {
      const base = window.TAMMY_API || '';
      fetch(`${base}/sessions`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(sess => {
          if (!sess || !window.TammyData) return;
          const now = new Date();
          const seen = new Set();
          const formatted = sess.filter(s => {
            const key = s.id || s._id;
            if (!key || seen.has(key)) return false;
            seen.add(key); return true;
          }).map(s => {
            const d = new Date(s.updated_at * 1000);
            const isToday = d.toDateString() === now.toDateString();
            const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
            const isYesterday = d.toDateString() === yesterday.toDateString();
            const isThisWeek = (now - d) < 7 * 86400000 && !isToday && !isYesterday;
            let when;
            if (isToday) when = 'Today';
            else if (isYesterday) when = 'Yesterday';
            else if (isThisWeek) when = d.toLocaleDateString('en-US', { weekday: 'short' });
            else when = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return {
              id: s.id || s._id,
              title: s.session_name || s.id,
              preview: typeof s.summary === 'string' ? s.summary.substring(0, 80) + '…' : 'Conversation…',
              state: 'open', tint: 'var(--iris)', flagged: false,
              time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
              when, pinned: false,
            };
          });
          window.TammyData.chat_history    = formatted;
          window.TammyData.recent_sessions = formatted;
          setLocalHistory(formatted);
        })
        .catch(() => {});
    };
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, []);
  const D = window.TammyData;
  const history = localHistory || D.chat_history || [];

  // Group by recency window
  const groups = React.useMemo(() => {
    const pinned = history.filter(h => h.pinned);
    const today = history.filter(h => !h.pinned && h.when.startsWith('Today'));
    const yest = history.filter(h => h.when.startsWith('Yesterday'));
    const week = history.filter(h => /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test(h.when));
    const earlier = history.filter(h => /^[A-Z][a-z]{2} \d/.test(h.when));
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
        zIndex: 200,
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
            {g.items.map(s => (
                <SessionItem
                  key={s.id}
                  item={s}
                  isActive={s.id === activeId}
                  isDeleting={s.id === deletingId}
                  isPinned={g.label === 'Pinned'}
                  onSelect={onSelect}
                  onDeleteSession={deleteSession}
                  onRenameSession={renameSession}
                />
              ))}
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
          zIndex: 201,
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