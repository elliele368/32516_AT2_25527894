import { useState, useEffect } from 'react';
import { getCars } from '../api/api';
import { getSuggestions } from '../api/search';
import FilterDropdown from './FilterDropdown';
import SearchDropdown from './SearchDropdown';
import { useNavigate } from 'react-router-dom';

export default function Search({ initialSearch = "", initialBrandFilter = [], initialTypeFilter = [] }) {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  
  // Define options
  const brandOptions = [
    { value: 'All', label: 'All Brands' },
    { value: 'Mercedes', label: 'Mercedes', icon: 'brand-mercedes.svg' },
    { value: 'Volkswagen', label: 'Volkswagen', icon: 'brand-volkswagen.svg' },
    { value: 'Kia/Hyundai', label: 'Kia / Huyndai', icon: 'brand-kia.svg' },
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

  // One-time initialization for search/filter state (prevents infinite re-render loop)
  useEffect(() => {
    setSearchText(initialSearch);
    
    // Xử lý brand filter
    if (initialBrandFilter.includes('none')) {
      setBrandFilter([]);
    } else if (initialBrandFilter.length > 0) {
      setBrandFilter(initialBrandFilter);
    } else {
      setBrandFilter(allBrands);
    }
    
    // Xử lý type filter
    if (initialTypeFilter.includes('none')) {
      setTypeFilter([]);
    } else if (initialTypeFilter.length > 0) {
      setTypeFilter(initialTypeFilter);
    } else {
      setTypeFilter(allTypes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          // Tạo một Set để lưu trữ các suggestions đã thêm
          const uniqueSuggestions = new Set();
          const keyword = searchText.trim().toLowerCase();
          
          // Xử lý suggestions
          const suggestionsData = results.data.reduce((acc, car) => {
            if (
              car.brand &&
              !uniqueSuggestions.has(car.brand) &&
              car.brand.toLowerCase().includes(keyword)
            ) {
              uniqueSuggestions.add(car.brand);
              acc.push({
                type: 'brand',
                value: car.brand,
                label: car.brand
              });
            }

            if (
              car.name &&
              !uniqueSuggestions.has(car.name) &&
              car.name.toLowerCase().includes(keyword)
            ) {
              uniqueSuggestions.add(car.name);
              acc.push({
                type: 'car',
                value: car.name,
                label: `${car.name}`
              });
            }

            return acc;
          }, []);

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

  const handleSearch = (searchValue = searchText) => {
    if (!isSearchEnabled) return;

    const searchParams = new URLSearchParams();
    if (searchValue.trim()) searchParams.set('search', searchValue.trim());
    if (brandFilter.length === 0) {
      searchParams.set('brand', 'none');
    } else if (!brandFilter.includes('All')) {
      searchParams.set('brand', brandFilter.join(','));
    }
    if (typeFilter.length === 0) {
      searchParams.set('type', 'none');
    } else if (!typeFilter.includes('All')) {
      searchParams.set('type', typeFilter.join(','));
    }

    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="w-full h-12 inline-flex justify-start items-center gap-3">
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
              onFocus={() => setInputFocused(true)}
              onBlur={() => setTimeout(() => setInputFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-light leading-snug tracking-tight focus:outline-none"
            />
          </div>
          
          {/* Ensure the dropdown container is positioned correctly */}
          <div className="absolute nmm top-full left-0 right-0 mt-1" >
            <SearchDropdown
              suggestions={suggestions}
              onSuggestionClick={(suggestion) => {
                setSearchText(suggestion.value);
                setSuggestions([]);

                const isCar = suggestion.type === 'car';
                const finalSearchValue = isCar
                  ? `"${suggestion.value}"`
                  : suggestion.value;

                handleSearch(finalSearchValue);
              }}
              isVisible={inputFocused && searchText.trim() !== '' && suggestions.length > 0}
              searchKeyword={searchText}
            />
          </div>
        </div>
        
        {/* Search button */}
        <div
          className={`w-28 self-stretch px-5 rounded-tr-lg rounded-br-lg ${
            isSearchEnabled ? 'bg-[rgba(231,170,76,1)] hover:bg-yellow-600 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'
          } flex justify-center items-center gap-2 transition-colors`}
          onClick={() => handleSearch()}
        >
          <div className="text-white text-base font-medium leading-snug tracking-tight">Search</div>
        </div>
      </div>
    </div>
  );
}