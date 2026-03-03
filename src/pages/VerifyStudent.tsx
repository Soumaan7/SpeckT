import { useState } from 'react';
import { db, getDoc, doc, setDoc, serverTimestamp } from '../firebaseConfig';

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

interface BoardingRecord {
  studentName: string;
  enrollmentId: string;
  timestamp: any;
  date: string;
}

const VerifyStudent = () => {
  const [enrollmentId, setEnrollmentId] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const checkRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!enrollmentId.trim()) {
      setMessage('❌ Please enter an enrollment ID');
      setIsLoading(false);
      return;
    }

    try {
      const studentRef = doc(db, 'students', enrollmentId.trim());
      const studentDoc = await getDoc(studentRef);

      if (studentDoc.exists()) {
        const studentData = studentDoc.data() as StudentData;
        
        // Create boarding record
        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        const boardingRecord: BoardingRecord = {
          studentName: studentData.name,
          enrollmentId: enrollmentId.trim(),
          timestamp: serverTimestamp(),
          date: today
        };

        // Store in boarding_records collection with a unique ID
        const boardingRef = doc(db, 'boarding_records', `${enrollmentId.trim()}_${Date.now()}`);
        await setDoc(boardingRef, boardingRecord);

        setMessage(`✅ Registered Student!\nName: ${studentData.name}`);
      } else {
        setMessage('❌ Student not registered');
      }
    } catch (err) {
      console.error('Error checking registration:', err);
      setMessage('❌ Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* <h1 className="text-4xl font-bold text-blue-600 mb-2 tracking-tight">SpeckT</h1> */}
          <h2 className="text-2xl font-semibold text-gray-800">Student Verification</h2>
          <p className="text-gray-600 mt-2">Enter your enrollment ID to verify your registration</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
          <form onSubmit={checkRegistration} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="enrollmentId" className="block text-sm font-medium text-gray-700">
                Enrollment ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="enrollmentId"
                  value={enrollmentId}
                  onChange={(e) => setEnrollmentId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="Enter your enrollment ID"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Registration'
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-xl text-center transform transition-all duration-300 ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-700 border-2 border-green-200 shadow-lg' 
                : message.includes('❌') 
                ? 'bg-red-50 text-red-700 border-2 border-red-200 shadow-lg'
                : 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-lg'
            }`}>
              {message.split('\n').map((line, i) => (
                <p key={i} className={`${i > 0 ? 'mt-2' : ''} text-lg font-medium`}>{line}</p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by SpeckT - Secure Student Verification System</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyStudent; 