import { Bell, X } from "lucide-react";
import { useState } from "react";

export default function NotificationBanner() {
  const [showNotification, setShowNotification] = useState(true);

  if (!showNotification) return null;

  return (
    <div className="bg-indigo-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          <p className="text-sm font-medium">
            New feature: Set up custom alerts for your favorite routes!
          </p>
        </div>
        <button
          onClick={() => setShowNotification(false)}
          className="flex-shrink-0 ml-4 text-white hover:text-indigo-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
