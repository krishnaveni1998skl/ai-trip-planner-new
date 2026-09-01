from typing import Dict


def get_weather(
    destination: str,
) -> Dict:
    """
    Get basic weather information for a travel destination.
    """

    if not destination.strip():
        raise ValueError(
            "Destination cannot be empty"
        )

    destination = destination.strip()

    # Demo weather data.
    # Live weather API can be connected later.
    weather_data = {
        "dubai": {
            "temperature": 32,
            "condition": "Sunny",
            "humidity": 55,
        },
        "paris": {
            "temperature": 18,
            "condition": "Partly Cloudy",
            "humidity": 65,
        },
        "maldives": {
            "temperature": 29,
            "condition": "Sunny",
            "humidity": 75,
        },
        "bali": {
            "temperature": 28,
            "condition": "Partly Cloudy",
            "humidity": 78,
        },
    }

    data = weather_data.get(
        destination.lower()
    )

    if not data:
        data = {
            "temperature": None,
            "condition": "Weather data unavailable",
            "humidity": None,
        }

    return {
        "destination": destination,
        **data,
    }