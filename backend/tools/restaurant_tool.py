from typing import Dict


def search_restaurants(
    destination: str,
    cuisine: str = "local food",
) -> Dict:
    """
    Find restaurant options for a destination
    based on cuisine preference.
    """

    if not destination.strip():
        raise ValueError(
            "Destination cannot be empty"
        )

    destination_key = destination.strip().lower()

    restaurant_data = {
        "dubai": [
            {
                "name": "Arabian Taste",
                "cuisine": "Arabic",
                "location": "Downtown Dubai",
                "price_range": "₹₹",
            },
            {
                "name": "Desert Spice",
                "cuisine": "Middle Eastern",
                "location": "Dubai Marina",
                "price_range": "₹₹₹",
            },
            {
                "name": "Global Kitchen",
                "cuisine": "International",
                "location": "Jumeirah",
                "price_range": "₹₹",
            },
        ],

        "paris": [
            {
                "name": "Paris Bistro",
                "cuisine": "French",
                "location": "Central Paris",
                "price_range": "€€",
            },
            {
                "name": "Le Garden",
                "cuisine": "French",
                "location": "Montmartre",
                "price_range": "€€€",
            },
        ],

        "bali": [
            {
                "name": "Bali Spice",
                "cuisine": "Indonesian",
                "location": "Ubud",
                "price_range": "₹",
            },
            {
                "name": "Island Kitchen",
                "cuisine": "Asian",
                "location": "Seminyak",
                "price_range": "₹₹",
            },
        ],
    }

    restaurants = restaurant_data.get(
        destination_key,
        [
            {
                "name": f"Local Restaurant in {destination}",
                "cuisine": cuisine,
                "location": destination,
                "price_range": "₹₹",
            }
        ],
    )

    return {
        "destination": destination,
        "cuisine": cuisine,
        "restaurants": restaurants,
    }