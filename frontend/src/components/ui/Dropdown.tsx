import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

import type { DropdownOption, DropdownProps } from '../../types';

export type { DropdownOption, DropdownProps };

export const Dropdown: React.FC<DropdownProps> = ({ value, options, onChange, icon, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none flex items-center text-left"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <span className="block truncate w-full">
          {selectedOption ? selectedOption.label : (placeholder || 'Select...')}
        </span>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-auto py-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50
                ${option.value === value ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'}
              `}
            >
              <span className="block truncate w-full">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
