import { useState } from 'react';
import QRCode from 'qrcode.react';

const GenerateQR = () => {
  const [enrollmentId, setEnrollmentId] = useState('');

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Generate Student QR Code</h2>
        
        <div className="mb-4">
          <label htmlFor="enrollmentId" className="block text-sm font-medium text-gray-700 mb-2">
            Enrollment ID
          </label>
          <input
            type="text"
            id="enrollmentId"
            value={enrollmentId}
            onChange={(e) => setEnrollmentId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter enrollment ID"
          />
        </div>

        {enrollmentId && (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <QRCode
                value={enrollmentId}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-gray-600">
              Scan this QR code with your phone's camera to verify registration
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateQR; 