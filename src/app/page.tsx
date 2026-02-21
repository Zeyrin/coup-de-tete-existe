"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import destinations from "./destinations.json";
import TravelTimeCombobox from "@/components/TravelTimeCombobox";
import BudgetCombobox from "@/components/BudgetCombobox";
import HelpDialog from "@/components/HelpDialog";
import BookingHelpPopover from "@/components/BookingHelpPopover";
import ImageCarousel from "@/components/ImageCarousel";
import RouletteWheel from "@/components/RouletteWheel";
import HomePageSkeleton from "@/components/HomePageSkeleton";
import { getLocalGuestUser } from "@/utils/guestUser";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageContext";

interface Image {
  url: string;
  alt: string;
  credit?: string;
}

interface Destination {
  city: string;
  tagline: string;
  tagline_en?: string;
  station: string;
  departure: "paris" | "nice";
  activities: string[];
  activities_en?: string[];
  travel_time: string;
  travel_time_minutes: number;
  typical_price: string;
  typical_price_euros: number;
  vibe: string;
  vibe_en?: string;
  image?: string;
  images?: Image[];
}

interface UserArchetype {
  id: string;
  name_fr: string;
  name_en: string;
  icon: string;
}

interface DestinationArchetypeMapping {
  destination_city: string;
  relevance_score: number;
}

export default function Home() {
  const { t, lang } = useLanguage();
  const [maxTravelTime, setMaxTravelTime] = useState(120);
  const [maxBudget, setMaxBudget] = useState(30);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [departureCity, setDepartureCity] = useState<"paris" | "nice">("paris");
  const [recentDestinations, setRecentDestinations] = useState<string[]>([]);

  const [userArchetype, setUserArchetype] = useState<UserArchetype | null>(null);
  const [useArchetypeFilter, setUseArchetypeFilter] = useState(true);
  const [archetypeMappings, setArchetypeMappings] = useState<DestinationArchetypeMapping[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [subResponse, prefResponse] = await Promise.all([
          fetch("/api/subscription/status"),
          fetch("/api/user/preferences")
        ]);

        if (subResponse.ok) {
          const subData = await subResponse.json();
          setIsPremium(subData.isPremium === true);
        }

        if (prefResponse.ok) {
          const data = await prefResponse.json();
          if (data.preferences?.archetype) {
            setUserArchetype({
              id: data.preferences.archetype.id,
              name_fr: data.preferences.archetype.name_fr,
              name_en: data.preferences.archetype.name_en,
              icon: data.preferences.archetype.icon,
            });

            const supabase = createClient();
            const { data: mappings } = await supabase
              .from("destination_archetypes")
              .select("destination_city, relevance_score")
              .eq("archetype_id", data.preferences.archetype.id);

            if (mappings) {
              setArchetypeMappings(mappings);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsUserDataLoaded(true);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleReset = () => {
      setDestination(null);
      setIsSpinning(false);
    };

    window.addEventListener('reset-home-state', handleReset);
    return () => window.removeEventListener('reset-home-state', handleReset);
  }, []);

  const spin = useCallback(async () => {
    setIsSpinning(true);

    let filtered = (destinations as Destination[]).filter(
      (d) =>
        d.departure === departureCity &&
        d.travel_time_minutes <= maxTravelTime &&
        d.typical_price_euros <= maxBudget
    );

    if (isPremium && useArchetypeFilter && userArchetype && archetypeMappings.length > 0) {
      const archetypeCities = new Set(archetypeMappings.map((m) => m.destination_city));
      const archetypeFiltered = filtered.filter((d) => archetypeCities.has(d.city));

      if (archetypeFiltered.length > 0) {
        filtered = archetypeFiltered;
      }
    }

    const availableWithoutRecent = filtered.filter(
      (d) => !recentDestinations.includes(d.city)
    );

    if (availableWithoutRecent.length >= 4) {
      filtered = availableWithoutRecent;
    }

    const random = filtered[Math.floor(Math.random() * filtered.length)];

    if (random.images && random.images.length > 0) {
      random.images.forEach((img) => {
        if (img.url && img.url !== "YOUR_IMAGE_URL_HERE") {
          const preloadImg = new window.Image();
          preloadImg.src = img.url;
        }
      });
    } else if (random.image && random.image !== "YOUR_IMAGE_URL_HERE") {
      const preloadImg = new window.Image();
      preloadImg.src = random.image;
    }

    setTimeout(async () => {
      setDestination(random);

      setRecentDestinations((prev) => {
        const updated = [random.city, ...prev];
        return updated.slice(0, 3);
      });

      setIsSpinning(false);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const guestUser = getLocalGuestUser();

        const response = await fetch("/api/roll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
        console.error("Error saving spin:", error);
      }
    }, 2000);
  }, [departureCity, maxTravelTime, maxBudget, recentDestinations, useArchetypeFilter, userArchetype, archetypeMappings, isPremium]);

  const filteredDestinations = (() => {
    let filtered = (destinations as Destination[]).filter(
      (d) =>
        d.departure === departureCity &&
        d.travel_time_minutes <= maxTravelTime &&
        d.typical_price_euros <= maxBudget
    );

    if (isPremium && useArchetypeFilter && userArchetype && archetypeMappings.length > 0) {
      const archetypeCities = new Set(archetypeMappings.map((m) => m.destination_city));
      const archetypeFiltered = filtered.filter((d) => archetypeCities.has(d.city));
      if (archetypeFiltered.length > 0) {
        filtered = archetypeFiltered;
      }
    }

    return filtered;
  })();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === "r" &&
        !isSpinning &&
        !destination &&
        filteredDestinations.length > 0 &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        spin();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isSpinning, destination, filteredDestinations.length, spin]);

  if (!isUserDataLoaded) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8">
      {!destination ? (
        <div className="bg-white neo-border neo-shadow p-8 max-w-2xl w-full relative">
          <HelpDialog />

          <a
            href="https://forms.gle/2aYJDkfBSweDCVzD8"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -top-3 -right-3 bg-[#4ECDC4] text-black neo-feedback-button border-2 px-4 py-2 font-bold text-sm uppercase hover:bg-[#45B7D1] transition z-10"
          >
            {t('common.feedback')}
          </a>
          <h1 className="text-5xl md:text-6xl font-bold mb-2 text-center uppercase">
            {t('home.title')}
          </h1>
          <p className="text-center text-xl mb-6 font-bold">
            {t('home.tagline')}
          </p>

          {!isSpinning && (
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setDepartureCity("paris")}
                className={`px-8 py-4 font-bold text-lg uppercase transition-all duration-200 rounded-md ${
                  departureCity === "paris"
                    ? "bg-[#52688E] text-white neo-border"
                    : "bg-white text-black neo-border shadow-[2px_2px_0px_#000000] opacity-60 hover:opacity-80"
                }`}
              >
                {t('home.paris')}
              </button>

              <button
                onClick={() => setDepartureCity("nice")}
                className={`px-8 py-4 font-bold text-lg uppercase transition-all duration-200 rounded-md ${
                  departureCity === "nice"
                    ? "bg-[#52688E] text-white neo-border"
                    : "bg-white text-black neo-border shadow-[2px_2px_0px_#000000] opacity-60 hover:opacity-80"
                }`}
              >
                {t('home.nice')}
              </button>
            </div>
          )}
          {isSpinning ? (
            <RouletteWheel isSpinning={isSpinning} />
          ) : (
            <>
              {userArchetype && (
                <div className="mb-6">
                  {isPremium ? (
                    <>
                      <button
                        onClick={() => setUseArchetypeFilter(!useArchetypeFilter)}
                        className={`w-full p-4 neo-border rounded-md font-bold text-sm transition-all duration-200 flex items-center justify-between ${
                          useArchetypeFilter
                            ? "bg-[#9B59B6] text-white"
                            : "bg-white text-gray-600"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {userArchetype.icon} {t('home.myProfile')} {lang === 'en' ? userArchetype.name_en : userArchetype.name_fr}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            useArchetypeFilter
                              ? "bg-white text-[#9B59B6]"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {useArchetypeFilter ? t('home.enabled') : t('home.disabled')}
                        </span>
                      </button>
                      {!useArchetypeFilter && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          {t('home.allDestinations')}
                        </p>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/subscription"
                      className="w-full p-4 neo-border rounded-md font-bold text-sm bg-white text-gray-700 flex items-center justify-between hover:bg-gray-50 transition-all duration-200"
                    >
                      <span className="flex items-center gap-2">
                        {userArchetype.icon} {t('home.myProfile')} {lang === 'en' ? userArchetype.name_en : userArchetype.name_fr}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFD700] text-black">
                        {t('home.enableFilter')}
                      </span>
                    </Link>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-lg font-bold mb-3 uppercase">
                    {t('home.travelTimeLabel')}
                  </label>
                  <TravelTimeCombobox
                    value={maxTravelTime}
                    onChange={setMaxTravelTime}
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold mb-3 uppercase">
                    {t('home.budgetLabel')}
                  </label>
                  <BudgetCombobox value={maxBudget} onChange={setMaxBudget} />
                </div>
              </div>

              <div className="bg-[#74D3AE] neo-card p-4 mb-8">
                <p className="text-center font-bold text-lg">
                  {filteredDestinations.length} {t('home.destinationsAvailable')}
                  {isPremium && useArchetypeFilter && userArchetype && archetypeMappings.length > 0 && (
                    <span className="block text-sm font-normal mt-1">
                      {t('home.filteredFor')} {userArchetype.icon} {lang === 'en' ? userArchetype.name_en : userArchetype.name_fr}
                    </span>
                  )}
                </p>
              </div>

              <button
                onClick={spin}
                disabled={isSpinning || filteredDestinations.length === 0}
                className="w-full bg-[#FF4747] text-white neo-button px-8 py-6 text-2xl md:text-3xl font-bold uppercase disabled:opacity-50"
              >
                {isSpinning ? t('home.spinning') : t('home.spin')}
              </button>

              {isUserDataLoaded && !userArchetype && (
                <div className="mt-6 text-center">
                  <Link
                    href="/quiz"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-black font-bold transition"
                  >
                    <span>{t('home.discoverProfile')}</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white neo-border neo-shadow p-8 max-w-2xl w-full animate-[shake_0.5s_ease-in-out] relative">
          <a
            href="https://forms.gle/2aYJDkfBSweDCVzD8"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -top-3 -right-3 bg-[#4ECDC4] text-black neo-feedback-button border-2 px-4 py-2 font-bold text-sm uppercase hover:bg-[#45B7D1] transition z-10"
          >
            {t('common.feedback')}
          </a>
          <div className="bg-[#FF6B6B] p-6 mb-6 -mt-8 -mx-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-yellow-400 opacity-0 animate-[winning-flash_0.5s_ease-in-out_3]"></div>
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase text-center relative z-10">
              🎉 {destination.city} 🎉
            </h1>
          </div>

          {destination.images && destination.images.length > 0 ? (
            <ImageCarousel
              images={destination.images}
              travelTime={destination.travel_time}
              price={destination.typical_price}
              tagline={lang === 'en' && destination.tagline_en ? destination.tagline_en : destination.tagline}
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
              <h3 className="font-bold text-xl mb-4 uppercase">
                {t('home.resultTodo')}
              </h3>
              <ul className="space-y-3">
                {(lang === 'en' && destination.activities_en ? destination.activities_en : destination.activities).map((activity, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-xl mr-3">→</span>
                    <span className="font-bold text-base leading-relaxed">
                      {activity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xs text-gray-500 text-center italic">
              {t('home.priceDisclaimer')}
            </p>

            <div className="flex gap-3">
              <a
                href={`https://www.sncf-connect.com/home/search?userInput=${encodeURIComponent(
                  destination.city
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#4ECDC4] text-black neo-button py-4 font-bold text-base text-center uppercase inline-block"
              >
                {t('home.bookSNCF')}
              </a>

              <BookingHelpPopover />
            </div>

            <button
              onClick={() => setDestination(null)}
              className="w-full bg-[#FF6B6B] text-white neo-button py-6 font-bold text-xl uppercase mt-2"
            >
              {t('home.respin')}
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
