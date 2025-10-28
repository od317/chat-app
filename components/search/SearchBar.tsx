"use client";
import { useState, useRef, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useSearch } from "@/hooks/useSearch";
import SearchResults from "./SearchResults";
import { UserProfile } from "@/lib/firebase/userService";

interface SearchBarProps {
  onStartChat: (user: UserProfile) => void;
  placeholder?: string;
  variant?: "default" | "navbar";
}

/**
 * Search Bar Component - Main search interface
 * Features:
 * - Debounced search
 * - Results dropdown
 * - Keyboard navigation
 * - Responsive design
 */
export default function SearchBar({
  onStartChat,
  placeholder = "Search users by name or email...",
  variant = "default",
}: SearchBarProps) {
  const {
    searchResults,
    searchLoading,
    searchError,
    searchTerm,
    handleSearchChange,
    clearSearch,
  } = useSearch();

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleClear = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  const handleUserSelect = (user: UserProfile) => {
    onStartChat(user);
    clearSearch();
    setIsFocused(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Different styles based on variant
  const containerStyles =
    variant === "navbar" ? "relative w-full max-w-md" : "relative w-full";

  const inputStyles =
    variant === "navbar"
      ? "pl-10 pr-10 py-2 w-full bg-highlights/80 backdrop-blur-sm border border-highlights/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-foreground placeholder-foreground/50"
      : "pl-12 pr-10 py-4 w-full bg-highlights/50 backdrop-blur-sm border border-highlights/30 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-foreground placeholder-foreground/50 text-lg shadow-lg";

  return (
    <div ref={containerRef} className={containerStyles}>
      {/* Search Input */}
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch
            className={`text-foreground/50 ${
              variant === "navbar" ? "w-4 h-4" : "w-5 h-5"
            }`}
          />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className={inputStyles}
          aria-label="Search users"
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/50 hover:text-foreground transition-colors duration-200"
            aria-label="Clear search"
          >
            <FiX className={variant === "navbar" ? "w-4 h-4" : "w-5 h-5"} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <SearchResults
        results={searchResults}
        loading={searchLoading}
        error={searchError}
        searchTerm={searchTerm}
        onStartChat={handleUserSelect}
        onClose={() => setIsFocused(false)}
        isOpen={isFocused && searchTerm.length > 0}
      />
    </div>
  );
}
