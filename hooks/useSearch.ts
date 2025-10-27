"use client";
import { useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { searchUsers, UserProfile } from "@/lib/firbase/userService";

/**
 * Custom hook for user search functionality
 * Why a custom hook?
 * - Reusable search logic
 * - Debounced search to prevent excessive Firestore queries
 * - Centralized state management for search
 * - Easy to test and maintain
 */
export const useSearch = () => {
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { user: currentUser } = useAuth();
  const debounceRef = useRef<NodeJS.Timeout>(null);

  /**
   * Debounced search function
   * Why debounce?
   * - Prevents excessive Firestore queries on every keystroke
   * - Better performance and cost control
   * - Improved user experience (less flickering)
   */
  const performSearch = useCallback(
    async (term: string) => {
      if (!currentUser) return;

      // Clear previous timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set loading state for immediate feedback
      setSearchLoading(true);
      setSearchError(null);

      // Debounce the search - wait 300ms after user stops typing
      debounceRef.current = setTimeout(async () => {
        try {
          if (term.trim().length < 2) {
            // Clear results if search term is too short
            setSearchResults([]);
            setSearchLoading(false);
            return;
          }

          const results = await searchUsers(term, currentUser.uid);
          setSearchResults(results);
        } catch (error) {
          setSearchError((error as Error).message);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    },
    [currentUser]
  );

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term);
      performSearch(term);
    },
    [performSearch]
  );

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    searchResults,
    searchLoading,
    searchError,
    searchTerm,
    handleSearchChange,
    clearSearch,
    hasResults: searchResults.length > 0,
    noResults:
      searchTerm.length >= 2 && !searchLoading && searchResults.length === 0,
  };
};
