import { QRCodeSVG } from 'qrcode.react';

const StudentVerification = () => {
  // Use the new Vercel deployment URL
  const verificationUrl = 'https://test11-aj72.vercel.app/verify-student';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">SpeckT</h1>
          <h2 className="text-2xl font-semibold text-gray-800">Student Registration Check</h2>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="bg-white p-6 rounded-xl shadow-md mb-6 border-2 border-blue-100">
            <QRCodeSVG
              value={verificationUrl}
              size={280}
              level="H"
              includeMargin={true}
              className="rounded-lg"
            />
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-lg font-medium text-gray-700">
              Scan this QR code with your phone's camera
            </p>
            <p className="text-sm text-gray-600 max-w-xs">
              This will take you to a secure page where you can verify your registration status with SpeckT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentVerification; 