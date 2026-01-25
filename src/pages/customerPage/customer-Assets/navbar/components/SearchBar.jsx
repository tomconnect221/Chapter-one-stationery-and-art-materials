import React, { useState, useRef, useEffect } from 'react';
import useCategories from '../../../../../hooks/useCategories';

const SearchBar = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const searchRef = useRef(null);
    const { categories, loading } = useCategories();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch?.({ searchText, selectedCategory });
    };

    return (
        <form className="search-form" onSubmit={handleSubmit} ref={searchRef}>
            <div className="search-input-wrapper">
                <i className="fas fa-search search-icon-input"></i>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search for products, brands..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button type="submit" className="search-btn">
                    SEARCH
                </button>
            </div>
        </form>
    );
};

export default SearchBar;