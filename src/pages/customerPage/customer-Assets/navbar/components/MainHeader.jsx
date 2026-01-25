import React from 'react';
import Logo from './Logo';
import SearchBar from './SearchBar';
import UserActions from './UserActions';

const MainHeader = ({ onSearch, isAuthenticated, user, onOpenAuth, totalQty }) => {
    return (
        <header className="jumia-main-header">
            <div className="navbar-container">
                <div className="header-row">
                    <Logo />
                    <SearchBar onSearch={onSearch} />
                    <UserActions 
                        isAuthenticated={isAuthenticated}
                        user={user}
                        onOpenAuth={onOpenAuth}
                        totalQty={totalQty}
                    />
                </div>
            </div>
        </header>
    );
};

export default MainHeader;