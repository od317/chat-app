import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./clientApp";
import { UserProfile } from "./userService";

/**
 * Chat Conversation Interface
 * Why separate from messages?
 * - Efficient querying for chat list
 * - Metadata about conversations
 * - Last message preview
 * - Unread message counts
 */
export interface ChatConversation {
  id: string; // chat_{userId1}_{userId2} (sorted to ensure uniqueness)
  participants: string[]; // User IDs of both users
  participantData: {
    // User data for display
    [userId: string]: {
      displayName: string;
      email: string;
      photoURL?: string;
    };
  };
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Date;
  };
  updatedAt: Date;
  createdAt: Date;
  unreadCount: { [userId: string]: number }; // Track unread messages per user
}

/**
 * Creates or gets a chat conversation between two users
 * Why this approach?
 * - Ensures unique chat between any two users
 * - Auto-creates conversation on first message
 * - Handles both new and existing chats
 */
export async function getOrCreateChat(
  user1Id: string,
  user2Id: string,
  user1Data: UserProfile,
  user2Data: UserProfile
): Promise<ChatConversation> {
  // Create consistent chat ID regardless of user order
  const participants = [user1Id, user2Id].sort();
  const chatId = `chat_${participants[0]}_${participants[1]}`;

  console.log(
    "🔄 Creating/Getting chat:",
    chatId,
    "for users:",
    user1Id,
    user2Id
  );

  try {
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      console.log("✅ Chat already exists:", chatId);
      const data = chatSnap.data();
      return {
        id: chatSnap.id,
        ...data,
        updatedAt: data.updatedAt.toDate(),
        createdAt: data.createdAt.toDate(),
        lastMessage: data.lastMessage
          ? {
              ...data.lastMessage,
              timestamp: data.lastMessage.timestamp.toDate(),
            }
          : undefined,
      } as ChatConversation;
    } else {
      console.log("🆕 Creating new chat:", chatId);
      // Create new chat
      const newChat: Omit<ChatConversation, "id"> = {
        participants,
        participantData: {
          [user1Id]: {
            displayName: user1Data.displayName,
            email: user1Data.email,
            photoURL: user1Data.photoURL!,
          },
          [user2Id]: {
            displayName: user2Data.displayName,
            email: user2Data.email,
            photoURL: user2Data.photoURL!,
          },
        },
        updatedAt: new Date(),
        createdAt: new Date(),
        unreadCount: {
          [user1Id]: 0,
          [user2Id]: 0,
        },
      };

      await setDoc(chatRef, {
        ...newChat,
        updatedAt: Timestamp.fromDate(newChat.updatedAt),
        createdAt: Timestamp.fromDate(newChat.createdAt),
      });

      console.log("✅ New chat created successfully:", chatId);
      return { id: chatId, ...newChat } as ChatConversation;
    }
  } catch (error) {
    console.error("❌ Error creating/getting chat:", error);
    throw error;
  }
}

/**
 * Gets all chat conversations for a user
 * Why real-time updates?
 * - Immediate UI updates when new messages arrive
 * - Live unread count updates
 * - Better user experience
 */
export function subscribeToUserChats(
  userId: string,
  callback: (chats: ChatConversation[]) => void
) {
  console.log("🔔 Subscribing to chats for user:", userId);

  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      console.log("📨 Chats snapshot update, documents:", snapshot.size);
      const chats: ChatConversation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(
          "📋 Chat found:",
          doc.id,
          "last updated:",
          data.updatedAt?.toDate()
        );
        chats.push({
          id: doc.id,
          ...data,
          updatedAt: data.updatedAt.toDate(),
          createdAt: data.createdAt.toDate(),
          lastMessage: data.lastMessage
            ? {
                ...data.lastMessage,
                timestamp: data.lastMessage.timestamp.toDate(),
              }
            : undefined,
        } as ChatConversation);
      });
      callback(chats);
    },
    (error) => {
      console.error("❌ Error in chats subscription:", error);
    }
  );

  return unsubscribe;
}

/**
 * Updates chat metadata (last message, unread counts)
 * Why update chat separately from messages?
 * - Efficient chat list queries
 * - Don't need to load all messages for chat list
 * - Better performance
 */
export async function updateChatMetadata(
  chatId: string,
  updates: Partial<ChatConversation>
) {
  try {
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error("Error updating chat metadata:", error);
    throw error;
  }
}

/**
 * Marks messages as read for a user in a chat
 */
export async function markMessagesAsRead(chatId: string, userId: string) {
  try {
    console.log(
      "📖 Marking messages as read for user:",
      userId,
      "in chat:",
      chatId
    );

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0,
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Messages marked as read successfully");
  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
    throw error;
  }
}
