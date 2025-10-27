"use client";
import { Message } from "@/lib/firbase/messageService";
import MessageBubble from "./MessageBubble";
import { useEffect, useRef } from "react";
import { FiLoader } from "react-icons/fi";
import { User } from "firebase/auth";

interface MessageListProps {
  messages: Message[];
  currentUser: User | null;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function MessageList({
  messages,
  currentUser,
  loading = false,
  hasMore = false,
  onLoadMore,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Check if messages are consecutive from same sender
  const isConsecutive = (currentIndex: number): boolean => {
    if (currentIndex === 0) return false;

    const currentMessage = messages[currentIndex];
    const previousMessage = messages[currentIndex - 1];

    return (
      currentMessage.senderId === previousMessage.senderId &&
      currentMessage.timestamp.getTime() - previousMessage.timestamp.getTime() <
        5 * 60 * 1000
    );
  };

  // Handle scroll for loading more messages
  const handleScroll = () => {
    if (!containerRef.current || !onLoadMore || loading || !hasMore) return;

    const { scrollTop } = containerRef.current;
    if (scrollTop === 0) {
      onLoadMore();
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-1"
      onScroll={handleScroll}
    >
      {/* Load More Indicator */}
      {hasMore && (
        <div className="flex justify-center py-2">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? "Loading..." : "Load more messages"}</span>
          </button>
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No messages yet
          </h3>
          <p className="text-foreground/60">
            Send the first message to start the conversation!
          </p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUser={currentUser}
              isConsecutive={isConsecutive(index)}
            />
          ))}
        </>
      )}

      {/* Loading Indicator */}
      {loading && messages.length === 0 && (
        <div className="flex justify-center py-8">
          <FiLoader className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
