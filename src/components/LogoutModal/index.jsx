import React from 'react';
import './LogoutModal.css';

const LogoutModal = ({ isOpen, onClose, onConfirm, userName, userRole, isLoading = false }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="logout-modal-backdrop" onClick={handleBackdropClick}>
      <div className="logout-modal">
        <div className="logout-modal-header">
          <div className="logout-icon">
            <span className="icon">🚪</span>
          </div>
          <h3>Confirm Logout</h3>
        </div>

        <div className="logout-modal-body">
          <div className="user-info">
            <div className="user-avatar">
              <img
                src="/images/resource/user.png"
                alt="User"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y1RjVGNSIvPgo8cGF0aCBkPSJNMjAgMjBDMjIuMjA5MSAyMCAyNCAxOC4yMDkxIDI0IDE2QzI0IDEzLjc5MDkgMjIuMjA5MSAxMiAyMCAxMkMxNy43OTA5IDEyIDE2IDEzLjc5MDkgMTYgMTZDMTYgMTguMjA5MSAxNy43OTA5IDIwIDIwIDIwWiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMjAgMjJDMjMuMzEzNyAyMiAyNiAyMy43OTAyIDI2IDI2VjI4SDE0VjI2QzE0IDIzLjc5MDIgMTYuNjg2MyAyMiAyMCAyMloiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';
                }}
              />
            </div>
            <div className="user-details">
              <div className="user-name">{userName || 'User'}</div>
              <div className="user-role">{userRole || 'User'}</div>
            </div>
          </div>

          <div className="logout-message">
            <p>Are you sure you want to logout?</p>
            <p className="logout-warning">
              You will be redirected to the login page and will need to sign in again to access your dashboard.
            </p>
          </div>
        </div>

        <div className="logout-modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn-logout"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Logging out...
              </>
            ) : (
              <>
                {/* <span className="logout-icon" style={{fontSize:'10px'}}>🚪</span> */}
                Logout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;