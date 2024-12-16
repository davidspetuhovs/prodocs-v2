'use client';

import { useEffect, useState } from 'react';

export default function UserDisplay() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/domain/user');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userData) return <div>No user data found for this domain</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl mb-4">Domain Owner Information</h2>
      <p>Email: {userData.email}</p>
      <p>Domain: {userData.domain}</p>
    </div>
  );
}
