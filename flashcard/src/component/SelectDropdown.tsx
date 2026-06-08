// src/component/SelectDropdown.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  id: string;
  label: string;
  subLabel?: React.ReactNode;
}

interface SelectDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SelectDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className = "",
}: SelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2 bg-white border border-[#c5c8f2] hover:border-[#656799]/50 rounded-xl text-sm font-bold text-[#4d51a3] transition-all shadow-sm w-full"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#656799]" : "text-gray-400"}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 min-w-full max-w-[85vw] sm:w-max sm:min-w-[260px] bg-white border border-indigo-100 rounded-2xl shadow-2xl z-[100] overflow-hidden py-2 origin-top-right"
          >
            <div className="max-h-[50vh] sm:max-h-64 overflow-y-auto no-scrollbar">
              {options.map((option) => {
                const isSelected = value === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 sm:py-2.5 text-sm transition-colors flex items-center justify-between gap-4 group ${
                      isSelected
                        ? "bg-indigo-50/50 text-[#4d51a3] font-bold"
                        : "text-gray-600 font-medium hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate group-hover:text-[#4d51a3] transition-colors">
                      {option.label}
                    </span>
                    {option.subLabel && (
                      <span
                        className={`text-xs whitespace-nowrap shrink-0 ${
                          isSelected ? "text-indigo-400" : "text-gray-400"
                        }`}
                      >
                        {option.subLabel}
                      </span>
                    )}
                  </button>
                );
              })}
              {options.length === 0 && (
                <div className="px-5 py-4 text-sm text-gray-400 text-center font-medium">
                  No options available
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
