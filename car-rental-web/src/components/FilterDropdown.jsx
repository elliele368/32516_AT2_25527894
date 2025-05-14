import { useRef, useEffect, useState } from 'react';

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
    e.preventDefault();
    e.stopPropagation();
    
    let newSelections = [...selectedOptions];
    
    if (value === 'All') {
      // Toggle All selection
      if (selectedOptions.includes('All')) {
        // If All was selected, deselect everything
        newSelections = [];
      } else {
        // If All wasn't selected, select all options
        newSelections = options.map(opt => opt.value);
      }
    } else {
      if (selectedOptions.includes(value)) {
        // Remove this option from selections
        newSelections = newSelections.filter(v => v !== value);
        
        // Also remove All if it was selected
        newSelections = newSelections.filter(v => v !== 'All');
        
        // Check if any selections remain (excluding empty strings)
        const hasRealSelections = newSelections.some(v => v !== '');
        if (!hasRealSelections) {
          // If no real selections remain, clear the array completely
          newSelections = [];
        }
      } else {
        // Add this option to selections
        if (!newSelections.includes(value)) {
          newSelections.push(value);
        }
        
        // Check if all non-All options are now selected
        const allNonAllOptions = options.filter(opt => opt.value !== 'All').map(opt => opt.value);
        const allSelected = allNonAllOptions.every(optValue => newSelections.includes(optValue));
        
        // If all options are selected, add 'All' as well
        if (allSelected && !newSelections.includes('All')) {
          newSelections.push('All');
        }
      }
    }
    
    // Important: Update with the new selections
    onChange(newSelections);
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
          {label} ({(() => {
            // Kiểm tra nếu mảng rỗng hoặc chỉ chứa giá trị rỗng
            if (!selectedOptions || selectedOptions.length === 0) {
              return '0';
            }
            
            if (isAllSelected) return 'All';
            
            // Lọc ra các giá trị không phải All và không phải rỗng
            const filteredOptions = selectedOptions.filter(v => v !== 'All' && v !== '');
            
            // Nếu không còn giá trị nào sau khi lọc, trả về 0
            return filteredOptions.length || '0';
          })()})
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