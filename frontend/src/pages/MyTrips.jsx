import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyTrips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");

  // ==========================================
  // LOAD SAVED TRIPS
  // ==========================================

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      const response = await fetch("http://127.0.0.1:8001/api/trips");

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.detail || "Failed to load trips");
      }

      setTrips(data.trips || []);
    } catch (error) {
      console.error("Unable to load trips:", error);
      setTrips([]);
    }
  }

  // ==========================================
  // TRIP STATUS
  // ==========================================

  function getTripStatus(trip) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) {
      return "completed";
    }

    if (startDate <= today && endDate >= today) {
      return "remaining";
    }

    return "upcoming";
  }

  // ==========================================
  // FILTER TRIPS
  // ==========================================

  const upcomingTrips = trips.filter(
    (trip) => getTripStatus(trip) === "upcoming",
  );

  const remainingTrips = trips.filter(
    (trip) => getTripStatus(trip) === "remaining",
  );

  const completedTrips = trips.filter(
    (trip) => getTripStatus(trip) === "completed",
  );

  // ==========================================
  // OPEN SAVED TRIP
  // ==========================================

  function openTrip(trip) {
    try {
      const selectedTrip = {
        ...trip,
        openSection: "Itinerary",
      };

      localStorage.setItem("selectedTrip", JSON.stringify(selectedTrip));

      navigate("/plan");
    } catch (error) {
      console.error("Unable to open trip:", error);
    }
  }

  // ==========================================
  // DELETE TRIP
  // ==========================================

  function deleteTrip(id) {
    const updatedTrips = trips.filter((trip) => trip.id !== id);

    localStorage.setItem("myTrips", JSON.stringify(updatedTrips));

    setTrips(updatedTrips);
  }

  // ==========================================
  // GET DESTINATION IMAGE
  // ==========================================

  function getTripImage(trip) {
    if (trip.image) return trip.image;
    if (trip.image_url) return trip.image_url;
    if (trip.destination_image) return trip.destination_image;

    const destination = (trip.destination || "").toLowerCase();

    if (destination.includes("maldives")) {
      return "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=85";
    }

    if (destination.includes("dubai")) {
      return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85";
    }

    if (destination.includes("singapore")) {
      return "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=85";
    }

    if (destination.includes("bali")) {
      return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85";
    }

    if (destination.includes("thailand")) {
      return "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=85";
    }

    if (
      destination.includes("paris") ||
      destination.includes("france") ||
      destination.includes("europe")
    ) {
      return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85";
    }

    return "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85";
  }

  // ==========================================
  // TRIP CARD
  // ==========================================

  function TripCard({ trip }) {
    const status = getTripStatus(trip);

    const tripImage = getTripImage(trip);

    const statusText =
      status === "completed"
        ? "Completed"
        : status === "remaining"
          ? "Ongoing"
          : "Upcoming";

    return (
      <article className="group overflow-hidden rounded-3xl border border-[#D8B98A]/40 bg-[#FBF7EF] shadow-[0_12px_35px_rgba(74,44,26,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(74,44,26,0.16)]">
        {/* ==========================================
            TRIP IMAGE
        ========================================== */}

        <div className="relative h-52 overflow-hidden">
          <img
            src={tripImage}
            alt={trip.destination || "Trip destination"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src =
                "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80";
            }}
          />

          {/* IMAGE OVERLAY */}

          <div className="absolute inset-0 bg-gradient-to-t from-[#2F1A0E]/80 via-transparent to-transparent" />

          {/* STATUS */}

          <span
            className={`absolute left-4 top-4 rounded-full px-4 py-1.5 text-xs font-bold shadow-md backdrop-blur-sm ${
              status === "completed"
                ? "bg-white/90 text-[#6B6259]"
                : status === "remaining"
                  ? "bg-[#E7C76B] text-[#4A2713]"
                  : "bg-[#FFF8ED]/95 text-[#7A4018]"
            }`}
          >
            {statusText}
          </span>

          {/* DESTINATION ON IMAGE */}

          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="font-serif text-2xl font-bold text-white sm:text-3xl">
              {trip.destination || "Unknown Destination"}
            </h3>
          </div>
        </div>

        {/* ==========================================
            CARD CONTENT
        ========================================== */}

        <div className="p-5 sm:p-6">
          {/* TRIP TITLE */}

          <div className="mb-5">
            <h4 className="font-serif text-xl font-bold text-[#4A2713]">
              {trip.destination ? `${trip.destination} Getaway` : "My Journey"}
            </h4>

            <p className="mt-1 text-xs text-[#8A7058]">
              Your personalized travel journey
            </p>
          </div>

          {/* DETAILS */}

          <div className="grid grid-cols-1 gap-3 text-sm">
            {/* DATE */}

            <div className="flex items-center gap-3 rounded-xl bg-[#F6EFE3] px-3 py-2.5">
              <span className="text-lg text-[#8A4A1B]">◫</span>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A816A]">
                  Travel Dates
                </p>

                <p className="mt-0.5 font-medium text-[#4A3425]">
                  {trip.start_date || "N/A"} → {trip.end_date || "N/A"}
                </p>
              </div>
            </div>

            {/* TRAVELERS */}

            <div className="flex items-center gap-3 rounded-xl bg-[#F6EFE3] px-3 py-2.5">
              <span className="text-lg text-[#8A4A1B]">●●</span>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A816A]">
                  Travelers
                </p>

                <p className="mt-0.5 font-medium text-[#4A3425]">
                  {trip.travelers || 1} Travelers
                </p>
              </div>
            </div>

            {/* BUDGET */}

            <div className="flex items-center gap-3 rounded-xl bg-[#F6EFE3] px-3 py-2.5">
              <span className="text-lg font-bold text-[#8A4A1B]">₹</span>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A816A]">
                  Budget
                </p>

                <p className="mt-0.5 font-medium text-[#4A3425]">
                  ₹{Number(trip.budget || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* TRAVEL STYLE */}

            {trip.travel_style && (
              <div className="flex items-center gap-3 rounded-xl bg-[#F6EFE3] px-3 py-2.5">
                <span className="text-lg text-[#8A4A1B]">✦</span>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A816A]">
                    Travel Style
                  </p>

                  <p className="mt-0.5 font-medium text-[#4A3425]">
                    {trip.travel_style}
                  </p>
                </div>
              </div>
            )}

            {/* DEPARTURE */}

            {trip.departure_city && (
              <div className="flex items-center gap-3 rounded-xl bg-[#F6EFE3] px-3 py-2.5">
                <span className="text-lg text-[#8A4A1B]">✈</span>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A816A]">
                    Departure
                  </p>

                  <p className="mt-0.5 font-medium text-[#4A3425]">
                    From {trip.departure_city}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* INTERESTS */}

          {Array.isArray(trip.interests) && trip.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {trip.interests.slice(0, 4).map((interest, index) => (
                <span
                  key={`${interest}-${index}`}
                  className="rounded-full border border-[#D8B98A]/50 bg-[#FFF8ED] px-3 py-1 text-xs text-[#7A5A3A]"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* ==========================================
              ACTIONS
          ========================================== */}

          <div className="mt-6 flex items-center gap-3">
            {/* VIEW */}

            <button
              type="button"
              onClick={() => openTrip(trip)}
              className="flex-1 rounded-xl bg-[#6B3A13] px-4 py-3 text-sm font-bold text-white shadow-md transition duration-300 hover:bg-[#7D4619] hover:shadow-lg"
            >
              View Trip
              <span className="ml-2 text-[#E7C76B]">→</span>
            </button>

            {/* DELETE */}

            <button
              type="button"
              onClick={() => deleteTrip(trip.id)}
              title="Delete trip"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D8B98A] bg-[#FFF8ED] text-[#8A4A1B] transition duration-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      </article>
    );
  }

  // ==========================================
  // CURRENT TAB
  // ==========================================

  const currentTrips =
    activeTab === "upcoming"
      ? upcomingTrips
      : activeTab === "remaining"
        ? remainingTrips
        : completedTrips;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-[#F6EFE3]">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="border-b border-[#D8B98A]/40 bg-[#FBF7EF] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A66A35]">
              <span>✦</span>
              Your Journeys
            </div>

            <h1 className="mt-2 font-serif text-4xl font-bold text-[#4A2713] sm:text-5xl">
              My Trips
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#7A5A3A]">
              Manage your upcoming, ongoing and completed journeys all in one
              place.
            </p>
          </div>

          {/* PLAN NEW TRIP */}

          <button
            type="button"
            onClick={() => navigate("/plan")}
            className="rounded-full bg-[#6B3A13] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#7D4619] hover:shadow-xl"
          >
            <span className="mr-2 text-[#E7C76B]">+</span>
            Plan a New Trip
          </button>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              TABS
          ================================================= */}

          <div className="flex flex-wrap gap-2">
            {/* UPCOMING */}

            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition duration-300 ${
                activeTab === "upcoming"
                  ? "bg-[#6B3A13] text-white shadow-md"
                  : "bg-[#FBF7EF] text-[#6B4226] hover:bg-[#E8D8C0]"
              }`}
            >
              Upcoming
              <span className="ml-2 opacity-70">({upcomingTrips.length})</span>
            </button>

            {/* REMAINING */}

            <button
              type="button"
              onClick={() => setActiveTab("remaining")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition duration-300 ${
                activeTab === "remaining"
                  ? "bg-[#6B3A13] text-white shadow-md"
                  : "bg-[#FBF7EF] text-[#6B4226] hover:bg-[#E8D8C0]"
              }`}
            >
              Remaining
              <span className="ml-2 opacity-70">({remainingTrips.length})</span>
            </button>

            {/* COMPLETED */}

            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition duration-300 ${
                activeTab === "completed"
                  ? "bg-[#6B3A13] text-white shadow-md"
                  : "bg-[#FBF7EF] text-[#6B4226] hover:bg-[#E8D8C0]"
              }`}
            >
              Completed
              <span className="ml-2 opacity-70">({completedTrips.length})</span>
            </button>
          </div>

          {/* =================================================
              TRIP LIST
          ================================================= */}

          <div className="mt-7">
            {currentTrips.length === 0 ? (
              /* ==========================================
                 NO TRIPS
              ========================================== */

              <div className="rounded-3xl border border-[#D8B98A]/40 bg-[#FBF7EF] px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8D8C0] text-4xl text-[#7A4018]">
                  ✈
                </div>

                <h2 className="mt-5 font-serif text-2xl font-bold text-[#4A2713]">
                  No trips found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7A5A3A]">
                  Your {activeTab} trips will appear here. Start planning your
                  next unforgettable journey.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/plan")}
                  className="mt-6 rounded-full bg-[#6B3A13] px-7 py-3 font-bold text-white shadow-md transition hover:bg-[#7D4619]"
                >
                  Plan a Trip
                  <span className="ml-2 text-[#E7C76B]">→</span>
                </button>
              </div>
            ) : (
              /* ==========================================
                 TRIPS
              ========================================== */

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {currentTrips.map((trip, index) => (
                  <TripCard
                    key={trip.id || `${trip.destination}-${index}`}
                    trip={trip}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          QUOTE
      ===================================================== */}

      <section className="px-5 pb-12 pt-4 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-[#D8B98A]/40 bg-[#E8D8C0]/50 px-6 py-8 text-center">
            <span className="font-serif text-4xl text-[#A66A35]">“</span>

            <p className="font-serif text-xl italic text-[#4A2713] sm:text-2xl">
              Travel far enough, you meet yourself.
            </p>

            <p className="mt-2 text-xs text-[#7A5A3A]">— David Mitchell</p>
          </div>
        </div>
      </section>
    </div>
  );
}
