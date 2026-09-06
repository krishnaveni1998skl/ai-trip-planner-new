import { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

maptilersdk.config.apiKey = MAPTILER_KEY;

function TripMap({ city }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // 1. GET LOCATION + PLACES
  // ==========================================
  useEffect(() => {
    if (!city) return;

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // Location
        const locationResponse = await fetch(
          `http://127.0.0.1:8001/api/location?city=${encodeURIComponent(city)}`,
        );

        if (!locationResponse.ok) {
          throw new Error("Location API failed");
        }

        const locationData = await locationResponse.json();

        if (!locationData.success) {
          throw new Error("Location not found");
        }

        if (!cancelled) {
          setLocation(locationData.location);
        }

        // Places
        const placesResponse = await fetch(
          `http://127.0.0.1:8001/api/places?city=${encodeURIComponent(
            city,
          )}&category=tourist_attraction`,
        );

        if (!placesResponse.ok) {
          throw new Error("Places API failed");
        }

        const placesData = await placesResponse.json();

        if (!cancelled && placesData.success) {
          setPlaces(placesData.places || []);
        }

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error("TripMap error:", err);

        if (!cancelled) {
          setError(err.message || "Unable to load map data.");
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [city]);

  // ==========================================
  // 2. CREATE MAP AFTER LOCATION IS RENDERED
  // ==========================================
  useEffect(() => {
    if (!location) return;
    if (!mapContainer.current) return;

    console.log("Creating MapTiler map...");
    console.log("API key present:", !!MAPTILER_KEY);
    console.log("Location:", location);

    // Remove old map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      apiKey: MAPTILER_KEY,
      style: maptilersdk.MapStyle.STREETS,
      center: [location.longitude, location.latitude],
      zoom: 10,
    });

    map.current.on("load", () => {
      console.log("MapTiler map loaded successfully!");
    });

    map.current.on("error", (event) => {
      console.error("MapTiler map error:", event);
    });

    // Destination marker
    new maptilersdk.Marker({
      color: "#d4af37",
    })
      .setLngLat([location.longitude, location.latitude])
      .setPopup(
        new maptilersdk.Popup().setHTML(
          `<strong>${location.name}</strong><br/>Trip Destination`,
        ),
      )
      .addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [location]);

  // ==========================================
  // 3. ADD PLACE MARKERS
  // ==========================================
  useEffect(() => {
    if (!map.current) return;
    if (!places.length) return;

    // Remove previous markers
    markers.current.forEach((marker) => {
      marker.remove();
    });

    markers.current = [];

    places.forEach((place) => {
      if (place.latitude == null || place.longitude == null) {
        return;
      }

      const marker = new maptilersdk.Marker({
        color: "#2563eb",
      })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(
          new maptilersdk.Popup().setHTML(`
            <strong>${place.name}</strong>
            <br/>
            ${place.type || "Tourist Place"}
            ${place.address ? `<br/>${place.address}` : ""}
          `),
        )
        .addTo(map.current);

      markers.current.push(marker);
    });

    return () => {
      markers.current.forEach((marker) => {
        marker.remove();
      });

      markers.current = [];
    };
  }, [places]);

  // ==========================================
  // 4. NO CITY
  // ==========================================
  if (!city) {
    return (
      <div className="p-6 text-center text-gray-400">
        Enter a destination to view the map.
      </div>
    );
  }

  // ==========================================
  // 5. ERROR
  // ==========================================
  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  // ==========================================
  // 6. IMPORTANT:
  // ALWAYS RENDER CONTAINER
  // ==========================================
  return (
    <div className="space-y-4">
      {loading && (
        <p className="text-center text-yellow-500">Loading {city} map...</p>
      )}

      <div
        ref={mapContainer}
        className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-yellow-700/30"
      />

      <p className="text-sm text-gray-500">
        Showing {places.length} real tourist places around{" "}
        {location?.name || city}.
      </p>
    </div>
  );
}

export default TripMap;
