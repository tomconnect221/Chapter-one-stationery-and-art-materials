import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Inject local styles once
const useInjectStyles = () => {
  useEffect(() => {
    const id = 'dispatch-schedule-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
      :root{
        --ds-bg:#f8f9fa;
        --ds-card:#ffffff;
        --ds-muted:#6c757d;
        --ds-text:#212529;
        --ds-brand:#f68b1e; /* Jumia orange */
        --ds-brand-600:#e27d18;
        --ds-brand-700:#cc6f15;
        --ds-success:#22c55e;
        --ds-danger:#ef4444;
        --ds-border:#dee2e6;
        --ds-chip:#f8f9fa;
        --ds-hover:#f1f3f5;
      }
      .ds-wrap{color:var(--ds-text);background:var(--ds-bg);min-height:100vh;}
      .ds-container{padding:20px;}
      @media(min-width:992px){.ds-container{padding:28px;}}

      /* Header */
      .ds-header{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;margin-bottom:20px}
      .ds-title{display:flex;gap:12px;align-items:center}
      .ds-title h1{font-size:22px;margin:0}
      .ds-sub{color:var(--ds-muted);font-size:14px}
      .ds-actions{display:flex;gap:10px;flex-wrap:wrap}
      .ds-btn{border:1px solid var(--ds-border);background:var(--ds-card);color:var(--ds-text);padding:10px 14px;border-radius:10px;cursor:pointer;transition:.2s;font-size:14px;font-weight:500;}
      .ds-btn:hover{background:var(--ds-hover);border-color:#adb5bd;transform:translateY(-1px);box-shadow:0 2px 4px rgba(0,0,0,0.05);}
      .ds-btn.brand{background:var(--ds-brand);border-color:var(--ds-brand);color:#fff;font-weight:600;}
      .ds-btn.brand:hover{background:var(--ds-brand-600);box-shadow:0 2px 8px rgba(246,139,30,0.3);}

      /* Stat cards */
      .ds-grid{display:grid;gap:14px}
      .ds-grid.stats{grid-template-columns:repeat(2,minmax(0,1fr));}
      @media(min-width:768px){.ds-grid.stats{grid-template-columns:repeat(4,minmax(0,1fr));}}
      .ds-card{background:var(--ds-card);border:1px solid var(--ds-border);border-radius:14px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.05);}
      .ds-stat-val{font-size:24px;font-weight:700;color:var(--ds-text);}
      .ds-stat-label{font-size:13px;color:var(--ds-muted);margin-top:4px;}
      .ds-chip{display:inline-flex;align-items:center;gap:6px;background:var(--ds-chip);border:1px solid var(--ds-border);padding:6px 10px;border-radius:999px;font-size:12px;font-weight:500;}
      .ds-chip.success{border-color:#c3fae8;color:#087f5b;background:#e6fcf5}
      .ds-chip.warn{border-color:#ffe8cc;color:#e67700;background:#fff4e6}

      /* Week header */
      .ds-week{display:flex;justify-content:space-between;align-items:center;margin:18px 0 12px 0}
      .ds-week h3{margin:0;font-size:16px}

      /* Day cards */
      .ds-grid.days{grid-template-columns:1fr;}
      @media(min-width:768px){.ds-grid.days{grid-template-columns:repeat(2,minmax(0,1fr));}}
      @media(min-width:1200px){.ds-grid.days{grid-template-columns:repeat(3,minmax(0,1fr));}}
      .ds-day-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
      .ds-day-title{display:flex;gap:8px;align-items:center}
      .ds-day-date{color:var(--ds-muted);font-size:12px;margin-top:2px;}
      .ds-switch{position:relative;display:inline-flex;align-items:center;width:46px;height:26px;background:#e9ecef;border-radius:999px;border:1px solid var(--ds-border);cursor:pointer;transition:.2s;}
      .ds-switch:hover{background:#dee2e6;}
      .ds-switch input{display:none}
      .ds-switch span{position:absolute;left:3px;top:3px;width:18px;height:18px;background:#fff;border-radius:999px;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);}
      .ds-switch input:checked + span{left:25px;background:var(--ds-brand);}
      .ds-switch input:checked ~ .ds-switch{background:#ffe8cc;}

      .ds-shifts{display:flex;flex-wrap:wrap;gap:8px}
      .ds-shift{display:flex;gap:8px;align-items:center;border:1px dashed var(--ds-border);background:#f8f9fa;padding:8px 10px;border-radius:10px;font-size:12px;}
      .ds-shift .tag{background:var(--ds-brand);color:#fff;padding:4px 8px;border-radius:999px;font-weight:600;font-size:11px;}
      .ds-shift .del{background:transparent;border:none;color:var(--ds-muted);cursor:pointer;font-size:16px;padding:0 4px;transition:.2s;}
      .ds-shift .del:hover{color:var(--ds-danger);}

      .ds-empty{color:var(--ds-muted);font-size:13px;font-style:italic;padding:8px 0;}

      .ds-row-actions{display:flex;gap:8px;margin-top:12px}

      /* Modal */
      .ds-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;}
      .ds-modal{width:95%;max-width:520px;background:var(--ds-card);border:1px solid var(--ds-border);border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.15);}
      .ds-modal-h{display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid var(--ds-border);background:#f8f9fa;}
      .ds-modal-h strong{font-size:18px;font-weight:600;}
      .ds-modal-b{padding:20px;display:grid;gap:16px;max-height:60vh;overflow-y:auto;}
      .ds-modal-f{padding:16px 20px;border-top:1px solid var(--ds-border);display:flex;gap:10px;justify-content:flex-end;background:#f8f9fa;}

      .ds-field{display:grid;gap:8px}
      .ds-field label{font-size:13px;color:var(--ds-text);font-weight:500;}
      .ds-time-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .ds-input, .ds-select{background:#fff;border:1px solid var(--ds-border);color:var(--ds-text);padding:10px 12px;border-radius:8px;font-size:14px;transition:.2s;}
      .ds-input:focus, .ds-select:focus{outline:none;border-color:var(--ds-brand);box-shadow:0 0 0 3px rgba(246,139,30,0.1);}
      .ds-input:hover, .ds-select:hover{border-color:#adb5bd;}

      .ds-link{color:var(--ds-brand);text-decoration:none;font-weight:500;}
      .ds-link:hover{color:var(--ds-brand-700);text-decoration:underline;}

      /* Helpers */
      .ds-flex{display:flex;gap:8px;align-items:center}
      .ds-space{height:12px}
    `;
    document.head.appendChild(style);
  }, []);
};

const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun - 6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // make Monday first
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const defaultWeekTemplate = (weekStart) => {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(weekStart, i);
    return {
      key: date.toDateString(),
      date,
      available: ![0,6].includes(date.getDay()), // weekdays available by default
      shifts: i % 7 === 0 || i % 7 === 6 ? [] : [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }]
    };
  });
};

export default function DispatchSchedule(){
  useInjectStyles();
  const navigate = useNavigate();

  const [weekStartState, setWeekStartState] = useState(() => startOfWeek(new Date()));
  const [week, setWeek] = useState(() => defaultWeekTemplate(startOfWeek(new Date())));

  const rangeLabel = useMemo(() => {
    const start = week[0]?.date ?? weekStartState;
    const end = addDays(start, 6);
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} - ${fmt(end)}`;
  }, [week, weekStartState]);

  const hoursThisWeek = useMemo(() => {
    const toNum = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h + m/60;
    };
    return week.reduce((sum, d) => sum + d.shifts.reduce((s, sh) => s + (toNum(sh.end) - toNum(sh.start)), 0), 0);
  }, [week]);

  const nextShift = useMemo(() => {
    const today = new Date();
    for (const d of week) {
      if (!d.available) continue;
      for (const sh of d.shifts) {
        const dt = new Date(d.date);
        const [h, m] = sh.start.split(':').map(Number);
        dt.setHours(h, m, 0, 0);
        if (dt >= today) return { date: d.date, start: sh.start, end: sh.end };
      }
    }
    return null;
  }, [week]);

  const toggleAvailable = (dayKey) => {
    setWeek((prev) => prev.map(d => d.key === dayKey ? { ...d, available: !d.available } : d));
  };

  const removeShift = (dayKey, idx) => {
    setWeek((prev) => prev.map(d => d.key === dayKey ? { ...d, shifts: d.shifts.filter((_, i) => i !== idx) } : d));
  };

  const [modal, setModal] = useState({ open: false, dayKey: null, start: '09:00', end: '13:00' });

  const openAddShift = (dayKey) => setModal({ open: true, dayKey, start: '09:00', end: '13:00' });
  const closeModal = () => setModal({ open: false, dayKey: null, start: '09:00', end: '13:00' });
  const saveShift = () => {
    if (!modal.dayKey) return;
    setWeek(prev => prev.map(d => d.key === modal.dayKey ? { ...d, shifts: [...d.shifts, { start: modal.start, end: modal.end }] } : d));
    closeModal();
  };

  const shiftTimes = [
    '06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'
  ];

  const goPrevWeek = () => {
    const newStart = addDays(weekStartState, -7);
    setWeekStartState(newStart);
    setWeek(defaultWeekTemplate(newStart));
  };
  const goNextWeek = () => {
    const newStart = addDays(weekStartState, +7);
    setWeekStartState(newStart);
    setWeek(defaultWeekTemplate(newStart));
  };

  return (
    <div className="ds-wrap">
      <div className="ds-container">
        {/* Header */}
        <div className="ds-header">
          <div className="ds-title">
            <span className="ds-chip"><span>📅</span> Schedule</span>
            <div>
              <h1>Dispatch Schedule</h1>
              <div className="ds-sub">Plan your weekly availability and shifts</div>
            </div>
          </div>
          <div className="ds-actions">
            <button className="ds-btn" onClick={() => navigate('../deliveries')}>View Deliveries</button>
            <Link to="../settings" className="ds-btn brand">Go to Settings</Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="ds-grid stats">
          <div className="ds-card">
            <div className="ds-stat-label">This Week</div>
            <div className="ds-stat-val">{rangeLabel}</div>
          </div>
          <div className="ds-card">
            <div className="ds-stat-label">Scheduled Hours</div>
            <div className="ds-stat-val">{hoursThisWeek.toFixed(1)} hrs</div>
          </div>
          <div className="ds-card">
            <div className="ds-stat-label">Next Shift</div>
            <div className="ds-flex">
              {nextShift ? (
                <span className="ds-chip success">{formatDate(nextShift.date)} • {nextShift.start} - {nextShift.end}</span>
              ) : (
                <span className="ds-chip warn">No upcoming shift</span>
              )}
            </div>
          </div>
          <div className="ds-card">
            <div className="ds-stat-label">Tips</div>
            <div className="ds-stat-val">Be online on peak hours</div>
          </div>
        </div>

        {/* Week controls */}
        <div className="ds-week">
          <div className="ds-flex">
            <button className="ds-btn" onClick={goPrevWeek}>◀ Prev</button>
            <button className="ds-btn" onClick={() => { setWeekStartState(startOfWeek(new Date())); setWeek(defaultWeekTemplate(startOfWeek(new Date()))); }}>Today</button>
            <button className="ds-btn" onClick={goNextWeek}>Next ▶</button>
          </div>
          <h3>{rangeLabel}</h3>
        </div>

        {/* Days grid */}
        <div className="ds-grid days">
          {week.map((d, idx) => (
            <div className="ds-card" key={d.key}>
              <div className="ds-day-head">
                <div className="ds-day-title">
                  <span className="ds-chip">{d.date.toLocaleDateString('en-US', { weekday: 'long' }).slice(0,3)}</span>
                  <div>
                    <div style={{fontWeight:700}}>{d.date.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                    <div className="ds-day-date">{d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
                <label className="ds-switch" title="Toggle availability">
                  <input type="checkbox" checked={d.available} onChange={() => toggleAvailable(d.key)} />
                  <span></span>
                </label>
              </div>

              {d.shifts.length ? (
                <div className="ds-shifts">
                  {d.shifts.map((sh, i) => (
                    <div className="ds-shift" key={`${d.key}-${i}`}>
                      <span className="tag">Shift</span>
                      <span>{sh.start} - {sh.end}</span>
                      <button className="del" aria-label="Remove" onClick={() => removeShift(d.key, i)}>✕</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ds-empty">No shifts added</div>
              )}

              <div className="ds-row-actions">
                <button className="ds-btn brand" onClick={() => openAddShift(d.key)}>+ Add shift</button>
                <button className="ds-btn" onClick={() => navigate('../deliveries')}>View day deliveries</button>
              </div>
            </div>
          ))}
        </div>

        <div className="ds-space" />
        <div className="ds-flex" style={{justifyContent:'flex-end'}}>
          <Link to="../settings" className="ds-link">Need to update working hours defaults? Go to Settings →</Link>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="ds-modal-backdrop" onClick={closeModal}>
          <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ds-modal-h">
              <strong>Add Shift</strong>
              <button className="ds-btn" onClick={closeModal}>Close</button>
            </div>
            <div className="ds-modal-b">
              <div className="ds-field">
                <label>Start time</label>
                <select className="ds-select" value={modal.start} onChange={(e) => setModal(v => ({...v, start: e.target.value}))}>
                  {shiftTimes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="ds-field">
                <label>End time</label>
                <select className="ds-select" value={modal.end} onChange={(e) => setModal(v => ({...v, end: e.target.value}))}>
                  {shiftTimes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="ds-field">
                <label>Note (optional)</label>
                <input className="ds-input" placeholder="e.g. peak hours"
                       onChange={() => {}} />
              </div>
            </div>
            <div className="ds-modal-f">
              <button className="ds-btn" onClick={closeModal}>Cancel</button>
              <button className="ds-btn brand" onClick={saveShift}>Save shift</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}