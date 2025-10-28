"use client";
import { ChatConversation } from "@/lib/firebase/chatService";
import { UserProfile } from "@/lib/firebase/userService";
import { useMessages } from "@/hooks/useMessages";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { FiUser, FiArrowLeft, FiMoreVertical } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useOtherUsersPresence } from "@/hooks/usePresence"; // Add this import
import PresenceIndicator from "@/components/presence/PresenceIndicator"; // Add this import
import Image from "next/image";

interface ChatWindowProps {
  chat: ChatConversation | null;
  otherParticipant: UserProfile | null;
  onBack?: () => void;
}

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

  // Subscribe to other participant's presence
  const otherUserIds = otherParticipant ? [otherParticipant.uid] : [];
  const { presences } = useOtherUsersPresence(otherUserIds);
  const otherParticipantPresence = otherParticipant
    ? presences.get(otherParticipant.uid) || null
    : null;

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
    <div className="flex-1 flex flex-col bg-highlights/20">
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

          {/* Participant Avatar with Presence */}
          <div className="relative">
            {otherParticipant.photoURL ? (
              <Image
                height={10}
                width={10}
                src={otherParticipant.photoURL}
                alt={otherParticipant.displayName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center">
                <FiUser className="w-5 h-5 text-highlights" />
              </div>
            )}

            {/* Online Status Indicator */}
            <div className="absolute -bottom-1 -right-1">
              <PresenceIndicator
                presence={otherParticipantPresence}
                size="sm"
              />
            </div>
          </div>

          {/* Participant Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-foreground truncate">
                {otherParticipant.displayName}
              </h2>

              {/* Online Status */}
              {otherParticipantPresence?.isOnline ? (
                <span className="text-xs text-green-500 font-medium">
                  Online
                </span>
              ) : (
                <span className="text-xs text-foreground/60">Offline</span>
              )}
            </div>

            <p className="text-sm text-foreground/60 truncate">
              {otherParticipant.email}
            </p>

            {/* Last Seen for Offline Users */}
            {otherParticipantPresence && !otherParticipantPresence.isOnline && (
              <p className="text-xs text-foreground/50">
                Last seen {formatLastSeen(otherParticipantPresence.lastSeen)}
              </p>
            )}
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
        currentUser={currentUser}
        loading={loading}
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

// Helper function to format last seen time
function formatLastSeen(lastSeen: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - lastSeen.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return lastSeen.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
