import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const useInjectStyles = () => {
  useEffect(() => {
    const id = 'dispatch-settings-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
      :root{
        --ds-bg:#f8f9fa;
        --ds-card:#ffffff;
        --ds-muted:#6c757d;
        --ds-text:#212529;
        --ds-brand:#f68b1e;
        --ds-brand-600:#e27d18;
        --ds-brand-700:#cc6f15;
        --ds-border:#dee2e6;
        --ds-chip:#f8f9fa;
        --ds-hover:#f1f3f5;
        --ds-success:#22c55e;
      }
      .dset-wrap{color:var(--ds-text);background:var(--ds-bg);min-height:100vh;}
      .dset-container{padding:20px;}
      @media(min-width:992px){.dset-container{padding:28px;}}

      .dset-header{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;margin-bottom:20px;}
      .dset-title{display:flex;gap:12px;align-items:center;}
      .dset-title h1{font-size:22px;margin:0;}
      .dset-sub{color:var(--ds-muted);font-size:14px;margin-top:4px;}
      .dset-actions{display:flex;gap:10px;flex-wrap:wrap;}
      .ds-btn{border:1px solid var(--ds-border);background:var(--ds-card);color:var(--ds-text);padding:10px 14px;border-radius:10px;cursor:pointer;transition:.2s;font-size:14px;font-weight:500;text-decoration:none;display:inline-block;}
      .ds-btn:hover{background:var(--ds-hover);border-color:#adb5bd;transform:translateY(-1px);box-shadow:0 2px 4px rgba(0,0,0,0.05);}
      .ds-btn.brand{background:var(--ds-brand);border-color:var(--ds-brand);color:#fff;font-weight:600;}
      .ds-btn.brand:hover{background:var(--ds-brand-600);box-shadow:0 2px 8px rgba(246,139,30,0.3);}

      .dset-grid{display:grid;gap:14px;grid-template-columns:1fr;}
      @media(min-width:992px){.dset-grid{grid-template-columns:2fr 1fr;}}
      .dset-card{background:var(--ds-card);border:1px solid var(--ds-border);border-radius:14px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);}
      .dset-card h3{margin:0 0 8px 0;font-size:18px;font-weight:600;}
      .dset-card p{margin:0 0 16px 0;color:var(--ds-muted);font-size:14px;line-height:1.5;}

      .dset-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
      .dset-row .full{grid-column:1/-1;}
      .dset-field{display:grid;gap:8px;}
      .dset-field label{font-size:13px;color:var(--ds-text);font-weight:500;}
      .dset-input, .dset-select{background:#fff;border:1px solid var(--ds-border);color:var(--ds-text);padding:10px 12px;border-radius:8px;font-size:14px;transition:.2s;width:100%;}
      .dset-input:focus, .dset-select:focus{outline:none;border-color:var(--ds-brand);box-shadow:0 0 0 3px rgba(246,139,30,0.1);}
      .dset-input:hover, .dset-select:hover{border-color:#adb5bd;}

      .dset-switch{display:flex;align-items:center;gap:10px;}
      .dset-switch input[type="checkbox"]{width:46px;height:26px;position:relative;appearance:none;background:#e9ecef;border-radius:999px;border:1px solid var(--ds-border);cursor:pointer;transition:.2s;outline:none;}
      .dset-switch input[type="checkbox"]:hover{background:#dee2e6;}
      .dset-switch input[type="checkbox"]:checked{background:var(--ds-brand);}
      .dset-switch input[type="checkbox"]::before{content:'';position:absolute;left:3px;top:3px;width:18px;height:18px;background:#fff;border-radius:999px;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);}
      .dset-switch input[type="checkbox"]:checked::before{left:25px;}

      .dset-list{display:grid;gap:10px;}
      .dset-item{display:flex;justify-content:space-between;align-items:center;padding:14px;background:#f8f9fa;border:1px solid var(--ds-border);border-radius:10px;cursor:pointer;transition:.2s;}
      .dset-item:hover{background:#e9ecef;border-color:#adb5bd;}
      .dset-item small{color:var(--ds-muted);display:block;margin-top:4px;font-size:12px;}
      .dset-item input[type="checkbox"]{width:20px;height:20px;cursor:pointer;accent-color:var(--ds-brand);}

      .dset-side{display:grid;gap:14px;}
      .dset-chip{display:inline-flex;align-items:center;gap:6px;background:var(--ds-chip);border:1px solid var(--ds-border);padding:6px 10px;border-radius:999px;font-size:12px;font-weight:500;}
      .dset-help{color:var(--ds-muted);font-size:13px;line-height:1.6;}

      .dset-footer{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;padding-top:20px;border-top:1px solid var(--ds-border);}
    `;
    document.head.appendChild(style);
  }, []);
};

export default function DispatchSettings(){
  useInjectStyles();
  const navigate = useNavigate();

  const [defaults, setDefaults] = useState({
    timezone: 'Africa/Lagos',
    defaultStart: '09:00',
    defaultEnd: '18:00',
    breakMins: 60,
    maxDailyHours: 10
  });

  const [notifications, setNotifications] = useState({
    assignPush: true,
    assignSMS: false,
    shiftReminders: true,
    earningAlerts: true
  });

  const handleChange = (field, value) => setDefaults(prev => ({...prev, [field]: value}));
  const handleNotif = (field, value) => setNotifications(prev => ({...prev, [field]: value}));

  const handleSave = () => {
    // In real app, persist to API
    alert('Settings saved');
    navigate('../schedule');
  };

  return (
    <div className="dset-wrap">
      <div className="dset-container">
        <div className="dset-header">
          <div className="dset-title">
            <span className="dset-chip">⚙️ Settings</span>
            <div>
              <h1>Dispatch Settings</h1>
              <div className="dset-sub">Configure defaults and preferences</div>
            </div>
          </div>
          <div className="dset-actions">
            <button className="ds-btn" onClick={() => navigate('../deliveries')}>View Deliveries</button>
            <Link to="../schedule" className="ds-btn brand">Go to Schedule</Link>
          </div>
        </div>

        <div className="dset-grid">
          <div className="dset-card">
            <h3>Working Hours</h3>
            <p>Set your default daily working window. You can still adjust per-day in your Schedule.</p>
            <div className="dset-row">
              <div className="dset-field">
                <label>Timezone</label>
                <select className="dset-select" value={defaults.timezone} onChange={(e) => handleChange('timezone', e.target.value)}>
                  <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                  <option value="Africa/Abidjan">Africa/Abidjan (GMT)</option>
                  <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
                </select>
              </div>
              <div></div>
              <div className="dset-field">
                <label>Default start</label>
                <input className="dset-input" type="time" value={defaults.defaultStart} onChange={(e) => handleChange('defaultStart', e.target.value)} />
              </div>
              <div className="dset-field">
                <label>Default end</label>
                <input className="dset-input" type="time" value={defaults.defaultEnd} onChange={(e) => handleChange('defaultEnd', e.target.value)} />
              </div>
              <div className="dset-field">
                <label>Break (minutes)</label>
                <input className="dset-input" type="number" min={0} max={180} value={defaults.breakMins} onChange={(e) => handleChange('breakMins', Number(e.target.value))} />
              </div>
              <div className="dset-field">
                <label>Max daily hours</label>
                <input className="dset-input" type="number" min={4} max={16} value={defaults.maxDailyHours} onChange={(e) => handleChange('maxDailyHours', Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="dset-side">
            <div className="dset-card">
              <h3>Tips</h3>
              <div className="dset-list">
                <div className="dset-item">
                  <div>
                    Peak hours
                    <div><small>Set shifts around lunch and evening for more orders.</small></div>
                  </div>
                  <span className="dset-chip">🔥</span>
                </div>
                <div className="dset-item">
                  <div>
                    Safety first
                    <div><small>Keep your phone mounted and use hands-free calls.</small></div>
                  </div>
                  <span className="dset-chip">🛡️</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dset-grid" style={{marginTop:14}}>
          <div className="dset-card">
            <h3>Notifications</h3>
            <p>Choose how you want to be notified.</p>
            <div className="dset-list">
              <label className="dset-item">
                <div>
                  New assignment push
                  <div><small>Get instant push when a new order is assigned.</small></div>
                </div>
                <input type="checkbox" checked={notifications.assignPush} onChange={(e) => handleNotif('assignPush', e.target.checked)} />
              </label>
              <label className="dset-item">
                <div>
                  New assignment SMS
                  <div><small>SMS fallback if push fails.</small></div>
                </div>
                <input type="checkbox" checked={notifications.assignSMS} onChange={(e) => handleNotif('assignSMS', e.target.checked)} />
              </label>
              <label className="dset-item">
                <div>
                  Shift reminders
                  <div><small>Reminder 30 minutes before your shift.</small></div>
                </div>
                <input type="checkbox" checked={notifications.shiftReminders} onChange={(e) => handleNotif('shiftReminders', e.target.checked)} />
              </label>
              <label className="dset-item">
                <div>
                  Earning alerts
                  <div><small>Notify when you receive earnings or bonuses.</small></div>
                </div>
                <input type="checkbox" checked={notifications.earningAlerts} onChange={(e) => handleNotif('earningAlerts', e.target.checked)} />
              </label>
            </div>
          </div>
          <div className="dset-side">
            <div className="dset-card">
              <h3>Support</h3>
              <p className="dset-help">Having trouble? Contact support from your rider app or email support@company.com</p>
              <Link to="../schedule" className="ds-btn" style={{display:'inline-block'}}>Back to Schedule</Link>
            </div>
          </div>
        </div>

        <div className="dset-footer">
          <button className="ds-btn" onClick={() => navigate(-1)}>Cancel</button>
          <button className="ds-btn brand" onClick={handleSave}>Save changes</button>
        </div>
      </div>
    </div>
  );
}