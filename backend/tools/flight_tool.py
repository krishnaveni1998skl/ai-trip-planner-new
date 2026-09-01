from typing import Dict


def search_flights(
    origin: str,
    destination: str,
    travelers: int = 1,
) -> Dict:
    """
    Search available flight options between two destinations.
    """

    if not origin.strip():
        raise ValueError("Origin cannot be empty")

    if not destination.strip():
        raise ValueError("Destination cannot be empty")

    if travelers < 1:
        raise ValueError("Travelers must be at least 1")

    return {
        "origin": origin.strip(),
        "destination": destination.strip(),
        "travelers": travelers,
        "currency": "INR",
        "flights": [
            {
                "airline": "Demo Airways",
                "departure": "08:00",
                "arrival": "11:30",
                "price_per_person": 18000,
                "total_price": 18000 * travelers,
                "type": "Direct",
            },
            {
                "airline": "Travel Express",
                "departure": "14:00",
                "arrival": "17:45",
                "price_per_person": 15000,
                "total_price": 15000 * travelers,
                "type": "1 Stop",
            },
        ],
    }