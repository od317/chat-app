import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment as firestoreIncrement,
  getDocs,
} from "firebase/firestore";
import { db } from "./clientApp";
import { updateChatMetadata } from "./chatService";

/**
 * Message Interface
 * Why separate collection?
 * - Scalability (messages can be numerous)
 * - Efficient pagination
 * - Better query performance
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
  type: "text" | "image" | "file"; // For future media support
}

/**
 * Sends a new message
 * Why transaction-like approach?
 * - Create message AND update chat metadata
 * - Ensure data consistency
 * - Update last message preview
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string
): Promise<void> {
  try {
    const messagesRef = collection(db, "chats", chatId, "messages");

    // Create the message
    const messageData = {
      chatId,
      senderId,
      text: text.trim(),
      timestamp: serverTimestamp(),
      read: false,
      type: "text" as const,
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Get the other participant ID
    const otherParticipantId = getOtherParticipant(chatId, senderId);

    // Update chat metadata with last message
    await updateChatMetadata(chatId, {
      lastMessage: {
        text: text.trim(),
        senderId,
        timestamp: new Date(),
      },
      // ✅ Fix: Properly increment unread count for the other participant
      [`unreadCount.${otherParticipantId}`]: firestoreIncrement(1),
    });

    console.log("Message sent:", docRef.id);
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// Helper function to increment Firestore field

// Helper to get the other participant in a chat
function getOtherParticipant(chatId: string, currentUserId: string): string {
  const participants = chatId.replace("chat_", "").split("_");
  return participants.find((id) => id !== currentUserId) || participants[0];
}
/**
 * Subscribes to messages in a chat for real-time updates
 * Why real-time subscription?
 * - Instant message delivery
 * - Live chat experience
 * - No manual refreshing needed
 */
export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void
) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as Message);
    });
    callback(messages);
  });
}

/**
 * Loads more messages for pagination
 * Why pagination?
 * - Better performance with large chat histories
 * - Faster initial load
 * - Infinite scroll capability
 */
export async function loadMoreMessages(
  chatId: string,
  beforeDate: Date,
  limitCount: number = 20
): Promise<Message[]> {
  try {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(
      messagesRef,
      where("timestamp", "<", beforeDate),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp.toDate(),
      } as Message);
    });

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error("Error loading more messages:", error);
    throw error;
  }
}
