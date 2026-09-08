import httpx


# =====================================================
# WEATHER SERVICE - OPEN-METEO
# =====================================================

async def get_weather(
    latitude: float,
    longitude: float,
):
    """
    Fetch current and daily weather information
    from Open-Meteo.
    """

    # =====================================================
    # VALIDATE COORDINATES
    # =====================================================

    try:
        latitude = float(latitude)
        longitude = float(longitude)

    except (TypeError, ValueError):

        return {
            "success": False,
            "data": None,
            "error_type": "validation_error",
            "message": (
                "Invalid latitude or longitude."
            ),
            "is_live": False,
        }

    # =====================================================
    # OPEN-METEO API
    # =====================================================

    url = (
        "https://api.open-meteo.com/v1/forecast"
    )

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

    print(
        "\n"
        "========================================"
    )

    print(
        "OPEN-METEO WEATHER SEARCH"
    )

    print(
        "========================================"
    )

    print(
        f"Latitude  : {latitude}"
    )

    print(
        f"Longitude : {longitude}"
    )

    print(
        "Calling Open-Meteo API..."
    )

    # =====================================================
    # DIRECT HTTPX REQUEST
    # =====================================================

    try:

        async with httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
        ) as client:

            response = await client.get(
                url,
                params=params,
            )

        print(
            "Open-Meteo Status:",
            response.status_code,
        )

    except httpx.TimeoutException:

        print(
            "Open-Meteo request timed out."
        )

        return {
            "success": False,
            "data": None,
            "error_type": "timeout",
            "message": (
                "Weather service timed out."
            ),
            "is_live": False,
        }

    except httpx.RequestError as exc:

        print(
            "Open-Meteo connection error:",
            str(exc),
        )

        return {
            "success": False,
            "data": None,
            "error_type": "request_error",
            "message": (
                "Unable to connect to "
                "weather service."
            ),
            "is_live": False,
        }

    # =====================================================
    # HTTP ERROR
    # =====================================================

    if response.status_code != 200:

        try:
            error_data = response.json()

        except Exception:
            error_data = {}

        print(
            "Open-Meteo API ERROR:"
        )

        print(
            error_data
        )

        message = (
            error_data.get(
                "reason"
            )
            or error_data.get(
                "message"
            )
            or (
                "Weather service "
                "request failed."
            )
        )

        return {
            "success": False,
            "data": None,
            "error_type": (
                "weather_api_error"
            ),
            "message": message,
            "is_live": False,
        }

    # =====================================================
    # PARSE JSON
    # =====================================================

    try:

        data = response.json()

    except Exception as exc:

        print(
            "Open-Meteo JSON error:",
            str(exc),
        )

        return {
            "success": False,
            "data": None,
            "error_type": (
                "invalid_response"
            ),
            "message": (
                "Weather API returned "
                "invalid data."
            ),
            "is_live": False,
        }

    # =====================================================
    # VALIDATE RESPONSE
    # =====================================================

    if not isinstance(
        data,
        dict,
    ):

        return {
            "success": False,
            "data": None,
            "error_type": (
                "invalid_response"
            ),
            "message": (
                "Invalid weather response."
            ),
            "is_live": False,
        }

    # =====================================================
    # CURRENT WEATHER
    # =====================================================

    current = data.get(
        "current",
        {},
    )

    if not isinstance(
        current,
        dict,
    ):
        current = {}

    # =====================================================
    # DAILY WEATHER
    # =====================================================

    daily = data.get(
        "daily",
        {},
    )

    if not isinstance(
        daily,
        dict,
    ):
        daily = {}

    # =====================================================
    # FINAL LOG
    # =====================================================

    print(
        "\n"
        "========================================"
    )

    print(
        "WEATHER SUCCESS"
    )

    print(
        "========================================"
    )

    print(
        "Temperature:",
        current.get(
            "temperature_2m"
        ),
    )

    print(
        "Humidity:",
        current.get(
            "relative_humidity_2m"
        ),
    )

    print(
        "Weather Code:",
        current.get(
            "weather_code"
        ),
    )

    print(
        "Wind Speed:",
        current.get(
            "wind_speed_10m"
        ),
    )

    # =====================================================
    # SUCCESS
    # =====================================================

    return {
        "success": True,

        "data": data,

        "error_type": None,

        "message": (
            "Weather data fetched successfully"
        ),

        "is_live": True,
    }