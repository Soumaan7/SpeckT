import { useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { db, getDoc, doc } from '../firebaseConfig';

const StudentScan = () => {
  const [message, setMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      setIsScanning(true);
      setMessage('Starting scanner...');

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          try {
            setMessage('Verifying enrollment...');
            
            // Check if the enrollment ID exists in Firestore
            const studentRef = doc(db, 'students', decodedText);
            const studentDoc = await getDoc(studentRef);

            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              setMessage(`✅ Registered Student!\nName: ${studentData.name}\nClass: ${studentData.class || 'N/A'}`);
            } else {
              setMessage('❌ Student not registered');
            }
          } catch (error) {
            setMessage('Error verifying enrollment');
          }
          
          // Stop scanning after successful scan
          await html5QrCode.stop();
          setIsScanning(false);
        },
        (errorMessage) => {
          // Ignore errors during scanning
        }
      );
    } catch (error) {
      setMessage('Error starting scanner. Please allow camera access.');
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Student Registration Check</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {!isScanning ? (
            <button
              onClick={startScanner}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Scanner
            </button>
          ) : (
            <div id="qr-reader" className="w-full aspect-square"></div>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-center ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 
            message.includes('❌') ? 'bg-red-100 text-red-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            {message.split('\n').map((line, i) => (
              <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentScan; 