'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const handleSubmit = async () => {
    console.log("🚀 Fetching profile for:", url);

    try {
      const res = await fetch('/api/fetch-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      console.log("📦 Received profile data:", data);
      setProfile(data);
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
    }
  };

  // Build location string only if present
  const getLocation = () => {
    if (!profile) return '';
    const parts = [profile.city, profile.state, profile.country_full_name];
    return parts.filter(Boolean).join(', ');
  };

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-xl mx-auto bg-gray-800 rounded-lg p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-white">LinkedIn Profile Viewer</h1>

        <input
          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter LinkedIn Profile URL"
        />

        <button
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full font-medium"
          onClick={handleSubmit}
        >
          Fetch Profile
        </button>

        {profile && (
          <div className="mt-6 p-6 bg-gray-700 rounded-lg shadow-lg text-white">
            <img
              src={
                profile.profile_pic_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}`
              }
              alt="Profile"
              className="w-24 h-24 rounded-full mb-4 border-4 border-blue-500 shadow-lg object-cover"
            />
            <h2 className="text-xl font-semibold text-white mb-2">{profile.full_name}</h2>

            {profile.headline && (
              <p className="text-gray-300 mb-2">{profile.headline}</p>
            )}

            {profile.occupation && (
              <p className="text-gray-400 mb-1 italic">{profile.occupation}</p>
            )}

            {getLocation() && (
              <p className="text-gray-400 text-sm">{getLocation()}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
