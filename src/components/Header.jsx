import React, { useState } from 'react';

function Header({ searchInput, setSearchInput, handleSearch, loading }) {
  const [warning, setWarning] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    
    if (!searchInput.trim()) {
      setWarning('Please enter a search term');
      return;
    }
    
    setWarning('');
    handleSearch();
    setSearchInput(''); // Add this line to clear the input
  };

  return (
    <header>
      <div className="container">
        <div className="header__description">
          <h1>Recipes R Us!</h1>
          <h3>Where Delicious Begins.</h3>
          <form className="search-container" onSubmit={onSubmit}>
            <input
              type="text"
              id="searchInput"
              placeholder="Search by meals, cuisine, ingredients..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" id="searchButton">
              View Recipes
            </button>
          </form>
          {warning && <div className="warning" style={{ color: 'red', marginTop: '10px' }}>{warning}</div>}
          {loading && <div className="loading"></div>}
        </div>
      </div>
    </header>
  );
}

export default Header;