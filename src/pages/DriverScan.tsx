import { useState } from 'react';
import QRScanner from '../components/QRScanner';

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

const DriverScan = () => {
  const [scannedStudents, setScannedStudents] = useState<StudentData[]>([]);

  const handleScanSuccess = (studentData: StudentData) => {
    setScannedStudents(prev => [...prev, studentData]);
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Boarding Scanner</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Scan Student QR Code</h2>
          <QRScanner 
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Scanned Students</h2>
          {scannedStudents.length === 0 ? (
            <p className="text-gray-500">No students scanned yet</p>
          ) : (
            <div className="space-y-4">
              {scannedStudents.map((student, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-gray-600">ID: {student.enrollmentId}</p>
                      {student.class && (
                        <p className="text-sm text-gray-600">
                          Class: {student.class}{student.section ? ` - ${student.section}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {student.route && <p className="text-sm text-gray-600">Route: {student.route}</p>}
                      {student.stop && <p className="text-sm text-gray-600">Stop: {student.stop}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverScan; 