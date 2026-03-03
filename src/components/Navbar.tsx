import { UserButton, useUser, SignInButton } from "@clerk/clerk-react";
import {
  Bus,
  Home,
  Menu,
  X,
  Bell,
  Settings,
  MapPin,
  UserCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isSignedIn } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isDriverPortal = location.pathname === "/driver-portal";

  const renderAuthButton = () => {
    if (isDriverPortal) return null;

    return isSignedIn ? (
      <UserButton
        afterSignOutUrl="/"
        appearance={{ elements: { avatarBox: "w-8 h-8" } }}
      />
    ) : (
      <SignInButton mode="modal">
        <button className="text-gray-500 hover:text-indigo-600 transition-colors">
          <UserCircle className="h-5 w-5" />
        </button>
      </SignInButton>
    );
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-md"
            : "bg-white shadow-lg"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Bus className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  SpeckT
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive("/")
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-900 hover:border-indigo-600 hover:text-indigo-600"
                  }`}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>

                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-900 hover:border-indigo-600 hover:text-indigo-600"
                  }`}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>

                <Link
                  to="/live-tracking"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive("/live-tracking")
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-900 hover:border-indigo-600 hover:text-indigo-600"
                  }`}
                >
                  <Bus className="h-4 w-4 mr-1" />
                  Live Tracking
                </Link>

                <Link
                  to="/qr-scanner"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive("/qr-scanner")
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-900 hover:border-indigo-600 hover:text-indigo-600"
                  }`}
                  style={{ border: "2px solid red" }}
                >
                  📱 QR Scanner
                </Link>

                <Link
                  to="/driver-portal"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive("/driver-portal")
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-900 hover:border-indigo-600 hover:text-indigo-600"
                  }`}
                >
                  <UserCircle className="h-4 w-4 mr-1" />
                  Driver Portal
                </Link>
              </div>
            </div>

            {/* Right side buttons */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <button className="text-gray-500 hover:text-indigo-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="text-gray-500 hover:text-indigo-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              {renderAuthButton()}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              {renderAuthButton()}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActive("/")
                    ? "bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700"
                    : "border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4 mr-1" />
                <span className="ml-2">Home</span>
              </Link>

              <Link
                to="/dashboard"
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActive("/dashboard")
                    ? "bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700"
                    : "border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <MapPin className="h-4 w-4 mr-1" />
                <span className="ml-2">Dashboard</span>
              </Link>

              <Link
                to="/live-tracking"
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActive("/live-tracking")
                    ? "bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700"
                    : "border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Bus className="h-4 w-4 mr-1" />
                <span className="ml-2">Live Tracking</span>
              </Link>

              <Link
                to="/qr-scanner"
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActive("/qr-scanner")
                    ? "bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700"
                    : "border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                📱 <span className="ml-2">QR Scanner</span>
              </Link>

              <Link
                to="/driver-portal"
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActive("/driver-portal")
                    ? "bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700"
                    : "border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <UserCircle className="h-4 w-4 mr-1" />
                <span className="ml-2">Driver Portal</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
