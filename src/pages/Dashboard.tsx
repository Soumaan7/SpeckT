import React, { useEffect, useState } from "react";
import {
  Bus,
  MapPin,
  Clock,
  Users,
  Bell,
  AlertTriangle,
  X,
  ChevronRight,
} from "lucide-react";
import { db, collection, onSnapshot, deleteDoc, doc } from "../firebaseConfig";

interface Update {
  id: string;
  type: "warning" | "danger";
  message: string;
  time: string;
  description?: string;
  location?: string;
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

const Dashboard: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>("All Routes");
  const [statistics, setStatistics] = useState({
    activeBuses: 0,
    onTimeRate: 0,
    totalRoutes: 25,
    dailyRiders: 1234,
  });

  const routes = [
    "All Routes",
    "North Campus → Main Campus",
    "Main Campus → South Campus",
    "South Campus → North Campus",
    "Main Campus → Library",
    "Library → Main Campus",
  ];

  const formatTimeAgo = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  useEffect(() => {
    const schedulesUnsubscribe = onSnapshot(
      collection(db, "schedules"),
      (snapshot) => {
        const schedulesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            busNumber: data.busNumber ?? "N/A",
            route: data.route ?? "Unknown",
            departureTime: data.departureTime ?? "",
            arrivalTime: data.arrivalTime ?? "",
            status: data.status ?? "on-time",
            driverName: data.driverName ?? "Not Assigned",
          } as Schedule;
        });

        setSchedules(schedulesData);

        const activeSchedules = schedulesData.filter(
          (schedule) => schedule.status !== "completed"
        );
        const onTimeSchedules = schedulesData.filter(
          (schedule) => schedule.status === "on-time"
        );

        setStatistics((prev) => ({
          ...prev,
          activeBuses: activeSchedules.length,
          onTimeRate:
            schedulesData.length > 0
              ? Math.round(
                  (onTimeSchedules.length / schedulesData.length) * 100
                )
              : 0,
        }));
      }
    );

    const updatesUnsubscribe = onSnapshot(
      collection(db, "updates"),
      (snapshot) => {
        let updatesData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            let time: string;

            if (data.time && typeof data.time.toDate === "function") {
              time = data.time.toDate().toISOString();
            } else if (typeof data.time === "string") {
              time = data.time;
            } else {
              time = new Date().toISOString();
            }

            return {
              id: doc.id,
              type: data.type ?? "warning",
              message: data.message ?? "No message",
              time,
              description: data.description ?? "",
              location: data.location ?? "",
              timeAgo: data.timeAgo ?? "Just now",
            } as Update;
          })
          .sort((a, b) => {
            const timeA = new Date(a.time).getTime();
            const timeB = new Date(b.time).getTime();
            return timeB - timeA;
          });

        if (updatesData.length > 7) {
          const updatesToDelete = updatesData.slice(7);
          updatesData = updatesData.slice(0, 7);

          updatesToDelete.forEach(async (update) => {
            try {
              await deleteDoc(doc(db, "updates", update.id));
            } catch (error) {
              console.error("Error deleting old update:", error);
            }
          });
        }

        setUpdates(updatesData);
      }
    );

    return () => {
      schedulesUnsubscribe();
      updatesUnsubscribe();
    };
  }, []);

  const filteredSchedules =
    selectedRoute === "All Routes"
      ? schedules
      : schedules.filter((schedule) => schedule.route === selectedRoute);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dashboard Overview
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor all bus activities, schedules, and important updates in
            real-time.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Bus className="h-6 w-6 text-indigo-600" />}
            value={statistics.activeBuses}
            label="Active Buses"
            description="Currently in operation"
          />
          <StatCard
            icon={<MapPin className="h-6 w-6 text-indigo-600" />}
            value={statistics.totalRoutes}
            label="Routes"
            description="Covering all locations"
          />
          <StatCard
            icon={<Clock className="h-6 w-6 text-indigo-600" />}
            value={`${statistics.onTimeRate}%`}
            label="On-Time Rate"
            description="Reliable service"
          />
          <StatCard
            icon={<Users className="h-6 w-6 text-indigo-600" />}
            value={statistics.dailyRiders}
            label="Daily Riders"
            description="Served daily"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Updates Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Recent Updates
              </h2>
              <Bell className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="space-y-4">
              {updates.length > 0 ? (
                updates.map((update) => (
                  <div
                    key={update.id}
                    className={`p-4 rounded-xl ${
                      update.type === "danger"
                        ? "bg-red-50 border-l-4 border-red-500"
                        : "bg-yellow-50 border-l-4 border-yellow-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {update.message}
                        </h3>
                        {update.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {update.description}
                          </p>
                        )}
                        {update.location && (
                          <p className="mt-1 text-sm text-gray-500 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {update.location}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(update.time)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(update.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No recent updates
                </p>
              )}
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Bus Schedule
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
              >
                View All
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {filteredSchedules.slice(0, 3).map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Bus {schedule.busNumber}
                      </h3>
                      <p className="text-sm text-gray-600">{schedule.route}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        schedule.status === "on-time"
                          ? "bg-green-100 text-green-800"
                          : schedule.status === "delayed"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {schedule.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {schedule.departureTime} - {schedule.arrivalTime}
                    </span>
                    <span>{schedule.driverName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Bus Schedule
                </h2>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bus
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departure
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Arrival
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {schedule.busNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.route}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.departureTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.arrivalTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              schedule.status === "on-time"
                                ? "bg-green-100 text-green-800"
                                : schedule.status === "delayed"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {schedule.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.driverName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  value: number | string;
  label: string;
  description: string;
}> = ({ icon, value, label, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-indigo-50 rounded-xl">{icon}</div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
        <p className="text-gray-500">{label}</p>
      </div>
    </div>
    <p className="mt-2 text-sm text-gray-600">{description}</p>
  </div>
);

export default Dashboard;
