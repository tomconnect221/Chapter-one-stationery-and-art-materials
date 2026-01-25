import React, { useEffect } from 'react';

export default function Toast({ id = 'app-toast', message = '', show = false, onClose, duration = 3000 }){
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [show, duration, onClose]);

  if (!show) return null;
  return (
    <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000 }}>
      <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="toast-header">
          <strong className="me-auto">Notification</strong>
          <button type="button" className="btn-close" onClick={() => onClose && onClose()} aria-label="Close"></button>
        </div>
        <div className="toast-body">{message}</div>
      </div>
    </div>
  );
}
