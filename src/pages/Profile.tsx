import { useState } from 'react';
import { useAuthContext } from '../components/AuthProvider';

export default function Profile() {
  const { user } = useAuthContext();
  const [isPremium] = useState(false);

  return (
    <div className="p-4 pb-20">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold">{user?.email}</h1>
        <p className="text-gray-600">Level 5</p>
      </div>

      <div className="bg-white rounded-lg p-4 shadow mt-6">
        <h2 className="text-lg font-semibold mb-2">Stats Overview</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Local Rank</p>
            <p className="font-bold">#5</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">State Rank</p>
            <p className="font-bold">#156</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">National Rank</p>
            <p className="font-bold">#1458</p>
          </div>
        </div>
      </div>

      {!isPremium && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">Unlock Premium Features</h3>
          <p className="text-sm text-blue-600 mb-4">
            Get access to all muscle group tracking, unlimited templates, and more!
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full">
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
}