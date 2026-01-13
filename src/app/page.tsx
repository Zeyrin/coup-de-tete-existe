'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import destinations from './destinations.json';
import TravelTimeCombobox from '@/components/TravelTimeCombobox';
import BudgetCombobox from '@/components/BudgetCombobox';
import HelpDialog from '@/components/HelpDialog';
import BookingHelpPopover from '@/components/BookingHelpPopover';
import ImageCarousel from '@/components/ImageCarousel';
import RouletteWheel from '@/components/RouletteWheel';
import { getLocalGuestUser } from '@/utils/guestUser';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';



interface Image {
  url: string;
  alt: string;
  credit?: string;
}

interface Destination {
  city: string;
  tagline: string;
  station: string;
  departure: 'paris' | 'nice';
  activities: string[];
  travel_time: string;
  travel_time_minutes: number;
  typical_price: string;
  typical_price_euros: number;
  vibe: string;
  image?: string;
  images?: Image[];
}

export default function Home() {
  const [maxTravelTime, setMaxTravelTime] = useState(120); // minutes
  const [maxBudget, setMaxBudget] = useState(30); // euros
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [departureCity, setDepartureCity] = useState<'paris' | 'nice'>('paris');
  const [recentDestinations, setRecentDestinations] = useState<string[]>([]); // Track last 3 destinations
  const [showActivities, setShowActivities] = useState(false); // Track if activities section is expanded

  const spin = async () => {
    setIsSpinning(true);

    // Filter destinations based on preferences AND departure city
    let filtered = (destinations as Destination[]).filter(d =>
      d.departure === departureCity &&
      d.travel_time_minutes <= maxTravelTime &&
      d.typical_price_euros <= maxBudget
    );

    // Exclude the last 3 destinations if there are enough alternatives
    const availableWithoutRecent = filtered.filter(d => !recentDestinations.includes(d.city));

    // Only exclude recent destinations if we have at least 4 other options
    if (availableWithoutRecent.length >= 4) {
      filtered = availableWithoutRecent;
    }

    setTimeout(async () => {
      const random = filtered[Math.floor(Math.random() * filtered.length)];
      setDestination(random);
      setShowActivities(false); // Reset activities section to collapsed

      // Update recent destinations: add new one and keep only last 3
      setRecentDestinations(prev => {
        const updated = [random.city, ...prev];
        return updated.slice(0, 3); // Keep only the 3 most recent
      });

      setIsSpinning(false);

      // Save spin to database
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const guestUser = getLocalGuestUser();

        const response = await fetch('/api/roll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destination_city: random.city,
            departure_city: departureCity,
            travel_time_minutes: random.travel_time_minutes,
            typical_price_euros: random.typical_price_euros,
            is_guest: !user && !!guestUser,
            guest_user_id: guestUser?.id || null,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(`+${data.points_earned} points ! 🎉`);
        }
      } catch (error) {
        console.error('Error saving spin:', error);
      }
    }, 2000);
  };

  const filteredDestinations = (destinations as Destination[]).filter(d =>
    d.departure === departureCity &&
    d.travel_time_minutes <= maxTravelTime &&
    d.typical_price_euros <= maxBudget
  );

  // Keyboard shortcut: Press R to spin the wheel
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if not in an input/textarea and wheel is not already spinning
      if (
        event.key.toLowerCase() === 'r' &&
        !isSpinning &&
        !destination &&
        filteredDestinations.length > 0 &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        spin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSpinning, destination, filteredDestinations.length]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      {!destination ? (
        <div className="bg-white neo-border neo-shadow p-8 max-w-2xl w-full relative">
          {/* Help button in top left corner */}
          <HelpDialog />

          {/* Feedback button in top right corner */}
          <a
            href="https://forms.gle/2aYJDkfBSweDCVzD8"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -top-3 -right-3 bg-[#4ECDC4] text-black neo-feedback-button border-2 px-4 py-2 font-bold text-sm uppercase hover:bg-[#45B7D1] transition z-10"
          >
            💬 Feedback
          </a>
          <h1 className="text-5xl md:text-6xl font-bold mb-2 text-center uppercase">
            COUP DE TÊTE
          </h1>
          <p className="text-center text-xl mb-6 font-bold">⚡ AVENTURE SPONTANÉE ⚡</p>

          {/* Departure City Switch - hidden when spinning */}
          {!isSpinning && (
            <div className="flex justify-center gap-4 mb-8">
              {/* Paris button */}
              <button
                onClick={() => setDepartureCity('paris')}
                className={`px-8 py-4 font-bold text-lg uppercase transition-all duration-200 rounded-md ${
                  departureCity === 'paris'
                    ? 'bg-[#52688E] text-white neo-border'
                    : 'bg-white text-black neo-border shadow-[2px_2px_0px_#000000] opacity-60 hover:opacity-80'
                }`}
              >
                🗼 PARIS
              </button>

              {/* Nice button */}
              <button
                onClick={() => setDepartureCity('nice')}
                className={`px-8 py-4 font-bold text-lg uppercase transition-all duration-200 rounded-md ${
                  departureCity === 'nice'
                    ? 'bg-[#52688E] text-white neo-border'
                    : 'bg-white text-black neo-border shadow-[2px_2px_0px_#000000] opacity-60 hover:opacity-80'
                }`}
              >
                🌴 NICE
              </button>
            </div>
          )}

          {isSpinning ? (
            <RouletteWheel isSpinning={isSpinning} />
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-lg font-bold mb-3 uppercase">
                    🚂 Temps de trajet max:
                  </label>
                  <TravelTimeCombobox
                    value={maxTravelTime}
                    onChange={setMaxTravelTime}
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold mb-3 uppercase">
                    💰 Budget max:
                  </label>
                  <BudgetCombobox
                    value={maxBudget}
                    onChange={setMaxBudget}
                  />
                </div>
              </div>

              <div className="bg-[#74D3AE] neo-card p-4 mb-8">
                <p className="text-center font-bold text-lg">
                  {filteredDestinations.length} DESTINATIONS DISPONIBLES
                </p>
              </div>


                <button
                  onClick={spin}
                  disabled={isSpinning || filteredDestinations.length === 0}
                  className="w-full bg-[#FF4747] text-white neo-button px-8 py-6 text-2xl md:text-3xl font-bold uppercase disabled:opacity-50"
                >
                  {isSpinning ? '🎰 EN COURS...' : '🎲 LANCE LA ROUE !'}
                </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white neo-border neo-shadow p-8 max-w-2xl w-full animate-[shake_0.5s_ease-in-out] relative">
          {/* Feedback button in top right corner */}
          <a
            href="https://forms.gle/2aYJDkfBSweDCVzD8"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -top-3 -right-3 bg-[#4ECDC4] text-black neo-feedback-button border-2 px-4 py-2 font-bold text-sm uppercase hover:bg-[#45B7D1] transition z-10"
          >
            💬 Feedback
          </a>
          <div className="bg-[#FF6B6B] p-6 mb-6 -mt-8 -mx-8 relative overflow-hidden">
            {/* Winning flash effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-yellow-400 opacity-0 animate-[winning-flash_0.5s_ease-in-out_3]"></div>
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase text-center relative z-10">
              🎉 {destination.city} 🎉
            </h1>
          </div>

          {/* Photo de la destination */}
          {destination.images && destination.images.length > 0 ? (
            <ImageCarousel
              images={destination.images}
              travelTime={destination.travel_time}
              price={destination.typical_price}
              tagline={destination.tagline}
            />
          ) : destination.image ? (
            <div className="w-full h-64 md:h-80 mb-6 neo-border neo-shadow overflow-hidden relative">
              <Image
                src={destination.image}
                alt={`Photo de ${destination.city}`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          <div className="bg-white neo-card mb-6 overflow-hidden">
            <div className="p-6">
              {/* Desktop version - full list */}
              <div className="hidden min-[768px]:block">
                <h3 className="font-bold text-xl mb-4 uppercase">⚡ À FAIRE:</h3>
                <ul className="space-y-3">
                  {destination.activities.map((activity, i) => (
                    <li key={i} className="flex items-center">
                      <span className="text-xl mr-3">→</span>
                      <span className="font-bold text-base leading-relaxed">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mobile version - collapsible with first activity inline */}
              <div className="min-[768px]:hidden">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center flex-1 min-w-0 gap-2">
                    <h3 className="font-bold text-lg uppercase whitespace-nowrap">⚡ À FAIRE:</h3>
                    <span className="text-lg">→</span>
                    <span className="font-bold text-lg truncate">
                      {destination.activities[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowActivities(!showActivities)}
                    className="flex items-center gap-1 text-xs font-bold uppercase hover:text-gray-600 transition whitespace-nowrap flex-shrink-0"
                  >
                    <span>{showActivities ? 'Masquer' : destination.activities.length > 1 ? `+${destination.activities.length - 1}` : '...'}</span>
                    <span
                      className={`text-lg transition-transform duration-300 ${showActivities ? 'rotate-90' : 'rotate-0'}`}
                    >
                      ▶
                    </span>
                  </button>
                </div>

                {/* All activities with slide animation - mobile only */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    showActivities
                      ? 'max-h-[500px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <ul className="space-y-3 pl-0">
                    {destination.activities.map((activity, i) => (
                      <li key={i} className="flex items-center">
                        <span className="text-lg mr-2">→</span>
                        <span className="font-bold text-sm leading-relaxed">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Ligne unique avec les 3 boutons */}
            <div className="flex gap-3">
              <a
                href={`https://www.sncf-connect.com/home/search?userInput=${encodeURIComponent(destination.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#4ECDC4] text-black neo-button py-4 font-bold text-base text-center uppercase inline-block"
              >
                🚂 Réserver SNCF
              </a>

              <BookingHelpPopover />
            </div>

            {/* Bouton relancer avec plus d'espace */}
            <button
              onClick={() => setDestination(null)}
              className="w-full bg-[#FF6B6B] text-white neo-button py-6 font-bold text-xl uppercase mt-2"
            >
              ↻ RELANCER LA ROUE
            </button>

            {/* Feedback message */}
            <div className="flex justify-center">
              <a
                href="https://forms.gle/2aYJDkfBSweDCVzD8"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#98D8C8] neo-card px-6 py-3 font-bold text-sm hover:bg-[#85C1B5] transition inline-block"
              >
                💬 Partage ton expérience
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}