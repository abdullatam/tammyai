// ═══ PAGE 3 — RAG BOOKS MANAGER ═══════════════════════════════════════════
const D = window.AdminData;

const RAGPage = () => {
  const [loading, setLoading] = useState(true);
  const [ragStats, setRagStats] = useState({ total_vectors: 0, books: [] });
  const [books, setBooks] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [injectStage, setInjectStage] = useState(null);
  const [chunkSize, setChunkSize] = useState(512);
  const [pasteMode, setPasteMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // ── Preview modal state
  const [previewModal, setPreviewModal] = useState(null); // { book, chunks, loading }

  // ── Re-index modal state
  const [reindexModal, setReindexModal] = useState(null); // { book, job, jobId }

  useEffect(() => {
    window.AdminAPI.getRagStats().then(s => {
      setRagStats(s);
      setBooks((s.books || []).map((b, i) => ({
        id: b.book_id || `b${i}`,
        title: b.book_name || b.book_id,
        vectors: b.chunk_count || 0,
        chunks: b.chunk_count || 0,
        indexed: 'indexed',
        status: 'ready',
        size: '—',
      })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Poll re-index job
  useEffect(() => {
    if (!reindexModal?.jobId || reindexModal?.job?.status === 'done' || reindexModal?.job?.status === 'error') return;
    const t = setInterval(async () => {
      try {
        const job = await window.AdminAPI.getJob(reindexModal.jobId);
        setReindexModal(m => m ? { ...m, job } : m);
        if (job.status === 'done' || job.status === 'error') clearInterval(t);
      } catch (_) {}
    }, 1500);
    return () => clearInterval(t);
  }, [reindexModal?.jobId, reindexModal?.job?.status]);

  const openPreview = async (book) => {
    setPreviewModal({ book, chunks: [], loading: true });
    try {
      const data = await window.AdminAPI.previewBook(book.id, 30);
      setPreviewModal({ book, chunks: data.chunks || [], loading: false, count: data.count });
    } catch (e) {
      setPreviewModal({ book, chunks: [], loading: false, error: e.message });
    }
  };

  const startReindex = async (book) => {
    setReindexModal({ book, job: { status: 'starting', progress: 0, chunks_done: 0, chunks_total: 0 }, jobId: null });
    try {
      const { job_id, chunks_total } = await window.AdminAPI.reindexBook(book.id);
      setReindexModal(m => m ? { ...m, jobId: job_id, job: { status: 'running', progress: 0, chunks_done: 0, chunks_total } } : m);
    } catch (e) {
      setReindexModal(m => m ? { ...m, job: { status: 'error', error: e.message } } : m);
    }
  };

  const startInject = () => {
    const stages = ['chunking', 'embedding', 'upserting', 'done'];
    let i = 0;
    setInjectStage({ stage: stages[0], pct: 0 });
    const t = setInterval(() => {
      i++;
      if (i >= stages.length) {
        clearInterval(t);
        setTimeout(() => setInjectStage(null), 1500);
        return;
      }
      setInjectStage({ stage: stages[i], pct: (i / (stages.length - 1)) * 100 });
    }, 900);
  };

  return (
    <div className="page">
      <TopHeader
        eyebrow={`${books.length} books · ${books.reduce((s, b) => s + b.vectors, 0).toLocaleString()} vectors`}
        title="RAG Books"
        subtitle="The library Tammy thinks with. Books are chunked, embedded, and stored in Pinecone."
      />

      {/* Books grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 18 }} />)
          : books.map((b) => (
            <div key={b.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusDot status={b.status} />
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>{b.status}</span>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{b.size}</span>
              </div>
              <h3 className="serif" style={{ margin: 0, fontSize: 18, fontWeight: 400, lineHeight: 1.25, minHeight: 44 }}>{b.title}</h3>
              <div style={{ display: 'flex', gap: 18, fontSize: 12, color: 'var(--ink-3)', marginTop: 'auto' }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.06 }}>VECTORS</div>
                  <div className="mono" style={{ color: 'var(--ink)', fontSize: 13 }}>{b.vectors.toLocaleString()}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.06 }}>CHUNKS</div>
                  <div className="mono" style={{ color: 'var(--ink)', fontSize: 13 }}>{b.chunks}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.06 }}>INDEXED</div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 12 }}>{b.indexed}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={() => startReindex(b)}
                >
                  <Icon name="refresh" size={12} /> Re-index
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={() => openPreview(b)}
                >
                  <Icon name="eye" size={12} /> Preview
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px 10px', fontSize: 12, marginLeft: 'auto', color: 'var(--danger)', borderColor: 'transparent' }}
                  onClick={() => setConfirm({ kind: 'book', id: b.id, title: b.title })}
                >
                  <Icon name="trash" size={12} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Upload */}
      <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Inject new book</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button className="btn btn-ghost" style={{ background: !pasteMode ? 'var(--purple-soft)' : 'transparent', color: !pasteMode ? 'var(--purple-hi)' : undefined, borderColor: !pasteMode ? 'var(--purple)' : undefined }} onClick={() => setPasteMode(false)}>Drop file</button>
            <button className="btn btn-ghost" style={{ background: pasteMode ? 'var(--purple-soft)' : 'transparent', color: pasteMode ? 'var(--purple-hi)' : undefined, borderColor: pasteMode ? 'var(--purple)' : undefined }} onClick={() => setPasteMode(true)}>Paste text</button>
          </div>

          {!pasteMode ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
              style={{
                border: `2px dashed ${dragActive ? 'var(--purple)' : 'var(--line-strong)'}`,
                borderRadius: 14,
                padding: '38px 20px',
                textAlign: 'center',
                background: dragActive ? 'var(--purple-soft)' : 'var(--bg-2)',
                transition: 'all 200ms',
                marginBottom: 16,
              }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--purple-hi)' }}>
                <Icon name="upload" size={28} />
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>Drop a PDF, EPUB, or .md file here</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>or click to browse · max 50 MB</div>
            </div>
          ) : (
            <textarea className="textarea" placeholder="Paste book text or article…" style={{ minHeight: 180, marginBottom: 16 }} />
          )}

          {/* Chunk size */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--line)' }}>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Chunk size</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{chunkSize} tokens · {chunkSize < 400 ? 'tighter recall' : chunkSize > 800 ? 'fuller context' : 'balanced'}</div>
            </div>
            <input type="range" min="256" max="1024" step="64" value={chunkSize} onChange={(e) => setChunkSize(+e.target.value)} style={{ width: 200, accentColor: 'var(--purple)' }} />
          </div>

          {/* Inject button + progress */}
          {injectStage ? (
            <div style={{ padding: 16, background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--purple)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--purple-hi)', letterSpacing: 0.1, textTransform: 'uppercase' }}>{injectStage.stage}…</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{Math.round(injectStage.pct)}%</div>
              </div>
              <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${injectStage.pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--purple), var(--purple-hi))', transition: 'width 800ms ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                {['chunking', 'embedding', 'upserting', 'done'].map((s) => (
                  <span key={s} className="mono" style={{ fontSize: 10, color: injectStage.stage === s ? 'var(--purple-hi)' : 'var(--ink-4)', letterSpacing: 0.05 }}>{s.toUpperCase()}</span>
                ))}
              </div>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={startInject}>
              <Icon name="plus" size={14} /> Inject into RAG
            </button>
          )}
        </div>

      {/* ── Delete confirm */}
      {confirm && (
        <ConfirmModal
          danger
          title={`Delete ${confirm.kind === 'book' ? 'book' : 'document'}?`}
          body={`"${confirm.title}" will be removed${confirm.kind === 'book' ? ' from the RAG index. All vectors will be deleted from Pinecone.' : '. The user will lose access to this knowledge.'}`}
          confirmLabel="Delete"
          onConfirm={() => {
            if (confirm.kind === 'book') setBooks((bs) => bs.filter((b) => b.id !== confirm.id));
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── Preview Modal */}
      {previewModal && (
        <div className="backdrop" onClick={() => setPreviewModal(null)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ width: 820, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Book Preview · {previewModal.book.id}</div>
                <h3 className="serif" style={{ margin: 0, fontSize: 22, fontWeight: 400 }}>{previewModal.book.title}</h3>
                {!previewModal.loading && (
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                    Showing {previewModal.chunks.length} chunks · {previewModal.book.vectors.toLocaleString()} total vectors in Pinecone
                  </div>
                )}
              </div>
              <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => setPreviewModal(null)}><Icon name="close" size={14} /></button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {previewModal.loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>Fetching chunks from Pinecone…</div>
                  <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden', maxWidth: 240, margin: '0 auto' }}>
                    <div style={{ height: '100%', background: 'var(--purple)', animation: 'shimmer 1.2s ease infinite', backgroundSize: '200% 100%' }} />
                  </div>
                </div>
              ) : previewModal.error ? (
                <div style={{ padding: 32, color: 'var(--danger)', fontSize: 13 }}>Error: {previewModal.error}</div>
              ) : previewModal.chunks.length === 0 ? (
                <div style={{ padding: 32, color: 'var(--ink-3)', fontSize: 13 }}>No chunks found for this book in Pinecone.</div>
              ) : previewModal.chunks.map((c, i) => (
                <div key={c.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', minWidth: 28, marginTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                        {c.chapter_name && (
                          <span className="pill" style={{ fontSize: 10, background: 'var(--purple-soft)', color: 'var(--purple-hi)', borderColor: 'transparent' }}>
                            {c.chapter_name}
                          </span>
                        )}
                        {c.framework && (
                          <span className="pill" style={{ fontSize: 10 }}>{c.framework}</span>
                        )}
                        {c.intent && (
                          <span className="pill" style={{ fontSize: 10 }}>{c.intent}</span>
                        )}
                        {c.primary_emotion && (
                          <span className="pill" style={{ fontSize: 10, background: 'rgba(237,184,125,0.12)', color: 'var(--warn)', borderColor: 'transparent' }}>
                            {c.primary_emotion}
                          </span>
                        )}
                        {(c.token_count > 0) && (
                          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginLeft: 'auto' }}>{c.token_count} tok</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>{c.chunk_content}</div>
                      <div className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 6 }}>ID: {c.id}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Re-index Modal */}
      {reindexModal && (
        <div className="backdrop" onClick={() => reindexModal.job?.status !== 'running' && setReindexModal(null)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ width: 480, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Re-index Book</div>
                <h3 className="serif" style={{ margin: 0, fontSize: 22, fontWeight: 400 }}>{reindexModal.book.title}</h3>
              </div>
              {reindexModal.job?.status !== 'running' && (
                <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => setReindexModal(null)}><Icon name="close" size={14} /></button>
              )}
            </div>

            {reindexModal.job?.status === 'starting' && (
              <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>Starting re-index job…</div>
            )}

            {(reindexModal.job?.status === 'running' || reindexModal.job?.status === 'starting') && reindexModal.jobId && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--purple-hi)', letterSpacing: 0.1, textTransform: 'uppercase' }}>
                    Re-embedding…
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    {reindexModal.job?.chunks_done || 0} / {reindexModal.job?.chunks_total || '?'} chunks · {Math.round(reindexModal.job?.progress || 0)}%
                  </div>
                </div>
                <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${reindexModal.job?.progress || 0}%`, height: '100%',
                    background: 'linear-gradient(90deg, var(--purple), var(--purple-hi))',
                    transition: 'width 1s ease',
                  }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>
                  Tammy is fetching vectors, generating new embeddings via OpenAI, and upserting them back to Pinecone. This may take a minute for large books.
                </div>
              </div>
            )}

            {reindexModal.job?.status === 'done' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--ok)', fontWeight: 500 }}>Re-index complete</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                      {reindexModal.job.chunks_done || reindexModal.job.chunks_total} chunks re-embedded and upserted to Pinecone.
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setReindexModal(null)}>
                  Done
                </button>
              </div>
            )}

            {reindexModal.job?.status === 'error' && (
              <div>
                <div style={{ padding: '14px 18px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 500, marginBottom: 4 }}>Re-index failed</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{reindexModal.job.error || 'Unknown error'}</div>
                </div>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setReindexModal(null)}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

window.RAGPage = RAGPage;
