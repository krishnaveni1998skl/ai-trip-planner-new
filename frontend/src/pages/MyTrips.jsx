import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000";

// ============================================================
// MY TRIPS
// ============================================================

function MyTrips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedTrip, setSelectedTrip] = useState(null);

  // ==========================================================
  // LOAD TRIPS
  // ==========================================================

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/my-trips`);

      if (!response.ok) {
        throw new Error("Failed to load trips");
      }

      const data = await response.json();

      setTrips(Array.isArray(data) ? data : data.trips || []);
    } catch (error) {
      console.error("My Trips Error:", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // CALCULATE TRIP STATUS
  // ==========================================================

  const getTripStatus = (trip) => {
    if (!trip.start_date || !trip.end_date) {
      return "Upcoming";
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Future trip
    if (today < startDate) {
      return "Upcoming";
    }

    // Current trip
    if (today >= startDate && today <= endDate) {
      return "Ongoing";
    }

    // Past trip
    return "Completed";
  };

  // ==========================================================
  // DELETE TRIP
  // ==========================================================

  const deleteTrip = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trip?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/my-trips/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete trip");
      }

      setTrips((previous) => previous.filter((trip) => trip.id !== id));

      setSelectedTrip(null);
    } catch (error) {
      console.error("Delete Trip Error:", error);

      alert("Unable to delete trip.");
    }
  };

  // ==========================================================
  // FILTER TRIPS
  // ==========================================================

  const filteredTrips =
    filter === "All"
      ? trips
      : trips.filter(
          (trip) => getTripStatus(trip).toLowerCase() === filter.toLowerCase(),
        );

  // ==========================================================
  // STATUS COUNTS
  // ==========================================================

  const upcomingCount = trips.filter(
    (trip) => getTripStatus(trip) === "Upcoming",
  ).length;

  const ongoingCount = trips.filter(
    (trip) => getTripStatus(trip) === "Ongoing",
  ).length;

  const completedCount = trips.filter(
    (trip) => getTripStatus(trip) === "Completed",
  ).length;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#183B32]">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="bg-[#123D35] px-5 pb-16 pt-28 text-white sm:px-8 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E5C873]">
            Your Journeys
          </p>

          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl lg:text-7xl">
            My Trips
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            Keep all your planned journeys together and revisit your travel
            plans whenever you need them.
          </p>
        </div>
      </section>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        {/* ==================================================
            STATUS SUMMARY
        ================================================== */}

        {!loading && trips.length > 0 && (
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {/* ALL */}

            <StatusSummary
              label="All Trips"
              count={trips.length}
              active={filter === "All"}
              onClick={() => setFilter("All")}
            />

            {/* UPCOMING */}

            <StatusSummary
              label="Upcoming"
              count={upcomingCount}
              active={filter === "Upcoming"}
              onClick={() => setFilter("Upcoming")}
            />

            {/* ONGOING */}

            <StatusSummary
              label="Ongoing"
              count={ongoingCount}
              active={filter === "Ongoing"}
              onClick={() => setFilter("Ongoing")}
            />

            {/* COMPLETED */}

            <StatusSummary
              label="Completed"
              count={completedCount}
              active={filter === "Completed"}
              onClick={() => setFilter("Completed")}
            />
          </div>
        )}

        {/* ==================================================
            FILTER BUTTONS
        ================================================== */}

        <div className="mb-10 flex flex-wrap items-center gap-3">
          {["All", "Upcoming", "Ongoing", "Completed"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`
                rounded-full px-5 py-3
                text-xs font-bold
                transition duration-300
                sm:px-6 sm:text-sm
                ${
                  filter === item
                    ? "bg-[#123D35] text-[#E5C873] shadow-md"
                    : "bg-white text-[#183B32] hover:bg-[#EDE6D5]"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#D1AA58] border-t-transparent" />

            <p className="mt-5 text-sm text-[#183B32]/50">
              Loading your trips...
            </p>
          </div>
        )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!loading && filteredTrips.length === 0 && (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm sm:py-20">
            <div className="text-5xl">✈️</div>

            <h2 className="mt-5 font-serif text-3xl sm:text-4xl">
              No trips found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#183B32]/50">
              {filter === "All"
                ? "Your saved journeys will appear here once you create a travel plan."
                : `You don't have any ${filter.toLowerCase()} trips yet.`}
            </p>

            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="mt-7 rounded-full bg-[#123D35] px-8 py-4 text-xs font-bold tracking-[0.15em] text-white transition hover:bg-[#28594D]"
            >
              PLAN A TRIP →
            </button>
          </div>
        )}

        {/* ==================================================
            TRIPS
        ================================================== */}

        {!loading && filteredTrips.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip, index) => (
              <TripCard
                key={trip.id || index}
                trip={trip}
                status={getTripStatus(trip)}
                onView={() => setSelectedTrip(trip)}
                onDelete={() => deleteTrip(trip.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ======================================================
          CREATE NEW TRIP
      ====================================================== */}

      <section className="bg-[#EDE6D5] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <img
            src="/way-to-paradise-logo.jpg"
            alt="Way To Paradise"
            className="mx-auto h-16 w-16 rounded-full object-contain"
          />

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            Your next adventure
          </p>

          <h2 className="mt-4 font-serif text-3xl sm:text-5xl">
            Where will you go next?
          </h2>

          <button
            type="button"
            onClick={() => navigate("/plan")}
            className="mt-8 rounded-full bg-[#123D35] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#E5C873] transition hover:bg-[#28594D]"
          >
            Plan A New Trip →
          </button>
        </div>
      </section>

      {/* ======================================================
          MODAL
      ====================================================== */}

      {selectedTrip && (
        <TripModal
          trip={selectedTrip}
          status={getTripStatus(selectedTrip)}
          onClose={() => setSelectedTrip(null)}
          onDelete={() => deleteTrip(selectedTrip.id)}
        />
      )}

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-[#102F29] px-5 py-10 text-center text-white">
        <p className="font-serif text-xl font-bold tracking-wide">
          WAY TO PARADISE
        </p>

        <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-white/40">
          TRAVELS • EXPLORE • REMEMBER
        </p>

        <p className="mt-4 text-xs text-white/30">
          Your Journey to Paradise Begins Here.
        </p>
      </footer>
    </main>
  );
}

// ============================================================
// STATUS SUMMARY COMPONENT
// ============================================================

function StatusSummary({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-2xl p-5 text-left
        transition duration-300
        ${
          active
            ? "bg-[#123D35] text-white shadow-lg"
            : "bg-white text-[#183B32] shadow-sm hover:-translate-y-1 hover:shadow-md"
        }
      `}
    >
      <p
        className={`
          text-[9px] font-bold uppercase tracking-[0.2em]
          ${active ? "text-[#E5C873]" : "text-[#B4883D]"}
        `}
      >
        {label}
      </p>

      <p className="mt-2 font-serif text-3xl">{count}</p>
    </button>
  );
}

// ============================================================
// TRIP CARD
// ============================================================

function TripCard({ trip, status, onView, onDelete }) {
  const destination =
    trip.destination || trip.place || trip.location || "My Trip";

  const image =
    trip.image ||
    trip.image_url ||
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=85";

  const interests = Array.isArray(trip.interests) ? trip.interests : [];

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl">
      {/* ==================================================
          IMAGE / HEADER
      ================================================== */}

      <div className="relative h-56 overflow-hidden sm:h-60">
        <img
          src={image}
          alt={destination}
          className="h-full w-full object-cover transition duration-700 hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* STATUS */}

        <StatusBadge status={status} />

        {/* DESTINATION */}

        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#E5C873]">
            Travel Destination
          </p>

          <h2 className="mt-2 font-serif text-3xl text-white">{destination}</h2>
        </div>
      </div>

      {/* ==================================================
          CARD CONTENT
      ================================================== */}

      <div className="p-6">
        {/* DATES */}

        {trip.start_date && trip.end_date && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B4883D]">
              Travel Dates
            </p>

            <p className="mt-2 text-sm font-medium text-[#183B32]">
              {trip.start_date} → {trip.end_date}
            </p>
          </div>
        )}

        {/* TRAVELERS */}

        {trip.travelers && (
          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B4883D]">
              Travelers
            </p>

            <p className="mt-2 text-sm font-medium text-[#183B32]">
              {trip.travelers}
            </p>
          </div>
        )}

        {/* BUDGET */}

        {trip.budget && (
          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B4883D]">
              Budget
            </p>

            <p className="mt-2 text-sm font-medium text-[#183B32]">
              {trip.currency || "INR"}{" "}
              {Number(trip.budget).toLocaleString("en-IN")}
            </p>
          </div>
        )}

        {/* TRAVEL STYLE */}

        {trip.travel_style && (
          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B4883D]">
              Travel Style
            </p>

            <p className="mt-2 text-sm font-medium text-[#183B32]">
              {trip.travel_style}
            </p>
          </div>
        )}

        {/* INTERESTS */}

        {interests.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B4883D]">
              Interests
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span
                  key={index}
                  className="rounded-full bg-[#F7F3E8] px-3 py-2 text-xs text-[#183B32]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onView}
            className="flex-1 rounded-xl bg-[#123D35] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#28594D]"
          >
            VIEW TRIP
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-red-200 px-4 py-3 text-xs font-bold text-red-600 transition hover:bg-red-50"
          >
            DELETE
          </button>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const badgeStyle = {
    Upcoming: "bg-[#123D35] text-[#E5C873]",

    Ongoing: "bg-[#E5C873] text-[#123D35]",

    Completed: "bg-white text-[#183B32]",
  };

  return (
    <span
      className={`
        absolute left-5 top-5
        rounded-full px-4 py-2
        text-[9px] font-bold uppercase tracking-[0.15em]
        shadow-sm
        ${badgeStyle[status] || badgeStyle.Upcoming}
      `}
    >
      {status}
    </span>
  );
}

// ============================================================
// TRIP MODAL
// ============================================================

function TripModal({ trip, status, onClose, onDelete }) {
  const destination =
    trip.destination || trip.place || trip.location || "My Trip";

  const interests = Array.isArray(trip.interests) ? trip.interests : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-5">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-[#F7F3E8]">
        {/* ==================================================
            MODAL HEADER
        ================================================== */}

        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#123D35] px-5 py-5 text-white sm:px-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#E5C873]">
              {status}
            </p>

            <h2 className="mt-1 font-serif text-2xl sm:text-3xl">
              {destination}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-3xl text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        {/* ==================================================
            DETAILS
        ================================================== */}

        <div className="p-5 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Destination" value={destination} />

            <Detail label="Status" value={status} />

            <Detail
              label="Travel Dates"
              value={
                trip.start_date && trip.end_date
                  ? `${trip.start_date} → ${trip.end_date}`
                  : "Not specified"
              }
            />

            <Detail
              label="Travelers"
              value={trip.travelers || "Not specified"}
            />

            <Detail
              label="Budget"
              value={
                trip.budget
                  ? `${trip.currency || "INR"} ${Number(
                      trip.budget,
                    ).toLocaleString("en-IN")}`
                  : "Not specified"
              }
            />

            <Detail
              label="Travel Style"
              value={trip.travel_style || "Not specified"}
            />
          </div>

          {/* ==================================================
              INTERESTS
          ================================================== */}

          {interests.length > 0 && (
            <div className="mt-8">
              <h3 className="font-serif text-3xl">Interests</h3>

              <div className="mt-4 flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-white px-4 py-3 text-sm shadow-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================
              TRAVEL PLAN
          ================================================== */}

          {trip.travel_plan && (
            <div className="mt-8">
              <h3 className="font-serif text-3xl">Travel Plan</h3>

              <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
                <p className="whitespace-pre-line text-sm leading-8 text-[#183B32]/70">
                  {typeof trip.travel_plan === "string"
                    ? trip.travel_plan
                    : JSON.stringify(trip.travel_plan, null, 2)}
                </p>
              </div>
            </div>
          )}

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#183B32]/20 px-6 py-4 text-sm font-bold transition hover:bg-white"
            >
              CLOSE
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="flex-1 rounded-xl bg-red-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-red-700"
            >
              DELETE TRIP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DETAIL COMPONENT
// ============================================================

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B4883D]">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold text-[#183B32]">{value}</p>
    </div>
  );
}

export default MyTrips;
