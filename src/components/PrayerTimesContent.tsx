"use client";

import type { Locale } from "@/i18n/config";
import { useEffect, useState } from "react";

interface PrayerTimesContentProps {
  locale: Locale;
  dictionary: any;
}

interface PrayerTime {
  name: string;
  adhan: string;
  iqama: string;
  icon: string;
  gradient: string;
}

export default function PrayerTimesContent({
  locale,
  dictionary,
}: PrayerTimesContentProps) {
  const [currentDate, setCurrentDate] = useState("");
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = locale === "ar";

  useEffect(() => {
    const now = new Date();
    const dateString = now.toLocaleDateString(
      locale === "de" ? "de-DE" : locale === "fr" ? "fr-FR" : "ar-SA",
      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    );
    setCurrentDate(dateString);

    // Fetch prayer times from Aladhan API
    const fetchPrayerTimes = async () => {
      try {
        // Coordinates for Lörrach, Germany
        const latitude = 47.6156;
        const longitude = 7.6615;
        const method = 3; // Islamic Society of North America (can be changed to 2 for Islamic World League)

        // Get current date in DD-MM-YYYY format
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        const dateString = `${day}-${month}-${year}`;

        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=${method}`
        );

        const data = await response.json();
        console.log("API Response:", data); // Debug log

        if (data.code === 200 && data.data) {
          const timings = data.data.timings;

          // Map API response to our prayer times structure
          const fetchedPrayerTimes: PrayerTime[] = [
            {
              name: dictionary.prayers.fajr,
              adhan: timings.Fajr,
              iqama: calculateIqama(timings.Fajr, 30), // 30 min after Fajr
              icon: "🌅",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              name: dictionary.prayers.sunrise,
              adhan: timings.Sunrise,
              iqama: "-",
              icon: "☀️",
              gradient: "from-amber-400 to-orange-500",
            },
            {
              name: dictionary.prayers.dhuhr,
              adhan: timings.Dhuhr,
              iqama: calculateIqama(timings.Dhuhr, 15), // 15 min after Dhuhr
              icon: "🌤️",
              gradient: "from-yellow-400 to-amber-500",
            },
            {
              name: dictionary.prayers.asr,
              adhan: timings.Asr,
              iqama: calculateIqama(timings.Asr, 30), // 30 min after Asr
              icon: "🌆",
              gradient: "from-orange-400 to-red-500",
            },
            {
              name: dictionary.prayers.maghrib,
              adhan: timings.Maghrib,
              iqama: calculateIqama(timings.Maghrib, 5), // 5 min after Maghrib
              icon: "🌇",
              gradient: "from-purple-500 to-pink-500",
            },
            {
              name: dictionary.prayers.isha,
              adhan: timings.Isha,
              iqama: calculateIqama(timings.Isha, 15), // 15 min after Isha
              icon: "🌙",
              gradient: "from-indigo-600 to-purple-600",
            },
          ];

          setPrayerTimes(fetchedPrayerTimes);
        }
      } catch (error) {
        console.error("Error fetching prayer times:", error);
        // No fallback - just set empty array
        setPrayerTimes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [locale, dictionary]);

  // Helper function to calculate Iqama time
  const calculateIqama = (adhanTime: string, minutesAfter: number): string => {
    const [hours, minutes] = adhanTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + minutesAfter;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-purple mb-2">
          {dictionary.prayers.title}
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          {dictionary.prayers.currentDate}: {currentDate}
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-green border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading prayer times...</p>
        </div>
      ) : prayerTimes.length > 0 ? (
        <>
          {/* Prayer Times List */}
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {prayerTimes.map((prayer, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-4 ${
                  index !== prayerTimes.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <span className="text-lg">{prayer.icon}</span>
                  <span className="font-medium text-gray-800">
                    {prayer.name}
                  </span>
                </div>
                <div className="text-sm font-semibold text-primary-green">
                  {prayer.adhan}
                </div>
              </div>
            ))}
          </div>

          {/* Jumaa Section */}
          <div className="max-w-md mx-auto bg-linear-to-r from-primary-green to-primary-green/90 rounded-lg shadow-md p-6 text-white text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🕌</span>
              <div>
                <h3 className="text-xl font-bold">
                  {dictionary.prayers.jumaa}
                </h3>
                <p className="text-white/90 text-sm">
                  {dictionary.prayers.jumaaTime}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Error State */
        <div className="text-center py-8">
          <p className="text-gray-600">
            Unable to load prayer times. Please try again later.
          </p>
        </div>
      )}
    </div>
  );
}
