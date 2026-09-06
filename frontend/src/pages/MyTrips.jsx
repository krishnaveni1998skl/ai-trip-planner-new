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

        // Tell PlanTrip.jsx to open Itinerary
        openSection: "Itinerary",
      };

      localStorage.setItem("selectedTrip", JSON.stringify(selectedTrip));

      // Go to PlanTrip page
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
  // TRIP CARD
  // ==========================================

  function TripCard({ trip }) {
    const status = getTripStatus(trip);

    return (
      <div className="rounded-2xl border border-[#d9c89e] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* =====================================
              TRIP INFORMATION
          ===================================== */}

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-bold text-[#123d32]">
                {trip.destination || "Unknown Destination"}
              </h3>

              {/* STATUS */}

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  status === "completed"
                    ? "bg-gray-100 text-gray-600"
                    : status === "remaining"
                      ? "bg-green-100 text-green-700"
                      : "bg-[#f4ecd8] text-[#8b6a24]"
                }`}
              >
                {status === "completed"
                  ? "Completed"
                  : status === "remaining"
                    ? "Ongoing"
                    : "Upcoming"}
              </span>
            </div>

            {/* DATES */}

            <p className="mt-3 text-gray-600">
              📅 {trip.start_date || "N/A"} → {trip.end_date || "N/A"}
            </p>

            {/* TRAVELERS */}

            <p className="mt-1 text-gray-600">
              👥 {trip.travelers || 1} Travelers
            </p>

            {/* BUDGET */}

            <p className="mt-1 text-gray-600">
              💰 ₹{Number(trip.budget || 0).toLocaleString("en-IN")}
            </p>

            {/* TRAVEL STYLE */}

            {trip.travel_style && (
              <p className="mt-1 text-gray-600">✨ {trip.travel_style}</p>
            )}

            {/* DEPARTURE CITY */}

            {trip.departure_city && (
              <p className="mt-1 text-gray-600">
                ✈️ From {trip.departure_city}
              </p>
            )}

            {/* INTERESTS */}

            {Array.isArray(trip.interests) && trip.interests.length > 0 && (
              <p className="mt-1 text-gray-600">
                ❤️ {trip.interests.join(", ")}
              </p>
            )}
          </div>

          {/* =====================================
              ACTION BUTTONS
          ===================================== */}

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => openTrip(trip)}
              className="rounded-lg bg-[#123d32] px-5 py-2 font-semibold text-white transition hover:bg-[#0d2f27]"
            >
              View Trip
            </button>

            <button
              type="button"
              onClick={() => deleteTrip(trip.id)}
              className="rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
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
    <div className="min-h-screen bg-[#f8f5ec] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <h1 className="text-4xl font-bold text-[#123d32]">My Trips</h1>

        <p className="mt-2 text-gray-600">
          Manage your upcoming, ongoing and completed trips.
        </p>

        {/* =====================================
            TABS
        ===================================== */}

        <div className="mt-8 flex flex-wrap gap-3">
          {/* UPCOMING */}

          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              activeTab === "upcoming"
                ? "bg-[#123d32] text-white"
                : "bg-white text-[#123d32] hover:bg-[#f4ecd8]"
            }`}
          >
            Upcoming ({upcomingTrips.length})
          </button>

          {/* REMAINING */}

          <button
            type="button"
            onClick={() => setActiveTab("remaining")}
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              activeTab === "remaining"
                ? "bg-[#123d32] text-white"
                : "bg-white text-[#123d32] hover:bg-[#f4ecd8]"
            }`}
          >
            Remaining ({remainingTrips.length})
          </button>

          {/* COMPLETED */}

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              activeTab === "completed"
                ? "bg-[#123d32] text-white"
                : "bg-white text-[#123d32] hover:bg-[#f4ecd8]"
            }`}
          >
            Completed ({completedTrips.length})
          </button>
        </div>

        {/* =====================================
            TRIP LIST
        ===================================== */}

        <div className="mt-8 space-y-5">
          {currentTrips.length === 0 ? (
            /* ===================================
               NO TRIPS
            =================================== */

            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <div className="text-5xl">✈️</div>

              <h2 className="mt-4 text-xl font-bold text-[#123d32]">
                No trips found
              </h2>

              <p className="mt-2 text-gray-500">
                Your {activeTab} trips will appear here.
              </p>

              <button
                type="button"
                onClick={() => navigate("/plan")}
                className="mt-5 rounded-lg bg-[#123d32] px-6 py-3 font-semibold text-white transition hover:bg-[#0d2f27]"
              >
                Plan a Trip
              </button>
            </div>
          ) : (
            /* ===================================
               TRIPS
            =================================== */

            currentTrips.map((trip, index) => (
              <TripCard
                key={trip.id || `${trip.destination}-${index}`}
                trip={trip}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
