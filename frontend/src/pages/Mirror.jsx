// Mirror Moment screen.
// Bug 12: real SpeechSynthesis audio, orb animates during playback
// Bug 13: fix excerpts (array) vs excerpt (string) schema mismatch + force-generate button

const { ScreenWrap, Eyebrow, H1, Sub, ScreenSkeleton, LockedGate } = window._ExtraShared;
const MIRROR_API = window.EXTRA_API || window.TAMMY_API || 'http://localhost:7861';

const WaveBars = ({ active }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 100, justifyContent: 'center' }}>
    {[...Array(60)].map((_, i) => {
      const h = 16 + Math.sin(i * 0.4) * 30 + Math.cos(i * 0.7) * 18;
      return (
        <div key={i} style={{
          width: 3,
          height: Math.abs(h) + 8,
          background: i < 24 ? 'var(--ink)' : 'var(--mauve)',
          borderRadius: 999,
          animation: active ? `pulse 1.${i % 9}s ease-in-out infinite` : 'none',
        }} />
      );
    })}
  </div>
);

const SourceRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--mauve-soft)' }}>
    <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{label}</div>
    <div className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>{value}</div>
  </div>
);

const MirrorScreen = () => {
  const [, rerender] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [mirrorOverride, setMirrorOverride] = React.useState(null);
  const utterRef = React.useRef(null);

  React.useEffect(() => {
    const h = () => rerender(n => n + 1);
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  // Stop speech on unmount
  React.useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const D = window.TammyData;
  const mirror = mirrorOverride || D.mirror;

  // Bug 13: normalise schema — backend returns { excerpts: [...] } or { excerpt: "..." }
  const _getExcerpt = (m) => {
    if (!m) return '';
    if (typeof m.excerpt === 'string' && m.excerpt) return m.excerpt;
    if (Array.isArray(m.excerpts)) return m.excerpts.join('\n\n');
    if (typeof m.excerpts === 'string') return m.excerpts;
    if (typeof m.content === 'string') return m.content;
    return '';
  };

  // Bug 12: play / pause using window.speechSynthesis
  const handlePlayPause = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const fullText = _getExcerpt(mirror);
    if (!fullText) return;
    window.speechSynthesis.cancel();

    // Detect language from content
    const isArabic = /[\u0600-\u06FF]/.test(fullText);
    const utter = new SpeechSynthesisUtterance(fullText);
    utter.lang = isArabic ? 'ar-SA' : 'en-US';
    utter.rate = 0.92;
    utterRef.current = utter;
    utter.onend   = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utter);
    setPlaying(true);
  };

  // Bug 13: force-generate button
  const handleForceGenerate = async () => {
    setGenerating(true);
    try {
      const resp = await fetch(`${MIRROR_API}/api/mirror?force=1`, { credentials: 'include' });
      if (resp.ok) {
        const data = await resp.json();
        setMirrorOverride(data);
        if (window.TammyData) {
          window.TammyData.mirror = data;
          window.dispatchEvent(new Event('tammy:dataready'));
        }
      }
    } catch (_) {}
    setGenerating(false);
  };

  if (mirror === undefined) return <ScreenWrap><ScreenSkeleton /></ScreenWrap>;

  if (mirror === null || mirror.locked) return <LockedMirror />;

  const excerpt       = _getExcerpt(mirror);
  const paragraphs    = excerpt.split(/\n\n+/).filter(Boolean);
  const sessionCount  = mirror.session_count  || mirror.sessions_this_week || '—';
  const decisionCount = mirror.decisions_touched || '—';
  const avoidanceCount= mirror.avoidance_signals || '—';
  const moodDelta     = mirror.mood_delta || '—';
  const voiceRatio    = mirror.voice_text_ratio || '—';
  const generatedAt   = mirror.generated_at ? new Date(mirror.generated_at * 1000).toLocaleDateString() : 'this week';

  return (
    <ScreenWrap>
      <Eyebrow>Reflection · {generatedAt}</Eyebrow>
      <H1>Mirror moment</H1>
      <Sub>A spoken read of where you are right now. Harsh, fair, private. Listen on a walk, not at your desk.</Sub>

      <div style={{ padding: 40, background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)', border: '1px solid var(--mauve-soft)', borderRadius: 24, marginBottom: 40 }}>
        <WaveBars active={playing} />
        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Bug 12: real SpeechSynthesis play/pause */}
          <button
            onClick={handlePlayPause}
            disabled={!excerpt}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--amber)', border: 'none', cursor: excerpt ? 'pointer' : 'default',
              color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 32px var(--amber-glow)', flexShrink: 0,
              opacity: excerpt ? 1 : 0.4,
            }}
          >
            {playing
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 19 12 7 20" /></svg>
            }
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', fontStyle: 'italic' }}>
              {playing ? 'playing aloud…' : excerpt ? 'tap to listen' : 'no reflection yet'}
            </div>
            {playing && (
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
                reading with {/[\u0600-\u06FF]/.test(excerpt) ? 'Arabic' : 'English'} voice
              </div>
            )}
          </div>
          <button
            onClick={handleForceGenerate}
            disabled={generating}
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: '8px 14px', opacity: generating ? 0.5 : 1 }}
          >
            {generating ? 'generating…' : 'refresh'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 18 }}>Excerpt</div>
          {paragraphs.length > 0 ? paragraphs.map((para, i) => (
            <p key={i} className="serif" style={{
              fontSize: 24, color: i === paragraphs.length - 1 ? 'var(--ink-2)' : 'var(--ink)',
              lineHeight: 1.45, margin: '0 0 24px', letterSpacing: '-0.01em',
            }}>{para}</p>
          )) : (
            <div>
              <p className="serif" style={{ fontSize: 20, color: 'var(--ink-3)', lineHeight: 1.5, fontStyle: 'italic' }}>
                Tammy is preparing your reflection…
              </p>
              <button
                onClick={handleForceGenerate}
                disabled={generating}
                className="btn btn-ghost"
                style={{ marginTop: 16, opacity: generating ? 0.5 : 1 }}
              >
                {generating ? 'generating…' : 'Generate now'}
              </button>
            </div>
          )}
        </div>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 18 }}>Generated from</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SourceRow label="Sessions this week" value={sessionCount} />
            <SourceRow label="Decisions touched"  value={decisionCount} />
            <SourceRow label="Avoidance signals"  value={avoidanceCount} />
            <SourceRow label="Mood baseline"       value={moodDelta} />
            <SourceRow label="Voice : text ratio"  value={voiceRatio} />
          </div>
        </div>
      </div>
    </ScreenWrap>
  );
};

window.MirrorScreen = MirrorScreen;
