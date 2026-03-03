import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  db,
  getDoc,
  doc,
  addDoc,
  collection,
  serverTimestamp,
} from "../firebaseConfig";

interface StudentData {
  name: string;
  enrollmentId: string;
  class?: string;
  section?: string;
  route?: string;
  stop?: string;
  parentName?: string;
  parentPhone?: string;
}

interface QRScannerProps {
  onScanSuccess?: (studentData: StudentData) => void;
  onScanError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError,
}) => {
  const [message, setMessage] = useState("");

  // Function to check if a string is a valid URL
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Function to navigate to URL
  const navigateToUrl = (url: string) => {
    setMessage("Redirecting to URL...");
    // Redirect immediately to the URL
    window.location.href = url;
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 10,
      },
      false
    );

    const success = async (decodedText: string) => {
      try {
        setMessage("Processing QR code...");
        console.log("Scanned QR content:", decodedText);

        // Check if the scanned data is a URL
        if (isValidUrl(decodedText)) {
          setMessage("URL detected! Redirecting...");
          console.log("URL detected, redirecting to:", decodedText);
          navigateToUrl(decodedText);
          return;
        }

        // If not a URL, treat as enrollment ID and check Firebase
        setMessage("Verifying student...");
        console.log("Checking student with ID:", decodedText);

        // Check if the enrollment ID exists in Firestore
        const studentRef = doc(db, "students", decodedText);
        const studentDoc = await getDoc(studentRef);

        if (studentDoc.exists()) {
          const studentData = studentDoc.data() as StudentData;
          setMessage("Student verified successfully!");
          console.log("Student found:", studentData);

          // Save QR scan entry to Firebase
          try {
            const scanEntry = {
              studentId: decodedText,
              studentName: studentData.name,
              enrollmentId: studentData.enrollmentId,
              scanTime: serverTimestamp(),
              busRoute: studentData.route,
              stop: studentData.stop,
              status: "boarding",
            };
            console.log("Saving scan entry:", scanEntry);

            const docRef = await addDoc(collection(db, "qrScans"), scanEntry);
            console.log("QR scan saved with ID:", docRef.id);
          } catch (error) {
            console.error("Error saving QR scan entry:", error);
            setMessage("Error saving scan entry!");
          }

          onScanSuccess?.(studentData);
        } else {
          setMessage("Student not found in database!");
          console.log("Student not found for ID:", decodedText);
          onScanError?.("Student not found");
        }
      } catch (error) {
        setMessage("Error processing QR code");
        console.error("QR scan error:", error);
        onScanError?.(error instanceof Error ? error.message : "Unknown error");
      }
    };

    const error = (error: string) => {
      setMessage("Error scanning QR code");
      onScanError?.(error);
    };

    scanner.render(success, error);

    return () => {
      scanner.clear();
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div id="qr-reader" className="w-full max-w-md"></div>
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes("successfully") || message.includes("URL")
              ? "bg-green-100 text-green-700"
              : message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default QRScanner;
