'use client';
import { useState } from 'react';
import destinations from './destinations.json';

interface Destination {
  city: string;
  tagline: string;
  station: string;
  activities: string[];
  travel_time: string;
  travel_time_minutes: number;
  typical_price: string;
  typical_price_euros: number;
  vibe: string;
}

export default function Home() {
  const [maxTravelTime, setMaxTravelTime] = useState(120); // minutes
  const [maxBudget, setMaxBudget] = useState(30); // euros
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const spin = () => {
    setIsSpinning(true);
    
    // Filter destinations based on preferences
    const filtered = destinations.filter(d => 
      d.travel_time_minutes <= maxTravelTime &&
      d.typical_price_euros <= maxBudget
    );
    
    setTimeout(() => {
      const random = filtered[Math.floor(Math.random() * filtered.length)];
      setDestination(random);
      setIsSpinning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-8">
      {!destination ? (
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Coup de Tête
          </h1>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Temps de trajet max:
              </label>
              <select 
                value={maxTravelTime}
                onChange={(e) => setMaxTravelTime(Number(e.target.value))}
                className="w-full p-3 border rounded-lg"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 heure</option>
                <option value="90">1h30</option>
                <option value="120">2 heures</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Budget max:
              </label>
              <select 
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full p-3 border rounded-lg"
              >
                <option value="15">€15</option>
                <option value="20">€20</option>
                <option value="30">€30</option>
                <option value="40">€40</option>
              </select>
            </div>
          </div>

          <button 
            onClick={spin}
            disabled={isSpinning}
            className="w-full bg-purple-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isSpinning ? '🎰 Spinning...' : '🎲 LANCE L\'AVENTURE'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <h1 className="text-3xl font-bold mb-2">{destination.city}</h1>
          <p className="text-gray-600 mb-4">{destination.tagline}</p>
          
          <div className="mb-4 text-sm">
            <p>🚂 {destination.travel_time} • 💰 {destination.typical_price}</p>
          </div>
          
          <h3 className="font-bold mb-2">À faire:</h3>
          <ul className="text-sm space-y-1 mb-6">
            {destination.activities.map((activity, i) => (
              <li key={i}>• {activity}</li>
            ))}
          </ul>
          
          <div className="space-y-2">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(destination.station);
                alert('✅ Destination copiée!');
              }}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              📋 Copier la destination
            </button>
            
            <a 
              href="https://www.sncf-connect.com"
              target="_blank"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-blue-700"
            >
              🚂 Réserver sur SNCF Connect
            </a>
            
            <button 
              onClick={() => setDestination(null)}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
            >
              ↻ Relancer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}