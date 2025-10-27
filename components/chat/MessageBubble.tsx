"use client";
import { Message } from "@/lib/firbase/messageService";
import { User } from "firebase/auth";

interface MessageBubbleProps {
  message: Message;
  currentUser: User | null;
  isConsecutive: boolean;
}

export default function MessageBubble({
  message,
  currentUser,
  isConsecutive,
}: MessageBubbleProps) {
  const isOwnMessage = message.senderId === currentUser?.uid;

  // Format message time
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div
      className={`flex w-full ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xs lg:max-w-md ${
          isOwnMessage ? "ml-auto" : "mr-auto"
        } ${isConsecutive ? "mt-1" : "mt-3"}`}
      >
        {/* Message Bubble */}
        <div
          className={`
          rounded-2xl px-4 py-2 transition-all duration-200
          ${
            isOwnMessage
              ? "bg-primary text-highlights rounded-br-md"
              : "bg-highlights text-foreground rounded-bl-md"
          }
          ${isConsecutive ? "rounded-t-2xl" : ""}
          hover:shadow-lg
        `}
        >
          {/* Message Text */}
          <p className="text-sm whitespace-pre-wrap wrap-break-word">
            {message.text}
          </p>
        </div>

        {/* Timestamp - Only show for last message in sequence */}
        {!isConsecutive && (
          <div
            className={`text-xs text-foreground/50 mt-1 ${
              isOwnMessage ? "text-right" : "text-left"
            }`}
          >
            {formatMessageTime(message.timestamp)}
            {message.read && isOwnMessage && (
              <span className="ml-1">✓ Read</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
