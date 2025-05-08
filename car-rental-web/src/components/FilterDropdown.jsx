import { useRef, useEffect, useState } from 'react';

/**
 * A reusable dropdown filter component for selecting multiple options (with "All" support).
 *
 * Props:
 * - label: string - The dropdown label (e.g., "Car Brands", "Car Types")
 * - options: Array<{ value: string, label: string, icon?: string }>
 * - selectedOptions: string[] - The selected values (e.g., ["All"] or ["Toyota", ...])
 * - onChange: (newSelectedOptions: string[]) => void
 * - isActive: string|null - The label of the currently active dropdown
 * - setActiveDropdown: (label: string|null) => void - Callback to set the active dropdown
 */
export default function FilterDropdown({ label, options, selectedOptions, onChange, isActive, setActiveDropdown }) {
  const dropdownRef = useRef(null);
  // Use internal state to control dropdown visibility
  const [isOpen, setIsOpen] = useState(false);
  
  // Sync external and internal state
  useEffect(() => {
    setIsOpen(isActive === label);
  }, [isActive, label]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setActiveDropdown(null);
      }
    };
    
    // Only add the event listener when the dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setActiveDropdown]);

  const toggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    setActiveDropdown(newIsOpen ? label : null);
  };

  const toggleOption = (value, e) => {
    // Stop event propagation to prevent dropdown from closing
    e.preventDefault();
    e.stopPropagation();
    
    // All non-"All" option values
    const nonAllValues = options
      .filter(opt => opt.value !== 'All')
      .map(opt => opt.value);
      
    if (value === 'All') {
      // If "All" is clicked, toggle between all selected and none selected
      if (selectedOptions.includes('All')) {
        // If "All" was selected, deselect everything
        onChange([]);
      } else {
        // If "All" wasn't selected, select all options including "All"
        onChange(['All', ...nonAllValues]);
      }
    } else {
      // Handle clicking a non-"All" option
      let newSelections = [...selectedOptions];
      
      if (selectedOptions.includes(value)) {
        // Deselect this option
        newSelections = newSelections.filter(v => v !== value);
        // Also remove "All" if it was selected
        newSelections = newSelections.filter(v => v !== 'All');
      } else {
        // Add this option if it wasn't selected
        newSelections.push(value);
        
        // Check if all non-All options are now selected
        const allNonAllSelected = nonAllValues.every(v => 
          newSelections.includes(v)
        );
        
        // If all other options are selected, also select "All"
        if (allNonAllSelected && !newSelections.includes('All')) {
          newSelections.push('All');
        }
      }
      
      onChange(newSelections);
    }
  };

  const isAllSelected = selectedOptions.includes('All');

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`dropdown-button pl-4 pr-2 h-12 w-fit rounded-lg flex items-center justify-between cursor-pointer outline outline-1 ${
          isOpen
            ? 'bg-[rgba(231,170,76,1)] text-white outline-yellow-500'
            : 'bg-orange-100 text-yellow-600 outline-amber-200 hover:bg-orange-200/80'
        }`}
        onClick={toggleDropdown}
      >
        <span className="text-base font-normal leading-snug tracking-tight">
          {label} ({isAllSelected ? 'All' : selectedOptions.length})
        </span>
        <img
          src="/src/assets/arrow-down.svg"
          alt="arrow"
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180 brightness-0 invert' : ''}`}
        />
      </div>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-[188px] bg-white rounded-lg shadow-lg outline outline-1 outline-amber-200"
          style={{ top: '100%', marginTop: '8px' }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${option.value === 'All' ? 'border-b border-gray-200' : ''}`}
              onClick={(e) => toggleOption(option.value, e)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <img
                src={
                  selectedOptions.includes(option.value)
                    ? '/src/assets/checkbox-checked.svg'
                    : '/src/assets/checkbox-uncheck.svg'
                }
                alt="checkbox"
                className="w-4 h-4"
              />
              <div className="flex items-center gap-2 text-zinc-700 text-base font-normal leading-snug tracking-tight">
                {option.icon && (
                  <img src={`/src/assets/${option.icon}`} alt={`${option.value} icon`} className="w-5 h-5" />
                )}
                <span className={selectedOptions.includes(option.value) ? 'font-medium' : ''}>{option.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}