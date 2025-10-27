"use client";
import { UserProfile } from "@/lib/firbase/userService";
import UserCard from "./UserCard";
import { FiSearch, FiUsers, FiAlertCircle } from "react-icons/fi";

interface SearchResultsProps {
  results: UserProfile[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onStartChat: (user: UserProfile) => void;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Search Results Component - Displays search results in a dropdown/popover
 * Why separate component?
 * - Clean separation of concerns
 * - Reusable results display
 * - Better state management
 */
export default function SearchResults({
  results,
  loading,
  error,
  searchTerm,
  onStartChat,
  isOpen,
}: SearchResultsProps) {
  // Don't render if not open or no search term
  if (!isOpen || searchTerm.length < 2) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-highlights/95 backdrop-blur-md border border-highlights/30 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide">
            Search Results
          </h3>
          <span className="text-xs text-foreground/50">
            {results.length} found
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-foreground/70">Searching users...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center space-x-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-500">
              Error searching users: {error}
            </p>
          </div>
        )}

        {/* No Results State */}
        {!loading &&
          !error &&
          results.length === 0 &&
          searchTerm.length >= 2 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FiSearch className="w-12 h-12 text-foreground/30 mb-3" />
              <p className="text-foreground/70 font-medium">No users found</p>
              <p className="text-foreground/50 text-sm mt-1">
                Try searching by name or email address
              </p>
            </div>
          )}

        {/* Results List */}
        {!loading && !error && results.length > 0 && (
          <div className="space-y-2">
            {results.map((user) => (
              <UserCard
                key={user.uid}
                user={user}
                onStartChat={onStartChat}
                variant="compact"
              />
            ))}
          </div>
        )}

        {/* Search Tips */}
        {!loading && !error && (
          <div className="mt-4 pt-3 border-t border-highlights/30">
            <div className="flex items-center space-x-2 text-xs text-foreground/50">
              <FiUsers className="w-3 h-3" />
              <span>Search by name or email address</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
