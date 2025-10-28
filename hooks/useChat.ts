"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  ChatConversation,
  getOrCreateChat,
  subscribeToUserChats,
  markMessagesAsRead,
} from "@/lib/firebase/chatService";
import { UserProfile } from "@/lib/firebase/userService";

export const useChat = () => {
  const { user: currentUser } = useAuth();
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [activeChat, setActiveChat] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startChat = useCallback(
    async (otherUser: UserProfile) => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        setError(null);
        console.log("🚀 Starting chat with user:", otherUser);

        const currentUserData: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email!,
          displayName:
            currentUser.displayName || currentUser.email!.split("@")[0],
          photoURL: currentUser.photoURL || null,
          createdAt: new Date(),
          searchableName: (
            currentUser.displayName || currentUser.email!.split("@")[0]
          ).toLowerCase(),
          searchableEmail: currentUser.email!.toLowerCase(),
        };

        const chat = await getOrCreateChat(
          currentUser.uid,
          otherUser.uid,
          currentUserData,
          otherUser
        );

        console.log("✅ Chat created/retrieved:", chat);
        setActiveChat(chat);
        return chat;
      } catch (error) {
        console.error("❌ Error starting chat:", error);
        const errorMessage = (error as Error).message;
        setError(errorMessage);
        throw error;
      }
    },
    [currentUser]
  );

  const setActiveChatWithRead = useCallback(
    async (chat: ChatConversation) => {
      if (!currentUser) return;

      console.log("🎯 Setting active chat:", chat.id);
      setActiveChat(chat);

      if (chat.unreadCount[currentUser.uid] > 0) {
        try {
          await markMessagesAsRead(chat.id, currentUser.uid);
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      }
    },
    [currentUser]
  );

  useEffect(() => {
    if (!currentUser) {
      requestAnimationFrame(() => {
        setChats([]);
        setLoading(false);
      });
      return;
    }

    console.log("👤 Setting up chat subscription for user:", currentUser.uid);
    setLoading(true);

    const unsubscribe = subscribeToUserChats(currentUser.uid, (userChats) => {
      console.log(
        "📬 Chats subscription callback received:",
        userChats.length,
        "chats"
      );
      console.log(
        "📋 Chat IDs:",
        userChats.map((chat) => chat.id)
      );
      setChats(userChats);
      setLoading(false);
      setError(null);
    });

    return () => {
      console.log("🧹 Cleaning up chat subscription");
      unsubscribe();
    };
  }, [currentUser]);

  const getOtherParticipant = useCallback(
    (chat: ChatConversation): UserProfile | null => {
      if (!currentUser) return null;
      const otherUserId = chat.participants.find(
        (id:string) => id !== currentUser.uid
      );
      if (!otherUserId || !chat.participantData[otherUserId]) return null;

      const participantData = chat.participantData[otherUserId];
      return {
        uid: otherUserId,
        email: participantData.email,
        displayName: participantData.displayName,
        photoURL: participantData.photoURL!,
        createdAt: new Date(),
        searchableName: participantData.displayName.toLowerCase(),
        searchableEmail: participantData.email.toLowerCase(),
      };
    },
    [currentUser]
  );

  return {
    chats,
    activeChat,
    loading,
    error,
    startChat,
    setActiveChat: setActiveChatWithRead,
    clearActiveChat: () => setActiveChat(null),
    getOtherParticipant,
    hasChats: chats.length > 0,
    unreadCount: chats.reduce(
      (total, chat) => total + (chat.unreadCount[currentUser?.uid || ""] || 0),
      0
    ),
  };
};
