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

// Roulette Wheel Component
function RouletteWheel({ destinations, isSpinning }: { destinations: Destination[], isSpinning: boolean }) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

  return (
    <div className="relative w-80 h-80 mx-auto mb-8">
      {/* Pointer/Arrow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-black"></div>
      </div>

      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full neo-border bg-white neo-shadow pulse-ring"></div>

      {/* Spinning wheel */}
      <div className={`absolute inset-4 rounded-full neo-border overflow-hidden ${isSpinning ? 'roulette-spin' : ''}`}>
        {destinations.map((dest, i) => {
          const rotation = (360 / destinations.length) * i;
          const skew = 90 - (360 / destinations.length);

          return (
            <div
              key={i}
              className="absolute w-1/2 h-1/2 origin-bottom-right"
              style={{
                transform: `rotate(${rotation}deg) skewY(${skew}deg)`,
                left: '50%',
                top: '50%',
                backgroundColor: colors[i % colors.length],
              }}
            >
              <div
                className="absolute bottom-4 right-4 font-bold text-xs text-black transform rotate-45"
                style={{ transform: `skewY(${-skew}deg) rotate(${-rotation}deg)` }}
              >
                {dest.city.slice(0, 8)}
              </div>
            </div>
          );
        })}

        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black neo-border border-white"></div>
      </div>
    </div>
  );
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
    }, 3000);
  };

  const filteredDestinations = destinations.filter(d =>
    d.travel_time_minutes <= maxTravelTime &&
    d.typical_price_euros <= maxBudget
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      {!destination ? (
        <div className="bg-white neo-border neo-shadow p-8 max-w-2xl w-full">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 text-center uppercase">
            COUP DE TÊTE
          </h1>
          <p className="text-center text-xl mb-8 font-bold">⚡ AVENTURE SPONTANÉE ⚡</p>

          {isSpinning ? (
            <RouletteWheel destinations={filteredDestinations} isSpinning={isSpinning} />
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-lg font-bold mb-3 uppercase">
                    🚂 Temps de trajet max:
                  </label>
                  <select
                    value={maxTravelTime}
                    onChange={(e) => setMaxTravelTime(Number(e.target.value))}
                    className="w-full p-4 neo-border bg-[#FFE951] font-bold text-lg cursor-pointer hover:bg-[#FFD700] transition"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 heure</option>
                    <option value="90">1h30</option>
                    <option value="120">2 heures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-bold mb-3 uppercase">
                    💰 Budget max:
                  </label>
                  <select
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full p-4 neo-border bg-[#4ECDC4] font-bold text-lg cursor-pointer hover:bg-[#45B7D1] transition"
                  >
                    <option value="15">€15</option>
                    <option value="20">€20</option>
                    <option value="30">€30</option>
                    <option value="40">€40</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#FF6B6B] neo-border p-4 mb-8">
                <p className="text-center font-bold text-lg">
                  {filteredDestinations.length} DESTINATIONS DISPONIBLES
                </p>
              </div>

              <button
                onClick={spin}
                disabled={isSpinning || filteredDestinations.length === 0}
                className="w-full bg-[#FF6B6B] text-white neo-border neo-shadow neo-shadow-hover neo-shadow-active px-8 py-6 text-2xl md:text-3xl font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSpinning ? '🎰 EN COURS...' : '🎲 LANCE LA ROUE !'}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white neo-border neo-shadow p-8 max-w-2xl w-full">
          <div className="bg-[#FF6B6B] neo-border p-6 mb-6 -mt-8 -mx-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase text-center">
              {destination.city}
            </h1>
          </div>

          <p className="text-2xl font-bold mb-6 text-center">{destination.tagline}</p>

          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="bg-[#4ECDC4] neo-border px-4 py-2 font-bold flex-1 text-center">
              🚂 {destination.travel_time}
            </div>
            <div className="bg-[#FFE951] neo-border px-4 py-2 font-bold flex-1 text-center">
              💰 {destination.typical_price}
            </div>
          </div>

          <div className="bg-[#98D8C8] neo-border p-4 text-center mb-6">
            <p className="text-xl font-bold">{destination.vibe}</p>
          </div>

          <div className="bg-white neo-border p-6 mb-6">
            <h3 className="font-bold text-xl mb-4 uppercase">⚡ À FAIRE:</h3>
            <ul className="space-y-3">
              {destination.activities.map((activity, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-2xl mr-3">→</span>
                  <span className="font-bold text-lg">{activity}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(destination.station);
                alert('✅ Gare copiée: ' + destination.station);
              }}
              className="w-full bg-[#F7DC6F] text-black neo-border neo-shadow-sm neo-shadow-hover neo-shadow-active py-4 font-bold text-lg uppercase"
            >
              📋 Copier la gare
            </button>

            <a
              href="https://www.sncf-connect.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#4ECDC4] text-black neo-border neo-shadow-sm neo-shadow-hover py-4 font-bold text-lg text-center uppercase"
            >
              🚂 Réserver SNCF
            </a>

            <button
              onClick={() => setDestination(null)}
              className="w-full bg-[#FF6B6B] text-white neo-border neo-shadow-sm neo-shadow-hover neo-shadow-active py-4 font-bold text-lg uppercase"
            >
              ↻ RELANCER LA ROUE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}