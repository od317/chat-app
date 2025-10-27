"use client";
import { useState, useRef, useEffect } from "react";
import { FiSend, FiPaperclip, FiSmile } from "react-icons/fi";
import Button from "@/components/ui/Button";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
}

/**
 * Message Input Component - Handles message composition and sending
 * Why separate component?
 * - Reusable across different chat interfaces
 * - Handles enter key and button send
 * - Manages input state and validation
 */
export default function MessageInput({
  onSendMessage,
  disabled = false,
  sending = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (trimmedMessage && !sending && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = message.trim().length > 0 && !sending && !disabled;

  return (
    <div className="border-t border-highlights/30 bg-highlights/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end space-x-3">
          {/* Attachment Button */}
          <button
            type="button"
            disabled={disabled}
            className="p-2 text-foreground/50 hover:text-foreground disabled:opacity-30 transition-colors"
            aria-label="Attach file"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 bg-highlights border border-highlights/30 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all duration-200 text-foreground placeholder-foreground/50"
              style={{
                minHeight: "44px",
                maxHeight: "120px",
              }}
            />

            {/* Emoji Button */}
            <button
              type="button"
              disabled={disabled}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground disabled:opacity-30 transition-colors"
              aria-label="Add emoji"
            >
              <FiSmile className="w-5 h-5" />
            </button>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={!canSend}
            loading={sending}
            className="shrink-0 px-4 py-3 rounded-2xl transition-all duration-200"
            aria-label="Send message"
          >
            <FiSend className="w-4 h-4" />
          </Button>
        </div>

        {/* Character Count */}
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-xs text-foreground/40">
            Press Enter to send, Shift+Enter for new line
          </span>
          {message.length > 0 && (
            <span
              className={`text-xs ${
                message.length > 1000 ? "text-red-500" : "text-foreground/40"
              }`}
            >
              {message.length}/1000
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
