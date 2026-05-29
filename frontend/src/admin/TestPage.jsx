const { useState, useEffect, useCallback, useRef } = window.React || React;

const TestPage = () => {
  const [promises, setPromises] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [historyRuns, setHistoryRuns] = useState([]);
  
  // Run State
  const [runStatus, setRunStatus] = useState('idle'); // idle | running | complete
  const [activeRunId, setActiveRunId] = useState(null);
  const [liveStats, setLiveStats] = useState({ passed: 0, failed: 0, total: 0, current: 0, elapsed: 0 });
  
  // Live Stage State
  const [activePromiseId, setActivePromiseId] = useState(null);
  const [activePromiseText, setActivePromiseText] = useState('');
  
  const [instanceAState, setInstanceAState] = useState('idle'); // idle | crafting | done
  const [instanceBState, setInstanceBState] = useState('waiting'); // waiting | thinking | speaking | done
  const [instanceCState, setInstanceCState] = useState('waiting'); // waiting | thinking | evaluating | verdict
  const [orbState, setOrbState] = useState('idle'); // idle | thinking | speaking
  
  const [streamContentA, setStreamContentA] = useState('');
  const [streamContentB, setStreamContentB] = useState('');
  const [conversation, setConversation] = useState([]);
  const [verdict, setVerdict] = useState(null);
  
  // Diagnosis State
  const [diagnosisStream, setDiagnosisStream] = useState('');
  const [patches, setPatches] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Refs
  const eventSourceRef = useRef(null);
  const timerRef = useRef(null);
  const convRef = useRef(null);
  
  const fetchPromises = async () => {
    try {
      const data = await window.AdminAPI._fetch('/api/admin/promises');
      setPromises(data || []);
    } catch (e) {
      console.error('Failed to fetch promises:', e);
    }
  };

  const fetchLedger = async () => {
    try {
      const data = await window.AdminAPI._fetch('/api/admin/promise-ledger');
      setLedger(data || []);
    } catch (e) {
      console.error('Failed to fetch ledger:', e);
    }
  };

  const loadHistory = async () => {
    try {
      const runs = await window.AdminAPI._fetch('/api/admin/self-test/history');
      setHistoryRuns(runs || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchPromises();
    fetchLedger();
    loadHistory();
    
    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && runStatus !== 'running' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        startTest();
      }
      if (e.code === 'Escape' && runStatus === 'running') {
        if (confirm("Cancel running test?")) {
          stopTest();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runStatus, promises.length]);
  
  useEffect(() => {
    if (convRef.current) {
      convRef.current.scrollTop = convRef.current.scrollHeight;
    }
  }, [streamContentA, streamContentB, conversation, verdict]);

  const handleReExtract = async () => {
    setIsExtracting(true);
    try {
      const data = await window.AdminAPI._fetch('/api/admin/promises/re-extract', { method: 'POST' });
      setPromises(data || []);
    } catch (e) {
      alert('Extraction failed: ' + e.message);
    }
    setIsExtracting(false);
  };
  
  const stopTest = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRunStatus('idle');
    fetchLedger();
    loadHistory();
  };

  const startTest = () => {
    if (runStatus === 'running') return;
    if (promises.length === 0) return alert('No promises to test. Re-extract first.');
    
    setRunStatus('running');
    setLiveStats({ passed: 0, failed: 0, total: promises.length, current: 0, elapsed: 0 });
    setConversation([]);
    setVerdict(null);
    setDiagnosisStream('');
    setPatches([]);
    setActivePromiseId(null);
    setStreamContentA('');
    setStreamContentB('');
    
    // Reset promises pass/fail status visually by clearing previous results if we had any in state
    // but here we just rely on ledger or new incoming statuses.
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setLiveStats(prev => ({ ...prev, elapsed: prev.elapsed + 1 }));
    }, 1000);
    
    const password = window.AdminCreds.get();
    const url = window.BACKEND + `/api/admin/self-test/stream?auth=${encodeURIComponent(password)}`;
    
    const es = new EventSource(url);
    eventSourceRef.current = es;
    
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      
      switch(data.event) {
        case 'test_start':
          setActivePromiseId(data.promise_id);
          setActivePromiseText(data.promise_text);
          setLiveStats(prev => ({ ...prev, current: data.test_number, total: data.total }));
          setInstanceAState('crafting');
          setInstanceBState('waiting');
          setInstanceCState('waiting');
          setStreamContentA('');
          setStreamContentB('');
          setVerdict(null);
          setConversation([]);
          break;
        
        case 'crafter_token':
          setStreamContentA(prev => prev + data.token);
          break;
        
        case 'crafter_done':
          setInstanceAState('done');
          setInstanceBState('thinking');
          setOrbState('thinking');
          setConversation(prev => [...prev, { from: 'A', text: data.full_message }]);
          setStreamContentA('');
          break;
        
        case 'tammy_thinking':
          setInstanceBState('thinking');
          setOrbState('thinking');
          break;
        
        case 'tammy_token':
          setStreamContentB(prev => prev + data.token);
          setInstanceBState('speaking');
          setOrbState('speaking');
          break;
        
        case 'tammy_done':
          setInstanceBState('done');
          setOrbState('idle');
          setInstanceCState('evaluating');
          setConversation(prev => [...prev, { from: 'B', text: data.full_response }]);
          setStreamContentB('');
          break;
          
        case 'judge_thinking':
          setInstanceCState('evaluating');
          break;
        
        case 'judge_result':
          setInstanceCState('verdict');
          setVerdict({ kept_promise: data.kept_promise, verdict: data.verdict, evidence: data.evidence });
          
          setPromises(prev => prev.map(p => p.promise_id === data.promise_id ? { ...p, status: data.kept_promise ? 'pass' : 'fail' } : p));
          setLiveStats(prev => ({ ...prev, passed: data.kept_promise ? prev.passed + 1 : prev.passed, failed: !data.kept_promise ? prev.failed + 1 : prev.failed }));
          break;
          
        case 'diagnosis_start':
          setRunStatus('complete');
          setDiagnosisStream('');
          if (timerRef.current) clearInterval(timerRef.current);
          break;
          
        case 'diagnosis_token':
          setDiagnosisStream(prev => prev + data.token);
          break;
          
        case 'diagnosis_done':
          // could save full diag if needed
          break;
        
        case 'patch_proposal':
          setPatches(prev => [...prev, data.patch]);
          break;
        
        case 'run_complete':
          setActiveRunId(data.run_id);
          stopTest();
          break;
      }
    };
    
    es.onerror = () => {
      console.error("SSE Error");
      stopTest();
    };
  };

  const handleTestPatch = async (patchId) => {
    try {
      const res = await window.AdminAPI._fetch(`/api/admin/patches/${patchId}/test`, { method: 'POST' });
      alert(res.improvement_confirmed ? 'Patch verified! Ready to accept.' : 'Patch failed verification.');
      // Refresh patches state... we would need to reload results or just update locally
      setPatches(prev => prev.map(p => p.patch_id === patchId || p._id === patchId ? { ...p, status: 'tested', test_result: res } : p));
    } catch (e) {
      alert('Test failed: ' + e.message);
    }
  };

  const handleAcceptPatch = async (patchId) => {
    try {
      await window.AdminAPI._fetch(`/api/admin/patches/${patchId}/accept`, { method: 'POST' });
      alert('Patch applied successfully.');
      setPatches(prev => prev.map(p => p.patch_id === patchId || p._id === patchId ? { ...p, status: 'accepted' } : p));
    } catch (e) {
      alert('Accept failed: ' + e.message);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // derived stats
  const passRate = liveStats.current > 0 ? Math.round((liveStats.passed / liveStats.current) * 100) : 0;
  const avgTimePerTest = liveStats.current > 0 ? liveStats.elapsed / liveStats.current : 0;
  const remaining = Math.round(avgTimePerTest * (liveStats.total - liveStats.current));

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      <div style={{ padding: '0 24px' }}>
        <TopHeader
          eyebrow="Self-Improvement Engine"
          title="Tammy Core Promises"
          subtitle="Dynamic real-time self-testing against The Book of Promise."
        />
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '0 24px 24px', gap: 20 }}>
        
        {/* Left Panel - Promise Queue */}
        <div className="card" style={{ width: 320, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow" style={{ margin: 0 }}>The Promises</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn" style={{ 
                  padding: '4px 10px', 
                  fontSize: 10, 
                  borderRadius: 20, 
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--ink-2)',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }} onClick={handleReExtract} disabled={isExtracting || runStatus === 'running'}>
                <Icon name="refresh" size={12} />
                {isExtracting ? 'Extracting...' : 'Re-extract'}
              </button>
              {runStatus === 'running' ? (
                <button className="btn" style={{ 
                    padding: '6px 16px', 
                    fontSize: 12,
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--danger)',
                    color: '#fff',
                    border: 'none'
                  }} 
                  onClick={stopTest}>
                  <Icon name="stop" size={14} />
                  Stop
                </button>
              ) : (
                <button className="btn btn-primary" style={{ 
                    padding: '6px 16px', 
                    fontSize: 12,
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }} 
                  onClick={startTest} disabled={promises.length === 0}>
                  <Icon name="play" size={14} />
                  Test
                </button>
              )}
            </div>
          </div>
          
          {runStatus !== 'idle' && (
            <div style={{ padding: '16px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 500, fontFamily: 'var(--f-serif)' }}>{liveStats.current} / {liveStats.total}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{remaining > 0 ? `~${formatTime(remaining)} remaining` : ''}</div>
              </div>
              <div style={{ height: 4, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${(liveStats.current / liveStats.total) * 100}%`, background: 'var(--purple)', transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-2)' }}>Pass rate so far: {passRate}%</div>
            </div>
          )}

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {promises.map(p => {
              const isActive = activePromiseId === p.promise_id;
              
              let statusColor = 'var(--ink-4)';
              if (p.status === 'pass') statusColor = 'var(--ok)';
              else if (p.status === 'fail') statusColor = 'var(--danger)';
              else if (isActive) statusColor = 'var(--amber)';
              
              return (
                <div key={p.promise_id} 
                     style={{ 
                       padding: '12px 16px', borderBottom: '1px solid var(--line)', 
                       background: isActive ? 'color-mix(in srgb, var(--purple) 10%, transparent)' : 'transparent',
                       display: 'flex', gap: 10, alignItems: 'flex-start',
                       transition: 'background 0.3s'
                     }}>
                  <div style={{ marginTop: 4 }}>
                    <div style={{ 
                      width: 8, height: 8, borderRadius: '50%', background: statusColor, flexShrink: 0,
                      animation: isActive ? 'pulse-amber 1s infinite alternate' : 'none',
                      boxShadow: isActive ? '0 0 8px var(--amber)' : 'none'
                    }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: 'var(--ink)' }}>{p.promise_id}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.promise_text}
                    </div>
                  </div>
                  {p.status && (
                    <span className="pill" style={{ 
                      background: p.status === 'pass' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                      color: p.status === 'pass' ? 'var(--ok)' : 'var(--danger)',
                      fontSize: 9, flexShrink: 0
                    }}>
                      {p.status.toUpperCase()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Panel - Live Stage */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Stats Bar */}
          {runStatus !== 'idle' && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, background: 'var(--bg-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)', fontWeight: 600, letterSpacing: 1 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse-danger 1s infinite alternate' }} />
                LIVE
              </div>
              <div style={{ color: 'var(--ink-2)' }}>●</div>
              <div style={{ color: 'var(--ink)' }}>Running promise {activePromiseId} of {liveStats.total}</div>
              <div style={{ color: 'var(--ink-2)' }}>·</div>
              <div style={{ color: 'var(--ok)' }}>Passed: {liveStats.passed}</div>
              <div style={{ color: 'var(--ink-2)' }}>·</div>
              <div style={{ color: 'var(--danger)' }}>Failed: {liveStats.failed}</div>
              <div style={{ color: 'var(--ink-2)' }}>·</div>
              <div style={{ color: 'var(--ink)' }}>Pass rate: {passRate}%</div>
              <div style={{ color: 'var(--ink-2)' }}>·</div>
              <div className="mono" style={{ color: 'var(--ink)' }}>Elapsed: {formatTime(liveStats.elapsed)}</div>
            </div>
          )}

          {runStatus === 'idle' && !activeRunId ? (
             <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
               <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15 }} onClick={startTest}>
                 <Icon name="play" size={16} /> Start Legendary Live Test
               </button>
               <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-3)' }}>Or press <kbd style={{ padding: '2px 6px', background: 'var(--surface-2)', borderRadius: 4, border: '1px solid var(--line)' }}>Space</kbd> to begin</div>
             </div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
               <div style={{ padding: '24px', borderBottom: '1px solid var(--line)' }}>
                 <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 8 }}>
                   {activePromiseId ? `PROMISE ${activePromiseId}` : 'TESTING COMPLETE'}
                 </div>
                 <div style={{ fontSize: 16, fontWeight: 500, fontFamily: 'var(--f-serif)' }}>
                   {activePromiseText || 'All systems evaluated.'}
                 </div>
               </div>

               {/* Theater Stage */}
               <div style={{ display: 'flex', padding: 24, gap: 16, justifyContent: 'center', borderBottom: '1px solid var(--line)' }}>
                 
                 {/* Card A */}
                 <div style={{ flex: 1, maxWidth: 200, padding: 16, background: 'var(--surface-2)', borderRadius: 12, border: '1px solid', borderColor: instanceAState === 'crafting' ? 'var(--amber)' : 'var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'all 0.3s', boxShadow: instanceAState === 'crafting' ? '0 0 16px rgba(245, 158, 11, 0.2)' : 'none' }}>
                   <div style={{ width: 48, height: 48, background: 'var(--bg)', borderRadius: 8, transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--amber)' }}>
                     <div style={{ width: 20, height: 20, background: 'var(--amber)', transform: 'rotate(-45deg)' }} />
                   </div>
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Instance A</div>
                     <div style={{ fontSize: 13, fontWeight: 500 }}>Test Crafter</div>
                   </div>
                   <div className="pill" style={{ fontSize: 9, background: 'var(--bg-2)', color: 'var(--ink-2)' }}>[{instanceAState}]</div>
                 </div>

                 {/* Card B */}
                 <div style={{ flex: 1, maxWidth: 200, padding: 16, background: 'var(--surface-2)', borderRadius: 12, border: '1px solid', borderColor: instanceBState === 'speaking' ? 'var(--purple)' : 'var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'all 0.3s', boxShadow: instanceBState === 'speaking' ? '0 0 16px rgba(107, 91, 200, 0.3)' : 'none' }}>
                   <MiniOrb state={orbState} size={48} />
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Instance B</div>
                     <div style={{ fontSize: 13, fontWeight: 500 }}>Real Tammy</div>
                   </div>
                   <div className="pill" style={{ fontSize: 9, background: 'var(--bg-2)', color: 'var(--ink-2)' }}>[{instanceBState}]</div>
                 </div>

                 {/* Card C */}
                 <div style={{ flex: 1, maxWidth: 200, padding: 16, background: 'var(--surface-2)', borderRadius: 12, border: '1px solid', borderColor: instanceCState === 'evaluating' ? '#d946ef' : 'var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'all 0.3s', boxShadow: instanceCState === 'evaluating' ? '0 0 16px rgba(217, 70, 239, 0.2)' : 'none' }}>
                   <div style={{ width: 48, height: 48, background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #d946ef', color: '#d946ef' }}>
                     <Icon name="overview" size={24} />
                   </div>
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Instance C</div>
                     <div style={{ fontSize: 13, fontWeight: 500 }}>The Judge</div>
                   </div>
                   <div className="pill" style={{ fontSize: 9, background: 'var(--bg-2)', color: 'var(--ink-2)' }}>[{instanceCState}]</div>
                 </div>

               </div>

               {/* Conversation Stream */}
               <div ref={convRef} style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg)' }}>
                 
                 {/* Completed messages */}
                 {conversation.map((msg, i) => (
                   <div key={i} style={{ paddingLeft: 16, borderLeft: `3px solid ${msg.from === 'A' ? 'var(--amber)' : 'var(--purple)'}` }}>
                     <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 4 }}>
                       {msg.from === 'A' ? 'Test Crafter sent:' : 'Tammy responded:'}
                     </div>
                     <div style={{ fontSize: 13, color: 'var(--ink)', fontFamily: msg.from === 'A' ? 'var(--f-mono)' : 'var(--f-sans)', whiteSpace: 'pre-wrap' }}>
                       {msg.text}
                     </div>
                   </div>
                 ))}

                 {/* Streaming A */}
                 {streamContentA && (
                   <div style={{ paddingLeft: 16, borderLeft: '3px solid var(--amber)' }}>
                     <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 4 }}>Test Crafter sending:</div>
                     <div style={{ fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--f-mono)', whiteSpace: 'pre-wrap' }}>
                       {streamContentA}<span className="blink">|</span>
                     </div>
                   </div>
                 )}

                 {/* Streaming B */}
                 {streamContentB && (
                   <div style={{ paddingLeft: 16, borderLeft: '3px solid var(--purple)' }}>
                     <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 4 }}>Tammy responding:</div>
                     <div style={{ fontSize: 13, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
                       {streamContentB}<span className="blink">|</span>
                     </div>
                   </div>
                 )}

                 {/* Verdict C */}
                 {verdict && (
                   <div style={{ alignSelf: 'center', margin: '16px 0', padding: '16px 24px', background: 'var(--surface-2)', borderRadius: 12, border: `1px solid ${verdict.kept_promise ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, textAlign: 'center', maxWidth: 400 }}>
                     <div style={{ marginBottom: 12 }}>
                       <span className="pill" style={{ background: verdict.kept_promise ? 'var(--ok)' : 'var(--danger)', color: '#fff', fontSize: 14, padding: '4px 12px' }}>
                         {verdict.kept_promise ? 'KEPT PROMISE' : 'BROKEN PROMISE'}
                       </span>
                     </div>
                     <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{verdict.verdict}</div>
                     <div style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic' }}>"{verdict.evidence}"</div>
                   </div>
                 )}

               </div>
             </div>
          )}
        </div>

        {/* Right Panel - Diagnostics & Patches */}
        <div className="card" style={{ width: 320, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--line)' }}>
            <div className="eyebrow">{diagnosisStream || runStatus === 'complete' ? "TAMMY'S SELF-DIAGNOSIS" : 'Diagnostics & Patches'}</div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: 16 }}>
            
            {runStatus === 'idle' && !activeRunId && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)', fontSize: 12 }}>Waiting for test run to begin.</div>
            )}
            
            {runStatus === 'running' && !diagnosisStream && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)', fontSize: 12 }}>Diagnostics will stream here after testing completes.</div>
            )}

            {(diagnosisStream || (runStatus === 'complete' && patches)) && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.6, padding: 16, background: 'var(--surface-2)', borderRadius: 8, fontFamily: 'var(--f-serif)', fontStyle: 'italic', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.05)' }}>
                  {diagnosisStream}{runStatus === 'complete' ? '' : <span className="blink">|</span>}
                </div>
              </div>
            )}

            {patches.length > 0 && (
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 12, letterSpacing: 1 }}>Proposed Patches ({patches.length})</div>
                {patches.map(patch => (
                  <div key={patch._id} style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: 12, 
                    padding: 16, 
                    marginBottom: 16, 
                    animation: 'fadeIn 0.5s ease-out',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 24px -4px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Target: Promise {patch.promise_id}
                      </div>
                      <span className="pill" style={{ 
                        background: patch.status === 'tested' ? 'rgba(74,222,128,0.15)' : patch.status === 'pending' ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)',
                        color: patch.status === 'tested' ? 'var(--ok)' : patch.status === 'pending' ? 'var(--warn)' : 'var(--ink-3)',
                        border: `1px solid ${patch.status === 'tested' ? 'rgba(74,222,128,0.2)' : patch.status === 'pending' ? 'rgba(234,179,8,0.2)' : 'transparent'}`,
                        fontSize: 9, padding: '4px 8px', fontWeight: 600
                      }}>
                        {patch.status ? patch.status.toUpperCase() : 'PENDING'}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 20 }}>
                      {patch.rationale}
                    </div>
                    
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <button className="btn" style={{ 
                          flex: 1, fontSize: 12, padding: '8px 0', 
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6
                        }} 
                        onClick={() => handleTestPatch(patch._id)}
                        disabled={patch.status === 'accepted' || patch.status === 'rejected'}>
                        <i className="ph ph-flask" style={{ marginRight: 6 }}></i>
                        {patch.status === 'tested' ? 'Re-Test Patch' : 'Test Patch'}
                      </button>
                      
                      {patch.status === 'tested' && (
                        <button className="btn" style={{ 
                            flex: 1, fontSize: 12, padding: '8px 0', 
                            background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6,
                            boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)'
                          }} 
                          onClick={() => handleAcceptPatch(patch._id)}>
                          <i className="ph ph-check-circle" style={{ marginRight: 6 }}></i>
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </div>
      
      {/* Bottom - History Strip */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>PREVIOUS RUNS</div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {historyRuns.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>No previous runs found.</div>
          ) : (
            historyRuns.map(run => {
              const passPct = run.total_promises > 0 ? (run.passed / run.total_promises) * 100 : 0;
              const pillColor = passPct >= 80 ? 'var(--ok)' : passPct >= 50 ? 'var(--amber)' : 'var(--danger)';
              return (
                <div key={run.run_id} style={{ padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div style={{ fontSize: 12 }}>{new Date(run.ran_at * 1000).toLocaleString()}</div>
                  <div className="pill" style={{ background: pillColor, color: '#fff', fontSize: 10, padding: '2px 6px' }}>
                    {Math.round(passPct)}% PASS
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <style>{`
        .blink { animation: blinker 1s linear infinite; }
        @keyframes blinker { 50% { opacity: 0; } }
        @keyframes pulse-amber { 0% { opacity: 0.5; box-shadow: 0 0 2px var(--amber); } 100% { opacity: 1; box-shadow: 0 0 10px var(--amber); } }
        @keyframes pulse-danger { 0% { opacity: 0.2; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.2); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

window.TestPage = TestPage;
