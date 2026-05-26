/**
 * VoiceMode.jsx — Complete rebuild
 * Architecture: Single Speechmatics WebSocket for entire session.
 * Microphone starts/stops between exchanges. WebSocket stays open.
 * Silence detection (1200ms) triggers send. No push-to-talk.
 */

const VoiceMode = ({ onExit }) => {
  // === REFS — never use state for real-time voice data ===
  const wsRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const transcriptRef = React.useRef('');
  const silenceTimerRef = React.useRef(null);
  const isProcessingRef = React.useRef(false);
  const isConnectedRef = React.useRef(false);
  const detectedLanguageRef = React.useRef('en');
  const sessionIdRef = React.useRef(window.TammyData?.pendingVoiceSessionId || null);
  const lastMessagesRef = React.useRef([]);
  const abortControllerRef = React.useRef(null);
  const activeAudioRef = React.useRef(null);
  const isUnmountedRef = React.useRef(false);

  // === STATE — only for UI rendering ===
  const [status, setStatus] = React.useState('connecting');
  const [displayText, setDisplayText] = React.useState('');
  const [orbState, setOrbState] = React.useState('idle');
  const [sttLangUI, setSttLangUI] = React.useState('en');
  const sttLangRef = React.useRef('en');

  // === MOUNT — connect Speechmatics ONCE ===
  React.useEffect(() => {
    connectSpeechmatics();
    return () => cleanup();
  }, []);

  // Escape key to exit
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleExit(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // === SPEECHMATICS CONNECTION — runs exactly ONCE ===
  const jwtRef = React.useRef(null);

  const connectSpeechmatics = async () => {
    setStatus('connecting');
    isConnectedRef.current = false;

    // Get temporary JWT from backend
    let jwt;
    try {
      const res = await fetch('/api/voice/config', { credentials: 'include' });
      const data = await res.json();
      jwt = data.jwt || data.speechmatics_key;
      jwtRef.current = jwt;
    } catch (err) {
      console.error('[Voice] Failed to get config:', err);
      setStatus('error');
      return;
    }

    const currentLang = sttLangRef.current;
    // Open WebSocket — language in URL path (required by Speechmatics RT v2)
    const ws = new WebSocket(`wss://eu2.rt.speechmatics.com/v2/${currentLang}?jwt=${jwt}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[Voice] WebSocket opened for ${currentLang}`);
      ws.send(JSON.stringify({
        message: 'StartRecognition',
        audio_format: { type: 'file' },
        transcription_config: {
          language: currentLang,
          operating_point: 'enhanced',
          enable_partials: true,
          max_delay: 1.5
        }
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.message) {
        case 'RecognitionStarted':
          console.log('[Voice] RecognitionStarted — starting mic');
          isConnectedRef.current = true;
          setStatus('listening');
          setOrbState('listening');
          startMicrophone();
          break;

        case 'AddPartialTranscript':
          if (isProcessingRef.current) return;
          if (msg.metadata?.transcript) {
            setDisplayText(transcriptRef.current + msg.metadata.transcript);
            resetSilenceTimer();
            detectedLanguageRef.current = sttLangRef.current;
          }
          break;

        case 'AddTranscript':
          if (isProcessingRef.current) return;
          if (msg.metadata?.transcript?.trim()) {
            transcriptRef.current += msg.metadata.transcript;
            setDisplayText(transcriptRef.current);
            resetSilenceTimer();
            detectedLanguageRef.current = sttLangRef.current;
          }
          break;

        case 'Error':
          console.error('[Voice] Speechmatics error:', msg);
          break;
      }
    };

    ws.onerror = (err) => {
      console.error('[Voice] WebSocket error:', err);
      setStatus('error');
    };

    ws.onclose = () => {
      isConnectedRef.current = false;
      console.log('[Voice] WebSocket closed');
      if (!isUnmountedRef.current && wsRef.current === ws) {
        // Auto-reconnect in the background to keep the connection alive seamlessly
        setTimeout(() => connectSpeechmatics(), 1000);
      }
    };
  };

  // === MICROPHONE — starts and stops, WebSocket stays open ===
  const startMicrophone = async () => {
    if (mediaRecorderRef.current?.state === 'recording') return;
    try {
      let stream = streamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000
          }
        });
        streamRef.current = stream;
      }

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(e.data);
        }
      };

      recorder.start(100); // send chunks every 100ms
      setStatus('listening');
      setOrbState('listening');
    } catch (err) {
      console.error('Microphone error:', err);
    }
  };

  const stopMicrophone = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    // Do NOT close the stream tracks — reuse them
    // Do NOT touch the WebSocket — it stays open
  };

  // === SILENCE TIMER — 2500ms of silence triggers send ===
  const resetSilenceTimer = () => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      const text = transcriptRef.current.trim();
      if (text && !isProcessingRef.current) {
        finalizeAndSend(text);
      }
    }, 1200);
  };

  // === SEND TO TAMMY ===
  const finalizeAndSend = async (text) => {
    isProcessingRef.current = true;
    transcriptRef.current = '';
    clearTimeout(silenceTimerRef.current);

    setStatus('thinking');
    setOrbState('thinking');
    setDisplayText(text);

    try {
      abortControllerRef.current = new AbortController();
      // Stream from Claude
      const response = await fetch('/chat/stream', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: text,
          session_id: sessionIdRef.current,
          voice_mode: true,
          language: detectedLanguageRef.current,
          history: lastMessagesRef.current.slice(-4)
        })
      });

      if (!response.ok) {
        console.error('Chat stream failed:', response.status);
        restartListening();
        return;
      }

      // Collect full response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';
      let sentenceBuffer = '';
      let isPlaying = false;
      let audioQueue = [];
      let streamFinished = false;

      const playQueue = async () => {
        if (isPlaying || audioQueue.length === 0 || isUnmountedRef.current) return;
        isPlaying = true;
        const textToSpeak = audioQueue.shift();
        
        setStatus('speaking');
        setOrbState('speaking');
        await speakWithElevenLabs(textToSpeak);
        isPlaying = false;
        
        if (isUnmountedRef.current) return;

        if (audioQueue.length > 0) {
          playQueue();
        } else if (streamFinished) {
          restartListening();
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              fullResponse += data.token;
              sentenceBuffer += data.token;
              setDisplayText(fullResponse);
              
              const match = sentenceBuffer.match(/([.!?\u061F\u06D4,\u060C:;]+(?:\s+|$))/);
              if (match) {
                const boundaryIndex = match.index + match[0].length;
                const sentence = sentenceBuffer.slice(0, boundaryIndex).trim();
                if (sentence) {
                  audioQueue.push(sentence);
                  playQueue();
                }
                sentenceBuffer = sentenceBuffer.slice(boundaryIndex);
              }
            }
            if (data.done && data.session_id) {
              sessionIdRef.current = data.session_id;
              if (window.TammyData) {
                window.TammyData.pendingVoiceSessionId = data.session_id;
              }
            }
            if (data.session_id && !sessionIdRef.current) {
              sessionIdRef.current = data.session_id;
              if (window.TammyData) {
                window.TammyData.pendingVoiceSessionId = data.session_id;
              }
            }
          } catch {}
        }
      }

      // Update message history for next exchange
      lastMessagesRef.current.push(
        { role: 'user', content: text },
        { role: 'assistant', content: fullResponse }
      );
      if (lastMessagesRef.current.length > 8) {
        lastMessagesRef.current = lastMessagesRef.current.slice(-8);
      }

      streamFinished = true;
      if (sentenceBuffer.trim()) {
        audioQueue.push(sentenceBuffer.trim());
        playQueue();
      } else if (audioQueue.length === 0 && !isPlaying) {
        restartListening();
      }

    } catch (err) {
      console.error('Voice pipeline error:', err);
      restartListening();
    }
  };

  // === ELEVENLABS TTS — human voice ===
  const speakWithElevenLabs = (text) => {
    return new Promise(async (resolve) => {
      if (isUnmountedRef.current) return resolve();
      try {
        const response = await fetch('/api/voice/tts-stream', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            language: detectedLanguageRef.current
          })
        });

        if (isUnmountedRef.current) return resolve();

        if (!response.ok) {
          console.error('ElevenLabs TTS failed:', response.status);
          resolve();
          return;
        }

        const blob = await response.blob();
        if (blob.size === 0) {
          console.error('ElevenLabs returned empty audio');
          resolve();
          return;
        }

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        activeAudioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          activeAudioRef.current = null;
          resolve();
        };

        audio.onerror = (err) => {
          console.error('Audio playback error:', err);
          URL.revokeObjectURL(url);
          activeAudioRef.current = null;
          resolve();
        };

        if (!isUnmountedRef.current) {
          await audio.play();
        } else {
          resolve();
        }

      } catch (err) {
        console.error('speakWithElevenLabs error:', err);
        resolve();
      }
    });
  };

  // === RESTART LISTENING — between exchanges ===
  const restartListening = () => {
    isProcessingRef.current = false;
    transcriptRef.current = '';
    setDisplayText('');
    setOrbState('listening');
    setStatus('listening');
    
    // Stop old MediaRecorder
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Speechmatics RT requires a fresh WebSocket session for a new MediaRecorder stream.
    // Close the old one, and connect from scratch.
    if (wsRef.current) {
      // Temporarily clear the ref so the onclose handler doesn't auto-reconnect
      const oldWs = wsRef.current;
      wsRef.current = null;
      oldWs.close();
    }
    
    setTimeout(() => {
      connectSpeechmatics();
    }, 100);
  };

  // === CLEANUP — only on voice mode exit ===
  const cleanup = () => {
    isUnmountedRef.current = true;
    clearTimeout(silenceTimerRef.current);
    isProcessingRef.current = false;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ message: 'EndOfStream', last_seq_no: 0 }));
      } catch {}
      wsRef.current.close();
    }
  };

  const handleExit = () => {
    cleanup();
    onExit();
  };

  const toggleLanguage = () => {
    const newLang = sttLangRef.current === 'en' ? 'ar' : 'en';
    sttLangRef.current = newLang;
    setSttLangUI(newLang);
    detectedLanguageRef.current = newLang;
    
    // Completely kill old mic recorder so it doesn't send invalid trailing chunks
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      if (mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      mediaRecorderRef.current = null;
    }

    if (wsRef.current) {
      try { wsRef.current.send(JSON.stringify({ message: 'EndOfStream', last_seq_no: 0 })); } catch {}
      wsRef.current.close();
    }
    
    // UI feedback
    setStatus('connecting');
    setDisplayText(`Switching to ${newLang === 'ar' ? 'Arabic' : 'English'}...`);
    connectSpeechmatics();
  };

  // === RENDER ===
  const stateLabel = { connecting: 'connecting', listening: 'listening', thinking: 'thinking', speaking: 'speaking', error: 'error' }[status] || status;
  const langBadge = detectedLanguageRef.current === 'ar' ? 'العربية' : 'English';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(180deg, var(--canvas) 0%, var(--canvas-tint) 100%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'absolute', top: 24, right: 28, display: 'flex', gap: 12 }}>
        <button
          onClick={toggleLanguage}
          style={{
            background: 'rgba(255,253,248,0.7)', border: '1px solid rgba(178,157,217,0.35)',
            height: 44, padding: '0 16px', borderRadius: 22, cursor: 'pointer',
            fontSize: 14, color: 'var(--iris)', fontWeight: 600, fontFamily: 'var(--f-sans)'
          }}
        >
          {sttLangUI === 'ar' ? 'AR' : 'EN'}
        </button>
        <button
          onClick={handleExit}
          style={{
            background: 'rgba(255,253,248,0.7)', border: '1px solid rgba(178,157,217,0.35)',
            width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
            fontSize: 16, color: 'var(--ink-2)',
          }}
        >✕</button>
      </div>

      <Orb size={360} state={orbState === 'error' ? 'idle' : orbState} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          {stateLabel}
        </div>
        {status !== 'connecting' && status !== 'error' && (
          <div style={{ fontSize: 10, color: 'var(--amber)', fontFamily: 'var(--f-mono)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--amber-soft)', background: 'var(--amber-soft)' }}>
            {langBadge}
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, maxWidth: 720, textAlign: 'center', padding: '0 32px', minHeight: 100 }}>
        {status === 'error' ? (
          <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            Connection dropped. Voice is unavailable.
          </p>
        ) : status === 'connecting' ? (
          <p style={{ fontSize: 15, color: 'var(--ink-3)', fontStyle: 'italic', animation: 'pulse 2s infinite' }}>warming up...</p>
        ) : displayText ? (
          <p className="serif" key={displayText.slice(0, 30)} style={{
            fontSize: 28, lineHeight: 1.35, color: 'var(--ink)',
            fontWeight: 400, animation: 'fadeInUp 400ms ease',
            direction: sttLangUI === 'ar' ? 'rtl' : 'ltr'
          }}>{displayText}</p>
        ) : status === 'listening' ? (
          <p style={{ fontSize: 15, color: 'var(--ink-3)', fontStyle: 'italic' }}>speak now…</p>
        ) : null}
      </div>

      <div style={{ position: 'absolute', bottom: 48, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
          esc to leave · 1.2s silence to send
        </div>
      </div>
    </div>
  );
};

window.VoiceMode = VoiceMode;
