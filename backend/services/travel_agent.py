import os

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent

from services.rag_service import search_knowledge

from tools.budget_tool import calculate_budget
from tools.currency_tool import convert_currency
from tools.weather_tool import get_weather
from tools.flight_tool import search_flights
from tools.hotel_tool import search_hotels
from tools.places_tool import search_places
from tools.restaurant_tool import search_restaurants


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(
        "GEMINI_API_KEY is missing from .env"
    )


# ============================================================
# GEMINI MODEL
# ============================================================

model = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    google_api_key=api_key,
    max_output_tokens=2000,
)


# ============================================================
# RAG TOOL
# ============================================================

def search_travel_knowledge(query: str) -> str:
    """
    Search the travel knowledge base for destination
    and travel planning information from curated PDF documents.
    """

    if not query or not query.strip():
        return "No RAG query was provided."

    results = search_knowledge(
        query=query,
        top_k=4,
    )

    if not results:
        return "No relevant travel knowledge was found."

    output = []

    for index, document in enumerate(results, start=1):

        content = document.page_content

        metadata = document.metadata or {}

        destination = metadata.get(
            "destination",
            "Unknown"
        )

        source = metadata.get(
            "source",
            "Unknown"
        )

        source_name = os.path.basename(source)

        output.append(
            f"""
RESULT {index}

Destination: {destination}
Source: {source_name}

Content:
{content}
"""
        )

    return "\n".join(output)


# ============================================================
# LANGCHAIN AGENT
# ============================================================

agent = create_agent(
    model=model,

    tools=[
        # RAG
        search_travel_knowledge,

        # Travel tools
        calculate_budget,
        convert_currency,
        get_weather,
        search_flights,
        search_hotels,
        search_places,
        search_restaurants,
    ],
)


# ============================================================
# TRAVEL AGENT FUNCTION
# ============================================================

def travel_agent(
    question: str,
) -> str:
    """
    Generate a personalized travel plan using
    LangChain, RAG, Gemini, and travel tools.
    """

    if not question or not question.strip():
        raise ValueError(
            "Question cannot be empty"
        )

    result = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": question,
                }
            ]
        }
    )

    messages = result.get(
        "messages",
        []
    )

    if not messages:
        return "No response received."

    # Find the last AI response
    for message in reversed(messages):

        content = getattr(
            message,
            "content",
            None
        )

        if not content:
            continue

        # Normal string response
        if isinstance(content, str):
            return content.strip()

        # Gemini structured content
        if isinstance(content, list):

            text_parts = []

            for item in content:

                if isinstance(item, dict):

                    if item.get("type") == "text":

                        text_parts.append(
                            item.get("text", "")
                        )

                elif isinstance(item, str):

                    text_parts.append(item)

            final_text = "\n".join(
                text_parts
            ).strip()

            if final_text:
                return final_text

    return "No final response received from the travel agent."