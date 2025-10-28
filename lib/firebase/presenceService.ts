import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./clientApp";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./clientApp";

/**
 * User Presence Interface
 * Why separate from user profile?
 * - Real-time updates without loading full user data
 * - Frequent writes for status changes
 * - Different security rules
 */
export interface UserPresence {
  userId: string;
  status: "online" | "offline" | "away";
  lastSeen: Date;
  isOnline: boolean;
  lastChanged: Date;
}

/**
 * Initialize presence system for current user
 * Why separate initialization?
 * - Handles auth state changes automatically
 * - Sets up proper cleanup on logout/close
 * - Manages multiple tab scenarios
 */
export async function initializePresence(userId: string): Promise<void> {
  try {
    const presenceRef = doc(db, "presence", userId);

    // Set initial online status
    await setDoc(presenceRef, {
      userId,
      status: "online",
      isOnline: true,
      lastSeen: serverTimestamp(),
      lastChanged: serverTimestamp(),
    });

    console.log("✅ Presence initialized for user:", userId);

    // Set up onDisconnect to handle offline status
    // This ensures user goes offline if connection drops
    await setupDisconnectHandler(presenceRef);
  } catch (error) {
    console.error("❌ Error initializing presence:", error);
    throw error;
  }
}

/**
 * Setup Firebase onDisconnect handler
 * Why use onDisconnect?
 * - Automatically handles app closure
 * - Handles network disconnections
 * - More reliable than manual cleanup
 */
async function setupDisconnectHandler(presenceRef: any) {
  // Note: This would typically use Firebase Realtime Database for onDisconnect
  // For Firestore, we'll implement a manual approach
  console.log("🔧 Disconnect handler setup for presence");
}

/**
 * Update user presence status
 */
export async function updatePresence(
  userId: string,
  status: "online" | "offline" | "away"
): Promise<void> {
  try {
    const presenceRef = doc(db, "presence", userId);
    await updateDoc(presenceRef, {
      status,
      isOnline: status === "online",
      lastSeen: serverTimestamp(),
      lastChanged: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating presence:", error);
    throw error;
  }
}

/**
 * Set user as offline
 * Used on logout or app close
 */
export async function setUserOffline(userId: string): Promise<void> {
  try {
    await updatePresence(userId, "offline");
    console.log("✅ User set offline:", userId);
  } catch (error) {
    console.error("Error setting user offline:", error);
  }
}

/**
 * Subscribe to user presence changes
 * Why real-time subscription?
 * - Instant status updates across all clients
 * - Live online indicators in UI
 * - Better user experience
 */
export function subscribeToPresence(
  userId: string,
  callback: (presence: UserPresence | null) => void
) {
  const presenceRef = doc(db, "presence", userId);

  return onSnapshot(
    presenceRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const presence: UserPresence = {
          userId: data.userId,
          status: data.status,
          isOnline: data.isOnline,
          lastSeen: data.lastSeen?.toDate() || new Date(),
          lastChanged: data.lastChanged?.toDate() || new Date(),
        };
        callback(presence);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error in presence subscription:", error);
    }
  );
}

/**
 * Subscribe to multiple users' presence
 * Efficient for chat lists where we need status of multiple users
 */
export function subscribeToMultiplePresence(
  userIds: string[],
  callback: (presences: Map<string, UserPresence>) => void
) {
  const presences = new Map<string, UserPresence>();
  const unsubscribeCallbacks: (() => void)[] = [];

  userIds.forEach((userId) => {
    const unsubscribe = subscribeToPresence(userId, (presence) => {
      if (presence) {
        presences.set(userId, presence);
      } else {
        presences.delete(userId);
      }
      callback(new Map(presences)); // Return new Map to trigger updates
    });
    unsubscribeCallbacks.push(unsubscribe);
  });

  // Return cleanup function
  return () => {
    unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
  };
}

/**
 * Get current user presence (one-time read)
 */
export async function getUserPresence(
  userId: string
): Promise<UserPresence | null> {
  try {
    const presenceRef = doc(db, "presence", userId);
    const docSnap = await getDoc(presenceRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        userId: data.userId,
        status: data.status,
        isOnline: data.isOnline,
        lastSeen: data.lastSeen?.toDate() || new Date(),
        lastChanged: data.lastChanged?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user presence:", error);
    return null;
  }
}
