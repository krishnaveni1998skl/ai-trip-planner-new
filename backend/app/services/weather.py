from app.utils.api_helpers import safe_get


async def get_weather(latitude: float, longitude: float):
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "weather_code,"
            "wind_speed_10m"
        ),
        "daily": (
            "weather_code,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "precipitation_probability_max"
        ),
        "timezone": "auto",
    }

    try:
        result = await safe_get(
            url=url,
            params=params,
            timeout=15,
            retries=1,
        )

        # External API failed
        if not result.get("success"):
            print(
                f"Weather API error: "
                f"{result.get('error_type')} - "
                f"{result.get('message')}"
            )

            return {
                "success": False,
                "data": None,
                "error_type": result.get(
                    "error_type",
                    "unknown"
                ),
                "message": result.get(
                    "message",
                    "Weather service unavailable"
                ),
                "is_live": False,
            }

        # Successful response
        return {
            "success": True,
            "data": result.get("data"),
            "error_type": None,
            "message": "Weather data fetched successfully",
            "is_live": True,
        }

    except Exception as e:
        print(f"Unexpected weather error: {e}")

        return {
            "success": False,
            "data": None,
            "error_type": "unexpected_error",
            "message": "Unable to fetch weather information",
            "is_live": False,
        }