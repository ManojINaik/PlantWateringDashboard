import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaHistory } from 'react-icons/fa';

interface SearchBarProps {
  onSearch: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close recent searches dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowRecent(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSearch = (term: string = searchTerm) => {
    if (term.trim()) {
      onSearch(term);
      // Add to recent searches if not already there
      if (!recentSearches.includes(term) && term.trim() !== '') {
        setRecentSearches(prev => [term, ...prev.slice(0, 2)]);
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
    setShowRecent(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const selectRecentSearch = (term: string) => {
    setSearchTerm(term);
    onSearch(term);
    setShowRecent(false);
  };

  return (
    <div 
      className={`relative w-full transition-all duration-300`}
      ref={wrapperRef}
    >
      <div className={`flex items-center bg-white backdrop-blur-sm border overflow-hidden rounded-xl transition-all ${
        isFocused 
          ? 'border-green-400 shadow-green-glow scale-[1.01]' 
          : 'border-gray-200 shadow-sm hover:border-gray-300'
      }`}>
        <div className="px-3">
          <FaSearch className={`text-sm transition-all ${
            isFocused ? 'text-green-500 scale-110' : 'text-gray-400'
          }`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Search schedules, durations, status..."
          className="w-full py-3 px-2 outline-none text-gray-700 placeholder:text-gray-400 text-sm font-medium"
          value={searchTerm}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            if (recentSearches.length > 0) {
              setShowRecent(true);
            }
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
              setShowRecent(false);
            }
          }}
        />
        
        {searchTerm ? (
          <button 
            onClick={clearSearch}
            className="px-3 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-1.5 mr-1"
            aria-label="Clear search"
          >
            <FaTimes className="text-xs" />
          </button>
        ) : recentSearches.length > 0 ? (
          <button 
            onClick={() => setShowRecent(!showRecent)}
            className="px-3 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-1.5 mr-1"
            aria-label="Show recent searches"
          >
            <FaHistory className="text-xs" />
          </button>
        ) : null}
      </div>
      
      {/* Recent searches dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-2 animate-fadeIn">
          <h4 className="text-xs font-medium text-gray-500 px-4 pb-2 uppercase">Recent Searches</h4>
          <ul className="max-h-40 overflow-y-auto">
            {recentSearches.map((term, index) => (
              <li key={index}>
                <button
                  onClick={() => selectRecentSearch(term)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <FaHistory className="text-gray-400 text-xs" />
                  <span>{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Subtle gradient reflection */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-200/30 to-transparent"></div>
    </div>
  );
};

export default SearchBar; 