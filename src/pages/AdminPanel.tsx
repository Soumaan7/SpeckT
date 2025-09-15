import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  Users,
  Clock,
  Bell,
  Bus,
  MapPin,
  Calendar,
  TrendingUp,
  AlertCircle,
  Shield,
  X,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  enrollmentId: string;
  class?: string;
  section?: string;
  route?: string;
  stop?: string;
  parentName?: string;
  parentPhone?: string;
}

interface QRScanEntry {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentId: string;
  scanTime: Timestamp;
  busRoute?: string;
  stop?: string;
  status: "boarding" | "departed";
}

interface Notification {
  id: string;
  type: "warning" | "danger";
  message: string;
  location: string;
  time: string; // Store as ISO string
  description: string;
  timeAgo: string;
}

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [qrScans, setQrScans] = useState<QRScanEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Allow any authenticated user to access admin panel (same as driver portal)
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Authentication check will be handled by onAuthStateChanged
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Fetch students
    const fetchStudents = async () => {
      try {
        const studentsRef = collection(db, "students");
        const snapshot = await getDocs(studentsRef);
        const studentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[];
        console.log("Fetched students:", studentsData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    // Real-time QR scan entries
    const qrScansQuery = query(
      collection(db, "qrScans"),
      orderBy("scanTime", "desc"),
      limit(50)
    );

    const unsubscribeQrScans = onSnapshot(qrScansQuery, (snapshot) => {
      const scansData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as QRScanEntry[];
      console.log("Fetched QR scans:", scansData);
      setQrScans(scansData);
    });

    // Real-time notifications (from Driver Portal updates)
    const notificationsQuery = query(
      collection(db, "updates"),
      orderBy("time", "desc"),
      limit(20)
    );

    const unsubscribeNotifications = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(notificationsData);
      }
    );

    fetchStudents();

    return () => {
      unsubscribeQrScans();
      unsubscribeNotifications();
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Panel</h2>
            <p className="mt-2 text-gray-600">
              Sign in to access the admin dashboard
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loginLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const todayScans = qrScans.filter(
    (scan) =>
      new Date(scan.scanTime.toDate()).toDateString() ===
      new Date().toDateString()
  );

  const recentScans = qrScans.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-indigo-600 rounded-xl p-2 mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Admin Panel
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">
            Monitor real-time activities, student registrations, and QR scan
            entries.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Today's Scans
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayScans.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Notifications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Routes
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(students.map((s) => s.route)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", name: "Overview", icon: TrendingUp },
                { id: "students", name: "Students", icon: Users },
                { id: "scans", name: "QR Scans", icon: Bus },
                { id: "notifications", name: "Notifications", icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent QR Scans
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {recentScans.length > 0 ? (
                      <div className="space-y-3">
                        {recentScans.map((scan) => (
                          <div
                            key={scan.id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {scan.studentName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {scan.enrollmentId} •{" "}
                                {scan.busRoute || "No route"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {scan.status === "boarding"
                                  ? "Boarding"
                                  : "Departed"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {scan.scanTime.toDate().toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No recent QR scans
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Notifications
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {notifications.slice(0, 5).length > 0 ? (
                      <div className="space-y-3">
                        {notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className="flex items-center justify-between p-3 rounded-lg shadow-sm bg-white"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {notification.message}
                              </p>
                              <p className="text-sm text-gray-600">
                                {notification.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                Location: {notification.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  notification.type === "danger"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {notification.type === "danger"
                                  ? "Emergency"
                                  : "Delay"}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(
                                  notification.time
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No recent notifications
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Registered Students ({students.length})
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  {students.length > 0 ? (
                    <div className="space-y-3">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="bg-white p-4 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                ID: {student.enrollmentId}
                              </p>
                              <p className="text-sm text-gray-600">
                                Class: {student.class || "N/A"} • Section:{" "}
                                {student.section || "N/A"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Route: {student.route || "N/A"} • Stop:{" "}
                                {student.stop || "N/A"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Parent: {student.parentName || "N/A"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {student.parentPhone || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No students registered
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* QR Scans Tab */}
            {activeTab === "scans" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    QR Scan Entries ({qrScans.length})
                  </h3>
                  <button
                    onClick={() => {
                      console.log("Current QR scans:", qrScans);
                      console.log("Students:", students);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    Debug Info
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  {qrScans.length > 0 ? (
                    <div className="space-y-3">
                      {qrScans.map((scan) => (
                        <div
                          key={scan.id}
                          className="bg-white p-4 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {scan.studentName}
                              </p>
                              <p className="text-sm text-gray-600">
                                ID: {scan.enrollmentId}
                              </p>
                              <p className="text-sm text-gray-600">
                                Route: {scan.busRoute || "N/A"} • Stop:{" "}
                                {scan.stop || "N/A"}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  scan.status === "boarding"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {scan.status === "boarding"
                                  ? "Boarding"
                                  : "Departed"}
                              </span>
                              <p className="text-sm text-gray-500 mt-1">
                                {scan.scanTime.toDate().toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No QR scan entries
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications ({notifications.length})
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  {notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 rounded-lg shadow-sm bg-white"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className="font-medium text-gray-900">
                                  {notification.message}
                                </h4>
                                <span
                                  className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    notification.type === "danger"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {notification.type === "danger"
                                    ? "Emergency"
                                    : "Delay"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Location: {notification.location}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-500">
                                {new Date(notification.time).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.timeAgo}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No notifications
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
