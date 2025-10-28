"use client";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import { FiMessageSquare, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import Image from "next/image";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-highlights/80 backdrop-blur-md border-b border-highlights/30 sticky top-0 z-50 mb-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary text-highlights rounded-xl">
              <FiMessageSquare className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              ChatApp
            </span>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/" active>
              Chats
            </NavLink>
            <NavLink href="/groups">Groups</NavLink>
            <NavLink href="/contacts">Contacts</NavLink>
          </div>

          {/* Desktop Navigation - Right */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-3">
                {/* User Avatar */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center">
                    {user.photoURL ? (
                      <Image
                        height={8}
                        width={8}
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-highlights text-sm font-medium">
                        {user.displayName?.[0] ||
                          user.email?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-foreground text-sm font-medium max-w-32 truncate">
                    {user.displayName || user.email}
                  </span>
                </div>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  loading={loading}
                  className="text-foreground/70 hover:text-foreground hover:bg-primary/10"
                >
                  <FiLogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-foreground hover:bg-primary/10 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-highlights/30 bg-highlights/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Navigation Links */}
              <MobileNavLink href="/" active>
                Chats
              </MobileNavLink>
              <MobileNavLink href="/groups" active={false}>
                Groups
              </MobileNavLink>
              <MobileNavLink href="/contacts" active={false}>
                Contacts
              </MobileNavLink>

              {/* User Section */}
              {user && (
                <div className="pt-4 border-t border-highlights/30">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center">
                      {user.photoURL ? (
                        <Image
                          height={10}
                          width={10}
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-highlights font-medium">
                          {user.displayName?.[0] ||
                            user.email?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium text-sm truncate">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-foreground/60 text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-foreground/70 hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors duration-200"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                    {loading && (
                      <div className="ml-auto w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Desktop Navigation Link Component
interface NavLinkProps {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active = false, children }: NavLinkProps) {
  return (
    <a
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "text-primary bg-primary/10 border border-primary/20"
          : "text-foreground/70 hover:text-foreground hover:bg-highlights"
      }`}
    >
      {children}
    </a>
  );
}

interface MobileNavLinkProps {
  active: boolean;
  href: string;
  children: React.ReactNode;
}

// Mobile Navigation Link Component
function MobileNavLink({ href, active = false, children }: MobileNavLinkProps) {
  return (
    <a
      href={href}
      className={`block px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
        active
          ? "text-primary bg-primary/10 border border-primary/20"
          : "text-foreground/70 hover:text-foreground hover:bg-highlights"
      }`}
      onClick={() => {
        /* Close mobile menu on link click */
      }}
    >
      {children}
    </a>
  );
}
