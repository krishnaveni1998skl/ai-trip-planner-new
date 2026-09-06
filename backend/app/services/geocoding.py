import httpx


async def get_coordinates(city: str):
    url = "https://geocoding-api.open-meteo.com/v1/search"

    params = {
        "name": city,
        "count": 1,
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

            location = results[0]

            return {
                "name": location.get("name"),
                "country": location.get("country"),
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