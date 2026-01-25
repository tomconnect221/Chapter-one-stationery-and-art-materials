import React from 'react';
import { Link } from 'react-router-dom';
import AccountAction from './AccountAction';
import CartAction from './CartAction';

const UserActions = ({ isAuthenticated, user, onOpenAuth, totalQty }) => {
    return (
        <div className="user-actions">
            <AccountAction 
                isAuthenticated={isAuthenticated}
                user={user}
                onOpenAuth={onOpenAuth}
            />
            
            <div className="action-item">
                <Link to="/help" className="action-link">
                    <i className="fas fa-question-circle"></i>
                    <div className="action-text">
                        <span className="label">Help</span>
                    </div>
                </Link>
            </div>

            <CartAction totalQty={totalQty} />
        </div>
    );
};

export default UserActions;