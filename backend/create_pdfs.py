from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
)
from reportlab.lib.styles import getSampleStyleSheet


# ============================================================
# BASE PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DOCUMENTS_DIR = BASE_DIR / "data" / "documents"

DOCUMENTS_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# TRAVEL KNOWLEDGE
# ============================================================

DESTINATIONS = {

    # ========================================================
    # DUBAI
    # ========================================================

    "Dubai": {
        "overview": (
            "Dubai is a modern destination in the United Arab Emirates "
            "known for luxury shopping, modern architecture, beaches, "
            "desert experiences, entertainment, and family attractions."
        ),

        "places": (
            "Burj Khalifa, Dubai Mall, Palm Jumeirah, Dubai Marina, "
            "Museum of the Future, Jumeirah Beach, Dubai Frame, "
            "and Dubai Desert Safari."
        ),

        "food": (
            "Arabic cuisine, Emirati dishes, Middle Eastern food, "
            "international restaurants, seafood, and street food "
            "are popular food options in Dubai."
        ),

        "activities": (
            "Desert safari, sightseeing, shopping, dhow cruise, "
            "beach activities, visiting observation decks, "
            "water activities, and city tours."
        ),

        "transport": (
            "Dubai Metro, taxis, buses, trams, private cars, "
            "and ride-hailing services are common transportation options."
        ),

        "tips": (
            "Carry comfortable clothing, stay hydrated, respect "
            "local customs, and plan outdoor activities according "
            "to weather conditions."
        ),
    },


    # ========================================================
    # PARIS
    # ========================================================

    "Paris": {
        "overview": (
            "Paris is the capital of France and is famous for art, "
            "history, architecture, museums, cafes, shopping, "
            "and romantic landmarks."
        ),

        "places": (
            "Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, "
            "Arc de Triomphe, Montmartre, Seine River, "
            "Champs-Élysées, and Sacré-Cœur."
        ),

        "food": (
            "French cuisine includes croissants, pastries, crepes, "
            "cheese, bread, traditional French dishes, and cafe food."
        ),

        "activities": (
            "Museum visits, city walks, Seine cruises, sightseeing, "
            "shopping, photography, cultural experiences, "
            "and visiting historical landmarks."
        ),

        "transport": (
            "Metro, buses, trains, walking, bicycles, and taxis "
            "are convenient ways to explore Paris."
        ),

        "tips": (
            "Keep belongings secure in crowded areas, use public "
            "transportation, reserve popular attractions in advance, "
            "and carry comfortable walking shoes."
        ),
    },


    # ========================================================
    # MALDIVES
    # ========================================================

    "Maldives": {
        "overview": (
            "The Maldives is a tropical island destination known "
            "for beaches, clear water, coral reefs, luxury resorts, "
            "and marine activities."
        ),

        "places": (
            "Malé, Hulhumalé, Maafushi, resort islands, "
            "coral reefs, snorkeling locations, and beaches."
        ),

        "food": (
            "Maldivian cuisine includes fish, coconut, rice, curries, "
            "seafood dishes, and tropical fruits."
        ),

        "activities": (
            "Snorkeling, scuba diving, island hopping, swimming, "
            "sunset cruises, kayaking, fishing, and beach relaxation."
        ),

        "transport": (
            "Speedboats, domestic flights, seaplanes, and ferries "
            "are commonly used between islands."
        ),

        "tips": (
            "Carry sunscreen, swimwear, light clothing, and "
            "respect local island customs and environmental rules."
        ),
    },


    # ========================================================
    # BALI
    # ========================================================

    "Bali": {
        "overview": (
            "Bali is an Indonesian island known for beaches, temples, "
            "rice terraces, waterfalls, culture, nature, and resorts."
        ),

        "places": (
            "Uluwatu Temple, Ubud, Tegallalang Rice Terrace, "
            "Seminyak Beach, Tanah Lot, Kuta Beach, "
            "Mount Batur, and Nusa Dua."
        ),

        "food": (
            "Balinese and Indonesian dishes include nasi goreng, "
            "mie goreng, satay, babi guling, local rice dishes, "
            "and tropical fruits."
        ),

        "activities": (
            "Temple visits, beach activities, hiking, rice terrace "
            "tours, surfing, waterfalls, snorkeling, and cultural experiences."
        ),

        "transport": (
            "Private drivers, taxis, ride-hailing services, scooters, "
            "and tour vehicles are commonly used."
        ),

        "tips": (
            "Respect temple rules, carry modest clothing for temple "
            "visits, stay hydrated, and use reliable transportation."
        ),
    },


    # ========================================================
    # JAPAN
    # ========================================================

    "Japan": {
        "overview": (
            "Japan is a popular destination combining traditional "
            "culture, modern cities, temples, natural scenery, "
            "technology, and seasonal experiences."
        ),

        "places": (
            "Tokyo, Kyoto, Osaka, Mount Fuji, Nara, Hiroshima, "
            "Fushimi Inari Shrine, Arashiyama, and Shibuya."
        ),

        "food": (
            "Japanese cuisine includes sushi, ramen, tempura, udon, "
            "soba, takoyaki, rice dishes, and traditional seasonal food."
        ),

        "activities": (
            "Temple visits, city sightseeing, cherry blossom viewing, "
            "shopping, cultural experiences, hiking, and scenic train journeys."
        ),

        "transport": (
            "Japan Rail trains, Shinkansen, metro systems, buses, "
            "and local trains provide extensive transportation."
        ),

        "tips": (
            "Learn basic Japanese travel phrases, follow public etiquette, "
            "keep trains quiet, and consider suitable rail passes."
        ),
    },


    # ========================================================
    # RAJASTHAN
    # ========================================================

    "Rajasthan": {
        "overview": (
            "Rajasthan is an Indian state known for royal heritage, "
            "forts, palaces, deserts, colorful culture, handicrafts, "
            "and traditional cuisine."
        ),

        "places": (
            "Jaipur, Udaipur, Jodhpur, Jaisalmer, Pushkar, "
            "Amer Fort, City Palace, Mehrangarh Fort, "
            "Lake Pichola, and Jaisalmer Fort."
        ),

        "food": (
            "Rajasthani cuisine includes dal baati churma, "
            "gatte ki sabzi, ker sangri, laal maas, kachori, "
            "and traditional sweets."
        ),

        "activities": (
            "Fort visits, palace tours, desert safaris, camel rides, "
            "cultural performances, shopping, heritage walks, "
            "and traditional craft experiences."
        ),

        "transport": (
            "Trains, buses, taxis, private cars, and local "
            "auto-rickshaws are commonly used."
        ),

        "tips": (
            "Carry water, use sun protection, wear comfortable clothing, "
            "and allow enough time for long-distance travel between cities."
        ),
    },


    # ========================================================
    # KERALA
    # ========================================================

    "Kerala": {
        "overview": (
            "Kerala is a southern Indian destination known for "
            "backwaters, beaches, hill stations, wildlife, Ayurveda, "
            "greenery, and cultural heritage."
        ),

        "places": (
            "Alappuzha, Munnar, Kochi, Thekkady, Wayanad, Varkala, "
            "Kumarakom, Kovalam, and Fort Kochi."
        ),

        "food": (
            "Kerala cuisine includes appam, puttu, Kerala parotta, "
            "sadya, fish curry, coconut-based dishes, and traditional snacks."
        ),

        "activities": (
            "Houseboat cruises, hill station visits, wildlife experiences, "
            "beach activities, cultural tours, nature walks, "
            "and traditional experiences."
        ),

        "transport": (
            "Trains, buses, taxis, boats, auto-rickshaws, "
            "and private vehicles are common transportation options."
        ),

        "tips": (
            "Carry light clothing, rain protection when needed, "
            "comfortable footwear, and plan hill and backwater activities "
            "according to weather conditions."
        ),
    },


    # ========================================================
    # GENERAL TRAVEL PLANNING
    # ========================================================

    "Travel_Planning": {
        "overview": (
            "This travel planning guide explains how to create a practical "
            "trip plan by considering destination, duration, travelers, "
            "budget, transportation, accommodation, activities, food, "
            "weather, and personal preferences."
        ),

        "trip_planning_steps": (
            "Start by selecting the destination and travel dates. "
            "Decide the number of travelers and trip duration. "
            "Set a total budget and divide it among transportation, "
            "accommodation, food, activities, and emergency expenses."
        ),

        "budget_planning": (
            "A practical travel budget should include flights or other "
            "transportation, hotel costs, food, local transportation, "
            "sightseeing and activities, shopping, travel insurance "
            "when applicable, and an emergency reserve."
        ),

        "itinerary_planning": (
            "Create a day-by-day itinerary. Group nearby attractions "
            "together to reduce unnecessary travel time. Avoid scheduling "
            "too many activities in one day and keep free time for rest "
            "and unexpected changes."
        ),

        "transportation": (
            "Consider flights, trains, buses, taxis, rental vehicles, "
            "metro systems, and local transportation depending on the "
            "destination. Compare travel time, cost, convenience, and availability."
        ),

        "accommodation": (
            "Choose accommodation based on location, budget, ratings, "
            "facilities, safety, and distance from major attractions. "
            "Staying near public transportation can make sightseeing easier."
        ),

        "food": (
            "Include breakfast, lunch, dinner, snacks, and local food "
            "experiences in the travel plan. Travelers can balance "
            "restaurants with affordable local food options."
        ),

        "weather": (
            "Check expected weather before traveling. Consider temperature, "
            "rainfall, seasonal conditions, and outdoor activity requirements "
            "when preparing the itinerary."
        ),

        "travel_tips": (
            "Keep important documents secure, carry suitable clothing, "
            "maintain an emergency budget, check local rules, and keep "
            "some flexibility in the itinerary."
        ),

        "example_itinerary": (
            "A typical 4-night trip can include arrival and local exploration "
            "on Day 1, major attractions on Day 2, cultural or nature "
            "experiences on Day 3, shopping or additional sightseeing "
            "on Day 4, and departure on Day 5."
        ),
    },
}


# ============================================================
# CREATE PDF
# ============================================================

def create_pdf(destination, data):
    """
    Create a travel knowledge PDF for a destination.
    """

    # Keep the general planning PDF name clean.
    if destination == "Travel_Planning":
        file_path = (
            DOCUMENTS_DIR
            / "Travel_Planning_Guide.pdf"
        )
    else:
        file_path = (
            DOCUMENTS_DIR
            / f"{destination}_Travel_Guide.pdf"
        )

    document = SimpleDocTemplate(
        str(file_path),
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50,
    )

    styles = getSampleStyleSheet()

    story = []

    # ========================================================
    # TITLE
    # ========================================================

    title = (
        "Travel Planning Guide"
        if destination == "Travel_Planning"
        else f"{destination} Travel Guide"
    )

    story.append(
        Paragraph(
            title,
            styles["Title"],
        )
    )

    story.append(
        Spacer(1, 20)
    )

    # ========================================================
    # DESTINATION SECTIONS
    # ========================================================

    if destination == "Travel_Planning":

        sections = [
            (
                "Overview",
                data["overview"],
            ),
            (
                "Trip Planning Steps",
                data["trip_planning_steps"],
            ),
            (
                "Budget Planning",
                data["budget_planning"],
            ),
            (
                "Itinerary Planning",
                data["itinerary_planning"],
            ),
            (
                "Transportation",
                data["transportation"],
            ),
            (
                "Accommodation",
                data["accommodation"],
            ),
            (
                "Food Planning",
                data["food"],
            ),
            (
                "Weather Planning",
                data["weather"],
            ),
            (
                "Travel Tips",
                data["travel_tips"],
            ),
            (
                "Example Itinerary",
                data["example_itinerary"],
            ),
        ]

    else:

        sections = [
            (
                "Overview",
                data["overview"],
            ),
            (
                "Places to Visit",
                data["places"],
            ),
            (
                "Food and Cuisine",
                data["food"],
            ),
            (
                "Activities and Experiences",
                data["activities"],
            ),
            (
                "Transportation",
                data["transport"],
            ),
            (
                "Travel Tips",
                data["tips"],
            ),
        ]

    # ========================================================
    # ADD SECTIONS
    # ========================================================

    for section_title, content in sections:

        story.append(
            Paragraph(
                section_title,
                styles["Heading2"],
            )
        )

        story.append(
            Paragraph(
                content,
                styles["BodyText"],
            )
        )

        story.append(
            Spacer(1, 12)
        )

    # ========================================================
    # BUILD PDF
    # ========================================================

    document.build(story)

    print(
        f"Created: {file_path.name}"
    )


# ============================================================
# GENERATE ALL PDFs
# ============================================================

for destination, data in DESTINATIONS.items():

    create_pdf(
        destination,
        data,
    )


print()
print(
    "All travel PDFs created successfully."
)