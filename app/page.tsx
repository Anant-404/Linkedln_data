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
          <div className="mt-6 p-6 bg-gray-700 rounded-lg shadow-lg text-white space-y-6">
            {/* Profile Header */}
            <div className="text-center">
              <img
                src={
                  profile.profile_pic_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}`
                }
                alt="Profile"
                className="w-24 h-24 mx-auto rounded-full mb-4 border-4 border-blue-500 shadow-lg object-cover"
              />
              <h2 className="text-xl font-semibold mb-2">{profile.full_name}</h2>
              {profile.headline && <p className="text-gray-300">{profile.headline}</p>}
              {profile.occupation && <p className="italic text-gray-400">{profile.occupation}</p>}
              {getLocation() && <p className="text-gray-400 text-sm">{getLocation()}</p>}
            </div>

            {/* About Section */}
            {profile.summary && (
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">About</h3>
                <p className="text-gray-300 whitespace-pre-line">{profile.summary}</p>
              </div>
            )}

            {/* Experience */}
            {profile.experiences?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Experience</h3>
                <ul className="space-y-3">
                  {profile.experiences.map((exp: any, index: number) => (
                    <li key={index} className="bg-gray-800 p-4 rounded-lg shadow">
                      <h4 className="font-bold text-white">{exp.title} @ {exp.company}</h4>
                      <p className="text-sm text-gray-400">{exp.location}</p>
                      {exp.description && (
                        <p className="text-sm text-gray-300 mt-1">{exp.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Education */}
            {profile.education?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Education</h3>
                <ul className="space-y-3">
                  {profile.education.map((edu: any, index: number) => (
                    <li key={index} className="bg-gray-800 p-4 rounded-lg shadow">
                      <h4 className="font-bold text-white">{edu.school}</h4>
                      <p className="text-sm text-gray-400">{edu.degree_name} in {edu.field_of_study}</p>
                      {edu.description && (
                        <p className="text-sm text-gray-300 mt-1">{edu.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
{profile.skills?.length > 0 && (
  <div>
    <h3 className="text-lg font-semibold text-blue-400 mb-2">Skills</h3>
    <div className="flex flex-wrap gap-2">
      {profile.skills.map((skill: string, index: number) => (
        <span
          key={index}
          className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow hover:bg-blue-700 transition"
        >
          {skill}
        </span>
      ))}
    </div>
  </div>
)}

            {/* Projects */}
            {profile.accomplishment_projects?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Projects</h3>
                <ul className="space-y-3">
                  {profile.accomplishment_projects.map((proj: any, index: number) => (
                    <li key={index} className="bg-gray-800 p-4 rounded-lg shadow">
                      <h4 className="font-bold text-white">{proj.title}</h4>
                      {proj.description && (
                        <p className="text-sm text-gray-300 mt-1 whitespace-pre-line">{proj.description}</p>
                      )}
                      {proj.url && (
                        <a href={proj.url} target="_blank" className="text-blue-400 text-sm underline mt-2 inline-block">View Project</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
