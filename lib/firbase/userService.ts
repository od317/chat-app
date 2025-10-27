import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getDoc,
} from "firebase/firestore";
import { db } from "./clientApp";
import { User } from "firebase/auth";

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Date;
  searchableName: string; // Lowercase for case-insensitive search
  searchableEmail: string; // Lowercase for case-insensitive search
}

/**
 * Creates or updates a user profile in Firestore
 * Why store user profiles separately?
 * - Search optimization (lowercase fields, indexing)
 * - Additional user data beyond auth
 * - Better performance than querying auth system
 */
export async function createOrUpdateUserProfile(user: User): Promise<void> {
  try {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || user.email!.split("@")[0],
      photoURL: user.photoURL || null,
      createdAt: new Date(),
      searchableName: (
        user.displayName || user.email!.split("@")[0]
      ).toLowerCase(),
      searchableEmail: user.email!.toLowerCase(),
    };

    await setDoc(doc(db, "users", user.uid), userProfile);
    console.log("User profile created/updated:", user.uid);
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

/**
 * Searches users by name or email
 * Why this approach?
 * - Case-insensitive search using lowercase fields
 * - Firestore doesn't support native case-insensitive queries
 * - ArrayUnion for OR conditions (name OR email)
 */
export async function searchUsers(
  searchTerm: string,
  currentUserId: string
): Promise<UserProfile[]> {
  if (!searchTerm.trim()) return [];

  const searchLower = searchTerm.toLowerCase().trim();

  try {
    // Create queries for name and email search
    const usersRef = collection(db, "users");

    // Query for name matches
    const nameQuery = query(
      usersRef,
      where("searchableName", ">=", searchLower),
      where("searchableName", "<=", searchLower + "\uf8ff"),
      limit(10)
    );

    // Query for email matches
    const emailQuery = query(
      usersRef,
      where("searchableEmail", ">=", searchLower),
      where("searchableEmail", "<=", searchLower + "\uf8ff"),
      limit(10)
    );

    // Execute both queries in parallel for better performance
    const [nameSnapshot, emailSnapshot] = await Promise.all([
      getDocs(nameQuery),
      getDocs(emailQuery),
    ]);

    // Combine and deduplicate results
    const results = new Map<string, UserProfile>();

    nameSnapshot.docs.forEach((doc) => {
      const user = doc.data() as UserProfile;
      if (user.uid !== currentUserId) {
        results.set(user.uid, user);
      }
    });

    emailSnapshot.docs.forEach((doc) => {
      const user = doc.data() as UserProfile;
      if (user.uid !== currentUserId) {
        results.set(user.uid, user);
      }
    });

    return Array.from(results.values());
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}

/**
 * Gets a user profile by ID
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}
