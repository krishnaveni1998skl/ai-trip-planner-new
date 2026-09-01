import { useNavigate, useParams } from "react-router-dom";

const tourData = {
  1: {
    title: "Sightseeing Tour",
    category: "City Explorer",
    destination: "Paris",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=85",
    description:
      "Explore famous landmarks, iconic attractions and beautiful city views.",
    highlights: [
      "Famous landmarks",
      "Iconic attractions",
      "Local sightseeing",
      "Photography spots",
    ],
  },

  2: {
    title: "Adventure Tour",
    category: "Adventure",
    destination: "Dubai",
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=85",
    description:
      "Discover exciting activities and unforgettable outdoor experiences.",
    highlights: [
      "Outdoor activities",
      "Adventure experiences",
      "Nature exploration",
      "Exciting destinations",
    ],
  },

  3: {
    title: "Beach Tour",
    category: "Relaxation",
    destination: "Maldives",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85",
    description:
      "Relax on beautiful beaches and enjoy peaceful tropical experiences.",
    highlights: [
      "Beautiful beaches",
      "Island experiences",
      "Sunset views",
      "Relaxation",
    ],
  },

  4: {
    title: "Cultural Tour",
    category: "Culture",
    destination: "India",
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85",
    description:
      "Experience local traditions, history, food and authentic culture.",
    highlights: [
      "Historic places",
      "Local traditions",
      "Authentic food",
      "Cultural experiences",
    ],
  },

  5: {
    title: "Luxury Tour",
    category: "Luxury",
    destination: "Dubai",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=85",
    description:
      "Enjoy premium hotels, fine dining and unforgettable luxury experiences.",
    highlights: [
      "Luxury hotels",
      "Fine dining",
      "Premium experiences",
      "Private activities",
    ],
  },

  6: {
    title: "Nature Tour",
    category: "Nature",
    destination: "Switzerland",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=85",
    description:
      "Discover mountains, forests, lakes and breathtaking natural landscapes.",
    highlights: [
      "Mountain views",
      "Beautiful lakes",
      "Nature walks",
      "Scenic landscapes",
    ],
  },
};

function TourDetails() {
  const { number } = useParams();
  const navigate = useNavigate();

  const tour = tourData[number] || tourData[1];

  // ============================================================
  // PLAN THIS TOUR
  // ============================================================

  const handlePlanTrip = () => {
    navigate("/plan", {
      state: {
        destination: tour.destination,

        travel_style:
          tour.category === "City Explorer" ? "Cultural" : tour.category,

        interests: [tour.category, tour.title],

        message: `I want to include a ${tour.title} in my trip.`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#183B32]">
      {/* ======================================================
          HERO IMAGE
      ======================================================= */}

      <section className="relative h-[550px] overflow-hidden">
        <img
          src={tour.image}
          alt={tour.title}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#123D35] via-transparent to-black/20" />

        <div className="relative mx-auto flex h-full max-w-7xl items-end px-5 pb-16 sm:px-8">
          <div className="text-white">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E5C873]">
              {tour.category}
            </p>

            <h1 className="mt-4 font-serif text-5xl sm:text-6xl lg:text-7xl">
              {tour.title}
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70">
              {tour.description}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENT
      ======================================================= */}

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          {/* ==================================================
              HIGHLIGHTS
          ================================================== */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
              Tour Highlights
            </p>

            <h2 className="mt-4 font-serif text-4xl text-[#183B32] sm:text-5xl">
              Experience it your way.
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {tour.highlights.map((highlight, index) => (
                <div
                  key={highlight}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0E8D5] text-sm font-bold text-[#B4883D]">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <h3 className="mt-5 font-serif text-xl">{highlight}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* ==================================================
              PLAN CARD
          ================================================== */}

          <div className="h-fit rounded-3xl bg-[#123D35] p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E5C873]">
              Create Your Journey
            </p>

            <h2 className="mt-5 font-serif text-3xl">
              Make this tour part of your trip.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/60">
              Add this tour to your AI travel plan and create a personalized
              journey around it.
            </p>

            {/* DESTINATION PREVIEW */}

            <div className="mt-6 rounded-2xl bg-white/10 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E5C873]">
                Destination
              </p>

              <p className="mt-2 font-serif text-2xl">{tour.destination}</p>
            </div>

            {/* PLAN BUTTON */}

            <button
              type="button"
              onClick={handlePlanTrip}
              className="mt-8 w-full rounded-full bg-[#E5C873] px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#183B32] transition hover:bg-[#C9A45C]"
            >
              Add to My Journey →
            </button>

            {/* BACK */}

            <button
              type="button"
              onClick={() => navigate("/tours")}
              className="mt-4 w-full rounded-full border border-white/20 px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-white/70 transition hover:border-[#E5C873] hover:text-[#E5C873]"
            >
              ← Back to Tours
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ======================================================= */}

      <footer className="bg-[#102F29] py-10 text-center text-white">
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

export default TourDetails;
