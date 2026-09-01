from typing import Dict


def search_hotels(
    destination: str,
    nights: int = 1,
    travelers: int = 1,
) -> Dict:
    """
    Search available hotel options for a destination.
    """

    if not destination.strip():
        raise ValueError("Destination cannot be empty")

    if nights < 1:
        raise ValueError("Nights must be at least 1")

    if travelers < 1:
        raise ValueError("Travelers must be at least 1")

    return {
        "destination": destination.strip(),
        "nights": nights,
        "travelers": travelers,
        "currency": "INR",
        "hotels": [
            {
                "name": "Demo Grand Hotel",
                "rating": 4.5,
                "price_per_night": 12000,
                "total_price": 12000 * nights,
                "room_type": "Deluxe",
            },
            {
                "name": "Paradise Stay",
                "rating": 4.2,
                "price_per_night": 8500,
                "total_price": 8500 * nights,
                "room_type": "Standard",
            },
            {
                "name": "Budget Comfort",
                "rating": 3.8,
                "price_per_night": 5500,
                "total_price": 5500 * nights,
                "room_type": "Standard",
            },
        ],
    }