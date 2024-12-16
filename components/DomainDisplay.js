'use client';

import { useEffect, useState } from 'react';

export default function DomainDisplay() {
  const [domainData, setDomainData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        const response = await fetch('/api/domain/user');
        const data = await response.json();
        setDomainData(data);
      } catch (error) {
        console.error('Error fetching domain data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDomainData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Domain</h2>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{domainData?.domain}</span>
          {domainData?.isCustomDomain && (
            <span className={`px-2 py-1 text-sm rounded ${
              domainData?.verified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {domainData?.verified ? 'Verified' : 'Pending'}
            </span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Account</h2>
        <p className="text-gray-600">{domainData?.email}</p>
      </div>

      {!domainData?.isCustomDomain && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-sm text-blue-800">
            You&apos;re currently using the default domain. Add your custom domain to personalize your experience.
          </p>
        </div>
      )}
    </div>
  );
}
