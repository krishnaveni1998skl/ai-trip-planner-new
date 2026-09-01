function About() {
  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#183B32]">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#123D35] pt-28">
        <div className="absolute inset-0">
          <div
            className="h-full w-full bg-cover bg-center opacity-25"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=2200&q=85')",
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#123D35]/60 to-[#123D35]" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#E5C873]">
            ✦ About Us ✦
          </p>

          <h1 className="mx-auto mt-6 max-w-4xl font-serif text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
            Travel with a
            <span className="block italic text-[#E5C873]">Purpose.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Your journey should be more than just a destination. It should be an
            experience worth remembering.
          </p>
        </div>
      </section>

      {/* =====================================================
          ABOUT CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image */}

          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=85"
                alt="Travel experience"
                className="h-[500px] w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>

            {/* Floating card */}

            <div className="absolute -bottom-6 right-5 rounded-2xl bg-[#E5C873] px-6 py-5 shadow-xl sm:right-8">
              <p className="font-serif text-3xl font-bold text-[#183B32]">
                18+
              </p>

              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#183B32]/60">
                Ways to Travel
              </p>
            </div>
          </div>

          {/* Content */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
              Way to Paradise Travels
            </p>

            <h2 className="mt-5 font-serif text-4xl leading-tight text-[#183B32] sm:text-5xl">
              Your Journey to
              <span className="italic"> Paradise Begins Here.</span>
            </h2>

            <p className="mt-7 text-sm leading-8 text-[#183B32]/60">
              WAY TO PARADISE TRAVELS is an AI-powered travel planning platform
              designed to make trip planning simple, personal and enjoyable.
            </p>

            <p className="mt-5 text-sm leading-8 text-[#183B32]/60">
              Instead of spending hours searching through different websites,
              travelers can tell us what they want and receive a journey
              designed around their destination, dates, interests and budget.
            </p>

            <p className="mt-5 text-sm leading-8 text-[#183B32]/60">
              From discovering destinations to choosing the right type of tour,
              our goal is to help every traveler find their own way to paradise.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY CHOOSE US
      ===================================================== */}

      <section className="bg-[#EDE6D5] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
              Why choose us
            </p>

            <h2 className="mt-4 font-serif text-4xl text-[#183B32] sm:text-5xl">
              We make travel planning feel effortless.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              number="01"
              icon="✦"
              title="AI Powered"
              text="Get personalized travel suggestions based on your preferences and requirements."
            />

            <FeatureCard
              number="02"
              icon="◎"
              title="Personalized"
              text="Your journey is planned around your destination, dates, interests and budget."
            />

            <FeatureCard
              number="03"
              icon="₹"
              title="Budget Friendly"
              text="Plan your experience while keeping your estimated travel expenses in mind."
            />

            <FeatureCard
              number="04"
              icon="♡"
              title="Travel Your Way"
              text="Choose from different travel styles and discover experiences that match you."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            Simple planning
          </p>

          <h2 className="mt-4 font-serif text-4xl text-[#183B32] sm:text-5xl">
            From dream to destination
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#183B32]/55">
            Planning your next adventure takes only a few simple steps.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-4">
          <ProcessStep
            number="01"
            title="Share Your Dream"
            text="Tell us where you want to go and what kind of experience you want."
          />

          <ProcessStep
            number="02"
            title="AI Creates Your Plan"
            text="Our travel planner organizes a personalized journey around your needs."
          />

          <ProcessStep
            number="03"
            title="Review Your Trip"
            text="Explore your destinations, activities, stays and estimated budget."
          />

          <ProcessStep
            number="04"
            title="Start Your Journey"
            text="Save your plan and get ready to discover your paradise."
          />
        </div>
      </section>

      {/* =====================================================
          MISSION
      ===================================================== */}

      <section className="bg-[#123D35] px-5 py-24 text-white sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-3xl text-[#E5C873]">✦</span>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-[#E5C873]">
            Our vision
          </p>

          <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">
            Making every journey
            <span className="block italic text-[#E5C873]">meaningful.</span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-white/55">
            We believe travel should be easier to plan, more personal to
            experience and more memorable to live.
          </p>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="bg-[#F7F3E8] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-[#EDE6D5] px-6 py-16 text-center sm:px-12">
          <span className="text-3xl text-[#C9A45C]">
            <img
              src="/way-to-paradise-logo.jpg"
              alt="Way To Paradise"
              className="mx-auto h-16 w-16 object-contain"
            />
          </span>

          <h2 className="mt-5 font-serif text-4xl text-[#183B32] sm:text-5xl">
            Ready to find your paradise?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#183B32]/55">
            Tell us your dream destination and let us help create a journey made
            just for you.
          </p>

          <a
            href="/plan"
            className="mt-8 inline-block rounded-full bg-[#183B32] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#E5C873] transition duration-300 hover:bg-[#28594D]"
          >
            Plan My Journey →
          </a>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

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

/* =====================================================
   FEATURE CARD
===================================================== */

function FeatureCard({ number, icon, title, text }) {
  return (
    <div className="group rounded-2xl bg-white p-7 transition duration-500 hover:-translate-y-2 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0E8D5] text-lg text-[#B4883D] transition duration-500 group-hover:scale-110">
          {icon}
        </div>

        <span className="text-xs font-bold text-[#183B32]/20">{number}</span>
      </div>

      <h3 className="mt-7 font-serif text-2xl text-[#183B32]">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-[#183B32]/50">{text}</p>
    </div>
  );
}

/* =====================================================
   PROCESS STEP
===================================================== */

function ProcessStep({ number, title, text }) {
  return (
    <div className="relative">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#183B32] font-serif text-lg text-[#E5C873]">
        {number}
      </div>

      <h3 className="mt-6 font-serif text-2xl text-[#183B32]">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-[#183B32]/50">{text}</p>
    </div>
  );
}

export default About;
