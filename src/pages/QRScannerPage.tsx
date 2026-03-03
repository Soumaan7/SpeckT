import QRScanner from "../components/QRScanner";

const QRScannerPage = () => {
  const handleScanSuccess = (studentData: any) => {
    console.log("Student verified:", studentData);
    // You can add additional logic here like redirecting or showing a success message
  };

  const handleScanError = (error: string) => {
    console.error("Scan error:", error);
    // You can add additional error handling here
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              QR Code Scanner
            </h1>
            <p className="text-gray-600">
              Scan a student's QR code to verify their identity
            </p>
          </div>
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;
