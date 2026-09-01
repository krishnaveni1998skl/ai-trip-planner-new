import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

/*
  ============================================================
  DESTINATION DATA
  Only Dubai and Paris are currently supported.
  ============================================================
*/

const destinationData = {
  dubai: {
    weather: {
      temperature: "32°C",
      condition: "Sunny",
      humidity: "58%",
      wind: "18 km/h",
      icon: "☀️",
      description:
        "Warm and sunny conditions are expected. Carry sunglasses, sunscreen and comfortable clothing.",
    },

    places: [
      {
        name: "Burj Khalifa",
        type: "Landmark",
        icon: "🏙️",
        description:
          "Visit the world's famous skyscraper and enjoy panoramic views of Dubai.",
      },
      {
        name: "Dubai Mall",
        type: "Shopping & Entertainment",
        icon: "🛍️",
        description:
          "Explore one of the world's largest shopping and entertainment destinations.",
      },
      {
        name: "Palm Jumeirah",
        type: "Island",
        icon: "🌴",
        description:
          "Explore Dubai's iconic artificial island and enjoy beautiful coastal views.",
      },
      {
        name: "Dubai Marina",
        type: "Waterfront",
        icon: "🌊",
        description:
          "Enjoy the waterfront, restaurants, skyline views and evening atmosphere.",
      },
    ],

    restaurants: [
      {
        name: "Arabian Garden",
        type: "Arabic Cuisine",
        rating: "4.5",
        icon: "🍛",
        location: "Downtown Dubai",
      },
      {
        name: "Dubai Spice House",
        type: "Indian Cuisine",
        rating: "4.4",
        icon: "🍲",
        location: "Bur Dubai",
      },
      {
        name: "Marina Café",
        type: "International",
        rating: "4.3",
        icon: "☕",
        location: "Dubai Marina",
      },
      {
        name: "Palm View Restaurant",
        type: "Fine Dining",
        rating: "4.6",
        icon: "🍽️",
        location: "Palm Jumeirah",
      },
    ],
  },

  paris: {
    weather: {
      temperature: "18°C",
      condition: "Partly Cloudy",
      humidity: "65%",
      wind: "14 km/h",
      icon: "🌤️",
      description:
        "Mild weather with partly cloudy conditions. Carry a light jacket and comfortable walking shoes.",
    },

    places: [
      {
        name: "Eiffel Tower",
        type: "Landmark",
        icon: "🗼",
        description:
          "Explore Paris's most iconic landmark and enjoy spectacular city views.",
      },
      {
        name: "Louvre Museum",
        type: "Museum",
        icon: "🏛️",
        description:
          "Discover world-famous art collections and historic masterpieces.",
      },
      {
        name: "Notre-Dame Cathedral",
        type: "Historic Place",
        icon: "⛪",
        description:
          "Visit one of Paris's most famous historic Gothic landmarks.",
      },
      {
        name: "Luxembourg Gardens",
        type: "Nature & Leisure",
        icon: "🌳",
        description:
          "Relax and walk through one of Paris's beautiful historic gardens.",
      },
    ],

    restaurants: [
      {
        name: "Paris Bistro",
        type: "French Cuisine",
        rating: "4.5",
        icon: "🥐",
        location: "Central Paris",
      },
      {
        name: "Le Garden Café",
        type: "French Café",
        rating: "4.4",
        icon: "☕",
        location: "Latin Quarter",
      },
      {
        name: "Paris Taste",
        type: "International",
        rating: "4.3",
        icon: "🍽️",
        location: "Champs-Élysées",
      },
      {
        name: "Seine View Restaurant",
        type: "Fine Dining",
        rating: "4.6",
        icon: "🥂",
        location: "River Seine",
      },
    ],
  },
};

/*
  ============================================================
  MAIN COMPONENT
  ============================================================
*/

function PlanResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const tripRequest = location.state?.tripRequest || {};
  const travelPlan = location.state?.travelPlan || "";

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ============================================================
  // TRIP DETAILS
  // ============================================================

  const destination = tripRequest.destination || "Your Destination";

  const startDate = tripRequest.start_date || "";

  const endDate = tripRequest.end_date || "";

  const travelers = tripRequest.travelers || "Not specified";

  const budget = tripRequest.budget || 0;

  const currency = tripRequest.currency || "INR";

  const travelStyle = tripRequest.travel_style || "Adventure";

  const interests = Array.isArray(tripRequest.interests)
    ? tripRequest.interests
    : [];

  // ============================================================
  // DESTINATION KEY
  // ============================================================

  const destinationKey = destination.toLowerCase().includes("paris")
    ? "paris"
    : "dubai";

  const destinationInfo = destinationData[destinationKey];

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Not specified";
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ============================================================
  // GET ACTUAL TRIP DATE
  // ============================================================

  const getTripDate = (dayNumber) => {
    if (!startDate) {
      return "";
    }

    const date = new Date(`${startDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    date.setDate(date.getDate() + Number(dayNumber) - 1);

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // ============================================================
  // MAP URLS
  // ============================================================

  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    destination,
  )}&output=embed`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    destination,
  )}`;

  const placesMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    destination + " tourist attractions",
  )}`;

  const restaurantsMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    destination + " restaurants",
  )}`;

  const tripAdvisorUrl = `https://www.tripadvisor.com/Search?q=${encodeURIComponent(
    destination,
  )}`;

  const tourismSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    destination + " official tourism",
  )}`;

  // ============================================================
  // BUDGET
  // ============================================================

  const formattedBudget = Number(budget).toLocaleString("en-IN");

  // ============================================================
  // SAVE TRIP
  // ============================================================

  const handleSaveTrip = async () => {
    if (!tripRequest.destination) {
      setSaveError("Trip information is missing.");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      const response = await fetch(`${API_URL}/api/my-trips`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          destination: tripRequest.destination,

          start_date: tripRequest.start_date,

          end_date: tripRequest.end_date,

          travelers: Number(tripRequest.travelers),

          budget: Number(tripRequest.budget),

          currency: tripRequest.currency || "INR",

          travel_style: tripRequest.travel_style || "Adventure",

          interests: tripRequest.interests || [],

          travel_plan:
            typeof travelPlan === "string"
              ? travelPlan
              : JSON.stringify(travelPlan),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Unable to save trip.");
      }

      setSaved(true);
    } catch (error) {
      console.error("Save trip error:", error);

      setSaveError(error.message || "Unable to save trip. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DOWNLOAD TRAVEL PDF
  // ============================================================

  const handleDownloadPDF = () => {
    const info = destinationInfo;

    const placesText = info.places
      .map(
        (place, index) =>
          `${index + 1}. ${place.name}\n   ${place.type}\n   ${place.description}`,
      )
      .join("\n\n");

    const restaurantsText = info.restaurants
      .map(
        (restaurant, index) =>
          `${index + 1}. ${restaurant.name}\n   ${restaurant.type}\n   ${restaurant.location}\n   Rating: ${restaurant.rating}`,
      )
      .join("\n\n");

    const pdfWindow = window.open("", "_blank");

    if (!pdfWindow) {
      alert("Please allow pop-ups to generate the travel PDF.");
      return;
    }

    pdfWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${destination} Travel Planning Guide</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #183B32;
            line-height: 1.6;
          }

          h1 {
            color: #123D35;
            font-size: 30px;
          }

          h2 {
            color: #123D35;
            margin-top: 30px;
          }

          .gold {
            color: #B4883D;
            font-weight: bold;
          }

          .box {
            background: #F7F3E8;
            padding: 18px;
            margin-top: 15px;
            border-radius: 8px;
          }

          .footer {
            margin-top: 40px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
            font-size: 12px;
            color: #777;
          }

          @media print {
            body {
              padding: 20px;
            }

            .print-button {
              display: none;
            }
          }
        </style>
      </head>

      <body>

        <h1>WAY TO PARADISE</h1>

        <p class="gold">
          ${destination} Travel Planning Guide
        </p>

        <div class="box">
          <strong>Destination:</strong> ${destination}<br/>
          <strong>Travel Dates:</strong> ${formatDate(startDate)} → ${formatDate(
            endDate,
          )}<br/>
          <strong>Travelers:</strong> ${travelers}<br/>
          <strong>Budget:</strong> ${currency} ${formattedBudget}<br/>
          <strong>Travel Style:</strong> ${travelStyle}
        </div>

        <h2>Weather</h2>

        <div class="box">
          ${info.weather.icon}
          ${info.weather.temperature} —
          ${info.weather.condition}<br/>
          Humidity: ${info.weather.humidity}<br/>
          Wind: ${info.weather.wind}<br/><br/>
          ${info.weather.description}
        </div>

        <h2>Places to Explore</h2>

        <div class="box">
          ${placesText.replace(/\n/g, "<br/>")}
        </div>

        <h2>Recommended Restaurants</h2>

        <div class="box">
          ${restaurantsText.replace(/\n/g, "<br/>")}
        </div>

        <h2>Travel Plan</h2>

        <div class="box">
          ${
            typeof travelPlan === "string"
              ? travelPlan.replace(/\n/g, "<br/>")
              : JSON.stringify(travelPlan, null, 2)
          }
        </div>

        <h2>Travel Sources</h2>

        <div class="box">
          Google Maps<br/>
          TripAdvisor<br/>
          Official Tourism Information
        </div>

        <div class="footer">
          WAY TO PARADISE<br/>
          TRAVELS • EXPLORE • REMEMBER
        </div>

        <br/>

        <button
          class="print-button"
          onclick="window.print()"
          style="
            padding: 12px 20px;
            background: #123D35;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          "
        >
          Save / Print PDF
        </button>

      </body>
      </html>
    `);

    pdfWindow.document.close();
  };

  // ============================================================
  // RENDER AI PLAN
  // ============================================================

  const renderTravelPlan = () => {
    if (!travelPlan) {
      return (
        <p className="text-sm leading-8 text-[#183B32]/65">
          Your personalized travel plan will appear here.
        </p>
      );
    }

    if (typeof travelPlan === "object") {
      return (
        <pre className="whitespace-pre-wrap text-sm leading-8 text-[#183B32]/70">
          {JSON.stringify(travelPlan, null, 2)}
        </pre>
      );
    }

    const planText = String(travelPlan);

    const lines = planText.split("\n");

    return (
      <div className="space-y-4">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();

          if (!trimmedLine) {
            return <div key={index} className="h-2" />;
          }

          const dayMatch = trimmedLine.match(/^DAY\s*(\d+)\s*[-:–—]?\s*(.*)$/i);

          if (dayMatch) {
            const dayNumber = Number(dayMatch[1]);

            const dayTitle = dayMatch[2] ? dayMatch[2].trim() : "";

            const tripDate = getTripDate(dayNumber);

            return (
              <div
                key={index}
                className="mt-7 border-b border-[#183B32]/10 pb-5 first:mt-0"
              >
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B4883D]">
                  DAY {dayNumber}
                </p>

                {tripDate && (
                  <h3 className="mt-2 font-serif text-2xl text-[#183B32] sm:text-3xl">
                    {tripDate}
                  </h3>
                )}

                {dayTitle && (
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#183B32]/65">
                    {dayTitle}
                  </p>
                )}
              </div>
            );
          }

          return (
            <p key={index} className="text-sm leading-8 text-[#183B32]/70">
              {trimmedLine}
            </p>
          );
        })}
      </div>
    );
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#183B32]">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="bg-[#123D35] px-5 pb-16 pt-16 text-white sm:px-8 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E5C873]">
            ✦ AI Travel Planner
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-tight sm:text-6xl lg:text-7xl">
            Your Journey to
            <span className="block italic text-[#E5C873]">{destination}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Your personalized travel plan has been created based on your
            destination, dates, budget and interests.
          </p>
        </div>
      </section>

      {/* ======================================================
          TRIP SUMMARY
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard label="Destination" value={destination} />

          <InfoCard
            label="Travel Dates"
            value={`${formatDate(startDate)} → ${formatDate(endDate)}`}
          />

          <InfoCard label="Travelers" value={travelers} />

          <InfoCard
            label="Total Budget"
            value={`${currency} ${formattedBudget}`}
          />

          <InfoCard label="Travel Style" value={travelStyle} />

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B4883D]">
              Interests
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {interests.length > 0 ? (
                interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-[#F7F3E8] px-4 py-2 text-xs font-medium text-[#183B32]"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#183B32]/50">
                  No interests selected
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          AI TRAVEL PLAN
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            ✦ AI Generated
          </p>

          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
            Your Travel Plan
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#183B32]/50">
            A personalized journey created for your trip.
          </p>

          <div className="mt-8 rounded-2xl bg-[#FCFBF7] p-6 sm:p-8">
            {renderTravelPlan()}
          </div>
        </div>
      </section>

      {/* ======================================================
          WEATHER
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            🌤️ Destination Weather
          </p>

          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
            Weather in {destination}
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <WeatherCard
              icon={destinationInfo.weather.icon}
              label="Temperature"
              value={destinationInfo.weather.temperature}
            />

            <WeatherCard
              icon="🌈"
              label="Condition"
              value={destinationInfo.weather.condition}
            />

            <WeatherCard
              icon="💧"
              label="Humidity"
              value={destinationInfo.weather.humidity}
            />

            <WeatherCard
              icon="💨"
              label="Wind"
              value={destinationInfo.weather.wind}
            />
          </div>

          <div className="mt-6 rounded-2xl bg-[#FCFBF7] p-6">
            <p className="text-sm leading-7 text-[#183B32]/65">
              {destinationInfo.weather.description}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          MAP
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            📍 Explore Location
          </p>

          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
            Explore {destination}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#183B32]/50">
            Explore the destination and find nearby attractions, restaurants and
            important places.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-[#183B32]/10">
            <iframe
              title={`${destination} Google Map`}
              src={mapUrl}
              className="h-[300px] w-full border-0 sm:h-[400px] lg:h-[500px]"
              loading="lazy"
              allowFullScreen
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-[#123D35] px-6 py-4 text-center text-sm font-bold text-white transition hover:bg-[#28594D]"
            >
              📍 Open Google Maps →
            </a>

            <a
              href={placesMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[#183B32]/20 px-6 py-4 text-center text-sm font-bold transition hover:bg-[#F7F3E8]"
            >
              Explore Nearby Places →
            </a>
          </div>
        </div>
      </section>

      {/* ======================================================
          PLACES / ATTRACTIONS
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            📌 Places to Explore
          </p>

          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
            {destination} Attractions
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {destinationInfo.places.map((place) => (
              <div
                key={place.name}
                className="rounded-2xl border border-[#183B32]/10 bg-[#FCFBF7] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EDE6D5] text-2xl">
                    {place.icon}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B4883D]">
                      {place.type}
                    </p>

                    <h3 className="mt-2 font-serif text-2xl">{place.name}</h3>

                    <p className="mt-2 text-sm leading-6 text-[#183B32]/55">
                      {place.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          RESTAURANTS
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            🍽️ Food & Dining
          </p>

          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
            Restaurants in {destination}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#183B32]/50">
            Explore recommended dining options. No booking or payment is
            required.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destinationInfo.restaurants.map((restaurant) => (
              <div
                key={restaurant.name}
                className="rounded-2xl border border-[#183B32]/10 bg-[#FCFBF7] p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-3xl">{restaurant.icon}</div>

                <h3 className="mt-4 font-serif text-xl font-bold">
                  {restaurant.name}
                </h3>

                <p className="mt-2 text-xs text-[#B4883D]">{restaurant.type}</p>

                <p className="mt-2 text-sm text-[#183B32]/50">
                  📍 {restaurant.location}
                </p>

                <p className="mt-4 text-sm font-bold">⭐ {restaurant.rating}</p>
              </div>
            ))}
          </div>

          <a
            href={restaurantsMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#123D35] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#28594D] sm:w-auto"
          >
            🍽️ Find More Restaurants →
          </a>
        </div>
      </section>

      {/* ======================================================
          TRAVEL SOURCES
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            📚 Travel Sources
          </p>

          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
            Useful Travel Sources
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#183B32]/50">
            Use these resources to explore more information about {destination}.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <SourceCard
              icon="📍"
              title="Google Maps"
              description="Explore attractions, restaurants and locations."
              url={googleMapsUrl}
            />

            <SourceCard
              icon="⭐"
              title="TripAdvisor"
              description="Explore traveler information and destination reviews."
              url={tripAdvisorUrl}
            />

            <SourceCard
              icon="🌍"
              title={`${destination} Tourism`}
              description="Search official tourism information and travel guidance."
              url={tourismSearchUrl}
            />

            <SourceCard
              icon="🍽️"
              title="Restaurants & Places"
              description={`Explore restaurants and places around ${destination}.`}
              url={restaurantsMapsUrl}
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          TRAVEL PDF
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="overflow-hidden rounded-3xl bg-[#123D35] p-7 text-white shadow-lg sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E5C873]">
                📄 Travel Planning Guide
              </p>

              <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
                {destination} Travel Guide
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
                Generate a destination-specific travel planning document
                containing your trip details, weather, places, restaurants,
                sources and AI travel plan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="rounded-full bg-[#E5C873] px-7 py-4 text-sm font-bold text-[#183B32] transition hover:bg-[#D4AA55]"
            >
              📄 Generate {destination} PDF →
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================
          SAVE / ACTION
      ====================================================== */}

      <section className="bg-[#EDE6D5] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            Ready for your adventure?
          </p>

          <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
            Your journey starts here.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#183B32]/55">
            Save your journey and revisit it whenever you want.
          </p>

          {saveError && (
            <div className="mx-auto mt-6 max-w-xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {saveError}
            </div>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSaveTrip}
              disabled={saving || saved}
              className="rounded-xl bg-[#123D35] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#28594D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving Trip..."
                : saved
                  ? "✓ Trip Saved"
                  : "SAVE TRIP →"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/my-trips")}
              className="rounded-xl border border-[#183B32]/20 px-7 py-4 text-sm font-bold transition hover:bg-white"
            >
              VIEW MY TRIPS
            </button>

            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="rounded-xl bg-[#E5C873] px-7 py-4 text-sm font-bold text-[#183B32] transition hover:bg-[#D4AA55]"
            >
              PLAN ANOTHER TRIP →
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-[#102F29] px-5 py-10 text-center text-white">
        <p className="font-serif text-xl font-bold tracking-wide">
          WAY TO PARADISE
        </p>

        <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white/40">
          TRAVELS • EXPLORE • REMEMBER
        </p>

        <p className="mt-4 text-xs text-white/30">
          Your Journey to Paradise Begins Here.
        </p>
      </footer>
    </main>
  );
}

/*
  ============================================================
  INFO CARD
  ============================================================
*/

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B4883D]">
        {label}
      </p>

      <p className="mt-3 text-base font-semibold text-[#183B32] sm:text-lg">
        {value}
      </p>
    </div>
  );
}

/*
  ============================================================
  WEATHER CARD
  ============================================================
*/

function WeatherCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[#FCFBF7] p-6 text-center">
      <div className="text-3xl">{icon}</div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B4883D]">
        {label}
      </p>

      <p className="mt-2 font-serif text-2xl font-bold text-[#183B32]">
        {value}
      </p>
    </div>
  );
}

/*
  ============================================================
  SOURCE CARD
  ============================================================
*/

function SourceCard({ icon, title, description, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group rounded-2xl border border-[#183B32]/10 bg-[#FCFBF7] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EDE6D5] text-xl">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-[#183B32]">{title}</h3>

          <p className="mt-2 text-sm leading-6 text-[#183B32]/50">
            {description}
          </p>

          <p className="mt-3 text-xs font-bold text-[#B4883D]">Explore →</p>
        </div>
      </div>
    </a>
  );
}

export default PlanResult;
