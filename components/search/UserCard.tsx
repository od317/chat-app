"use client";
import { UserProfile } from "../../lib/firbase/userService";
import { FiUser, FiMessageCircle } from "react-icons/fi";
import Button from "../ui/Button";
import Image from "next/image";
interface UserCardProps {
  user: UserProfile;
  onStartChat?: (user: UserProfile) => void;
  variant?: "default" | "compact";
}

/**
 * User Card Component - Displays individual user in search results
 * Why separate component?
 * - Reusable across different parts of the app
 * - Consistent user display
 * - Easy to update user card design
 */
export default function UserCard({
  user,
  onStartChat,
  variant = "default",
}: UserCardProps) {
  const handleStartChat = () => {
    if (onStartChat) {
      onStartChat(user);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-highlights/50 hover:bg-highlights/80 transition-colors duration-200">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* User Avatar */}
          <div className="shrink-0">
            {user.photoURL ? (
              <Image
                width={8}
                height={8}
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center">
                <FiUser className="w-4 h-4 text-highlights" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-foreground/60 truncate">{user.email}</p>
          </div>
        </div>

        {/* Action Button */}
        {onStartChat && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartChat}
            className="shrink-0 ml-2"
          >
            <FiMessageCircle className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="p-4 rounded-xl bg-highlights/50 border border-highlights/30 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center space-x-4">
        {/* User Avatar */}
        <div className="shrink-0">
          {user.photoURL ? (
            <Image
              width={12}
              height={12}
              src={user.photoURL}
              alt={user.displayName}
              className="w-12 h-12 rounded-full border-2 border-primary/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center border-2 border-primary/20">
              <FiUser className="w-6 h-6 text-highlights" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-foreground truncate">
            {user.displayName}
          </h3>
          <p className="text-sm text-foreground/70 truncate">{user.email}</p>
        </div>

        {/* Action Button */}
        {onStartChat && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleStartChat}
            className="shrink-0"
          >
            <FiMessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
        )}
      </div>
    </div>
  );
}
