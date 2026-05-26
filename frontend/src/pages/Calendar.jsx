// Calendar screen — full month grid + event list + add/edit modal.
// Tammy can create/edit events from chat; this screen is the ground truth.

const CAL_API = window.TAMMY_API || 'http://localhost:7861';

const EVENT_COLORS = {
  meeting: '#947DED',
  call:    '#C0ACFF',
  personal:'#6B5BC8',
  general: '#8B8898',
  lunch:   '#F0A500',
  review:  '#4E9A6F',
};

const eventColor = (type) => EVENT_COLORS[type] || EVENT_COLORS.general;

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function toYMD(year, month, day) {
  return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
function fmtTime(t) {
  if (!t) return '';
  const [h,m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const hr   = h % 12 || 12;
  return `${hr}:${String(m).padStart(2,'0')}${ampm}`;
}
function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y,mo,d] = dateStr.split('-').map(Number);
  return `${MONTHS[mo-1]} ${d}, ${y}`;
}

// ── EventModal ────────────────────────────────────────────────────────────────
const EventModal = ({ event, defaultDate, onSave, onDelete, onClose }) => {
  const isEdit = !!event;
  const [title,     setTitle]     = React.useState(event?.title     || '');
  const [date,      setDate]      = React.useState(event?.date      || defaultDate || '');
  const [time,      setTime]      = React.useState(event?.time      || '');
  const [type,      setType]      = React.useState(event?.type      || 'general');
  const [notes,     setNotes]     = React.useState(event?.notes     || '');
  const [attendees, setAttendees] = React.useState(event?.attendees || '');
  const [loading,   setLoading]   = React.useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const body = { title: title.trim(), date, time, type, notes, attendees };
    try {
      if (isEdit) {
        await fetch(`${CAL_API}/api/calendar/events/${event.event_id}`, {
          method: 'PUT', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        onSave({ ...event, ...body });
      } else {
        const r = await fetch(`${CAL_API}/api/calendar/events`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const ev = await r.json();
        onSave(ev);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!event?.event_id) return;
    if (!window.confirm('Delete this event?')) return;
    setLoading(true);
    await fetch(`${CAL_API}/api/calendar/events/${event.event_id}`, {
      method: 'DELETE', credentials: 'include',
    });
    onDelete(event.event_id);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(31,28,48,0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--canvas)', border: '1px solid var(--mauve-soft)',
        borderRadius: 24, padding: '36px 40px', width: 500, maxWidth: '94vw',
        boxShadow: '0 40px 100px rgba(43,20,86,0.22)',
        animation: 'fadeInUp 200ms ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 className="serif" style={{ fontSize: 26, fontWeight: 400, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
            {isEdit ? 'Edit event' : 'New event'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Event</label>
          <input
            autoFocus
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="What is it?"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10,
              border: '1px solid var(--mauve-soft)', background: 'var(--surface)',
              color: 'var(--ink)', fontSize: 15, fontFamily: 'var(--f-sans)',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
        </div>

        {/* Date + Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid var(--mauve-soft)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--f-sans)', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid var(--mauve-soft)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--f-sans)', boxSizing: 'border-box', outline: 'none' }} />
          </div>
        </div>

        {/* Type */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Type</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.keys(EVENT_COLORS).map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                padding: '6px 13px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontFamily: 'var(--f-sans)',
                background: type === t ? eventColor(t) : 'var(--surface)',
                color: type === t ? '#fff' : 'var(--ink-3)',
                border: `1px solid ${type === t ? eventColor(t) : 'var(--mauve-soft)'}`,
                transition: 'all 160ms',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Attendees */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Attendees</label>
          <input value={attendees} onChange={e => setAttendees(e.target.value)}
            placeholder="Sarah, Mike…"
            style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid var(--mauve-soft)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--f-sans)', boxSizing: 'border-box', outline: 'none' }} />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            rows={3} placeholder="Anything Tammy should know…"
            style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid var(--mauve-soft)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--f-sans)', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isEdit ? (
            <button onClick={handleDelete} disabled={loading} style={{
              padding: '10px 18px', borderRadius: 10, border: '1px solid var(--amber)',
              background: 'transparent', color: 'var(--amber)', fontSize: 13,
              fontFamily: 'var(--f-sans)', cursor: 'pointer',
            }}>Delete</button>
          ) : <div />}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--mauve-soft)', background: 'transparent', color: 'var(--ink-3)', fontSize: 13, fontFamily: 'var(--f-sans)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading || !title.trim()} style={{
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background: 'var(--ink)', color: 'var(--canvas)',
              fontSize: 13, fontFamily: 'var(--f-sans)', fontWeight: 500, cursor: 'pointer',
              opacity: !title.trim() ? 0.5 : 1,
            }}>
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MonthGrid ─────────────────────────────────────────────────────────────────
const MonthGrid = ({ year, month, events, holidays, todayStr, selectedDate, onSelectDate, onEventClick }) => {
  const totalDays = daysInMonth(year, month);
  const firstDay  = firstDayOfMonth(year, month);
  const cells = [];

  // Pad with empty cells for first week
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  // Pad end to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDate = {};
  events.forEach(ev => {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  });

  const holidaysByDate = {};
  (holidays || []).forEach(h => {
    let current = new Date(h.date + 'T00:00:00');
    for (let i = 0; i < h.duration_days; i++) {
      const dStr = current.toISOString().split('T')[0];
      if (!holidaysByDate[dStr]) holidaysByDate[dStr] = [];
      holidaysByDate[dStr].push(h);
      current.setDate(current.getDate() + 1);
    }
  });

  return (
    <div>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 2, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} className="mono" style={{ textAlign: 'left', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 14px' }}>
            {d}
          </div>
        ))}
      </div>
      {/* Calendar cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ymd = toYMD(year, month, day);
          const isToday    = ymd === todayStr;
          const isSelected = ymd === selectedDate;
          const dayEvents  = eventsByDate[ymd] || [];
          const dayHolidays = holidaysByDate[ymd] || [];
          const isRamadan = dayHolidays.some(h => h.type === 'ramadan');

          return (
            <div
              key={i}
              onClick={() => onSelectDate(ymd)}
              style={{
                minHeight: 84, padding: '8px 6px', borderRadius: 12, cursor: 'pointer',
                background: isSelected ? 'rgba(148,125,237,0.12)' : isToday ? 'rgba(148,125,237,0.06)' : isRamadan ? 'linear-gradient(135deg, rgba(107, 63, 160, 0.08) 0%, rgba(107, 63, 160, 0.01) 100%)' : 'transparent',
                border: isSelected ? '1px solid rgba(148,125,237,0.4)' : isToday ? '1px solid rgba(148,125,237,0.2)' : isRamadan ? '1px solid rgba(107, 63, 160, 0.08)' : '1px solid transparent',
                transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = isRamadan ? 'linear-gradient(135deg, rgba(107, 63, 160, 0.12) 0%, rgba(107, 63, 160, 0.03) 100%)' : 'var(--surface)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? 'rgba(148,125,237,0.06)' : isRamadan ? 'linear-gradient(135deg, rgba(107, 63, 160, 0.08) 0%, rgba(107, 63, 160, 0.01) 100%)' : 'transparent'; }}
            >
              {/* Background Watermark for Holidays */}
              {dayHolidays.length > 0 && dayHolidays[0].emoji && (
                <div style={{
                  position: 'absolute',
                  bottom: -10, right: -8,
                  fontSize: 52,
                  opacity: dayHolidays[0].type === 'ramadan' ? 0.04 : 0.08,
                  transform: 'rotate(-15deg)',
                  pointerEvents: 'none',
                  zIndex: 0,
                  filter: 'grayscale(30%)'
                }}>
                  {dayHolidays[0].emoji}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: isToday ? 'var(--iris)' : 'transparent',
                  color: isToday ? '#fff' : 'var(--ink)',
                  fontSize: 13, fontWeight: isToday ? 600 : 400,
                  fontFamily: 'var(--f-sans)',
                }}>
                  {day}
                </div>
              </div>
              
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 4, marginBottom: dayEvents.length ? 6 : 0 }}>
                {dayHolidays.map((h, j) => {
                  const isStart = h.date === ymd;
                  const displayTitle = (h.type === 'ramadan' && !isStart) ? 'رمضان الكريم 🌙' : h.title;
                  
                  return (
                    <div key={'h'+j} title={h.title} style={{
                      fontSize: 9.5, color: h.color, fontFamily: 'var(--f-sans)',
                      fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      animation: `holidayShimmer ${3 + (j % 2)}s ease-in-out infinite`,
                      padding: '0 4px',
                      animationDelay: `${(i % 3) * 0.3}s`
                    }}>
                      {displayTitle}
                    </div>
                  );
                })}
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                {dayEvents.slice(0, 3).map((ev, j) => (
                  <div key={j} onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                    title={`${ev.time ? fmtTime(ev.time) + ' ' : ''}${ev.title}`}
                    style={{
                      display: 'block', boxSizing: 'border-box',
                      width: '100%', maxWidth: '100%', minWidth: 0,
                      fontSize: 10, color: '#fff', padding: '2px 6px', borderRadius: 6, marginBottom: 3,
                      background: eventColor(ev.type),
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                    {ev.time ? `${fmtTime(ev.time)} ` : ''}{ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', paddingLeft: 4, marginTop: 2 }}>
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── CalendarScreen ────────────────────────────────────────────────────────────
const CalendarScreen = () => {
  const now        = new Date();
  const todayStr   = now.toISOString().split('T')[0];
  const [year,  setYear]  = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth()); // 0-indexed
  const [events, setEvents] = React.useState([]);
  const [holidays, setHolidays] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState(todayStr);
  const [modal, setModal] = React.useState(null); // null | 'new' | event-object (for edit)

  React.useEffect(() => {
    const loadHolidays = async () => {
      const yr = new Date().getFullYear();
      try {
        const [thisYear, nextYear] = await Promise.all([
          fetch(`${CAL_API}/api/calendar/holidays/${yr}`, { credentials: 'include' }).then(r => r.json()),
          fetch(`${CAL_API}/api/calendar/holidays/${yr + 1}`, { credentials: 'include' }).then(r => r.json())
        ]);
        setHolidays([...thisYear, ...nextYear]);
      } catch (e) {
        console.error("Failed to load holidays", e);
      }
    };
    loadHolidays();
  }, []);

  // Fetch month events whenever year/month changes
  React.useEffect(() => {
    setLoading(true);
    fetch(`${CAL_API}/api/calendar/month?year=${year}&month=${month + 1}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [year, month]);

  // Also listen for new events added via chat
  React.useEffect(() => {
    const h = () => {
      // Re-fetch this month if calendar_today was updated
      const newEvs = window.TammyData?.calendar_today || [];
      newEvs.forEach(ev => {
        if (!events.find(e => e.event_id === ev.event_id)) {
          setEvents(prev => [...prev, ev]);
        }
      });
    };
    window.addEventListener('tammy:dataready', h);
    return () => window.removeEventListener('tammy:dataready', h);
  }, [events]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const selectedEvents = events.filter(ev => ev.date === selectedDate)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const upcomingEvents = events
    .filter(ev => ev.date >= todayStr)
    .sort((a, b) => ev_sort(a, b))
    .slice(0, 8);

  function ev_sort(a, b) {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time || '').localeCompare(b.time || '');
  }

  const handleSave = (ev) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.event_id === ev.event_id);
      if (idx >= 0) {
        const next = [...prev]; next[idx] = ev; return next;
      }
      return [...prev, ev];
    });
    setModal(null);
    // Update TammyData for Today screen
    const today = todayStr;
    if (ev.date === today) {
      if (!window.TammyData.calendar_today) window.TammyData.calendar_today = [];
      const existing = window.TammyData.calendar_today.findIndex(e => e.event_id === ev.event_id);
      if (existing >= 0) window.TammyData.calendar_today[existing] = ev;
      else window.TammyData.calendar_today.push(ev);
      window.dispatchEvent(new Event('tammy:dataready'));
    }
  };

  const handleDelete = (eventId) => {
    setEvents(prev => prev.filter(e => e.event_id !== eventId));
    if (window.TammyData.calendar_today) {
      window.TammyData.calendar_today = window.TammyData.calendar_today.filter(e => e.event_id !== eventId);
      window.dispatchEvent(new Event('tammy:dataready'));
    }
    setModal(null);
  };

  return (
    <div style={{ marginLeft: 120, padding: '0 0 80px', maxWidth: 1280, margin: '0 auto 0 120px' }}>
      <style>{`
        @keyframes holidayShimmer {
          0%, 100% { opacity: 0.55; text-shadow: 0 0 0px transparent; }
          50% { opacity: 1; text-shadow: 0 0 8px currentColor; }
        }
      `}</style>
      <div style={{ padding: '44px 64px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
              calendar · {year}
            </div>
            <h1 className="serif" style={{ fontSize: 56, fontWeight: 400, margin: 0, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {MONTHS[month]}.
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink-3)', margin: '10px 0 0', maxWidth: 480 }}>
              Tell Tammy about a meeting in chat and it appears here automatically.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={prevMonth} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--mauve-soft)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelectedDate(todayStr); }} className="mono" style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--mauve-soft)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>today</button>
            <button onClick={nextMonth} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--mauve-soft)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            <button onClick={() => setModal('new')} style={{
              padding: '10px 22px', borderRadius: 12, border: 'none',
              background: 'var(--ink)', color: 'var(--canvas)',
              fontSize: 14, fontFamily: 'var(--f-sans)', fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New event
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40, alignItems: 'start' }}>

          {/* Calendar grid */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 20, padding: '24px 20px', boxShadow: 'var(--shadow-md)' }}>
            {loading ? (
              <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
                Loading…
              </div>
            ) : (
              <MonthGrid
                year={year} month={month}
                events={events}
                holidays={holidays}
                todayStr={todayStr}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onEventClick={ev => setModal(ev)}
              />
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Selected day events */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 18, padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                    {selectedDate === todayStr ? 'Today' : fmtDate(selectedDate)}
                  </div>
                </div>
                <button onClick={() => setModal('new')} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '1px solid var(--mauve-soft)', background: 'transparent',
                  color: 'var(--ink-3)', fontSize: 18, lineHeight: 1,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>+</button>
              </div>

              {selectedEvents.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>Nothing scheduled.</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>Tell Tammy in chat or add manually.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedEvents.map((ev, i) => (
                    <div key={i} onClick={() => setModal(ev)} style={{
                      padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                      borderLeft: `3px solid ${eventColor(ev.type)}`,
                      background: 'var(--canvas)',
                      transition: 'background 140ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--canvas)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 }}>{ev.title}</div>
                        {ev.time && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 8, flexShrink: 0 }}>{fmtTime(ev.time)}</span>}
                      </div>
                      {ev.attendees && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>with {ev.attendees}</div>}
                      {ev.notes && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, fontStyle: 'italic', lineHeight: 1.4 }}>{ev.notes.substring(0, 80)}{ev.notes.length > 80 ? '…' : ''}</div>}
                      <div style={{ marginTop: 6 }}>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: `${eventColor(ev.type)}20`, color: eventColor(ev.type), fontFamily: 'var(--f-mono)' }}>
                          {ev.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming events */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--mauve-soft)', borderRadius: 18, padding: '20px 22px' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 14 }}>
                Upcoming · next 7 days
              </div>
              {upcomingEvents.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic', padding: '8px 0' }}>Nothing coming up.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {upcomingEvents.map((ev, i) => (
                    <div key={i} onClick={() => { setSelectedDate(ev.date); setModal(ev); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                      transition: 'background 140ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--canvas)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 3, height: 36, borderRadius: 2, background: eventColor(ev.type), flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 450, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
                          {ev.date === todayStr ? 'Today' : fmtDate(ev.date)}{ev.time ? ` · ${fmtTime(ev.time)}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tammy tip */}
            <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(148,125,237,0.07)', border: '1px solid rgba(148,125,237,0.18)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--iris)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                Tammy tip
              </div>
              <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
                In chat, say things like <em>"schedule a call with Sarah tomorrow at 3pm"</em> or <em>"add board review for May 10"</em> and Tammy adds it automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <EventModal
          event={modal === 'new' ? null : modal}
          defaultDate={selectedDate}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

window.CalendarScreen = CalendarScreen;
