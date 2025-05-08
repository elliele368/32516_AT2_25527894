import { useState, useEffect } from 'react';
import { getCars } from '../api/api';
import { getSuggestions } from '../api/search';
import FilterDropdown from './FilterDropdown';
import SearchDropdown from './SearchDropdown';

export default function Search() {
  const [searchText, setSearchText] = useState('');
  
  // Define options
  const brandOptions = [
    { value: 'All', label: 'All Brands' },
    { value: 'Mercedes', label: 'Mercedes', icon: 'brand-mercedes.svg' },
    { value: 'Volkswagen', label: 'Volkswagen', icon: 'brand-volkswagen.svg' },
    { value: 'Kia / Huyndai', label: 'Kia / Huyndai', icon: 'brand-kia.svg' },
    { value: 'Toyota', label: 'Toyota', icon: 'brand-toyota.svg' },
    { value: 'Others', label: 'Others', icon: 'brand-others.svg' },
  ];
  
  const typeOptions = [
    { value: 'All', label: 'All Types' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Hatchback', label: 'Hatchback' },
    { value: 'Sedan', label: 'Sedan' },
    { value: 'Coupe', label: 'Coupe' },
    { value: 'Others', label: 'Others' },
  ];
  
  // Initialize with all options selected (including the "All" option)
  const allBrands = brandOptions.map(option => option.value);
  const allTypes = typeOptions.map(option => option.value);
  
  const [brandFilter, setBrandFilter] = useState(allBrands);
  const [typeFilter, setTypeFilter] = useState(allTypes);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [allCars, setAllCars] = useState([]);

  useEffect(() => {
    getCars().then((data) => {
      setAllCars(data);
    });
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchText.trim() === '') {
        setSuggestions([]);
        return;
      }
      try {
        const results = await getSuggestions(searchText.trim());
        console.log("Suggestions API response:", results);
        
        // Check if results.data exists and is an array
        if (results && results.data && Array.isArray(results.data)) {
          // Extract car names for the dropdown
          const suggestionsData = results.data.map(car => car.name || car.title || "Unnamed");
          console.log("Processed suggestions:", suggestionsData);
          setSuggestions(suggestionsData);
        } else {
          console.warn("Unexpected suggestions format:", results);
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    };

    // Add a small delay to prevent too many API calls while typing
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const isSearchEnabled = (
    searchText.trim() !== '' ||
    !brandFilter.includes('All') ||
    !typeFilter.includes('All')
  ) && !(brandFilter.length === 0 && typeFilter.length === 0);

  console.log('Rendering SearchDropdown with suggestions:', suggestions);

  return (
    <div className="self-stretch h-12 inline-flex justify-start items-center gap-3">
      {/* Car Brands */}
      <FilterDropdown
        label="Car Brands"
        options={brandOptions}
        selectedOptions={brandFilter}
        onChange={(newOptions) => setBrandFilter(newOptions)}
        isActive={activeDropdown}
        setActiveDropdown={setActiveDropdown}
      />

      {/* Car Types */}
      <FilterDropdown
        label="Car Types"
        options={typeOptions}
        selectedOptions={typeFilter}
        onChange={(newOptions) => setTypeFilter(newOptions)}
        isActive={activeDropdown}
        setActiveDropdown={setActiveDropdown}
      />

      {/* Search input + button */}
      <div className="flex-1 self-stretch rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center">
        <div className="relative w-full">
          <div className="flex-1 h-11 px-4 flex justify-start items-center gap-2 rounded-lg over">
            {/* icon placeholder */}
            <div className="w-6 h-6 relative overflow-hidden flex items-center">
              <div className="w-6 h-6 left-0 top-0 absolute" />
              <img src="/src/assets/search.svg" alt="search icon" className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search for cars..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-light leading-snug tracking-tight focus:outline-none"
            />
          </div>
          
          {/* Ensure the dropdown container is positioned correctly */}
          <div className="absolute nmm top-full left-0 right-0 mt-1" >
            <SearchDropdown
              suggestions={suggestions}
              onSuggestionClick={(value) => {
                setSearchText(value);
                setSuggestions([]); // Clear suggestions after selection
                console.log('Selected suggestion:', value);
              }}
              isVisible={searchText.trim() !== '' && suggestions.length > 0}
            />
          </div>
        </div>
        
        {/* Search button */}
        <div
          className={`w-28 self-stretch px-5 rounded-tr-lg rounded-br-lg ${
            isSearchEnabled ? 'bg-[rgba(231,170,76,1)] hover:bg-yellow-600 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'
          } flex justify-center items-center gap-2 transition-colors`}
        >
          <div className="text-white text-base font-medium leading-snug tracking-tight">Search</div>
        </div>
      </div>
    </div>
  );
}