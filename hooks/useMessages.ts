"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth"; // Add this import
import {
  Message,
  sendMessage,
  subscribeToMessages,
  loadMoreMessages,
} from "@/lib/firebase/messageService";

export const useMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const { user: currentUser } = useAuth(); // Add this to get current user

  /**
   * Send a new message
   */
  const sendNewMessage = useCallback(
    async (text: string) => {
      if (!chatId || !text.trim() || !currentUser) return; // Check for currentUser

      try {
        setSending(true);
        setError(null);
        // ✅ Fix: Add senderId parameter
        await sendMessage(chatId, currentUser.uid, text);
      } catch (error) {
        const errorMessage = (error as Error).message;
        setError(errorMessage);
        throw error;
      } finally {
        setSending(false);
      }
    },
    [chatId, currentUser] // Add currentUser to dependencies
  );

  /**
   * Load more messages for pagination
   */
  const loadMore = useCallback(async () => {
    if (!chatId || messages.length === 0 || !hasMore) return;

    try {
      setLoading(true);
      const olderMessages = await loadMoreMessages(
        chatId,
        messages[0].timestamp,
        20
      );

      if (olderMessages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...olderMessages, ...prev]);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [chatId, messages, hasMore]);

  /**
   * Subscribe to real-time messages
   */
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
      setHasMore(newMessages.length >= 20);
    });

    return () => unsubscribe();
  }, [chatId]);

  return {
    messages,
    loading,
    sending,
    error,
    hasMore,
    sendMessage: sendNewMessage,
    loadMoreMessages: loadMore,
    isEmpty: messages.length === 0 && !loading,
  };
};
