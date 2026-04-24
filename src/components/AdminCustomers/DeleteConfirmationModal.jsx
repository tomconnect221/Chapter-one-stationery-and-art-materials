import React from 'react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ customer, onConfirm, onCancel, loading }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div className="warning-icon">⚠️</div>
          <h3>Confirm Deletion</h3>
        </div>
        
        <div className="delete-modal-body">
          <p className="delete-message">
            Are you sure you want to delete this customer account? This action cannot be undone.
          </p>
          
          {customer && (
            <div className="customer-preview">
              <div className="preview-avatar">
                {customer.name ? customer.name.charAt(0).toUpperCase() : '👤'}
              </div>
              <div className="preview-info">
                <strong>{customer.name || 'Unknown Customer'}</strong>
                <span>{customer.email}</span>
              </div>
            </div>
          )}
          
          <p className="warning-note">
            All customer data, including order history, will be permanently removed.
          </p>
        </div>
        
        <div className="delete-modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onCancel} 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn-delete" 
            onClick={onConfirm} 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Deleting...
              </>
            ) : (
              'Delete Customer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
