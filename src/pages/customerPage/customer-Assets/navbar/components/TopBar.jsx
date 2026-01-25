import React from 'react';

const TopBar = () => {
    return (
        <div className="jumia-top-bar">
            <div className="navbar-container">
                <div className="top-bar-content">
                    <div className="top-left">
                        <span>
                            <i className="fas fa-phone"></i>
                            Need help? Call Us: + 1800 900
                        </span>
                        <span>
                            <i className="fas fa-envelope"></i>
                            support@store.com
                        </span>
                    </div>
                    <div className="top-right">
                        <span>Sell on Store</span>
                        <span>Find a Store</span>
                        <select className="currency-select">
                            <option>English / USD</option>
                            <option>Spanish / Euro</option>
                            <option>Turkey / Lira</option>
                            <option>England / Pound</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;