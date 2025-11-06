import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        const adminQuery = query(
          collection(db, 'admins'),
          where('email', '==', user.email)
        );
        const adminSnapshot = await getDocs(adminQuery);
        if (adminSnapshot.empty) {
          // Also check if there are any admins at all (first admin scenario)
          const allAdminsQuery = query(collection(db, 'admins'));
          const allAdminsSnapshot = await getDocs(allAdminsQuery);
          if (allAdminsSnapshot.empty) {
            // No admins, add this user as first admin
            const { addDoc } = await import('firebase/firestore');
            await addDoc(collection(db, 'admins'), { email: user.email, createdAt: new Date() });
            setUser(user);
            setLoading(false);
          } else {
            // User is not admin, sign out
            await signOut(auth);
            setUser(null);
            setLoading(false);
          }
        } else {
          setUser(user);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
