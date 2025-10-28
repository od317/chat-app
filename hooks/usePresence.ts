"use client";
import { useState, useEffect, useCallback } from "react";
import {
  UserPresence,
  initializePresence,
  setUserOffline,
  subscribeToPresence,
  subscribeToMultiplePresence,
} from "@/lib/firebase/presenceService";
import { useAuth } from "./useAuth";

/**
 * Presence Management Hook
 * Why custom hook?
 * - Centralized presence logic
 * - Automatic cleanup on unmount
 * - Real-time status updates
 * - Handles auth state changes
 */
export const usePresence = () => {
  const { user: currentUser } = useAuth();
  const [currentUserPresence, setCurrentUserPresence] =
    useState<UserPresence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize presence for current user
   */
  const initializeUserPresence = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      await initializePresence(currentUser.uid);
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);
      console.error("Failed to initialize presence:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Set current user as offline
   */
  const setOffline = useCallback(async () => {
    if (!currentUser) return;

    try {
      await setUserOffline(currentUser.uid);
    } catch (error) {
      console.error("Failed to set user offline:", error);
    }
  }, [currentUser]);

  /**
   * Subscribe to current user's presence
   */
  useEffect(() => {
    if (!currentUser) {
      setCurrentUserPresence(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToPresence(currentUser.uid, (presence) => {
      setCurrentUserPresence(presence);
      setLoading(false);
      setError(null);
    });

    // Initialize presence on mount
    initializeUserPresence();

    return () => {
      unsubscribe();
    };
  }, [currentUser, initializeUserPresence]);

  /**
   * Handle page visibility changes (tab switch)
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (currentUser) {
        if (document.hidden) {
          // User switched to another tab - set as away
          updatePresenceStatus("away");
        } else {
          // User returned to tab - set as online
          updatePresenceStatus("online");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUser]);

  /**
   * Update presence status
   */
  const updatePresenceStatus = useCallback(
    async (status: "online" | "offline" | "away") => {
      if (!currentUser) return;

      try {
        const { updatePresence } = await import(
          "@/lib/firebase/presenceService"
        );
        await updatePresence(currentUser.uid, status);
      } catch (error) {
        console.error("Failed to update presence status:", error);
      }
    },
    [currentUser]
  );

  return {
    // Current user presence
    currentUserPresence,

    // Status
    loading,
    error,

    // Actions
    initializeUserPresence,
    setOffline,
    updatePresenceStatus,

    // Derived state
    isOnline: currentUserPresence?.isOnline || false,
    status: currentUserPresence?.status || "offline",
  };
};

/**
 * Hook to track presence of other users
 * Useful for chat lists and user avatars
 */
export const useOtherUsersPresence = (userIds: string[]) => {
  const [presences, setPresences] = useState<Map<string, UserPresence>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userIds.length === 0) {
      setPresences(new Map());
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToMultiplePresence(userIds, (newPresences) => {
      setPresences(newPresences);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userIds.join(",")]); // Dependency on sorted user IDs string

  /**
   * Get presence for a specific user
   */
  const getPresence = useCallback(
    (userId: string): UserPresence | null => {
      return presences.get(userId) || null;
    },
    [presences]
  );

  /**
   * Check if a user is online
   */
  const isUserOnline = useCallback(
    (userId: string): boolean => {
      return presences.get(userId)?.isOnline || false;
    },
    [presences]
  );

  return {
    presences,
    loading,
    getPresence,
    isUserOnline,
  };
};
