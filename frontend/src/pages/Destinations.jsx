import { useNavigate } from "react-router-dom";

const destinations = [
  {
    name: "Dubai",
    country: "United Arab Emirates",
    description:
      "Experience futuristic skylines, desert adventures, luxury stays and unforgettable city experiences.",
    image:
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Maldives",
    country: "Indian Ocean",
    description:
      "Escape to turquoise waters, peaceful beaches, island resorts and unforgettable sunsets.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Paris",
    country: "France",
    description:
      "Discover timeless architecture, romantic streets, iconic landmarks and French culture.",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Switzerland",
    country: "Europe",
    description:
      "Explore breathtaking mountains, beautiful lakes, charming villages and scenic train journeys.",
    image:
      "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Bali",
    country: "Indonesia",
    description:
      "Discover tropical beaches, peaceful temples, lush landscapes and vibrant island culture.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Japan",
    country: "Asia",
    description:
      "Experience ancient traditions, modern cities, beautiful seasons and extraordinary cuisine.",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Kerala",
    country: "India",
    description:
      "Relax among peaceful backwaters, tropical landscapes, beaches and rich local culture.",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Rajasthan",
    country: "India",
    description:
      "Explore royal palaces, colourful markets, historic forts and the beauty of the desert.",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=85",
  },
];

function Destinations() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#183B32]">
      {/* HERO */}

      <section className="relative overflow-hidden bg-[#123D35] pt-28">
        <div className="absolute inset-0">
          <div
            className="h-full w-full bg-cover bg-center opacity-25"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2200&q=85')",
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#123D35]/60 to-[#123D35]" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#E5C873]">
            ✦ Explore the World ✦
          </p>

          <h1 className="mx-auto mt-6 max-w-4xl font-serif text-5xl leading-[1] text-white sm:text-6xl lg:text-7xl">
            Discover Your
            <span className="block italic text-[#E5C873]">Paradise</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            From tropical islands to historic cities, discover destinations that
            match the way you love to travel.
          </p>
        </div>
      </section>

      {/* DESTINATIONS */}

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
              Find your next escape
            </p>

            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
              Where will your journey
              <span className="italic"> take you?</span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-[#183B32]/55">
            Choose a destination and let our AI travel planner help you create a
            personalized journey around your dates, interests and budget.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination, index) => (
            <article
              key={destination.name}
              className={`group relative overflow-hidden rounded-2xl bg-[#183B32] ${
                index === 0 || index === 3 ? "sm:translate-y-6" : ""
              }`}
            >
              <div className="relative h-[390px] overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="h-full w-full object-cover transition duration-1000 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                {/* NUMBER */}

                <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 text-xs font-bold text-white backdrop-blur-sm">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* CONTENT */}

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#E5C873]">
                    {destination.country}
                  </p>

                  <h3 className="mt-2 font-serif text-3xl">
                    {destination.name}
                  </h3>

                  <p className="mt-3 max-h-0 overflow-hidden text-xs leading-6 text-white/70 opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
                    {destination.description}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/plan", {
                        state: {
                          message: `I want to plan a trip to ${destination.name}.`,
                          destination: destination.name,
                        },
                      })
                    }
                    className="mt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-[#E5C873] underline underline-offset-4 transition hover:text-white"
                  >
                    Explore Destination →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* AI CTA */}

      <section className="bg-[#EDE6D5] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <img
            src="/way-to-paradise-logo.jpg"
            alt="Way To Paradise"
            className="mx-auto h-16 w-16 object-contain"
          />

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            Let AI plan your journey
          </p>

          <h2 className="mt-5 font-serif text-4xl sm:text-6xl">
            Your destination.
          </h2>

          <h3 className="mt-2 font-serif text-3xl italic text-[#B4883D] sm:text-5xl">
            Your perfect journey.
          </h3>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#183B32]/55">
            Tell us where you want to go and what you love. We'll help turn your
            travel idea into a personalized plan.
          </p>

          <button
            type="button"
            onClick={() => navigate("/plan")}
            className="mt-8 rounded-full bg-[#183B32] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#E5C873] transition duration-300 hover:bg-[#28594D]"
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

export default Destinations;
