import { useEffect, useState } from "react";
import TripMap from "../components/TripMap";
import { useLocation, useNavigate } from "react-router-dom";
const NAV_ITEMS = [
  "Overview",
  "Itinerary",
  "Flights",
  "Hotels",
  "Restaurants",
  "Weather",
  "Places",
  "Map",
  "Budget",
];

function PlanTrip() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("Overview");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm Paradise AI. Where would you like to travel?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedTripId, setSavedTripId] = useState(null);

  // ==========================================
  // ITINERARY STATES
  // ==========================================

  const [itinerary, setItinerary] = useState(null);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryError, setItineraryError] = useState("");

  // ==========================================
  // HOTEL STATES
  // ==========================================

  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState("");

  // ==========================================
  // PLACES STATES
  // ==========================================

  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState("");

  // ==========================================
  // FLIGHT STATES
  // ==========================================

  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flightsError, setFlightsError] = useState("");

  // ==========================================
  // RESTAURANT STATES
  // ==========================================

  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [restaurantsError, setRestaurantsError] = useState("");

  // ==========================================
  // WEATHER STATES
  // ==========================================

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  // ==========================================
  // BUDGET STATES
  // ==========================================

  const [expenses, setExpenses] = useState({
    accommodation: 0,
    transportation: 0,
    food: 0,
    activities: 0,
    shopping: 0,
    other: 0,
  });

  const [backendBudget, setBackendBudget] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  // ==========================================
  // TRAVEL PREFERENCE EXPENSE ESTIMATOR
  // ==========================================

  function calculatePreferenceExpenses(interests, duration, travelers) {
    const days = Number(duration) || 1;
    const people = Number(travelers) || 1;

    let food = 0;
    let activities = 0;
    let shopping = 0;

    // FOOD
    if (interests.includes("Food")) {
      food = 1500 * days * people;
    }

    // ADVENTURE
    if (interests.includes("Adventure")) {
      activities += 2500 * days * people;
    }

    // CULTURE
    if (interests.includes("Culture")) {
      activities += 1200 * days * people;
    }

    // BEACH
    if (interests.includes("Beach")) {
      activities += 1000 * days * people;
    }

    // NATURE
    if (interests.includes("Nature")) {
      activities += 1000 * days * people;
    }

    // NIGHTLIFE
    if (interests.includes("Nightlife")) {
      activities += 1800 * days * people;
    }

    // SHOPPING
    if (interests.includes("Shopping")) {
      shopping = 2000 * people;
    }

    return {
      food,
      activities,
      shopping,
    };
  }
  // ==========================================
  // BUDGET EXPENSE FIELDS
  // ==========================================

  const expenseFields = [
    {
      key: "accommodation",
      label: "Accommodation",
      icon: "🏨",
      auto: true,
    },
    {
      key: "transportation",
      label: "Transportation",
      icon: "✈️",
      auto: true,
    },
    {
      key: "food",
      label: "Food",
      icon: "🍽️",
      auto: false,
    },
    {
      key: "activities",
      label: "Activities",
      icon: "🎯",
      auto: false,
    },
    {
      key: "shopping",
      label: "Shopping",
      icon: "🛍️",
      auto: false,
    },
    {
      key: "other",
      label: "Other",
      icon: "📦",
      auto: false,
    },
  ];

  // ==========================================
  // TRIP DATA
  // ==========================================

  const [tripData, setTripData] = useState({
    destination: "",
    duration: "",
    travelers: "",
    budget: "",
    startDate: "",
    endDate: "",
    departureCity: "",
    travelStyle: "",
    interests: [],
  });
  // ==========================================
  // RECEIVE MESSAGE FROM HOME PAGE
  // ==========================================

  useEffect(() => {
    const homeMessage = location.state?.message;

    if (!homeMessage) {
      return;
    }

    

    // Put the message into the existing chat input
    setInput(homeMessage);

    // Clear navigation state after receiving it
    window.history.replaceState({}, document.title, window.location.pathname);
  }, [location.state]);
  // ==========================================
  // LOAD SAVED TRIP FROM MY TRIPS
  // ==========================================

  useEffect(() => {
    const selectedTrip = localStorage.getItem("selectedTrip");

    if (!selectedTrip) {
      return;
    }

    try {
      const trip = JSON.parse(selectedTrip);

      setTripData((previous) => ({
        ...previous,
        destination: trip.destination || "",
        duration: trip.duration_days || "",
        travelers: trip.travelers || 1,
        budget: trip.budget || "",
        startDate: trip.start_date || "",
        endDate: trip.end_date || "",
        departureCity: trip.departure_city || "",
        travelStyle: trip.travel_style || "",
        interests: Array.isArray(trip.interests) ? trip.interests : [],
      }));

      if (trip.itinerary) {
        setItinerary(trip.itinerary);
      }

      if (trip.expenses) {
        setExpenses((previous) => ({
          ...previous,
          ...trip.expenses,
        }));
      }

      setSavedTripId(trip.id || null);

      // The saved trip should open on Overview.
      setActiveSection("Overview");

      // Prevent the same saved trip from being reloaded as a new plan.
      localStorage.removeItem("selectedTrip");
    } catch (error) {
      console.error("Unable to load selected trip:", error);
      localStorage.removeItem("selectedTrip");
    }
  }, []);

  // ==========================================
  // DESTINATIONS
  // ==========================================

  const destinations = [
    "dubai",
    "paris",
    "bali",
    "japan",
    "maldives",
    "kerala",
    "singapore",
    "thailand",
    "london",
    "italy",
    "switzerland",
    "canada",
    "rajasthan",
  ];

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  // ==========================================
  // CHAT-BASED TRIP MODIFICATION
  // ==========================================

  async function modifyTripWithChat(userMessage) {
    if (!itinerary) {
      return false;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8001/api/trips/${savedTripId || 1}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trip_data: tripData,
            current_itinerary: itinerary,
            message: userMessage,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to modify itinerary");
      }

      setItinerary(data.itinerary);

      // Automatically update the saved trip when it already exists.
      if (savedTripId) {
        const existingTrips = JSON.parse(
          localStorage.getItem("myTrips") || "[]",
        );

        const updatedTrips = existingTrips.map((trip) =>
          trip.id === savedTripId
            ? {
                ...trip,
                itinerary: data.itinerary,
                expenses,
              }
            : trip,
        );

        localStorage.setItem("myTrips", JSON.stringify(updatedTrips));
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "✅ I updated your itinerary based on your request.",
        },
      ]);

      return true;
    } catch (error) {
      console.error("Chat modification API error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "Sorry, I could not update the itinerary right now. Please try again.",
        },
      ]);

      return true;
    }
  }

  function handleSend() {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    // ========================================
    // HANDLE SIMPLE TRIP UPDATES FIRST
    // ========================================
    // Even after an itinerary is generated, messages such as
    // "from chennai" must update tripData before going to the
    // itinerary-modification API.

    const lowerText = text.toLowerCase();

    const departureMatch = text.match(
      /(?:from|departure(?:\s+city)?|departing\s+from)\s+(.+?)(?=\s+(?:to|for|with)\s+|,|$)/i,
    );

    let detectedDepartureCity = "";

    if (departureMatch) {
      detectedDepartureCity = departureMatch[1].trim().replace(/\s+/g, " ");
    }

    const styleNames = [
      "adventure",
      "relaxed",
      "luxury",
      "budget",
      "romantic",
      "family",
      "solo",
      "cultural",
    ];

    const detectedStyleName = styleNames.find((style) =>
      lowerText.includes(style),
    );

    const detectedTravelStyle = detectedStyleName
      ? detectedStyleName.charAt(0).toUpperCase() + detectedStyleName.slice(1)
      : "";

    // If an itinerary already exists, update direct trip fields locally.
    if (itinerary && (detectedDepartureCity || detectedTravelStyle)) {
      setMessages((previous) => [
        ...previous,
        {
          role: "user",
          text,
        },
      ]);

      setTripData((previous) => ({
        ...previous,
        ...(detectedDepartureCity
          ? { departureCity: detectedDepartureCity }
          : {}),
        ...(detectedTravelStyle ? { travelStyle: detectedTravelStyle } : {}),
      }));

      setInput("");

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: detectedDepartureCity
            ? `✅ Departure city updated to ${detectedDepartureCity}.`
            : `✅ Travel style updated to ${detectedTravelStyle}.`,
        },
      ]);

      return;
    }

    // If an itinerary already exists and this is not a direct field update,
    // treat the message as an itinerary modification request.
    if (itinerary) {
      setMessages((previous) => [
        ...previous,
        {
          role: "user",
          text,
        },
      ]);

      setInput("");
      setLoading(true);

      modifyTripWithChat(text).finally(() => {
        setLoading(false);
      });

      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text,
      },
    ]);

    setInput("");
    setLoading(true);

    setTimeout(() => {
      const lower = text.toLowerCase();

      // ========================================
      // DETECT TRAVEL PREFERENCES
      // ========================================

      const detectedInterests = [];

      if (lower.includes("adventure") || lower.includes("adventurous")) {
        detectedInterests.push("Adventure");
      }

      if (
        lower.includes("food") ||
        lower.includes("foodie") ||
        lower.includes("cuisine") ||
        lower.includes("restaurant")
      ) {
        detectedInterests.push("Food");
      }

      if (
        lower.includes("culture") ||
        lower.includes("cultural") ||
        lower.includes("history")
      ) {
        detectedInterests.push("Culture");
      }

      if (lower.includes("shopping") || lower.includes("shop")) {
        detectedInterests.push("Shopping");
      }

      if (lower.includes("beach") || lower.includes("beaches")) {
        detectedInterests.push("Beach");
      }

      if (lower.includes("nature") || lower.includes("nature trip")) {
        detectedInterests.push("Nature");
      }

      if (lower.includes("nightlife") || lower.includes("night life")) {
        detectedInterests.push("Nightlife");
      }
      // ========================================
      // FIND TRAVEL STYLE
      // ========================================

      let newTravelStyle = "";

      const travelStyles = [
        "adventure",
        "relaxed",
        "luxury",
        "budget",
        "romantic",
        "family",
        "solo",
        "cultural",
      ];

      const foundTravelStyle = travelStyles.find((style) =>
        lower.includes(style),
      );

      if (foundTravelStyle) {
        newTravelStyle =
          foundTravelStyle.charAt(0).toUpperCase() + foundTravelStyle.slice(1);
      }
      // ========================================
      // FIND DESTINATION
      // ========================================

      const foundDestination = destinations.find((item) =>
        lower.includes(item),
      );

      const newDestination = foundDestination
        ? foundDestination.charAt(0).toUpperCase() + foundDestination.slice(1)
        : "";

      // ========================================
      // FIND DURATION
      // ========================================

      let newDuration = "";

      const dayMatch = text.match(/\b(\d{1,2})\s*(?:day|days)\b/i);

      if (dayMatch) {
        const days = Number(dayMatch[1]);

        if (days >= 1 && days <= 30) {
          newDuration = String(days);
        }
      }

      // Support comma format
      if (!newDuration) {
        const commaParts = text.split(",").map((item) => item.trim());

        const numberParts = commaParts.filter((item) => {
          if (!/^\d+$/.test(item)) {
            return false;
          }

          const value = Number(item);

          return value >= 1 && value <= 30;
        });

        if (numberParts.length > 0) {
          newDuration = numberParts[0];
        }
      }

      // ========================================
      // FIND BUDGET
      // ========================================

      let newBudget = "";

      const hasBudgetKeyword =
        lower.includes("budget") ||
        lower.includes("₹") ||
        lower.includes("rs") ||
        lower.includes("inr");

      if (hasBudgetKeyword) {
        const cleanText = text.replace(/,/g, "");

        const budgetMatch = cleanText.match(/(?:₹|rs\.?|inr)?\s*(\d{4,})/i);

        if (budgetMatch) {
          newBudget = budgetMatch[1];
        }
      }

      // Support comma format
      if (!newBudget) {
        const commaParts = text.split(",").map((item) => item.trim());

        const largeNumber = commaParts.find((item) => /^\d{4,}$/.test(item));

        if (largeNumber) {
          newBudget = largeNumber;
        }
      }

      // ========================================
      // FIND TRAVELERS
      // ========================================

      let newTravelers = "";

      const travelerMatch = text.match(
        /\b(\d{1,2})\s*(?:traveler|travelers|traveller|travellers|people|persons|members)\b/i,
      );

      if (travelerMatch) {
        const travelers = Number(travelerMatch[1]);

        if (travelers >= 1 && travelers <= 20) {
          newTravelers = String(travelers);
        }
      }

      // ========================================
      // FIND DATE
      // ========================================

      let newStartDate = "";

      const isoDateMatch = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);

      const normalDateMatch = text.match(/\b(\d{1,2}[/-]\d{1,2}[/-]20\d{2})\b/);

      if (isoDateMatch) {
        newStartDate = isoDateMatch[1];
      } else if (normalDateMatch) {
        const parts = normalDateMatch[1].split(/[/-]/);

        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2];

        newStartDate = `${year}-${month}-${day}`;
      }

      // ========================================
      // FIND DEPARTURE CITY
      // ========================================

      let newDepartureCity = "";

      const fromMatch = text.match(
        /from\s+([a-zA-Z\s]+?)(?=\s+to\s+|\s+for\s+|\s+with\s+|,|$)/i,
      );

      if (fromMatch) {
        newDepartureCity = fromMatch[1].trim();
      }

      // ========================================
      // FOOD INTEREST
      // ========================================

      let addFood = false;

      if (
        lower.includes("food") ||
        lower.includes("restaurant") ||
        lower.includes("cuisine")
      ) {
        addFood = true;
      }

      // ========================================
      // BEACH INTEREST
      // ========================================

      let addBeach = false;

      if (lower.includes("beach")) {
        addBeach = true;
      }

      // ========================================
      // FINAL VALUES
      // ========================================

      const finalDestination = newDestination || tripData.destination;

      const finalDuration = newDuration || tripData.duration;

      const finalBudget = newBudget || tripData.budget;

      const finalTravelers = newTravelers || tripData.travelers || "";

      const finalStartDate = newStartDate || tripData.startDate;

      const finalDepartureCity = newDepartureCity || tripData.departureCity;

      const finalTravelStyle = newTravelStyle || tripData.travelStyle;

      // ========================================
      // CALCULATE END DATE
      // ========================================

      let finalEndDate = tripData.endDate;

      if (finalStartDate && finalDuration) {
        const start = new Date(`${finalStartDate}T00:00:00`);

        if (!Number.isNaN(start.getTime())) {
          const end = new Date(start);

          // A 5-day trip starting on Nov 5 ends on Nov 9.
          end.setDate(start.getDate() + Number(finalDuration) - 1);

          finalEndDate = end.toISOString().split("T")[0];
        }
      }

      // ========================================
      // FINAL INTERESTS
      // ========================================

      const finalInterests = [
        ...new Set([...tripData.interests, ...detectedInterests]),
      ];

      // ========================================
      // AUTO CALCULATE PREFERENCE BUDGET
      // ========================================

      const preferenceExpenses = calculatePreferenceExpenses(
        finalInterests,
        finalDuration,
        finalTravelers,
      );

      // ========================================
      // UPDATE TRIP DATA
      // ========================================

      setTripData((previous) => ({
        ...previous,

        destination: finalDestination,

        duration: finalDuration,

        travelers: finalTravelers,

        budget: finalBudget,

        startDate: finalStartDate,

        endDate: finalEndDate,

        departureCity: finalDepartureCity,

        travelStyle: finalTravelStyle,

        interests: [...new Set([...previous.interests, ...detectedInterests])],
      }));

      // ========================================
      // UPDATE PREFERENCE EXPENSES
      // ========================================

      setExpenses((previous) => ({
        ...previous,

        food: preferenceExpenses.food,

        activities: preferenceExpenses.activities,

        shopping: preferenceExpenses.shopping,
      }));
      // ========================================
      // RESPONSE LOGIC
      // ========================================

      let reply = "";

      if (!finalDestination) {
        reply = "Please tell me your destination.";
      } else if (!finalDuration) {
        reply = `Great choice! ${finalDestination} sounds amazing. How many days would you like to travel?`;
      } else if (!finalBudget) {
        reply = "Perfect! What is your total travel budget?";
      } else if (!finalTravelers) {
        reply =
          `Perfect! I have your ${finalDestination} trip for ${finalDuration} days with a budget of ₹${Number(
            finalBudget,
          ).toLocaleString()}.\n\n` +
          `How many travelers are going on this trip?`;
      } else if (!finalStartDate) {
        reply =
          `Perfect! I have your ${finalDestination} trip for ${finalDuration} days with a budget of ₹${Number(
            finalBudget,
          ).toLocaleString()} for ${finalTravelers} traveler${
            finalTravelers === "1" ? "" : "s"
          }.\n\n` + `What is your travel start date?`;
      } else if (finalInterests.length === 0) {
        reply =
          `Great! Your travel dates are ${finalStartDate} to ${finalEndDate}.\n\n` +
          `❤️ What are your travel interests?\n\n` +
          `For example: Food, Culture, Shopping, Beach, Nature, Adventure or Nightlife.`;
      } else if (!finalTravelStyle) {
        reply =
          `Nice! I have noted your interests: ${finalInterests.join(", ")}.\n\n` +
          `✈️ What travel style do you prefer?\n\n` +
          `For example: Luxury, Relaxed, Adventure, Budget, Romantic, Family, Solo or Cultural.`;
      } else {
        reply =
          `Excellent! Your ${finalDestination} trip is ready.\n\n` +
          `📍 Destination: ${finalDestination}\n` +
          `📅 Duration: ${finalDuration} days\n` +
          `👥 Travelers: ${finalTravelers}\n` +
          `💰 Budget: ₹${Number(finalBudget).toLocaleString()}\n` +
          `🗓️ Start Date: ${finalStartDate}\n` +
          `🗓️ End Date: ${finalEndDate}\n` +
          `❤️ Interests: ${finalInterests.join(", ")}\n` +
          `✈️ Travel Style: ${finalTravelStyle}\n\n` +
          `You can now explore your personalized itinerary, places, hotels, restaurants, weather, map and budget.`;
      }
      // ========================================
      // ADD AI MESSAGE
      // ========================================

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: reply,
        },
      ]);

      setLoading(false);
    }, 500);
  }

  // ==========================================
  // LOAD HOTELS WHEN TRIP DATA IS READY
  // ==========================================

  useEffect(() => {
    if (tripData.destination && tripData.startDate && tripData.duration) {
      const start = new Date(`${tripData.startDate}T00:00:00`);

      if (!Number.isNaN(start.getTime())) {
        const hotelCheckOut = new Date(start);

        // Hotel stay:
        // 5-day trip = 5 nights
        // Check-in Nov 5 -> Check-out Nov 10
        hotelCheckOut.setDate(start.getDate() + Number(tripData.duration));

        const hotelCheckOutDate = hotelCheckOut.toISOString().split("T")[0];

        loadHotels(
          tripData.destination,
          tripData.startDate,
          hotelCheckOutDate,
          tripData.travelers || 1,
        );
      }
    }
  }, [
  tripData.destination,
    tripData.startDate,
    tripData.duration,
    tripData.travelers,
  ]);

  // ==========================================
  // PRICE HELPERS
  // ==========================================

  function parseNumericPrice(value) {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    const text = String(value).replace(/,/g, "");
    const match = text.match(/(\d+(?:\.\d+)?)/);

    return match ? Number(match[1]) : 0;
  }

  function convertToINR(value, currency = "INR") {
    const price = parseNumericPrice(value);
    const code = String(currency || "INR").toUpperCase();

    if (code === "USD") {
      return price * 88;
    }

    if (code === "EUR") {
      return price * 103;
    }

    if (code === "GBP") {
      return price * 118;
    }

    return price;
  }

  // ==========================================
  // LOAD HOTELS FROM FASTAPI
  // ==========================================

  async function loadHotels(location, checkIn, checkOut, adults = 1) {
    if (!location || !checkIn || !checkOut) {
      return;
    }

    try {
      setHotelsLoading(true);
      setHotelsError("");
      setHotels([]);

      const params = new URLSearchParams({
        location: location,
        check_in: checkIn,
        check_out: checkOut,
        adults: String(adults),
        limit: "5",
      });

      const response = await fetch(
        `http://127.0.0.1:8001/api/hotels?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Hotel API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to load hotels");
      }
     const hotelResults = (data.hotels || []).slice(0, 5);
     console.log("5 HOTEL RESULTS:", hotelResults);
     console.log(
       "5 HOTEL IMAGE URLS:",
       hotelResults.map((hotel) => ({
         name: hotel.name,
         image: hotel.image,
       })),
     );
     setHotels(hotelResults);

      // ==========================================
      // GET CHEAPEST HOTEL TOTAL PRICE
      // ==========================================
      const hotelPrices = hotelResults
        .map((hotel) => {
          const totalPriceRaw =
            hotel.total_price ??
            hotel.totalPrice ??
            hotel.price_total ??
            hotel.total ??
            null;

          const nightlyPriceRaw =
            hotel.nightly_price ??
            hotel.nightlyPrice ??
            hotel.price_per_night ??
            hotel.price ??
            null;

          const nights =
            Number(hotel.nights) ||
            Math.max(
              1,
              Math.round(
                (new Date(checkOut) - new Date(checkIn)) /
                  (1000 * 60 * 60 * 24),
              ),
            );

          const currency = (
            hotel.currency ||
            hotel.price_currency ||
            "INR"
          ).toUpperCase();

          let price = 0;

          // Prefer the total price for the complete stay.
          if (totalPriceRaw !== null) {
            price = convertToINR(totalPriceRaw, currency);
          } else if (nightlyPriceRaw !== null) {
            const nightlyPrice = convertToINR(nightlyPriceRaw, currency);

            price = nightlyPrice * nights;
          }

          return price;
        })
        .filter((price) => price > 0);

      if (hotelPrices.length > 0) {
        const cheapestHotel = Math.min(...hotelPrices);

        setExpenses((previous) => ({
          ...previous,
          accommodation: Math.round(cheapestHotel),
        }));
      }
    } catch (error) {
      console.error("Hotel API error:", error);

      setHotelsError("Unable to load hotels right now. Please try again.");

      setHotels([]);
    } finally {
      setHotelsLoading(false);
    }
  }

  // ==========================================
  // SEARCH PLACES
  // ==========================================

  async function searchPlaces() {
    if (!tripData.destination) {
      setPlacesError("Destination is required.");
      return;
    }

    try {
      setPlacesLoading(true);
      setPlacesError("");
      setPlaces([]);

      const params = new URLSearchParams({
        city: tripData.destination,
        category: "tourist_attraction",
      });

      const response = await fetch(
        `http://127.0.0.1:8001/api/places?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Places API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to load places");
      }

      setPlaces(data.places || []);
    } catch (error) {
      console.error("Places API error:", error);

      setPlacesError("Unable to load places right now. Please try again.");

      setPlaces([]);
    } finally {
      setPlacesLoading(false);
    }
  }

  // ==========================================
  // SEARCH FLIGHTS
  // ==========================================

  const airportCodes = {
    chennai: "MAA",
    madras: "MAA",
    mumbai: "BOM",
    bombay: "BOM",
    delhi: "DEL",
    "new delhi": "DEL",
    bangalore: "BLR",
    bengaluru: "BLR",
    hyderabad: "HYD",
    kolkata: "CCU",
    kochi: "COK",
    cochin: "COK",
    pune: "PNQ",
    goa: "GOI",
    dubai: "DXB",
    paris: "CDG",
    london: "LHR",
    singapore: "SIN",
    tokyo: "NRT",
    bali: "DPS",
  
    newyork: "JFK",
    toronto: "YYZ",
    zurich: "ZRH",
    rome: "FCO",
    bangkok: "BKK",
  };

  function getAirportCode(cityOrCode) {
    const value = String(cityOrCode || "").trim();

    if (!value) {
      return "";
    }

    const normalized = value.toLowerCase();

    return airportCodes[normalized] || value.toUpperCase();
  }

  async function searchFlights() {
    if (
      !tripData.departureCity ||
      !tripData.destination ||
      !tripData.startDate
    ) {
      setFlightsError(
        "Departure city, destination and travel date are required.",
      );
      return;
    }

    console.log("========== FLIGHT SEARCH ==========");
    console.log("From:", tripData.departureCity);
    console.log("To:", tripData.destination);
    console.log("Date:", tripData.startDate);
    console.log("Travelers:", tripData.travelers);

    try {
      setFlightsLoading(true);
      setFlightsError("");
      setFlights([]);

      const originCode = getAirportCode(tripData.departureCity);
      const destinationCode = getAirportCode(tripData.destination);

      console.log("Airport codes:", {
        origin: originCode,
        destination: destinationCode,
      });

      const params = new URLSearchParams({
        origin: originCode,
        destination: destinationCode,
        departure_date: tripData.startDate,
        adults: String(tripData.travelers || 1),
      });

      const response = await fetch(
        `http://127.0.0.1:8001/api/flights?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Flight API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to load flights");
      }

      const flightResults = data.flights || [];
console.log("Frontend flights count:", flightResults.length);
console.log("Frontend flights:", flightResults);
const topFiveFlights = flightResults.slice(0, 5);
      setFlights(flightResults);

      // ==========================================
      // GET CHEAPEST FLIGHT FOR BUDGET
      // ==========================================

      const flightPrices = flightResults
        .map((flight) =>
          convertToINR(flight.price || 0, flight.currency || "INR"),
        )
        .filter((price) => price > 0);

      if (flightPrices.length > 0) {
        const cheapestFlight = Math.min(...flightPrices);

        const travelers = Number(tripData.travelers) || 1;

        const totalFlightCost = cheapestFlight * travelers;

        setExpenses((previous) => ({
          ...previous,
          transportation: Math.round(totalFlightCost),
        }));
      }
    } catch (error) {
      console.error("Flight API error:", error);

      setFlightsError("Unable to load flights right now. Please try again.");

      setFlights([]);
    } finally {
      setFlightsLoading(false);
    }
  }

  // ==========================================
  // SEARCH RESTAURANTS
  // ==========================================

  async function searchRestaurants() {
    if (!tripData.destination) {
      setRestaurantsError("Destination is required.");
      return;
    }

    try {
      setRestaurantsLoading(true);
      setRestaurantsError("");
      setRestaurants([]);

      const params = new URLSearchParams({
        city: tripData.destination,
        radius: "5000",
        limit: "10",
      });

      const response = await fetch(
        `http://127.0.0.1:8001/api/restaurants?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Restaurant API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to load restaurants");
      }

      setRestaurants(data.restaurants || []);
    } catch (error) {
      console.error("Restaurant API error:", error);

      setRestaurantsError(
        "Unable to load restaurants right now. Please try again.",
      );

      setRestaurants([]);
    } finally {
      setRestaurantsLoading(false);
    }
  }

  // ==========================================
  // LOAD WEATHER
  // ==========================================

  async function loadWeather() {
    if (!tripData.destination) {
      setWeatherError("Destination is required.");
      return;
    }

    try {
      setWeatherLoading(true);
      setWeatherError("");
      setWeather(null);

      // Step 1: Get destination coordinates

      const locationResponse = await fetch(
        `http://127.0.0.1:8001/api/location?city=${encodeURIComponent(
          tripData.destination,
        )}`,
      );

      if (!locationResponse.ok) {
        throw new Error(`Location request failed: ${locationResponse.status}`);
      }

      const locationData = await locationResponse.json();

      if (!locationData.success) {
        throw new Error(locationData.message || "Unable to find destination");
      }

      const { latitude, longitude } = locationData.location;

      // Step 2: Get weather

      const weatherResponse = await fetch(
        `http://127.0.0.1:8001/api/weather?latitude=${latitude}&longitude=${longitude}`,
      );

      if (!weatherResponse.ok) {
        throw new Error(`Weather request failed: ${weatherResponse.status}`);
      }

      const weatherData = await weatherResponse.json();

      if (!weatherData.success) {
        throw new Error("Unable to load weather information");
      }

      setWeather(weatherData.weather?.data);
    } catch (error) {
      console.error("Weather API error:", error);

      setWeatherError("Unable to load weather right now. Please try again.");

      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  }

  // ==========================================
  // GENERATE AI ITINERARY
  // ==========================================

  async function generateItinerary() {
    try {
      setItineraryLoading(true);
      setItineraryError("");
      setItinerary(null);

      const response = await fetch("http://127.0.0.1:8001/api/itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        throw new Error(`Itinerary request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to generate itinerary");
      }

      setItinerary(data.itinerary);
    } catch (error) {
      console.error("Itinerary API error:", error);

      setItineraryError(
        "Unable to generate AI itinerary right now. Please try again.",
      );
    } finally {
      setItineraryLoading(false);
    }
  }

  // ==========================================
  // BUDGET FUNCTIONS
  // ==========================================

  function handleExpenseChange(category, value) {
    const cleanValue = String(value).replace(/[^\d]/g, "");

    setExpenses((previous) => ({
      ...previous,
      [category]: cleanValue === "" ? 0 : Number(cleanValue),
    }));
  }

  function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  // ==========================================
  // CALCULATE BUDGET USING FASTAPI
  // ==========================================

  async function calculateBudgetFromBackend(currentExpenses = expenses) {
    const budget = Number(tripData.budget) || 0;
    const travelers = Number(tripData.travelers) || 1;
    const days = Number(tripData.duration) || 1;

    if (!budget || !days) {
      return null;
    }

    const nights = Math.max(1, days - 1);

    try {
      const response = await fetch("http://127.0.0.1:8001/api/budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          budget,
          travelers,
          days,
          nights,

          // Frontend stores the complete flight total.
          // Backend expects price per traveler.
          flight_price: Number(currentExpenses.transportation || 0) / travelers,

          // Frontend stores the complete hotel total.
          // Backend expects nightly price.
          hotel_price: Number(currentExpenses.accommodation || 0) / nights,

          // Backend expects food cost per person per day.
          food_daily:
            Number(currentExpenses.food || 0) / Math.max(1, days * travelers),

          activities: Number(currentExpenses.activities || 0),

          transport: 0,

          // Backend currently has no separate shopping field,
          // so shopping is included in "other".
          other:
            Number(currentExpenses.other || 0) +
            Number(currentExpenses.shopping || 0),
        }),
      });

      if (!response.ok) {
        throw new Error(`Budget API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Budget calculation failed");
      }

      return data.budget;
    } catch (error) {
      console.error("Budget API error:", error);
      return null;
    }
  }

  // ==========================================
  // UPDATE BACKEND BUDGET WHEN EXPENSES CHANGE
  // ==========================================

  useEffect(() => {
    if (!tripData.budget || !tripData.travelers || !tripData.duration) {
      setBackendBudget(null);
      return;
    }

    const timer = setTimeout(async () => {
      setBudgetLoading(true);

      const result = await calculateBudgetFromBackend(expenses);

      if (result) {
        setBackendBudget(result);
      }

      setBudgetLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [tripData.budget, tripData.travelers, tripData.duration, expenses]);

  // ==========================================
  // ENTER KEY
  // ==========================================

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }
  // ==========================================
  // SAVE TRIP
  // ==========================================

  async function saveTrip() {
    const tripToSave = {
      destination: tripData.destination,
      country: "",
      duration_days: Number(tripData.duration) || 0,
      travelers: Number(tripData.travelers) || 1,
      budget: Number(tripData.budget) || 0,
      currency: "INR",
      departure_city: tripData.departureCity || "",
      start_date: tripData.startDate || null,
      end_date: tripData.endDate || null,
      travel_style: tripData.travelStyle || "",
      interests: tripData.interests || [],
      itinerary: itinerary || {},
      expenses: expenses || {},
      status: "planned",
    };

    try {
      const response = await fetch("http://127.0.0.1:8001/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripToSave),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.detail || "Failed to save trip");
      }

      // Keep localStorage for current UI compatibility
      const existingTrips = JSON.parse(localStorage.getItem("myTrips") || "[]");

      const savedTrip = {
        ...tripToSave,
        id: data.trip_id,
      };

      localStorage.setItem(
        "myTrips",
        JSON.stringify([...existingTrips, savedTrip]),
      );

      setSavedTripId(data.trip_id);

      alert("Trip saved successfully!");
    } catch (error) {
      console.error("Save trip error:", error);
      alert("Unable to save trip.");
    }
  }

  // ==========================================
  // CONTENT
  // ==========================================

  function renderContent() {
    // ========================================
    // BEFORE DESTINATION
    // ========================================

    if (!tripData.destination) {
      const examplePrompts = [
        "Plan a trip to Dubai for 5 days with ₹2,00,000 budget.",
        "Suggest a honeymoon trip to Maldives for 4 days.",
        "Plan a family trip to Singapore for 6 days.",
        "Show me a budget trip to Thailand for 5 days.",
      ];

      return (
        <div className="relative min-h-full overflow-hidden bg-gradient-to-br from-[#F8F0E3] via-[#FBF7EF] to-[#E8D6BB] px-5 py-8 sm:px-8 lg:px-10">

          {/* SOFT DECORATIVE GLOW */}
          <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#D8B98A]/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#E0B56A]/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A66A35]">
              ✦ Paradise AI
            </p>

            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#3A2518] sm:text-4xl">
              Plan Your Journey
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#6B5542] sm:text-base">
              Start chatting with Paradise AI. Tell me your destination,
              number of days, travel dates, travelers and budget.
            </p>


            {/* EXAMPLE PROMPTS */}
            <div className="mt-8 w-full max-w-[620px] rounded-3xl border border-[#D8B98A]/70 bg-[#FBF7EF]/95 p-5 shadow-[0_15px_40px_rgba(74,44,26,0.12)] sm:p-6">

              <div className="mb-4 flex items-center gap-3">
                <span className="text-xl">☀️</span>

                <h3 className="text-sm font-bold text-[#3A281C]">
                  Try these examples
                </h3>
              </div>

              {examplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="group mt-2 flex w-full items-center justify-between rounded-xl border border-[#EEE2D0] bg-white px-4 py-3 text-left text-xs text-[#4A3425] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FFF8ED] hover:shadow-md sm:text-sm"
                >
                  <span>{prompt}</span>

                  <span className="ml-3 shrink-0 text-[#8A4A1B] transition group-hover:translate-x-1">
                    →
                  </span>
                </button>
              ))}
            </div>


            {/* RIGHT DECORATIVE SIGN */}
            <div className="pointer-events-none absolute right-0 top-16 hidden w-[260px] lg:block">

              <div className="rotate-[-5deg] text-center font-serif text-xl italic leading-6 text-[#4A2C1A]">
                Good Trips
                <br />
                Create
                <br />
                Great Stories
              </div>

              <div className="relative mx-auto mt-8 h-[230px] w-[230px]">

                <div className="absolute left-1/2 top-0 h-[195px] w-2 -translate-x-1/2 rounded-full bg-[#6B4226]" />

                <div className="absolute left-2 top-12 w-[185px] rotate-[-5deg] rounded-md bg-[#A66A35] px-5 py-2 text-center font-serif text-lg text-white shadow-md">
                  Explore
                </div>

                <div className="absolute left-7 top-20 w-[185px] rotate-[3deg] rounded-md bg-[#8D572D] px-5 py-2 text-center font-serif text-lg text-white shadow-md">
                  Dream
                </div>

                <div className="absolute left-4 top-28 w-[185px] rotate-[-2deg] rounded-md bg-[#A66A35] px-5 py-2 text-center font-serif text-lg text-white shadow-md">
                  Discover
                </div>

                <div className="absolute left-8 top-36 w-[185px] rotate-[3deg] rounded-md bg-[#7A4018] px-5 py-2 text-center font-serif text-lg text-white shadow-md">
                  Repeat
                </div>

              </div>
            </div>

          </div>
        </div>
      );
    }

    // ========================================
    // OVERVIEW
    // ========================================

    if (activeSection === "Overview") {
      return (
        <SectionContainer
          icon="🧭"
          title="Trip Overview"
          description="A quick summary of your planned trip."
        >
          <div className="rounded-3xl border border-[#D8B98A] bg-white p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard
                icon="📍"
                title="Destination"
                value={tripData.destination || "Not selected"}
              />

              <InfoCard
                icon="📅"
                title="Travel Dates"
                value={
                  tripData.startDate && tripData.endDate
                    ? `${tripData.startDate} → ${tripData.endDate}`
                    : "Not selected"
                }
              />

              <InfoCard
                icon="⏱️"
                title="Duration"
                value={
                  tripData.duration
                    ? `${tripData.duration} Days`
                    : "Not specified"
                }
              />

              <InfoCard
                icon="👥"
                title="Travelers"
                value={`${tripData.travelers || 1} Traveler(s)`}
              />

              <InfoCard
                icon="💰"
                title="Budget"
                value={
                  tripData.budget
                    ? `₹${Number(tripData.budget).toLocaleString("en-IN")}`
                    : "Not specified"
                }
              />

              <InfoCard
                icon="✈️"
                title="Departure City"
                value={tripData.departureCity || "Not specified"}
              />
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-[#D8B98A] bg-[#FBF7EF] p-6">
            <h3 className="text-xl font-bold text-[#4A2C1A]">
              Travel Preferences
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <DetailRow
                label="Travel Style"
                value={tripData.travelStyle || "Not specified"}
              />

              <DetailRow
                label="Interests"
                value={
                  tripData.interests?.length
                    ? tripData.interests.join(", ")
                    : "Not specified"
                }
              />
            </div>
          </div>
        </SectionContainer>
      );
    }

    // ========================================
    // ITINERARY
    // ========================================

    if (activeSection === "Itinerary") {
      return (
        <SectionContainer
          icon="🗓️"
          title="AI Itinerary"
          description={`Personalized ${tripData.duration || ""}-day itinerary for ${tripData.destination}.`}
        >
          <div className="rounded-2xl border border-[#D8B98A] bg-[#FBF7EF] p-6">
            <p className="text-sm text-gray-600">
              Let AI create a personalized day-by-day travel plan based on your
              destination, dates, budget and travel preferences.
            </p>

            <button
              type="button"
              onClick={generateItinerary}
              disabled={itineraryLoading}
              className="mt-5 rounded-xl bg-[#4A2C1A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#354d3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {itineraryLoading
                ? "Generating AI Itinerary..."
                : "✨ Generate AI Itinerary"}
            </button>
          </div>

          {itineraryError && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-semibold text-red-700">{itineraryError}</p>
            </div>
          )}

          {itineraryLoading && (
            <div className="mt-5 rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
              <div className="text-5xl">🤖</div>

              <p className="mt-4 font-semibold text-[#4A2C1A]">
                Creating your itinerary...
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Groq AI is planning your trip.
              </p>
            </div>
          )}

          {!itineraryLoading && !itineraryError && !itinerary && (
            <div className="mt-5 rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
              <div className="text-5xl">🗺️</div>

              <p className="mt-4 font-semibold text-[#4A2C1A]">
                No itinerary generated yet
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Click "Generate AI Itinerary" to create your personalized plan.
              </p>
            </div>
          )}

          {!itineraryLoading && itinerary && (
            <div className="mt-6 space-y-6">
              {itinerary.days?.map((day) => (
                <div
                  key={day.day}
                  className="overflow-hidden rounded-3xl border border-[#D8B98A] bg-white shadow-sm"
                >
                  <div className="bg-[#4A2C1A] p-5 text-white">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-xl font-bold">
                        Day {day.day} — {day.title}
                      </h3>

                      <span className="text-sm text-[#f3ead8]">{day.date}</span>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    {day.activities?.map((activity, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-5"
                      >
                        <div className="flex gap-4">
                          <div className="min-w-[80px] text-sm font-bold text-[#4A2C1A]">
                            {activity.time}
                          </div>

                          <div>
                            <h4 className="font-bold text-[#4A2C1A]">
                              {activity.activity}
                            </h4>

                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* ========================================
                  SAVE TRIP
              ======================================== */}

              <div className="rounded-3xl border border-[#D8B98A] bg-[#FBF7EF] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b4883d]">
                      My Trips
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-[#4A2C1A]">
                      Save this itinerary
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Save your trip details, itinerary and budget to My Trips.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={saveTrip}
                    disabled={
                      !tripData.destination || !tripData.startDate || !itinerary
                    }
                    className="rounded-xl bg-[#C89B3C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#A77C2E] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savedTripId ? "✓ Trip Saved" : "💾 Save Trip"}
                  </button>
                </div>
              </div>

              {/* ========================================
                  RAG TRAVEL SOURCES
              ======================================== */}

              {Array.isArray(itinerary.travel_sources) &&
                itinerary.travel_sources.length > 0 && (
                  <div className="rounded-3xl border border-[#D8B98A] bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">📚</span>
                      <div>
                        <h3 className="text-2xl font-bold text-[#4A2C1A]">
                          Travel Sources
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Destination-specific information used by the AI
                          itinerary.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {itinerary.travel_sources.map((source, index) => {
                        const sourceText = String(source || "");
                        const fileName =
                          sourceText.split(/[\\/]/).pop() || sourceText;

                        return (
                          <div
                            key={`${fileName}-${index}`}
                            className="flex items-center gap-4 rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f3ead8] text-2xl">
                              📄
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-[#4A2C1A]">
                                {fileName}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                RAG destination reference •{" "}
                                {tripData.destination}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {(!Array.isArray(itinerary.travel_sources) ||
                itinerary.travel_sources.length === 0) && (
                <div className="rounded-3xl border border-[#eadfc9] bg-[#fffdf8] p-6">
                  <p className="font-semibold text-[#4A2C1A]">
                    📚 Travel Sources
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    No destination PDF source was returned by the RAG service.
                    Make sure the {tripData.destination || "destination"} PDF is
                    present in the backend RAG data.
                  </p>
                </div>
              )}
            </div>
          )}
        </SectionContainer>
      );
    }
    // ========================================
    // FLIGHTS
    // ========================================

    if (activeSection === "Flights") {
      return (
        <SectionContainer
          icon="✈️"
          title="Flights"
          description={`Best flight options for your ${tripData.destination || "trip"} (Showing top 5 results)`}
        >
          <div className="rounded-2xl border border-[#D8B98A] bg-[#FBF7EF] p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <DetailRow
                label="From"
                value={tripData.departureCity || "Departure city"}
              />

              <DetailRow
                label="To"
                value={tripData.destination || "Destination"}
              />

              <DetailRow
                label="Travel Date"
                value={tripData.startDate || "Travel date"}
              />

              <DetailRow label="Travelers" value={tripData.travelers || "1"} />
            </div>

            <button
              type="button"
              onClick={searchFlights}
              disabled={flightsLoading}
              className="mt-6 rounded-xl bg-[#4A2C1A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#354d3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {flightsLoading ? "Searching Flights..." : "Search Flights"}
            </button>
          </div>

          {flightsError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-semibold text-red-700">{flightsError}</p>
            </div>
          )}

          {flightsLoading && (
            <div className="rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
              <div className="text-5xl">✈️</div>

              <p className="mt-4 font-semibold text-[#4A2C1A]">
                Finding flights...
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Searching available flight options.
              </p>
            </div>
          )}

          {!flightsLoading && !flightsError && flights.length === 0 && (
            <div className="rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
              <div className="text-5xl">✈️</div>

              <p className="mt-4 font-semibold text-[#4A2C1A]">
                No flights searched yet
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Click "Search Flights" to find available flight options.
              </p>
            </div>
          )}

          {!flightsLoading && !flightsError && flights.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Found{" "}
                  <span className="font-semibold text-[#4A2C1A]">
                    {flights.length}
                  </span>{" "}
                  flights
                </p>

                <p className="text-xs text-gray-500">FlightAPI</p>
              </div>

              <div className="space-y-4">
                {flights.slice(0, 5).map((flight, index) => (
                  <FlightCard
                    key={`${flight.flight_number || "flight"}-${index}`}
                    flight={flight}
                  />
                ))}
              </div>
            </>
          )}
        </SectionContainer>
      );
    }

    // ========================================
    // HOTELS
    // ========================================

    if (activeSection === "Hotels") {
      return (
        <SectionContainer
          icon="🏨"
          title="Hotels"
          description={
            tripData.startDate && tripData.endDate
              ? `Hotel prices for ${tripData.destination} from ${tripData.startDate} to ${tripData.endDate}.`
              : `Hotel information for ${tripData.destination}.`
          }
        >
          {(!tripData.startDate || !tripData.endDate) && (
            <div className="rounded-2xl border border-[#D8B98A] bg-[#FBF7EF] p-6">
              <p className="font-semibold text-[#4A2C1A]">
                📅 Travel dates required
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Please provide your travel start date in Paradise AI to search
                hotels and prices.
              </p>
            </div>
          )}

          {tripData.startDate && tripData.endDate && hotelsLoading && (
            <div className="rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
              <div className="text-5xl">🏨</div>

              <p className="mt-4 font-medium text-[#4A2C1A]">
                Finding hotels in {tripData.destination}...
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Searching hotel availability and prices.
              </p>
            </div>
          )}

          {!hotelsLoading && hotelsError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-semibold text-red-700">{hotelsError}</p>

              <button
                type="button"
                onClick={() =>
                  loadHotels(
                    tripData.destination,
                    tripData.startDate,
                    tripData.endDate,
                    tripData.travelers || 1,
                  )
                }
                className="mt-4 rounded-xl bg-[#4A2C1A] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {tripData.startDate &&
            tripData.endDate &&
            !hotelsLoading &&
            !hotelsError &&
            hotels.length === 0 && (
              <div className="rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
                <div className="text-5xl">🏨</div>

                <p className="mt-4 font-semibold text-[#4A2C1A]">
                  No hotels found
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  No hotel information is currently available for{" "}
                  {tripData.destination}.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadHotels(
                      tripData.destination,
                      tripData.startDate,
                      tripData.endDate,
                      tripData.travelers || 1,
                    )
                  }
                  className="mt-4 rounded-xl bg-[#4A2C1A] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Search Again
                </button>
              </div>
            )}

          {!hotelsLoading && !hotelsError && hotels.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Found{" "}
                  <span className="font-semibold text-[#4A2C1A]">
                    {hotels.length}
                  </span>{" "}
                  hotels
                </p>

                <p className="text-xs text-gray-500">Live hotel data</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {hotels.map((hotel, index) => (
                  <HotelCard
                    key={hotel.id || `${hotel.name}-${index}`}
                    hotel={hotel}
                  />
                ))}
              </div>
            </>
          )}
        </SectionContainer>
      );
    }

    // ========================================
    // RESTAURANTS
    // ========================================

    if (activeSection === "Restaurants") {
      return (
        <SectionContainer
          icon="🍽️"
          title="Restaurants"
          description="Restaurant options for your journey."
        >
          <div className="rounded-2xl border border-[#D8B98A] bg-[#FBF7EF] p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <DetailRow
                label="City"
                value={tripData.destination || "Destination"}
              />

              <DetailRow label="Search Radius" value="5 km" />

              <DetailRow label="Results" value="Up to 10 restaurants" />
            </div>

            <button
              type="button"
              onClick={searchRestaurants}
              disabled={restaurantsLoading}
              className="mt-6 rounded-xl bg-[#4A2C1A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#354d3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {restaurantsLoading
                ? "Searching Restaurants..."
                : "Search Restaurants"}
            </button>
          </div>

          {restaurantsError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-semibold text-red-700">{restaurantsError}</p>
            </div>
          )}

          {restaurantsLoading && (
            <div className="rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
              <div className="text-5xl">🍽️</div>

              <p className="mt-4 font-semibold text-[#4A2C1A]">
                Finding restaurants...
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Searching restaurants in {tripData.destination}.
              </p>
            </div>
          )}

          {!restaurantsLoading &&
            !restaurantsError &&
            restaurants.length === 0 && (
              <div className="rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
                <div className="text-5xl">🍽️</div>

                <p className="mt-4 font-semibold text-[#4A2C1A]">
                  No restaurants searched yet
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Click "Search Restaurants" to find restaurants.
                </p>
              </div>
            )}

          {!restaurantsLoading &&
            !restaurantsError &&
            restaurants.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Found{" "}
                    <span className="font-semibold text-[#4A2C1A]">
                      {restaurants.length}
                    </span>{" "}
                    restaurants
                  </p>

                  <p className="text-xs text-gray-500">Geoapify Places</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {restaurants.map((restaurant, index) => (
                    <RestaurantCard
                      key={
                        restaurant.place_id ||
                        restaurant.id ||
                        `${restaurant.name || restaurant.poi_name || "restaurant"}-${index}`
                      }
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              </>
            )}
        </SectionContainer>
      );
    }

    // ========================================
    // WEATHER
    // ========================================

    if (activeSection === "Weather") {
      return (
        <SectionContainer
          icon="🌤️"
          title="Weather"
          description={`Weather information for ${tripData.destination}.`}
        >
          <div className="rounded-2xl border border-[#D8B98A] bg-[#FBF7EF] p-6">
            <DetailRow label="Destination" value={tripData.destination} />

            <button
              type="button"
              onClick={loadWeather}
              disabled={weatherLoading}
              className="mt-6 rounded-xl bg-[#4A2C1A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#354d3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {weatherLoading ? "Loading Weather..." : "Check Weather"}
            </button>
          </div>

          {weatherError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-semibold text-red-700">{weatherError}</p>
            </div>
          )}

          {weatherLoading && (
            <div className="rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
              <div className="text-5xl">🌤️</div>

              <p className="mt-4 font-semibold text-[#4A2C1A]">
                Checking weather...
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Getting the latest weather information.
              </p>
            </div>
          )}

          {!weatherLoading && !weatherError && weather && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoCard
                icon="🌡️"
                title="Temperature"
                value={`${weather.current?.temperature_2m ?? "N/A"}°C`}
              />

              <InfoCard
                icon="💧"
                title="Humidity"
                value={`${weather.current?.relative_humidity_2m ?? "N/A"}%`}
              />

              <InfoCard
                icon="💨"
                title="Wind Speed"
                value={`${weather.current?.wind_speed_10m ?? "N/A"} km/h`}
              />

              <InfoCard
                icon="☁️"
                title="Weather"
                value={`Code ${weather.current?.weather_code ?? "N/A"}`}
              />
            </div>
          )}

          {!weatherLoading && !weatherError && !weather && (
            <div className="rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
              <div className="text-5xl">🌤️</div>

              <p className="mt-4 font-semibold text-[#4A2C1A]">
                No weather searched yet
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Click "Check Weather" to get weather information.
              </p>
            </div>
          )}
        </SectionContainer>
      );
    }

    // ========================================
    // PLACES
    // ========================================

    if (activeSection === "Places") {
      return (
        <SectionContainer
          icon="📍"
          title="Places"
          description="Tourist attractions and places to explore."
        >
          <div className="rounded-2xl border border-[#D8B98A] bg-[#FBF7EF] p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailRow
                label="City"
                value={tripData.destination || "Destination"}
              />

              <DetailRow label="Category" value="Tourist Attractions" />
            </div>

            <button
              type="button"
              onClick={searchPlaces}
              disabled={placesLoading}
              className="mt-6 rounded-xl bg-[#4A2C1A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#354d3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {placesLoading ? "Searching Places..." : "Search Places"}
            </button>
          </div>

          {placesError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-semibold text-red-700">{placesError}</p>
            </div>
          )}

          {placesLoading && (
            <div className="rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
              <div className="text-5xl">📍</div>

              <p className="mt-4 font-semibold text-[#4A2C1A]">
                Finding places...
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Searching attractions in {tripData.destination}.
              </p>
            </div>
          )}

          {!placesLoading && !placesError && places.length === 0 && (
            <div className="rounded-2xl border border-[#D8B98A] bg-white p-8 text-center">
              <div className="text-5xl">📍</div>

              <p className="mt-4 font-semibold text-[#4A2C1A]">
                No places searched yet
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Click "Search Places" to find tourist attractions.
              </p>
            </div>
          )}

          {!placesLoading && !placesError && places.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Found{" "}
                  <span className="font-semibold text-[#4A2C1A]">
                    {places.length}
                  </span>{" "}
                  places
                </p>

                <p className="text-xs text-gray-500">
                  OpenStreetMap / Overpass
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {places.map((place, index) => (
                  <PlaceCard
                    key={place.place_id || `${place.name}-${index}`}
                    place={place}
                  />
                ))}
              </div>
            </>
          )}
        </SectionContainer>
      );
    }

    // ========================================
    // MAP
    // ========================================

    if (activeSection === "Map") {
      return (
        <SectionContainer
          icon="🗺️"
          title="Travel Map"
          description={`Explore ${tripData.destination} on the map.`}
        >
          <TripMap city={tripData.destination} />
        </SectionContainer>
      );
    }

    // ========================================
    // BUDGET
    // ========================================

    if (activeSection === "Budget") {
      const totalBudget = Number(tripData.budget) || 0;

      const localEstimated = Object.values(expenses).reduce(
        (total, value) => total + Number(value || 0),
        0,
      );

      const totalEstimated = backendBudget?.total ?? localEstimated;

      const remainingBudget = totalBudget - totalEstimated;

      const isOverBudget = totalBudget > 0 && totalEstimated > totalBudget;

      const overAmount = isOverBudget ? totalEstimated - totalBudget : 0;

      const budgetPercentage =
        totalBudget > 0 ? Math.round((totalEstimated / totalBudget) * 100) : 0;

      const progressWidth =
        totalBudget > 0
          ? Math.min((totalEstimated / totalBudget) * 100, 100)
          : 0;

      return (
        <SectionContainer
          icon="💰"
          title="Trip Budget"
          description="Track your estimated travel expenses and compare them with your total trip budget."
        >
          {/* =================================
              TRIP SUMMARY
          ================================= */}

          <div className="rounded-3xl border border-[#D8B98A] bg-white p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-3">
              <InfoCard
                icon="📍"
                title="Destination"
                value={tripData.destination || "Not selected"}
              />

              <InfoCard
                icon="👥"
                title="Travelers"
                value={`${tripData.travelers || 1} Traveler(s)`}
              />

              <InfoCard
                icon="💰"
                title="Total Budget"
                value={formatCurrency(totalBudget)}
              />
            </div>
          </div>

          {/* =================================
              BUDGET USAGE
          ================================= */}

          <div className="rounded-3xl bg-[#4A2C1A] p-7 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#D8B98A]">Budget Usage</p>

                <p className="mt-2 text-3xl font-bold">
                  {budgetPercentage}% used
                </p>
              </div>

              {isOverBudget ? (
                <div className="rounded-full bg-red-500/20 px-5 py-2 text-sm font-semibold text-red-200">
                  ⚠️ Over Budget
                </div>
              ) : (
                <div className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-[#D8B98A]">
                  ✓ Within Budget
                </div>
              )}
            </div>

            <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget ? "bg-red-500" : "bg-[#D8B98A]"
                }`}
                style={{
                  width: `${progressWidth}%`,
                }}
              />
            </div>

            <div className="mt-4 flex justify-between text-xs text-white/60">
              <span>
                {budgetLoading
                  ? "Calculating..."
                  : `Estimated: ${formatCurrency(totalEstimated)}`}
              </span>

              <span>Budget: {formatCurrency(totalBudget)}</span>
            </div>
          </div>

          {/* =================================
              SUMMARY CARDS
          ================================= */}

          <div className="grid gap-5 sm:grid-cols-3">
            <InfoCard
              icon="💰"
              title="Total Budget"
              value={formatCurrency(totalBudget)}
            />

            <InfoCard
              icon="📊"
              title="Estimated Cost"
              value={formatCurrency(totalEstimated)}
            />

            <InfoCard
              icon={isOverBudget ? "⚠️" : "💵"}
              title={isOverBudget ? "Over Budget" : "Remaining"}
              value={
                isOverBudget
                  ? formatCurrency(overAmount)
                  : formatCurrency(remainingBudget)
              }
            />
          </div>
          {/* =================================
              EXPENSE INPUT
          ================================= */}

          <div className="rounded-3xl border border-[#D8B98A] bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b4883d]">
              Expense Breakdown
            </p>

            <h3 className="mt-2 text-2xl font-bold text-[#4A2C1A]">
              Where will you spend?
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Flight and hotel prices are automatically added when live search
              results are available. Food, activities, shopping and other
              expenses can be entered manually.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {expenseFields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ead8] text-xl">
                        {field.icon}
                      </div>

                      <label className="font-semibold text-[#4A2C1A]">
                        {field.label}
                      </label>
                    </div>

                    {field.auto && (
                      <span className="rounded-full bg-[#E8D8C0] px-3 py-1 text-xs font-semibold text-[#4A2C1A]">
                        Auto
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center rounded-xl border border-[#D8B98A] bg-white px-4">
                    <span className="text-[#b4883d]">₹</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        expenses[field.key] === 0 ? "" : expenses[field.key]
                      }
                      onChange={(event) =>
                        handleExpenseChange(field.key, event.target.value)
                      }
                      placeholder="0"
                      className="w-full bg-transparent px-3 py-4 outline-none"
                    />
                  </div>

                  {field.auto && (
                    <p className="mt-2 text-xs text-gray-500">
                      Automatically updated from live search.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* =================================
              BUDGET SUMMARY
          ================================= */}

          <div className="rounded-3xl bg-[#FBF7EF] p-7">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b4883d]">
              Budget Summary
            </p>

            <div className="mt-6 space-y-4">
              {expenseFields.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between border-b border-[#D8B98A] pb-4"
                >
                  <span className="text-sm text-gray-600">
                    {field.icon} {field.label}
                  </span>

                  <span className="font-semibold text-[#4A2C1A]">
                    {formatCurrency(expenses[field.key])}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="font-bold text-[#4A2C1A]">Total Estimated</span>

              <span
                className={`text-2xl font-bold ${
                  isOverBudget ? "text-red-600" : "text-[#4A2C1A]"
                }`}
              >
                {formatCurrency(totalEstimated)}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-bold text-[#4A2C1A]">
                {isOverBudget ? "Over Budget" : "Remaining"}
              </span>

              <span
                className={`text-2xl font-bold ${
                  isOverBudget ? "text-red-600" : "text-[#b4883d]"
                }`}
              >
                {isOverBudget
                  ? `-${formatCurrency(overAmount)}`
                  : formatCurrency(remainingBudget)}
              </span>
            </div>
          </div>

          {/* =================================
              OVER BUDGET WARNING
          ================================= */}

          {isOverBudget && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
                ⚠️ Budget Alert
              </p>

              <h3 className="mt-3 text-2xl font-bold text-[#4A2C1A]">
                Your estimated cost is over the budget.
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Please reduce your estimated expenses by{" "}
                <strong className="text-red-600">
                  {formatCurrency(overAmount)}
                </strong>{" "}
                to stay within your trip budget.
              </p>
            </div>
          )}
        </SectionContainer>
      );
    }

    return null;
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <div className="min-h-screen overflow-hidden bg-[#F3E7D3] text-[#3A281C]">
      

      {/* =====================================================
          MAIN APPLICATION
      ===================================================== */}

      <main className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col lg:h-[calc(100vh-80px)] lg:flex-row">
        {/* ===================================================
            LEFT CHAT PANEL
        =================================================== */}

        <aside className="flex w-full shrink-0 flex-col border-b border-[#C9A878] bg-[#E6D2B5] lg:w-[350px] lg:border-b-0 lg:border-r">
          {/* AI HEADER */}
          <div className="shrink-0 border-b border-[#C9A878] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4A2C1A] text-xl text-[#E7C76B] shadow-md">
                ✦
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold text-[#4A2C1A]">
                  Paradise AI
                </h2>

                <p className="text-xs text-[#7A5A3A]">
                  Your personal travel assistant
                </p>
              </div>
            </div>
          </div>

          {/* CHAT MESSAGES */}
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 lg:min-h-0">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[92%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-5 shadow-sm ${
                    message.role === "user"
                      ? "rounded-br-md bg-[#6B3A13] text-white"
                      : "rounded-bl-md border border-[#D8B98A] bg-[#FBF7EF] text-[#4A3425]"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="w-fit rounded-2xl rounded-bl-md border border-[#D8B98A] bg-[#FBF7EF] px-4 py-3 text-sm text-[#7A5A3A]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#A66A35]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#A66A35] [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#A66A35] [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          {/* CHAT INPUT */}
          <div className="shrink-0 border-t border-[#C9A878] p-4">
            <div className="flex items-end gap-2 rounded-2xl border border-[#C9A878] bg-[#FFFDF8] p-2 shadow-sm">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Tell me about your trip..."
                className="min-h-[48px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[#4A3425] outline-none placeholder:text-[#9B8875]"
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7A4018] text-lg text-white shadow-md transition hover:bg-[#8D4B1B] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                ➤
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-[#8A7058]">
              Enter to send
            </p>
          </div>
        </aside>

        {/* ===================================================
            RIGHT CONTENT
        =================================================== */}

        <section className="flex min-w-0 flex-1 flex-col bg-[#F8F0E3]">
          {/* SECTION NAV */}
          <nav className="shrink-0 border-b border-[#D8B98A] bg-[#FBF5EA] px-4 py-3 shadow-sm">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveSection(item)}
                  disabled={!tripData.destination}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition duration-300 sm:text-sm ${
                    activeSection === item
                      ? "bg-[#6B3A13] text-white shadow-md"
                      : "bg-[#E8D8C0] text-[#5A3A25] hover:bg-[#D9C2A0]"
                  } ${
                    !tripData.destination ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </nav>

          {/* CONTENT */}
          <div className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto min-h-full w-full max-w-6xl">
              {renderContent()}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// ==========================================
// INFO CARD
// ==========================================

function InfoCard({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-[#D8B98A] bg-white p-5 shadow-sm">
      <div className="text-2xl">{icon}</div>

      <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <p className="mt-1 font-semibold text-[#4A2C1A]">{value}</p>
    </div>
  );
}

// ==========================================
// DETAIL ROW
// ==========================================

function DetailRow({ label, value }) {
  return (
    <div className="rounded-xl bg-[#FBF7EF] p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>

      <p className="mt-1 font-semibold text-[#4A2C1A]">{value}</p>
    </div>
  );
}

// ==========================================
// SECTION CONTAINER
// ==========================================

function SectionContainer({ icon, title, description, children }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>

          <h2 className="font-serif text-3xl font-bold text-[#4A2C1A]">
            {title}
          </h2>
        </div>

        <p className="mt-2 text-gray-600">{description}</p>
      </div>

      {children}
    </div>
  );
}



// ==========================================
// FLIGHT CARD - LUXURY HORIZONTAL DESIGN
// ==========================================

function FlightCard({ flight }) {
  const formatPrice = (price, currency) => {
    if (price === null || price === undefined) {
      return "Price unavailable";
    }

    return `${currency || "INR"} ${Number(price).toLocaleString("en-IN")}`;
  };

  const airlineName = flight.airline || "Airline";

  return (
    <div className="group rounded-2xl border border-[#e4d3b8] bg-white px-5 py-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="grid items-center gap-5 lg:grid-cols-[1.4fr_1fr_1fr_1fr_0.9fr_auto]">
        {/* =====================================
            AIRLINE
        ===================================== */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#eadbc5]">
            <span className="text-3xl">✈️</span>
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[#3f2415]">
              {airlineName}
            </p>

            <p className="mt-1 text-sm text-[#806b59]">
              {flight.flight_number || "Flight"}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#e7f3ec] px-2.5 py-1 text-[10px] font-semibold text-[#28734a]">
                Refundable
              </span>

              <span className="rounded-full bg-[#e8f0f5] px-2.5 py-1 text-[10px] font-semibold text-[#41677f]">
                Baggage included
              </span>
            </div>
          </div>
        </div>

        {/* =====================================
            FROM
        ===================================== */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#9a8978]">
            From
          </p>

          <p className="mt-1 text-xl font-bold text-[#3f2415]">
            {flight.origin || "N/A"}
          </p>

          {flight.origin_city && (
            <p className="text-xs text-[#806b59]">{flight.origin_city}</p>
          )}

          {flight.departure_at && (
            <p className="mt-1 text-sm font-semibold text-[#3f2415]">
              {String(flight.departure_at).slice(11, 16)}
            </p>
          )}

          {flight.departure_at && (
            <p className="text-xs text-[#8d7a68]">
              {String(flight.departure_at).slice(0, 10)}
            </p>
          )}
        </div>

        {/* =====================================
            DURATION / STOPS
        ===================================== */}
        <div className="text-center">
          <p className="text-sm font-semibold text-[#806b59]">
            {flight.duration
              ? `${Math.floor(Number(flight.duration) / 60)}h ${
                  Number(flight.duration) % 60
                }m`
              : "—"}
          </p>

          <div className="my-2 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-[#d9c3a5]" />

            <span className="text-lg text-[#b4772b]">✈</span>

            <span className="h-px w-10 bg-[#d9c3a5]" />
          </div>

          <p className="text-xs font-medium text-[#5f4938]">
            {flight.transfers === 0
              ? "Direct"
              : `${flight.transfers || 0} stop${
                  Number(flight.transfers) > 1 ? "s" : ""
                }`}
          </p>
        </div>

        {/* =====================================
            TO
        ===================================== */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#9a8978]">
            To
          </p>

          <p className="mt-1 text-xl font-bold text-[#3f2415]">
            {flight.destination || "N/A"}
          </p>

          {flight.destination_city && (
            <p className="text-xs text-[#806b59]">{flight.destination_city}</p>
          )}

          {flight.arrival_at && (
            <p className="mt-1 text-sm font-semibold text-[#3f2415]">
              {String(flight.arrival_at).slice(11, 16)}
            </p>
          )}

          {flight.arrival_at && (
            <p className="text-xs text-[#8d7a68]">
              {String(flight.arrival_at).slice(0, 10)}
            </p>
          )}
        </div>

        {/* =====================================
            PRICE
        ===================================== */}
        <div className="lg:border-l lg:border-[#eadbc7] lg:pl-5">
          <p className="text-xs text-[#9a8978]">Flight Price</p>

          <p className="mt-1 whitespace-nowrap text-2xl font-bold text-[#a66a24]">
            {formatPrice(flight.price, flight.currency)}
          </p>

          <p className="text-xs text-[#806b59]">per adult</p>
        </div>

        {/* =====================================
            ACTION
        ===================================== */}
        <div className="flex flex-row items-center justify-between gap-4 lg:flex-col lg:items-stretch">
          <button
            type="button"
            className="rounded-xl bg-[#7b421b] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5e3014] hover:shadow-md"
          >
            Select
          </button>

          <button
            type="button"
            className="whitespace-nowrap text-xs font-semibold text-[#7b421b] transition hover:text-[#b4772b]"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
// ==========================================
// HOTEL CARD
// =====
 function HotelCard({ hotel, destination }) {
   // ==========================================
   // HOTEL NAME
   // ==========================================

   const hotelName =
     typeof hotel?.name === "string" && hotel.name.trim()
       ? hotel.name
       : "Hotel";

   // ==========================================
   // HOTEL IMAGE
   // Hotel image ONLY
   // ==========================================

   const hotelImage =
     typeof hotel?.image === "string" && hotel.image.trim()
       ? hotel.image
       : typeof hotel?.image_url === "string" && hotel.image_url.trim()
         ? hotel.image_url
         : typeof hotel?.main_photo_url === "string" &&
             hotel.main_photo_url.trim()
           ? hotel.main_photo_url
           : Array.isArray(hotel?.images) &&
               typeof hotel.images[0] === "string" &&
               hotel.images[0].trim()
             ? hotel.images[0]
             : Array.isArray(hotel?.photos) &&
                 typeof hotel.photos[0] === "string" &&
                 hotel.photos[0].trim()
               ? hotel.photos[0]
               : "";

   // ==========================================
   // DESTINATION / LOCATION
   // ==========================================

   const backendDestination =
     typeof hotel?.destination_name === "string" &&
     hotel.destination_name.trim()
       ? hotel.destination_name
       : typeof hotel?.destinationName === "string" &&
           hotel.destinationName.trim()
         ? hotel.destinationName
         : typeof hotel?.city === "string" && hotel.city.trim()
           ? hotel.city
           : typeof hotel?.location === "string" && hotel.location.trim()
             ? hotel.location
             : "";

   const hotelLocation =
     backendDestination ||
     (typeof destination === "string" && destination.trim()
       ? destination
       : "Destination unavailable");

   // ==========================================
   // ADDRESS
   // ==========================================

   const hotelAddress =
     typeof hotel?.address === "string" && hotel.address.trim()
       ? hotel.address
       : "";

   // ==========================================
   // STAR RATING
   // ==========================================

   const starRating =
     hotel?.star_rating ?? hotel?.stars ?? hotel?.category ?? "";

   // ==========================================
   // GUEST RATING
   // ==========================================

   let guestRating = hotel?.guest_rating ?? hotel?.rating ?? null;

   if (guestRating && typeof guestRating === "object") {
     guestRating = guestRating.value ?? guestRating.score ?? null;
   }

   // ==========================================
   // PRICE
   // ==========================================

   const nightlyPrice =
     hotel?.nightly_price ??
     hotel?.nightlyPrice ??
     hotel?.price_per_night ??
     hotel?.pricePerNight ??
     null;

   const totalPrice =
     hotel?.total_price ??
     hotel?.totalPrice ??
     hotel?.price_total ??
     hotel?.total ??
     null;

   const currency =
     typeof hotel?.currency === "string" && hotel.currency.trim()
       ? hotel.currency.toUpperCase()
       : "EUR";

   // ==========================================
   // FORMAT PRICE
   // ==========================================

   function formatPrice(value) {
     if (value === null || value === undefined || value === "") {
       return "Price unavailable";
     }

     const numericValue = Number(value);

     if (!Number.isFinite(numericValue)) {
       return "Price unavailable";
     }

     return `${currency} ${numericValue.toLocaleString("en-IN", {
       minimumFractionDigits: 2,
       maximumFractionDigits: 2,
     })}`;
   }

   // ==========================================
   // RENDER
   // ==========================================

   return (
     <div className="overflow-hidden rounded-2xl border border-[#D8B98A] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
       {/* ======================================
          HOTEL IMAGE
          ====================================== */}

       <div className="h-52 overflow-hidden bg-[#E8D8C0]">
         {hotelImage ? (
           <img
             src={hotelImage}
             alt={hotelName}
             className="h-full w-full object-cover transition duration-500 hover:scale-105"
             onError={(event) => {
               console.error("Hotel image failed:", hotelName, hotelImage);

               event.currentTarget.style.display = "none";
             }}
           />
         ) : (
           <div className="flex h-full flex-col items-center justify-center bg-[#F6EFE3] text-[#4A2C1A]">
             <span className="text-5xl">🏨</span>
             <span className="mt-2 text-sm">Hotel image unavailable</span>
           </div>
         )}
       </div>

       {/* ======================================
          HOTEL DETAILS
          ====================================== */}

       <div className="p-5">
         {/* SOURCE + STARS */}

         <div className="mb-3 flex items-center justify-between">
           <span className="rounded-full bg-[#F6EFE3] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#C89B3C]">
             Hotelbeds
           </span>

           {starRating ? (
             <span className="text-sm font-semibold text-[#C89B3C]">
               ⭐ {String(starRating)} STARS
             </span>
           ) : null}
         </div>

         {/* HOTEL NAME */}

         <h3 className="font-serif text-xl font-semibold text-[#4A2C1A]">
           {hotelName}
         </h3>

         {/* DESTINATION */}

         <p className="mt-2 text-sm font-medium text-gray-600">
           📍 {hotelLocation}
         </p>

         {/* ADDRESS */}

         {hotelAddress &&
         hotelAddress.toLowerCase() !== hotelLocation.toLowerCase() ? (
           <p className="mt-1 text-xs text-gray-500">{hotelAddress}</p>
         ) : null}

         {/* DESTINATION CODE */}

         {hotel?.destination_code || hotel?.destinationCode ? (
           <p className="mt-1 text-xs text-gray-400">
             Destination: {hotel.destination_code ?? hotel.destinationCode}
           </p>
         ) : null}

         {/* GUEST RATING */}

         {guestRating !== null &&
         guestRating !== undefined &&
         guestRating !== "" ? (
           <div className="mt-3">
             <span className="rounded-full bg-[#E8D8C0] px-3 py-1 text-xs font-semibold text-[#4A2C1A]">
               ⭐ {String(guestRating)}
               {hotel?.rating_scale ? ` / ${hotel.rating_scale}` : ""}
             </span>

             {hotel?.review_count || hotel?.rating_votes ? (
               <span className="ml-2 text-xs text-gray-500">
                 ({hotel.review_count ?? hotel.rating_votes} reviews)
               </span>
             ) : null}
           </div>
         ) : null}

         {/* ====================================
            LIVE HOTEL PRICE
            ==================================== */}

         <div className="mt-5 border-t border-[#E8D8C0] pt-4">
           <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
             Hotel Price
           </p>

           {nightlyPrice !== null && nightlyPrice !== undefined ? (
             <div className="mt-1">
               <p className="text-2xl font-bold text-[#4A2C1A]">
                 {formatPrice(nightlyPrice)}
               </p>

               <p className="text-xs text-gray-500">per night</p>
             </div>
           ) : totalPrice !== null && totalPrice !== undefined ? (
             <div className="mt-1">
               <p className="text-2xl font-bold text-[#4A2C1A]">
                 {formatPrice(totalPrice)}
               </p>

               <p className="text-xs text-gray-500">total stay</p>
             </div>
           ) : (
             <p className="mt-1 text-sm text-gray-500">Price unavailable</p>
           )}
         </div>

         {/* HOTEL CODE */}

         {hotel?.code || hotel?.hotel_id ? (
           <div className="mt-4 rounded-xl bg-[#FBF7EF] px-3 py-2">
             <p className="text-xs text-gray-500">Hotel Code</p>

             <p className="text-sm font-semibold text-[#4A2C1A]">
               {hotel.code ?? hotel.hotel_id}
             </p>
           </div>
         ) : null}
       </div>
     </div>
   );
 }
// ==========================================
// RESTAURANT CARD
// ==========================================

function RestaurantCard({ restaurant }) {
   const restaurantImage =
     restaurant.image ||
     restaurant.image_url ||
     restaurant.photo ||
     restaurant.photo_url ||
     restaurant.properties?.image ||
     restaurant.properties?.image_url ||
     "";
  return (
    <div className="overflow-hidden rounded-2xl border border-[#D8B98A] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="h-40 w-full overflow-hidden rounded-xl bg-[#E8D8C0]">
          {restaurantImage ? (
            <img
              src={restaurantImage}
              alt={restaurant.name || "Restaurant"}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              🍽️
            </div>
          )}
        </div>

        <span className="rounded-full bg-[#E8D8C0] px-3 py-1 text-xs font-semibold text-[#4A2C1A]">
          Restaurant
        </span>
      </div>

      <h3 className="mt-5 text-xl font-bold text-[#4A2C1A]">
        {restaurant.name ||
          restaurant.poi_name ||
          restaurant.place_name ||
          restaurant.properties?.name ||
          restaurant.properties?.place_name ||
          "Restaurant"}
      </h3>

      {restaurant.address && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Address
          </p>

          <p className="mt-1 text-sm text-gray-700">{restaurant.address}</p>
        </div>
      )}

      {restaurant.city && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">City</p>

          <p className="mt-1 text-sm font-semibold text-[#4A2C1A]">
            {restaurant.city}
          </p>
        </div>
      )}

      {restaurant.distance !== null && restaurant.distance !== undefined && (
        <div className="mt-4 rounded-xl bg-[#FBF7EF] p-3">
          <p className="text-xs text-gray-500">Distance</p>

          <p className="mt-1 text-sm font-semibold text-[#4A2C1A]">
            {(restaurant.distance / 1000).toFixed(2)} km
          </p>
        </div>
      )}

      {restaurant.phone && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>

          <p className="mt-1 text-sm font-semibold text-[#4A2C1A]">
            {restaurant.phone}
          </p>
        </div>
      )}

      {restaurant.website && (
        <a
          href={restaurant.website}
          target="_blank"
          rel="noreferrer"
          className="mt-5 block rounded-xl bg-[#4A2C1A] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#354d3d]"
        >
          Visit Website
        </a>
      )}

      <div className="mt-4 rounded-xl bg-[#FBF7EF] px-3 py-2">
        <p className="text-xs text-gray-500">Source</p>

        <p className="text-sm font-semibold text-[#4A2C1A]">Geoapify</p>
      </div>
    </div>
  );
}

// ==========================================
// PLACE CARD
// ==========================================

// ==========================================
// PLACE CARD
// ==========================================

function PlaceCard({ place }) {
  const placeImage =
    place?.image ||
    place?.image_url ||
    place?.photo ||
    place?.photo_url ||
    "";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D8B98A] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* =====================================
          ATTRACTION BADGE
      ===================================== */}

      <div className="flex justify-end px-5 pt-5">
        <span className="rounded-full bg-[#E8D8C0] px-3 py-1 text-xs font-semibold text-[#4A2C1A]">
          Attraction
        </span>
      </div>

      {/* =====================================
          ATTRACTION IMAGE
      ===================================== */}

      {placeImage && (
        <div className="mx-5 mt-4 h-52 overflow-hidden rounded-xl bg-[#E8D8C0]">
          <img
            src={placeImage}
            alt={place.name || "Tourist attraction"}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
            onError={(event) => {
              event.currentTarget.parentElement.style.display = "none";
            }}
          />
        </div>
      )}

      {/* =====================================
          PLACE NAME
      ===================================== */}

      <div className="p-5">

        <h3 className="text-xl font-bold text-[#4A2C1A]">
          {place.name || "Tourist Attraction"}
        </h3>

        {/* =================================
            ADDRESS
        ================================= */}

        {place.address && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Address
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {place.address}
            </p>
          </div>
        )}

        {/* =================================
            CATEGORY
        ================================= */}

        {place.category && (
          <div className="mt-4 rounded-xl bg-[#FBF7EF] p-3">
            <p className="text-xs text-gray-500">
              Category
            </p>

            <p className="mt-1 text-sm font-semibold text-[#4A2C1A]">
              {place.category}
            </p>
          </div>
        )}

        {/* =================================
            LATITUDE / LONGITUDE
        ================================= */}

        {(place.latitude !== undefined ||
          place.longitude !== undefined) && (
          <div className="mt-4 grid grid-cols-2 gap-3">

            <div className="rounded-xl bg-[#FBF7EF] p-3">
              <p className="text-xs text-gray-500">
                Latitude
              </p>

              <p className="mt-1 text-sm font-semibold text-[#4A2C1A]">
                {place.latitude ?? "N/A"}
              </p>
            </div>

            <div className="rounded-xl bg-[#FBF7EF] p-3">
              <p className="text-xs text-gray-500">
                Longitude
              </p>

              <p className="mt-1 text-sm font-semibold text-[#4A2C1A]">
                {place.longitude ?? "N/A"}
              </p>
            </div>

          </div>
        )}

        {/* =================================
            SOURCE
        ================================= */}

        <div className="mt-4 rounded-xl bg-[#FBF7EF] px-3 py-2">
          <p className="text-xs text-gray-500">
            Source
          </p>

          <p className="text-sm font-semibold text-[#4A2C1A]">
            OpenStreetMap / Overpass
          </p>
        </div>

      </div>
    </div>
  );
}

export default PlanTrip;
