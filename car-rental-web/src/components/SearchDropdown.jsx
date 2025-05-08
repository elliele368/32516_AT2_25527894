import React, { useEffect } from 'react';

export default function SearchDropdown({ suggestions, onSuggestionClick, isVisible }) {
  useEffect(() => {
    console.log('SearchDropdown rendered:', { 
      isVisible, 
      suggestionsCount: suggestions?.length,
      suggestions
    });
  }, [isVisible, suggestions]);

  if (!isVisible || !suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div 
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-[50] mt-1"
      style={{
    // Full width
        display: 'block', // Force display block
        width: '100%', // Full width
      }}
    >
      {suggestions.map((suggestion, index) => (
        <div 
          key={index}
          className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 hover:bg-gray-50 cursor-pointer"
          onClick={() => {
            onSuggestionClick(suggestion);
            console.log('Suggestion clicked:', suggestion);
          }}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <img src="/src/assets/search.svg" alt="search icon" className="w-4 h-4" />
          </div>
          <div className="text-black text-base">
            {suggestion}
          </div>
        </div>
      ))}
    </div>
  );
}