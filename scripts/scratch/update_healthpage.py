import os

filepath = "/Users/abdullatamimi/Documents/tammyV4/frontend/src/admin/HealthPage.jsx"
with open(filepath, "r") as f:
    content = f.read()

start_marker = "{/* Voice Pipeline Diagram */}"
end_marker = "{/* Error log */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = """{/* Voice Pipeline (Chain Grid) */}
        <div className="section-h" style={{ marginTop: '30px' }}>
          <h2>Live voice pipeline</h2>
          <span className="h-meta" id="chainBadge">active</span>
        </div>
        <div className="chain" style={{ paddingBottom: '30px' }}>
          <div className={`llm ${healthData?.voice?.speechmatics?.status === 'ok' ? 'active' : ''}`}>
            <div className="tier">step 1</div>
            <div className="name">Speechmatics STT</div>
            <div className="row"><span className="k">status</span>
              <span className="v" style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                <span className={`stat-dot ${healthData?.voice?.speechmatics?.status === 'ok' ? 'ok' : 'bad'}`}></span>
                <span className="num">{healthData?.voice?.speechmatics?.ms || 0}</span>ms
              </span>
            </div>
            <div className="row"><span className="k">processed</span><span className="v num">{(Number(healthData?.voice?.speechmatics?.hoursProcessed || 0) * 60).toFixed(1)} mins</span></div>
            <div className="row"><span className="k">jobs</span><span className="v num">{Number(healthData?.voice?.speechmatics?.jobsProcessed || 0).toLocaleString()}</span></div>
          </div>

          <div className="connector" aria-hidden="true">
            <svg viewBox="0 0 140 40" preserveAspectRatio="none">
              <path className="line" d="M 0 20 L 140 20" />
              <path className="pulse" d="M 0 20 L 140 20" />
            </svg>
          </div>

          <div className={`llm ${(!healthData?.llm?.activeTier || healthData.llm.activeTier.includes('primary')) ? 'active' : ''}`}>
            <div className="tier">step 2</div>
            <div className="name">Claude Haiku LLM</div>
            <div className="row"><span className="k">status</span>
              <span className="v" style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                <span className={`stat-dot ${healthData?.llm?.primaryStatus || 'ok'}`}></span><span className="num">{healthData?.llm?.primaryMs || 0}</span>ms
              </span>
            </div>
            <div className="row"><span className="k">requests · 1h</span><span className="v num">{Number(healthData?.llm?.primaryReqs || 0).toLocaleString()}</span></div>
            <div className="row"><span className="k">rate limit</span><span className="v"><span className="num">{healthData?.llm?.primaryLimitPct || 0}</span>% used</span></div>
          </div>

          <div className="connector" aria-hidden="true">
            <svg viewBox="0 0 140 40" preserveAspectRatio="none">
              <path className="line" d="M 0 20 L 140 20" />
              <path className="pulse" d="M 0 20 L 140 20" />
            </svg>
          </div>

          <div className={`llm ${healthData?.voice?.elevenlabs?.status === 'ok' ? 'active' : ''}`}>
            <div className="tier">step 3</div>
            <div className="name">ElevenLabs TTS</div>
            <div className="row"><span className="k">status</span>
              <span className="v" style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                <span className={`stat-dot ${healthData?.voice?.elevenlabs?.status === 'ok' ? 'ok' : 'bad'}`}></span>
                <span className="num">{healthData?.voice?.elevenlabs?.ms || 0}</span>ms
              </span>
            </div>
            <div className="row"><span className="k">remaining chars</span><span className="v num">{(Number(healthData?.voice?.elevenlabs?.charsLimit || 0) - Number(healthData?.voice?.elevenlabs?.charsUsed || 0)).toLocaleString()}</span></div>
            <div className="row"><span className="k">tier</span><span className="v">{healthData?.voice?.elevenlabs?.tier || 'unknown'}</span></div>
          </div>

          <div className="using" style={{ bottom: '-15px' }}>end-to-end latency: ~1.5s</div>
        </div>

        """
    
    updated_content = content[:start_idx] + new_content + content[end_idx:]
    with open(filepath, "w") as f:
        f.write(updated_content)
    print("Successfully updated HealthPage.jsx")
else:
    print("Markers not found!")
