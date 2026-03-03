import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Bell,
  AlertTriangle,
  Clock,
  Truck,
  ShieldAlert,
  CheckCircle,
  Calendar,
  Bus,
  Trash,
  Edit,
  MapPin,
  X,
  Info,
} from "lucide-react";
import {
  db,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  getDoc,
} from "../firebaseConfig";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// Get auth instance
const auth = getAuth();

// Add local storage keys
const STORAGE_KEY_BUS_NUMBER = "liveTracking_busNumber";
const STORAGE_KEY_IS_SHARING = "liveTracking_isSharing";

// Setup global tracking variables
if (typeof window !== "undefined") {
  window.busTracking = window.busTracking || {
    watchId: null,
    userId: null,
    busNumber: localStorage.getItem(STORAGE_KEY_BUS_NUMBER) || "",
    isSharing: localStorage.getItem(STORAGE_KEY_IS_SHARING) === "true",
  };
}

interface Update {
  id: string;
  type: "warning" | "danger";
  message: string;
  location: string;
  time: string; // Store as ISO string
  description: string;
  timeAgo: string;
}

interface Schedule {
  id: string;
  busNumber: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  status: "on-time" | "delayed" | "completed";
  driverName: string;
}

export const getStoredUpdates = (): Update[] => {
  const stored = localStorage.getItem("sharedUpdates");
  return stored ? JSON.parse(stored) : [];
};

export const storeUpdates = (updates: Update[]): void => {
  localStorage.setItem("sharedUpdates", JSON.stringify(updates));
};

const DriverPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [selectedDelay, setSelectedDelay] = useState<string>("");
  const [selectedEmergency, setSelectedEmergency] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    busNumber: "",
    route: "",
    departureTime: "",
    arrivalTime: "",
    driverName: "",
  });
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Location tracking states
  const [busNumber, setBusNumber] = useState(
    window.busTracking?.busNumber || ""
  );
  const [isSharing, setIsSharing] = useState(
    window.busTracking?.isSharing || false
  );
  const [locationError, setLocationError] = useState("");

  const delayOptions = [
    "Traffic Jam",
    "Technical Issue",
    "Weather Conditions",
    "Road Construction",
    "Heavy Passenger Load",
  ];

  const emergencyOptions = [
    "Accident",
    "Medical Emergency",
    "Bus Breakdown",
    "Security Issue",
    "Road Hazard",
  ];

  const locations = ["North Campus", "South Campus", "Main Campus"];

  const routes = [
    "North Campus → Main Campus",
    "Main Campus → South Campus",
    "South Campus → North Campus",
    "Main Campus → Library",
    "Library → Main Campus",
  ];

  const navigate = useNavigate();

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Function to update user location in Firestore with debouncing
  const updateUserLocation = useCallback(
    async (
      location: { lat: number; lng: number },
      busNum: string,
      uid: string
    ) => {
      const currentUserId = uid || auth.currentUser?.uid;
      if (!currentUserId) {
        console.log("No user ID, can't update location");
        return;
      }

      // Debounce the update - only update if enough time has passed since last update
      const now = Date.now();
      if (
        window.busTracking.lastUpdate &&
        now - window.busTracking.lastUpdate < 5000
      ) {
        return; // Skip update if less than 5 seconds since last update
      }

      try {
        console.log("Updating location for user:", currentUserId);
        const userRef = doc(db, "users", currentUserId);
        await setDoc(
          userRef,
          {
            location: {
              latitude: location.lat,
              longitude: location.lng,
              busNumber: busNum || busNumber,
              timestamp: new Date().toISOString(),
            },
            isSharing: true,
          },
          { merge: true }
        );
        console.log("Location updated successfully:", location);
        window.busTracking.lastUpdate = now;
      } catch (error) {
        console.error("Error updating location:", error);
      }
    },
    [busNumber]
  );

  // Function to check and request location permissions
  const checkLocationPermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permissionStatus.state === "denied") {
        setLocationError(
          "Location permission is denied. Please enable it in your browser settings."
        );
        return false;
      }

      if (permissionStatus.state === "prompt") {
        // Request permission
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        if (position) {
          return true;
        }
      }

      return permissionStatus.state === "granted";
    } catch (error) {
      console.error("Error checking location permission:", error);
      setLocationError(
        "Error checking location permissions. Please ensure location services are enabled."
      );
      return false;
    }
  };

  // Function to start location tracking
  const startLocationTracking = useCallback(
    async (busNum: string, uid: string) => {
      const currentUserId = uid || auth.currentUser?.uid;
      if (!currentUserId) {
        console.error("No user ID available for tracking");
        return;
      }

      if (!busNum) {
        setLocationError("Please enter a bus number");
        return;
      }

      // Check location permissions first
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        return;
      }

      console.log("Starting location tracking for bus:", busNum);

      // Save to local storage
      localStorage.setItem(STORAGE_KEY_BUS_NUMBER, busNum);
      localStorage.setItem(STORAGE_KEY_IS_SHARING, "true");

      // Update global tracking object
      window.busTracking = {
        ...window.busTracking,
        busNumber: busNum,
        isSharing: true,
        userId: currentUserId,
        lastUpdate: 0, // Initialize lastUpdate timestamp
      };

      // Start watching position with improved error handling
      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: true,
          timeout: 30000, // 30 seconds timeout
          maximumAge: 5000, // Accept cached position if less than 5 seconds old
        };

        let retryCount = 0;
        const maxRetries = 3;

        const handlePositionError = (error: GeolocationPositionError) => {
          console.error("Error getting location:", error);
          let errorMessage = "Error getting location: ";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage +=
                "Location permission denied. Please enable location services in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage +=
                "Location information unavailable. Please check your device's location settings and ensure GPS is enabled.";
              break;
            case error.TIMEOUT:
              if (retryCount < maxRetries) {
                retryCount++;
                errorMessage += `Attempting to get location (${retryCount}/${maxRetries})...`;
                setTimeout(() => {
                  if (window.busTracking.isSharing) {
                    startLocationTracking(busNum, currentUserId);
                  }
                }, 5000);
              } else {
                errorMessage +=
                  "Failed to get location after multiple attempts. Please check:\n1. GPS is enabled on your device\n2. You're in an area with good GPS signal\n3. Location services are enabled in your browser";
                retryCount = 0;
              }
              break;
            default:
              errorMessage += error.message;
          }

          setLocationError(errorMessage);
        };

        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Only update if we have valid coordinates
            if (latitude && longitude) {
              updateUserLocation(
                { lat: latitude, lng: longitude },
                busNum,
                currentUserId
              );
              setLocationError("");
              retryCount = 0;
            }
          },
          handlePositionError,
          options
        );

        window.busTracking.watchId = watchId;
      } else {
        setLocationError("Geolocation is not supported by this browser.");
      }
    },
    [updateUserLocation]
  );

  // Function to stop location tracking
  const stopLocationTracking = useCallback(async () => {
    if (window.busTracking.watchId !== null) {
      navigator.geolocation.clearWatch(window.busTracking.watchId);
      window.busTracking.watchId = null;
    }

    localStorage.setItem(STORAGE_KEY_IS_SHARING, "false");
    window.busTracking.isSharing = false;

    if (auth.currentUser?.uid) {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(
          userRef,
          {
            isSharing: false,
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating sharing status:", error);
      }
    }
  }, []);

  // Effect to handle location tracking state
  useEffect(() => {
    if (isSharing && busNumber) {
      startLocationTracking(busNumber, auth.currentUser?.uid);
    } else if (!isSharing) {
      stopLocationTracking();
    }
  }, [isSharing, busNumber, startLocationTracking, stopLocationTracking]);

  // Effect for cleanup
  useEffect(() => {
    return () => {
      if (window.busTracking.watchId !== null) {
        navigator.geolocation.clearWatch(window.busTracking.watchId);
      }
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load schedules from Firestore
    const unsubscribeSchedules = onSnapshot(
      collection(db, "schedules"),
      (snapshot) => {
        const schedulesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Schedule[];

        // Sort schedules by latest first (based on ID, which is a timestamp)
        const sortedSchedules = schedulesData.sort(
          (a, b) => Number(b.id) - Number(a.id)
        );
        setSchedules(sortedSchedules);
      }
    );

    // Load updates from Firestore
    const unsubscribeUpdates = onSnapshot(
      collection(db, "updates"),
      (snapshot) => {
        let updatesData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            console.log("Raw time from Firestore:", data.time); // Debugging: Log the raw time field
            return {
              id: doc.id,
              ...data,
              time: data.time ?? new Date().toISOString(), // Ensure time is in ISO format
            } as Update;
          })
          .sort((a, b) => {
            const timeA = new Date(a.time).getTime();
            const timeB = new Date(b.time).getTime();
            return timeB - timeA; // Sort in descending order (latest first)
          });

        // Limit to 7 updates and delete older ones
        if (updatesData.length > 7) {
          const updatesToDelete = updatesData.slice(7); // Get updates beyond the 7th
          updatesData = updatesData.slice(0, 7); // Keep only the first 7 updates

          // Delete older updates from Firestore
          updatesToDelete.forEach(async (update) => {
            try {
              await deleteDoc(doc(db, "updates", update.id));
            } catch (error) {
              console.error("Error deleting old update:", error);
            }
          });
        }

        setUpdates(updatesData);
        storeUpdates(updatesData);
      }
    );

    // Check if location sharing was active
    if (window.busTracking.isSharing && window.busTracking.busNumber) {
      setIsSharing(true);
      setBusNumber(window.busTracking.busNumber);
      startLocationTracking(
        window.busTracking.busNumber,
        auth.currentUser?.uid
      );
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribeSchedules();
      unsubscribeUpdates();
    };
  }, [startLocationTracking]);

  const sendNotification = async (
    type: "delay" | "emergency",
    reason: string
  ) => {
    if (!reason || !location) {
      alert("Please select both a reason and location before sending.");
      return;
    }

    const severity = type === "delay" ? "warning" : "danger";

    const newUpdate: Update = {
      id: Date.now().toString(), // Use timestamp for sorting
      type: severity,
      message: `${type === "delay" ? "Route Delay" : "Emergency"}: ${reason}`,
      location,
      time: new Date().toISOString(), // Store time as ISO string
      description: `${reason} reported at ${location}. ${
        type === "delay"
          ? "Service is adjusting to return to schedule."
          : "Emergency response team has been notified."
      }`,
      timeAgo: "Just now",
    };

    try {
      await addDoc(collection(db, "updates"), newUpdate);
      setSuccessMessage(
        `✅ ${
          type === "delay" ? "Delay" : "Emergency"
        } report submitted successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 3000);

      if (type === "delay") {
        setSelectedDelay("");
      } else {
        setSelectedEmergency("");
      }
      setLocation("");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Error sending notification. Please try again.");
    }
  };

  const saveSchedule = async () => {
    if (
      !newSchedule.busNumber ||
      !newSchedule.route ||
      !newSchedule.departureTime ||
      !newSchedule.arrivalTime ||
      !newSchedule.driverName
    ) {
      alert("Please fill in all schedule fields");
      return;
    }

    const scheduleData = {
      ...newSchedule,
      status: "on-time",
    };

    try {
      const docRef = await addDoc(collection(db, "schedules"), scheduleData);
      // No need to set id here, onSnapshot will pick up the correct doc.id
      setNewSchedule({
        busNumber: "",
        route: "",
        departureTime: "",
        arrivalTime: "",
        driverName: "",
      });
      setSuccessMessage("✅ Schedule added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await deleteDoc(doc(db, "schedules", id));
      setSuccessMessage("🗑️ Schedule deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  const startEditing = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setNewSchedule(schedule);
  };

  const saveEditedSchedule = async () => {
    if (!editingSchedule) return;

    try {
      const scheduleRef = doc(db, "schedules", editingSchedule.id);
      await updateDoc(scheduleRef, { ...newSchedule });
      setEditingSchedule(null);
      setNewSchedule({
        busNumber: "",
        route: "",
        departureTime: "",
        arrivalTime: "",
        driverName: "",
      });
      setSuccessMessage("✅ Schedule updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-indigo-600 rounded-xl p-2 mr-3">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Driver Portal
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-200"
              title="Logout"
            >
              <span>Logout</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Location Sharing & Schedule Management */}
        <div className="space-y-8 lg:col-span-2">
          {/* Location Sharing Card */}
          <section className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Location Sharing
              </h2>
              <Info
                className="h-4 w-4 text-gray-400 ml-1"
                title="Share your real-time location with the system."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Bus Number
              </label>
              <input
                type="text"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Enter bus number"
                disabled={isSharing}
              />
              {locationError && (
                <p className="text-red-500 text-xs mt-1">{locationError}</p>
              )}
              <button
                onClick={() => setIsSharing(!isSharing)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                  isSharing
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isSharing ? "Stop Sharing Location" : "Start Sharing Location"}
              </button>
            </div>
          </section>

          {/* Schedule Management Card */}
          <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Schedule Management
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Bus Number"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newSchedule.busNumber}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, busNumber: e.target.value })
                }
              />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newSchedule.route}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, route: e.target.value })
                }
              >
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}
              </select>
              <input
                type="time"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newSchedule.departureTime}
                onChange={(e) =>
                  setNewSchedule({
                    ...newSchedule,
                    departureTime: e.target.value,
                  })
                }
              />
              <input
                type="time"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newSchedule.arrivalTime}
                onChange={(e) =>
                  setNewSchedule({
                    ...newSchedule,
                    arrivalTime: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Driver Name"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newSchedule.driverName}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, driverName: e.target.value })
                }
              />
              <button
                onClick={saveSchedule}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                Add Schedule
              </button>
            </div>
            <div>
              <h3 className="text-md font-semibold mb-2">Active Schedules</h3>
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border rounded-lg p-4 flex items-center justify-between bg-gray-50 hover:bg-indigo-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-indigo-700">
                        Bus {schedule.busNumber}
                      </p>
                      <p className="text-sm text-gray-600">{schedule.route}</p>
                      <p className="text-sm text-gray-500">
                        {schedule.departureTime} - {schedule.arrivalTime}
                      </p>
                      <p className="text-sm text-gray-500">
                        Driver: {schedule.driverName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(schedule)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                        title="Edit schedule"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-400 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-200"
                        title="Delete schedule"
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Emergency & Delay Reporting */}
        <div className="space-y-8">
          <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl shadow-lg p-6 text-white border border-indigo-700">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5" />
              <h2 className="text-lg font-semibold">
                Emergency & Delay Reporting
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-100 mb-2">
                  Location
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border bg-white text-gray-900 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Select Location
                  </option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <select
                    className="w-full px-4 py-2 rounded-lg border bg-white text-gray-900 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300"
                    value={selectedDelay}
                    onChange={(e) => setSelectedDelay(e.target.value)}
                  >
                    <option value="" disabled hidden>
                      Select Delay Reason
                    </option>
                    {delayOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => sendNotification("delay", selectedDelay)}
                    className="w-full bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                  >
                    <Clock className="h-5 w-5" />
                    Report Delay
                  </button>
                </div>
                <div className="space-y-2">
                  <select
                    className="w-full px-4 py-2 rounded-lg border bg-white text-gray-900 focus:ring-2 focus:ring-red-300 focus:border-red-300"
                    value={selectedEmergency}
                    onChange={(e) => setSelectedEmergency(e.target.value)}
                  >
                    <option value="" disabled hidden>
                      Select Emergency Type
                    </option>
                    {emergencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      sendNotification("emergency", selectedEmergency)
                    }
                    className="w-full bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-400 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    <ShieldAlert className="h-5 w-5" />
                    Report Emergency
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Schedule</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Bus Number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={editingSchedule.busNumber}
                onChange={(e) =>
                  setEditingSchedule({
                    ...editingSchedule,
                    busNumber: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Route"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={editingSchedule.route}
                onChange={(e) =>
                  setEditingSchedule({
                    ...editingSchedule,
                    route: e.target.value,
                  })
                }
              />
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={editingSchedule.departureTime}
                onChange={(e) =>
                  setEditingSchedule({
                    ...editingSchedule,
                    departureTime: e.target.value,
                  })
                }
              />
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={editingSchedule.arrivalTime}
                onChange={(e) =>
                  setEditingSchedule({
                    ...editingSchedule,
                    arrivalTime: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Driver Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={editingSchedule.driverName}
                onChange={(e) =>
                  setEditingSchedule({
                    ...editingSchedule,
                    driverName: e.target.value,
                  })
                }
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEditedSchedule}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingSchedule(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Offline Status Bar */}
      {!isOnline && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 z-50 shadow">
          <AlertTriangle className="h-5 w-5" />
          <p>You are offline. Updates will sync when reconnected.</p>
        </div>
      )}
    </div>
  );
};

export default DriverPortal;
