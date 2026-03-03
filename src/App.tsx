import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import Welcome from "./pages/Welcome";
import LiveTracking from "./pages/LiveTracking";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import DriverPortal from "./pages/DriverPortal";
import StudentVerification from "./pages/StudentVerification";
import VerifyStudent from "./pages/VerifyStudent";
import QRScannerPage from "./pages/QRScannerPage";
import AdminPanel from "./pages/AdminPanel";
import { ClerkProvider } from "@clerk/clerk-react";

// Replace with your Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/live-tracking" element={<LiveTracking />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/driver-portal" element={<DriverPortal />} />
            <Route
              path="/student-verification"
              element={<StudentVerification />}
            />
            <Route path="/verify-student" element={<VerifyStudent />} />
            <Route path="/qr-scanner" element={<QRScannerPage />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
          </Routes>
        </Layout>
        <PWAInstallPrompt />
      </Router>
    </ClerkProvider>
  );
}
