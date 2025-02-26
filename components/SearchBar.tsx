import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchBarProps {
  onSearch: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className={`relative w-full max-w-md transition-all duration-300 ${
      isFocused 
        ? 'shadow-md scale-105' 
        : 'shadow-sm'
    }`}>
      <div className={`flex items-center bg-white border overflow-hidden rounded-xl transition-all ${
        isFocused 
          ? 'border-green-400 ring-2 ring-green-100' 
          : 'border-gray-200 hover:border-gray-300'
      }`}>
        <div className="px-3">
          <FaSearch className={`text-sm transition-colors ${
            isFocused ? 'text-green-500' : 'text-gray-400'
          }`} />
        </div>
        
        <input
          type="text"
          placeholder="Search schedules, durations, status..."
          className="w-full py-3 px-2 outline-none text-gray-700 placeholder:text-gray-400 text-sm"
          value={searchTerm}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {searchTerm && (
          <button 
            onClick={clearSearch}
            className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>
      
      {/* Subtle gradient reflection */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-200/30 to-transparent"></div>
    </div>
  );
};

export default SearchBar; 