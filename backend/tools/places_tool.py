from typing import Dict


def search_places(
    destination: str,
    interest: str = "popular attractions",
) -> Dict:
    """
    Find popular places and attractions for a destination
    based on the traveler's interest.
    """

    if not destination.strip():
        raise ValueError(
            "Destination cannot be empty"
        )

    destination_key = destination.strip().lower()

    places_data = {
        "dubai": [
            {
                "name": "Burj Khalifa",
                "category": "Landmark",
                "location": "Downtown Dubai",
            },
            {
                "name": "Dubai Mall",
                "category": "Shopping",
                "location": "Downtown Dubai",
            },
            {
                "name": "Palm Jumeirah",
                "category": "Island",
                "location": "Dubai",
            },
            {
                "name": "Dubai Marina",
                "category": "Sightseeing",
                "location": "Dubai Marina",
            },
            {
                "name": "Dubai Desert Safari",
                "category": "Adventure",
                "location": "Dubai Desert",
            },
        ],

        "paris": [
            {
                "name": "Eiffel Tower",
                "category": "Landmark",
                "location": "Champ de Mars",
            },
            {
                "name": "Louvre Museum",
                "category": "Museum",
                "location": "Rue de Rivoli",
            },
            {
                "name": "Notre-Dame Cathedral",
                "category": "Historic",
                "location": "Île de la Cité",
            },
        ],

        "bali": [
            {
                "name": "Uluwatu Temple",
                "category": "Temple",
                "location": "Uluwatu",
            },
            {
                "name": "Tegallalang Rice Terrace",
                "category": "Nature",
                "location": "Ubud",
            },
            {
                "name": "Seminyak Beach",
                "category": "Beach",
                "location": "Seminyak",
            },
        ],
    }

    places = places_data.get(
        destination_key,
        [
            {
                "name": f"Popular attraction in {destination}",
                "category": interest,
                "location": destination,
            }
        ],
    )

    return {
        "destination": destination,
        "interest": interest,
        "places": places,
    }