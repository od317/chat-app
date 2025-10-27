"use client";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { FiLogOut, FiUser } from "react-icons/fi";
import Image from "next/image";

/**
 * User Profile Component - Client Component
 * Why CSR?
 * - Displays dynamic user data
 * - Interactive logout button
 * - Real-time auth state
 */
export default function UserProfile() {
  const { user, logout, loading } = useAuth();

  if (!user) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center space-y-4">
        {/* User Avatar */}
        <div className="flex justify-center">
          {user.photoURL ? (
            <Image
              width={20}
              height={20}
              src={user.photoURL}
              alt={user.displayName || "User avatar"}
              className="w-20 h-20 rounded-full border-4 border-primary/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/20">
              <FiUser className="w-8 h-8 text-primary" />
            </div>
          )}
        </div>

        {/* User Information */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {user.displayName || "Anonymous User"}
          </h2>
          <p className="text-foreground/70 text-sm">{user.email}</p>
          {user.emailVerified && (
            <span className="inline-block px-2 py-1 text-xs bg-green-500/20 text-green-600 rounded-full">
              Verified
            </span>
          )}
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          loading={loading}
          onClick={logout}
          className="w-full"
        >
          <FiLogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </Card>
  );
}
