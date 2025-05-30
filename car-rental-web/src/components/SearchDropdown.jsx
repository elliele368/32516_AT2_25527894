import React, { useEffect } from 'react';

export default function SearchDropdown({ suggestions, onSuggestionClick, isVisible, searchKeyword }) {
  useEffect(() => {
  }, [isVisible, suggestions]);

  if (!isVisible || !suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div 
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-[50] mt-1"
      style={{
        display: 'block',
        width: '100%',
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
            <img 
              src={suggestion.type === 'brand' ? `/src/assets/${suggestion.value}.svg` : "/src/assets/search.svg"} 
              alt={suggestion.type === 'brand' ? "brand icon" : "car icon"} 
              className="w-4 h-4" 
            />
          </div>
          <div className="text-black text-base">
            {(() => {
              if (!searchKeyword) return suggestion.label;
              const regex = new RegExp(`(${searchKeyword})`, 'gi');
              const parts = suggestion.label.split(regex);
              return parts.map((part, i) =>
                regex.test(part)
                  ? <span key={i} className="font-medium text-[rgb(211,152,62)]">{part}</span>
                  : <span key={i}>{part}</span>
              );
            })()}
          </div>
        </div>
      ))}
    </div>
  );
}