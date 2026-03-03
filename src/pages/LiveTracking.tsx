import { useEffect, useState, useRef, useCallback } from "react";
import { MapPin, Bus, Clock } from "lucide-react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import {
  db,
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
} from "../firebaseConfig";
import { getAuth } from "firebase/auth";

// Get auth instance
const auth = getAuth();

// Google Maps configuration
const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 34.0837, // Srinagar's latitude
  lng: 74.7973, // Srinagar's longitude
};

// Add local storage keys
const STORAGE_KEY_BUS_NUMBER = "liveTracking_busNumber";
const STORAGE_KEY_IS_SHARING = "liveTracking_isSharing";
const STORAGE_KEY_ANONYMOUS_ID = "liveTracking_anonymousId";

// Define types
interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  busNumber?: number;
}

interface UserLocations {
  [key: string]: Location;
}

interface BusTracking {
  watchId: number | null;
  userId: string | null;
  busNumber: string;
  isSharing: boolean;
}

// Extend Window interface
declare global {
  interface Window {
    busTracking: BusTracking;
  }
}

// Setup global tracking variables
if (typeof window !== "undefined") {
  window.busTracking = window.busTracking || {
    watchId: null,
    userId: null,
    busNumber: localStorage.getItem(STORAGE_KEY_BUS_NUMBER) || "",
    isSharing: localStorage.getItem(STORAGE_KEY_IS_SHARING) === "true",
  };

  if (window.busTracking.isSharing && !window.busTracking.watchId) {
    console.log("Location sharing was active, will restore state");
  }
}

// Map component
interface MapProps {
  userLocations: UserLocations;
  center: { lat: number; lng: number };
  selectedBusId: string | null;
  setSelectedBusId: (id: string | null) => void;
}

const Map: React.FC<MapProps> = ({
  userLocations,
  center,
  selectedBusId,
  setSelectedBusId,
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "Enter your Google Maps API key here",
  });

  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (selectedBusId && userLocations[selectedBusId] && mapRef.current) {
      const location = userLocations[selectedBusId];
      const newCenter = { lat: location.latitude, lng: location.longitude };

      mapRef.current.panTo(newCenter);
      mapRef.current.setZoom(16);

      setSelectedMarker(selectedBusId);
    }
  }, [selectedBusId, userLocations]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={15}
      center={center}
      onLoad={onMapLoad}
    >
      {Object.entries(userLocations).map(([userId, location]) => (
        <Marker
          key={userId}
          position={{ lat: location.latitude, lng: location.longitude }}
          label={location.busNumber?.toString() || "N/A"}
          onClick={() => {
            setSelectedMarker(userId);
            setSelectedBusId(userId);
          }}
          animation={
            userId === selectedBusId ? google.maps.Animation.BOUNCE : undefined
          }
        >
          {selectedMarker === userId && (
            <InfoWindow
              position={{ lat: location.latitude, lng: location.longitude }}
              onCloseClick={() => {
                setSelectedMarker(null);
                setSelectedBusId(null);
              }}
            >
              <div>
                <h3 className="font-bold">Bus #{location.busNumber}</h3>
                <p>
                  Last updated:{" "}
                  {new Date(location.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
};

// Main LiveTracking component
export default function LiveTracking() {
  const [userLocations, setUserLocations] = useState<UserLocations>({});
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const scrollToMap = useCallback(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const locations: UserLocations = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.isSharing && data.location) {
          locations[doc.id] = data.location;
        }
      });
      setUserLocations(locations);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <MapPin className="h-8 w-8 mr-3 text-blue-600" />
                Live Bus Tracking
              </h2>
              <p className="mt-2 text-gray-600">
                Track all active buses in real-time across the campus
              </p>
            </div>
          </div>

          {/* Active Buses List */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Active Buses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(userLocations).map(([userId, location]) => (
                <div
                  key={userId}
                  className={`p-6 rounded-xl border transition-all cursor-pointer ${
                    selectedBusId === userId
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                  }`}
                  onClick={() => {
                    setSelectedBusId(userId);
                    scrollToMap();
                  }}
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 rounded-lg p-2 mr-3">
                      <Bus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="font-semibold text-lg text-gray-900">
                      Bus #{location.busNumber}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    Last updated:{" "}
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Container */}
          <div
            ref={mapContainerRef}
            className="rounded-xl overflow-hidden border border-gray-200"
          >
            <Map
              userLocations={userLocations}
              center={defaultCenter}
              selectedBusId={selectedBusId}
              setSelectedBusId={setSelectedBusId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
