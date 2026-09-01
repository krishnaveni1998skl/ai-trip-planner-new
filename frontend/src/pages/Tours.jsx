import { useNavigate } from "react-router-dom";

const tours = [
  {
    number: 1,
    title: "Sightseeing Tour",
    category: "Explore",
    description: "Discover famous landmarks and iconic places.",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 2,
    title: "Adventure Tour",
    category: "Adventure",
    description: "Experience exciting activities and thrilling destinations.",
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 3,
    title: "Beach Tour",
    category: "Relax",
    description: "Relax beside beautiful beaches and crystal-clear waters.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 4,
    title: "Cultural Tour",
    category: "Culture",
    description: "Discover local traditions, history and cultural experiences.",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 5,
    title: "Food Tour",
    category: "Cuisine",
    description: "Taste local dishes and discover unforgettable flavours.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 6,
    title: "Nature Tour",
    category: "Nature",
    description: "Explore mountains, forests, lakes and natural beauty.",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 7,
    title: "Luxury Tour",
    category: "Luxury",
    description: "Enjoy premium stays, experiences and unforgettable moments.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 8,
    title: "Family Tour",
    category: "Family",
    description: "Create memorable experiences for the whole family.",
    image:
      "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 9,
    title: "Romantic Tour",
    category: "Romance",
    description: "Enjoy beautiful destinations and special moments together.",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 10,
    title: "Wildlife Tour",
    category: "Wildlife",
    description: "Discover wildlife, safaris and incredible natural habitats.",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 11,
    title: "Desert Tour",
    category: "Adventure",
    description: "Explore deserts, dunes, traditional culture and sunsets.",
    image:
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 12,
    title: "Island Tour",
    category: "Island",
    description: "Escape to peaceful islands and tropical surroundings.",
    image:
      "https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 13,
    title: "Mountain Tour",
    category: "Nature",
    description: "Enjoy spectacular mountain views and scenic landscapes.",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 14,
    title: "City Break",
    category: "City",
    description: "Experience vibrant cities, shopping, food and nightlife.",
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 15,
    title: "Photography Tour",
    category: "Creative",
    description: "Capture beautiful landscapes, landmarks and local life.",
    image:
      "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 16,
    title: "Spiritual Tour",
    category: "Spiritual",
    description: "Visit peaceful temples, sacred places and cultural sites.",
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 17,
    title: "Road Trip",
    category: "Road Trip",
    description: "Enjoy scenic roads, hidden places and flexible travel.",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: 18,
    title: "Wellness Tour",
    category: "Wellness",
    description: "Relax, recharge and focus on your wellbeing.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
  },
];

function Tours() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#183B32]">
      {/* HERO */}

      <section className="relative overflow-hidden bg-[#123D35] pt-28">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2200&q=85"
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#123D35]/50 to-[#123D35]" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#E5C873]">
            ✦ Explore Your Way ✦
          </p>

          <h1 className="mx-auto mt-6 max-w-4xl font-serif text-5xl leading-none text-white sm:text-6xl lg:text-7xl">
            Choose Your
            <span className="block italic text-[#E5C873]">Way</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            From relaxing beach escapes to thrilling adventures, find a journey
            that matches the way you love to travel.
          </p>
        </div>
      </section>

      {/* INTRO */}

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
          18 ways to travel
        </p>

        <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            Travel your way.
            <span className="italic"> Make it memorable.</span>
          </h2>

          <p className="max-w-md text-sm leading-7 text-[#183B32]/55">
            Choose any tour style and explore experiences designed around
            different travel interests.
          </p>
        </div>

        {/* TOUR GRID */}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <article
              key={tour.number}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative h-[300px] overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <div className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 text-xs font-bold text-white backdrop-blur-sm">
                  {String(tour.number).padStart(2, "0")}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#E5C873]">
                    {tour.category}
                  </p>

                  <h3 className="mt-2 font-serif text-3xl">{tour.title}</h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm leading-7 text-[#183B32]/55">
                  {tour.description}
                </p>

                <button
                  type="button"
                  onClick={() => navigate(`/tours/${tour.number}`)}
                  className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-[#B4883D] underline underline-offset-4"
                >
                  Explore Tour →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}

      <section className="bg-[#EDE6D5] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <img
            src="/way-to-paradise-logo.jpg"
            alt="Way To Paradise"
            className="mx-auto h-16 w-16 object-contain"
          />

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            Your journey, your way
          </p>

          <h2 className="mt-5 font-serif text-4xl sm:text-6xl">
            Can't decide?
          </h2>

          <h3 className="mt-2 font-serif text-3xl italic text-[#B4883D] sm:text-5xl">
            Let AI plan it for you.
          </h3>

          <button
            type="button"
            onClick={() => navigate("/plan")}
            className="mt-8 rounded-full bg-[#183B32] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#E5C873] transition hover:bg-[#28594D]"
          >
            Plan My Journey →
          </button>
        </div>
      </section>

      {/* FOOTER */}

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

export default Tours;
