import { Link, useLocation } from "react-router-dom";
import { UserButton, useUser, SignInButton } from "@clerk/clerk-react";
import {
  Bus,
  MapPin,
  Bell,
  Shield,
  Menu,
  X,
  UserCircle,
  Scan,
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isSignedIn } = useUser();

  const navItems = [
    { name: "Home", path: "/", icon: Bus },
    { name: "Live Tracking", path: "/live-tracking", icon: MapPin },
    { name: "Dashboard", path: "/dashboard", icon: Shield },
    { name: "QR Scanner", path: "/qr-scanner", icon: Scan },
    { name: "Driver Portal", path: "/driver-portal", icon: UserCircle },
    { name: "Admin Panel", path: "/admin-panel", icon: Shield },
  ];

  const renderAuthButton = () => {
    if (isSignedIn) {
      return <UserButton afterSignOutUrl="/" />;
    }
    return (
      <SignInButton mode="modal">
        <button className="text-gray-600 hover:text-indigo-600 transition-colors">
          <UserCircle className="h-5 w-5" />
        </button>
      </SignInButton>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="bg-indigo-600 rounded-xl p-2 mr-3">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Speckt</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none transition-all duration-200"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* User Profile */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">{renderAuthButton()}</div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">{renderAuthButton()}</div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-indigo-600 rounded-xl p-2 mr-3">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Speckt</span>
              </div>
              <p className="text-gray-600 text-sm">
                Your intelligent campus transportation companion. Track buses in
                real-time, plan your routes, and never miss your ride.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className="text-gray-600 hover:text-indigo-600 text-sm transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Contact Us
              </h3>
              <p className="text-gray-600 text-sm">
                Have questions or feedback? We'd love to hear from you.
              </p>
              <div className="mt-4">
                <a
                  href="mailto:support@speckt.com"
                  className="text-indigo-600 hover:text-indigo-700 text-sm transition-colors duration-200"
                >
                  support@speckt.com
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm text-center">
              © {new Date().getFullYear()} Speckt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
