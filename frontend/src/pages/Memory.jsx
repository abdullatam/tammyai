// Memory screen.

const API_BASE = window.TAMMY_API || 'http://localhost:7861';

const MemStat = ({ n, label, right, small }) => (
  <div style={{ padding: '24px 0', borderRight: right ? 'none' : '1px solid var(--mauve-soft)', paddingLeft: 24 }}>
    <div className="serif" style={{ fontSize: small ? 28 : 44, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.1, textTransform: small ? 'capitalize' : 'none' }}>{n}</div>
    <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 10 }}>{label}</div>
  </div>
);

const memActionBtn = {
  background: 'transparent', border: '1px solid var(--mauve-soft)', fontSize: 11, color: 'var(--ink-2)', cursor: 'pointer',
  fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '5px 10px', borderRadius: 6,
  display: 'inline-flex', alignItems: 'center', transition: 'all 160ms ease',
};

const MemoryRow = ({ m, last, editing, editText, setEditText, saving, onEdit, onSave, onCancel, onForget }) => {
  const [hover, setHover] = React.useState(false);
  const [confirmForget, setConfirmForget] = React.useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setConfirmForget(false); }}
      style={{ display: 'grid', gridTemplateColumns: '120px 1fr 110px', alignItems: 'flex-start', gap: 24, padding: '22px 8px', borderBottom: last ? 'none' : '1px solid var(--mauve-soft)', background: editing ? 'var(--surface)' : 'transparent', borderLeft: editing ? '2px solid var(--ink)' : '2px solid transparent', paddingLeft: editing ? 16 : 8, transition: 'all 200ms ease' }}>
      <div style={{ paddingTop: 6 }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', padding: '4px 9px', background: 'var(--surface-2)', borderRadius: 6 }}>{m.cat}</span>
      </div>
      <div>
        {editing ? (
          <div>
            <textarea value={editText} onChange={e => setEditText(e.target.value)} autoFocus
              style={{ width: '100%', minHeight: 60, padding: '10px 14px', fontSize: 18, fontFamily: 'var(--font-serif,Georgia)', color: 'var(--ink)', background: 'var(--ivory)', border: '1px solid var(--mauve)', borderRadius: 10, outline: 'none', resize: 'vertical', lineHeight: 1.4 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={onSave} disabled={saving} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>{saving ? 'Saving…' : 'Save'}</button>
              <button onClick={onCancel} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="serif" style={{ fontSize: 19, color: 'var(--ink)', lineHeight: 1.45, letterSpacing: '-0.005em' }}>{m.text}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 10, opacity: hover ? 1 : 0, transform: hover ? 'translateY(0)' : 'translateY(-4px)', transition: 'all 180ms ease', pointerEvents: hover ? 'auto' : 'none' }}>
              <button onClick={onEdit} style={memActionBtn}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginRight: 4 }}><path d="M8 1 L11 4 L4 11 L1 11 L1 8 Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                edit
              </button>
              <button style={memActionBtn}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginRight: 4 }}><path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                correct
              </button>
              {confirmForget ? (
                <>
                  <button onClick={onForget} style={{ ...memActionBtn, color: 'var(--amber)', background: 'var(--amber-soft)' }}>confirm forget</button>
                  <button onClick={() => setConfirmForget(false)} style={memActionBtn}>cancel</button>
                </>
              ) : (
                <button onClick={() => setConfirmForget(true)} style={{ ...memActionBtn, color: 'var(--ink-3)' }}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginRight: 4 }}><path d="M2 3 L10 3 M4 3 L4 1 L8 1 L8 3 M3 3 L3 11 L9 11 L9 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  forget
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', paddingTop: 6 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>{m.time}</span>
      </div>
    </div>
  );
};

const MemoryScreen = () => {
  const [data, setData] = React.useState(window.TammyData);
  const [filter, setFilter] = React.useState('all');
  const [editing, setEditing] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [adding, setAdding] = React.useState(false);
  const [addText, setAddText] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [limit, setLimit] = React.useState(50);

  React.useEffect(() => {
    const h = () => setData({ ...window.TammyData });
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, []);

  const cats = ['all', 'identity', 'venture', 'pattern', 'relationship', 'decision', 'emotional', 'value'];
  const memories = data.memories || [];
  const catCounts = memories.reduce((a, m) => { a[m.cat] = (a[m.cat] || 0) + 1; return a; }, {});
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  const recent = memories.filter(m => /day|hour|week|now/i.test(m.time)).length;
  const shown = filter === 'all' ? memories : memories.filter(m => m.cat === filter);

  const startEdit = (m) => { setEditing(m.id); setEditText(m.text); };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/memories/${id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText }),
      });
      if (res.ok) {
        const updated = await res.json();
        window.TammyData.memories = window.TammyData.memories.map(m => m.id === id ? { ...m, ...updated } : m);
        setData({ ...window.TammyData });
      }
    } catch {}
    setSaving(false);
    setEditing(null);
  };

  const handleForget = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/memories/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        window.TammyData.memories = window.TammyData.memories.filter(m => m.id !== id);
        setData({ ...window.TammyData });
      }
    } catch {}
  };

  const handleAdd = async () => {
    if (!addText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/memories`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: addText }),
      });
      if (res.ok) {
        const newMem = await res.json();
        window.TammyData.memories = [newMem, ...window.TammyData.memories];
        setData({ ...window.TammyData });
        setAdding(false);
        setAddText('');
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div style={{ marginLeft: 120, padding: '48px 64px 80px', maxWidth: 1100, margin: '0 auto 0 120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 18 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 14 }}>
            memory · {memories.length} things tammy holds about you
          </div>
          <h1 className="serif" style={{ fontSize: 64, fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Here's what I<br /><em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>remember about you.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0, maxWidth: 580, lineHeight: 1.5 }}>
            Edit anything I got wrong. Correct what's drifted. Forget what I shouldn't be holding.
            Everything stays until you say otherwise.
          </p>
        </div>
        <button onClick={() => setAdding(true)} className="btn btn-primary" style={{ flexShrink: 0, marginTop: 12, padding: '14px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: -2 }}>+</span>
          Tell me something
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--mauve-soft)', borderBottom: '1px solid var(--mauve-soft)', marginTop: 56, marginBottom: 40 }}>
        <MemStat n={memories.length} label="total memories" />
        <MemStat n={Object.keys(catCounts).length} label="categories" />
        <MemStat n={topCat} label="most about" small />
        <MemStat n={recent} label="added this week" right />
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 32, alignItems: 'center' }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginRight: 6 }}>filter</span>
        {cats.map(c => {
          const count = c === 'all' ? memories.length : catCounts[c] || 0;
          if (count === 0 && c !== 'all') return null;
          return (
            <button key={c} onClick={() => { setFilter(c); setLimit(50); }} style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontFamily: 'var(--f-sans)', background: filter === c ? 'var(--ink)' : 'var(--surface)', color: filter === c ? 'var(--ivory)' : 'var(--ink-2)', border: filter === c ? '1px solid var(--ink)' : '1px solid var(--mauve-soft)', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 160ms ease' }}>
              {c}
              <span style={{ fontSize: 10, fontFamily: 'var(--f-mono)', opacity: filter === c ? 0.7 : 0.5, letterSpacing: '0.05em' }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {adding && (
          <div style={{ padding: '22px 8px', borderBottom: '1px solid var(--mauve-soft)', background: 'var(--surface)', borderLeft: '2px solid var(--ink)', paddingLeft: 16 }}>
            <textarea value={addText} onChange={e => setAddText(e.target.value)} autoFocus placeholder="What should I remember?"
              style={{ width: '100%', minHeight: 60, padding: '10px 14px', fontSize: 18, fontFamily: 'var(--font-serif,Georgia)', color: 'var(--ink)', background: 'var(--ivory)', border: '1px solid var(--mauve)', borderRadius: 10, outline: 'none', resize: 'vertical', lineHeight: 1.4 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={handleAdd} disabled={saving} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>{saving ? 'Saving…' : 'Save memory'}</button>
              <button onClick={() => setAdding(false)} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Cancel</button>
            </div>
          </div>
        )}
        {shown.slice(0, limit).map((m, i) => (
          <MemoryRow key={m.id} m={m} last={i === shown.slice(0, limit).length - 1}
            editing={editing === m.id} editText={editText} setEditText={setEditText} saving={saving}
            onEdit={() => startEdit(m)} onSave={() => saveEdit(m.id)} onCancel={() => setEditing(null)} onForget={() => handleForget(m.id)} />
        ))}
        {shown.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--mauve)', borderRadius: 16, color: 'var(--ink-3)', fontStyle: 'italic' }}>
            Nothing here in this category yet.
          </div>
        )}
        {shown.length > limit && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => setLimit(l => l + 50)} className="btn btn-ghost" style={{ padding: '10px 24px', fontSize: 13 }}>
              Load {Math.min(50, shown.length - limit)} more
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 40, padding: '24px 28px', background: 'var(--surface)', border: '1px dashed var(--mauve)', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ink)', color: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontFamily: 'var(--font-serif,Georgia)', fontStyle: 'italic', flexShrink: 0 }}>T</div>
        <div style={{ flex: 1 }}>
          <div className="serif" style={{ fontSize: 18, color: 'var(--ink)', letterSpacing: '-0.01em' }}>Anything else I should hold onto?</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>Tell me a fact, a value, a person, a thing you want me to remember about you.</div>
        </div>
        <button onClick={() => { setAdding(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }}>Add memory</button>
      </div>
    </div>
  );
};

window.MemoryScreen = MemoryScreen;
