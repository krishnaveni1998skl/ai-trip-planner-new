import httpx


# Ambiguous region/state names → safe city used for live API searches
LOCATION_OVERRIDES = {
    "kerala": "Kochi, India",
}


async def get_coordinates(city: str):
    url = "https://geocoding-api.open-meteo.com/v1/search"

    search_name = LOCATION_OVERRIDES.get(
        city.strip().lower(),
        city.strip(),
    )

    params = {
        "name": search_name,
        "count": 5,
        "language": "en",
        "format": "json",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                url,
                params=params,
            )

            response.raise_for_status()

            data = response.json()

            results = data.get("results", [])

            if not results:
                return None

            # Prefer India when searching an overridden location
            location = results[0]

            if city.strip().lower() == "kerala":
                india_results = [
                    result
                    for result in results
                    if result.get("country_code", "").upper() == "IN"
                ]

                if india_results:
                    location = india_results[0]

            return {
                "name": location.get("name"),
                "country": location.get("country"),
                "country_code": location.get("country_code"),
                "latitude": location.get("latitude"),
                "longitude": location.get("longitude"),
                "timezone": location.get("timezone"),
            }

    except httpx.TimeoutException:
        print(f"Open-Meteo timeout for city: {city}")
        return None

    except httpx.HTTPError as e:
        print(f"Open-Meteo HTTP error for city {city}: {e}")
        return None

    except Exception as e:
        print(f"Geocoding error for city {city}: {e}")
        return None