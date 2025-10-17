"use client";

import { useState } from "react";
import destinations from "./destinations.json";

type Destination = {
  city: string;
  tagline: string;
  activities: string[];
  station: string;
  typical_price: string;
  travel_time: string;
};

export default function Home() {
  // STEP 1: Set up state management
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);

  // STEP 2: Create the click handler function
  const handleSpin = () => {
    setIsSpinning(true);
    setSelectedDestination(null); // Clear previous result

    // Pick random destination
    const randomIndex = Math.floor(Math.random() * destinations.length);
    const randomDestination = destinations[randomIndex];

    // Wait 2 seconds, then show result
    setTimeout(() => {
      setSelectedDestination(randomDestination);
      setIsSpinning(false);
    }, 2000);
  };

  // Copy destination station to clipboard
  const copyDestination = () => {
    if (selectedDestination) {
      navigator.clipboard.writeText(selectedDestination.station);
      alert("Destination copied! Paste it in SNCF Connect");
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        {/* STEP 3: Show spinner while spinning */}
        {isSpinning && <div className="spinner"></div>}

        {/* STEP 4: Show result after spinning */}
        {!isSpinning && selectedDestination && (
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">
              {selectedDestination.city}
            </h1>
            <p className="text-xl text-gray-600 italic mb-6">
              {selectedDestination.tagline}
            </p>
            <div className="text-left mb-6">
              <h2 className="text-lg font-semibold mb-2">Activities:</h2>
              <ul className="list-disc list-inside space-y-1">
                {selectedDestination.activities.map((activity, index) => (
                  <li key={index} className="text-gray-700">
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={copyDestination}
                className="px-8 py-3 text-lg font-bold text-white bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700 transition-colors duration-200"
              >
                COPY STATION
              </button>
              <button
                onClick={handleSpin}
                className="px-8 py-3 text-lg font-bold text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-200"
              >
                SPIN AGAIN
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Show initial button */}
        {!isSpinning && !selectedDestination && (
          <button
            onClick={handleSpin}
            className="px-12 py-6 text-2xl font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105"
          >
            SPIN FOR ADVENTURE
          </button>
        )}
        {selectedDestination && (
          <a
            href="https://www.sncf-connect.com"
            target="_blank"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg"
          >
            Book on SNCF Connect →
          </a>
        )}
      </div>

      {/* STEP 6: CSS for the spinner */}
      <style jsx>{`
        .spinner {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
  
}
