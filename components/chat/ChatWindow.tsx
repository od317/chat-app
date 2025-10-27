"use client";
import { ChatConversation } from "../../lib/firbase/chatService";
import { UserProfile } from "../../lib/firbase/userService";
import { useMessages } from "../../hooks/useMessages";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { FiUser, FiArrowLeft, FiMoreVertical } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import Image from "next/image";

interface ChatWindowProps {
  chat: ChatConversation | null;
  otherParticipant: UserProfile | null;
  onBack?: () => void;
}

/**
 * Chat Window Component - Main messaging interface
 * Why separate component?
 * - Complete chat UI in one component
 * - Manages message sending and receiving
 * - Handles chat header and input
 */
export default function ChatWindow({
  chat,
  otherParticipant,
  onBack,
}: ChatWindowProps) {
  const { user: currentUser } = useAuth();
  const {
    messages,
    loading,
    sending,
    error,
    hasMore,
    sendMessage,
    loadMoreMessages,
  } = useMessages(chat?.id || null);

  if (!chat || !otherParticipant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-highlights/20">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Select a conversation
          </h3>
          <p className="text-foreground/60">
            Choose a chat from the sidebar or start a new conversation by
            searching for users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-highlights/20 max-h-[90vh] mt-2 ml-2">
      {/* Chat Header */}
      <div className="bg-highlights/80 backdrop-blur-sm border-b border-highlights/30 p-4">
        <div className="flex items-center space-x-3">
          {/* Back Button (Mobile) */}
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-2 text-foreground hover:bg-highlights rounded-lg transition-colors"
              aria-label="Back to chats"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Participant Avatar */}
          {otherParticipant.photoURL ? (
            <Image
              width={10}
              height={10}
              src={otherParticipant.photoURL}
              alt={otherParticipant.displayName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center">
              <FiUser className="w-5 h-5 text-highlights" />
            </div>
          )}

          {/* Participant Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">
              {otherParticipant.displayName}
            </h2>
            <p className="text-sm text-foreground/60 truncate">
              {otherParticipant.email}
            </p>
          </div>

          {/* Menu Button */}
          <button
            className="p-2 text-foreground/60 hover:text-foreground hover:bg-highlights rounded-lg transition-colors"
            aria-label="Chat options"
          >
            <FiMoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-500">Error: {error}</p>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        loading={loading}
        currentUser={currentUser}
        hasMore={hasMore}
        onLoadMore={loadMoreMessages}
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={sendMessage}
        disabled={sending}
        sending={sending}
        placeholder={`Message ${otherParticipant.displayName}...`}
      />
    </div>
  );
}
