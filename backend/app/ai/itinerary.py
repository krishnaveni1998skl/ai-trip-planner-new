import os
import json

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from app.ai.rag import search_rag


load_dotenv()


# =========================================================
# VALIDATE ITINERARY JSON
# =========================================================

def validate_itinerary(itinerary, expected_duration):
    """
    Validate the JSON structure returned by the LLM.
    """

    if not isinstance(itinerary, dict):
        return False, "LLM response is not a JSON object."

    required_fields = [
        "destination",
        "duration",
        "travel_style",
        "days",
    ]

    for field in required_fields:
        if field not in itinerary:
            return False, f"Missing required field: {field}"

    if not isinstance(itinerary["days"], list):
        return False, "The 'days' field must be a list."

    try:
        expected_days = int(expected_duration)
    except (TypeError, ValueError):
        return False, "Invalid trip duration."

    if len(itinerary["days"]) != expected_days:
        return (
            False,
            f"Expected {expected_days} days but received "
            f"{len(itinerary['days'])} days.",
        )

    for index, day in enumerate(itinerary["days"], start=1):

        if not isinstance(day, dict):
            return False, f"Day {index} is invalid."

        if "day" not in day:
            return False, f"Day {index} is missing the 'day' field."

        if "date" not in day:
            return False, f"Day {index} is missing the 'date' field."

        if "title" not in day:
            return False, f"Day {index} is missing the 'title' field."

        if "activities" not in day:
            return False, f"Day {index} is missing the 'activities' field."

        if not isinstance(day["activities"], list):
            return False, f"Activities for day {index} must be a list."

        for activity in day["activities"]:

            if not isinstance(activity, dict):
                return False, (
                    f"Invalid activity structure on day {index}."
                )

            if "time" not in activity:
                return False, (
                    f"Activity on day {index} is missing time."
                )

            if "activity" not in activity:
                return False, (
                    f"Activity on day {index} is missing activity name."
                )

            if "description" not in activity:
                return False, (
                    f"Activity on day {index} is missing description."
                )

    return True, None


# =========================================================
# GENERATE ITINERARY
# =========================================================

def generate_itinerary(trip_data):

    try:

        # =================================================
        # GROQ CONFIGURATION
        # =================================================

        api_key = os.getenv("GROQ_API_KEY")

        model = os.getenv(
            "GROQ_MODEL",
            "openai/gpt-oss-120b",
        )

        if not api_key:
            return {
                "success": False,
                "error_type": "configuration_error",
                "message": (
                    "AI service is not configured. "
                    "GROQ_API_KEY is missing."
                ),
                "itinerary": None,
            }

        # =================================================
        # TRIP DETAILS
        # =================================================

        destination = trip_data.get(
            "destination",
            "",
        ).strip()

        departure_city = trip_data.get(
            "departureCity",
            "",
        )

        start_date = trip_data.get(
            "startDate",
            "",
        )

        end_date = trip_data.get(
            "endDate",
            "",
        )

        duration = trip_data.get(
            "duration",
            0,
        )

        travelers = trip_data.get(
            "travelers",
            1,
        )

        budget = trip_data.get(
            "budget",
            0,
        )

        travel_style = trip_data.get(
            "travelStyle",
            "",
        )

        interests = trip_data.get(
            "interests",
            [],
        )

        # =================================================
        # BASIC VALIDATION
        # =================================================

        if not destination:
            return {
                "success": False,
                "error_type": "validation_error",
                "message": "Destination is required.",
                "itinerary": None,
            }

        try:
            duration = int(duration)
        except (TypeError, ValueError):
            return {
                "success": False,
                "error_type": "validation_error",
                "message": "Duration must be a valid number.",
                "itinerary": None,
            }

        if duration <= 0:
            return {
                "success": False,
                "error_type": "validation_error",
                "message": "Duration must be greater than zero.",
                "itinerary": None,
            }

        # =================================================
        # RAG SEARCH
        # =================================================

        rag_query = (
            f"Travel information, attractions, culture, "
            f"transportation, food, activities and places "
            f"in {destination}"
        )

        try:

            rag_results = search_rag(
                rag_query,
                destination=destination,
            )

        except Exception:

            # RAG failure should not crash itinerary generation.
            rag_results = []

        # =================================================
        # RAG CONTEXT
        # =================================================

        rag_context = "\n\n".join(
            result.get("content", "")
            for result in rag_results
            if isinstance(result, dict)
        )

        # =================================================
        # TRAVEL SOURCES
        # =================================================

        travel_sources = []

        for result in rag_results:

            source = result.get("source")

            if source:

                source_name = os.path.basename(source)

                if source_name not in travel_sources:
                    travel_sources.append(source_name)

        # =================================================
        # GROQ LLM
        # =================================================

        try:

            llm = ChatGroq(
                model=model,
                api_key=api_key,
                temperature=0.3,
            )

            prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        """
You are an expert AI travel planner.

Create a practical day-by-day travel itinerary.

IMPORTANT RULES:

- Use the user's trip details.
- Respect the destination.
- Respect the requested travel style.
- Respect the user's interests.
- Respect travelers and budget.
- Use the retrieved destination knowledge when relevant.
- Use only the provided RAG destination knowledge for destination-specific background information.
- Do not invent live flight information.
- Do not invent live hotel prices.
- Do not invent live restaurant availability.
- Do not invent live weather information.
- Live facts must come from the appropriate APIs/tools.
- Create realistic activities for each day.
- Do not exceed the requested number of days.
- Make the itinerary match the travel style.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not add explanations outside JSON.

Retrieved destination knowledge:

{rag_context}
                        """,
                    ),
                    (
                        "human",
                        """
Create an itinerary using these details:

Destination: {destination}
Departure City: {departure_city}
Start Date: {start_date}
End Date: {end_date}
Duration: {duration} days
Travelers: {travelers}
Budget: {budget}
Travel Style: {travel_style}
Interests: {interests}

Return exactly this structure:

{{
  "destination": "string",
  "duration": 0,
  "travel_style": "string",
  "days": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "string",
      "activities": [
        {{
          "time": "string",
          "activity": "string",
          "description": "string"
        }}
      ]
    }}
  ]
}}
                        """,
                    ),
                ]
            )

            # =================================================
            # LANGCHAIN CHAIN
            # =================================================

            chain = prompt | llm

            response = chain.invoke(
                {
                    "destination": destination,
                    "departure_city": departure_city,
                    "start_date": start_date,
                    "end_date": end_date,
                    "duration": duration,
                    "travelers": travelers,
                    "budget": budget,
                    "travel_style": travel_style,
                    "interests": ", ".join(
                        interests
                        if isinstance(interests, list)
                        else [str(interests)]
                    ),
                    "rag_context": rag_context,
                }
            )

        except Exception as e:

            error_text = str(e).lower()

            # =============================================
            # RATE LIMIT / QUOTA
            # =============================================

            if (
                "429" in error_text
                or "rate limit" in error_text
                or "quota" in error_text
                or "too many requests" in error_text
            ):

                return {
                    "success": False,
                    "error_type": "rate_limit",
                    "message": (
                        "AI service rate limit or quota reached. "
                        "Please try again later."
                    ),
                    "itinerary": None,
                }

            # =============================================
            # TIMEOUT
            # =============================================

            if (
                "timeout" in error_text
                or "timed out" in error_text
            ):

                return {
                    "success": False,
                    "error_type": "timeout",
                    "message": (
                        "AI service request timed out. "
                        "Please try again."
                    ),
                    "itinerary": None,
                }

            # =============================================
            # MODEL / API ERROR
            # =============================================

            return {
                "success": False,
                "error_type": "ai_service_error",
                "message": (
                    "Unable to generate itinerary because "
                    "the AI service is temporarily unavailable."
                ),
                "itinerary": None,
            }

        # =================================================
        # RESPONSE CONTENT
        # =================================================

        content = response.content

        if isinstance(content, list):

            content = "".join(
                item.get("text", "")
                for item in content
                if isinstance(item, dict)
            )

        if not isinstance(content, str):

            return {
                "success": False,
                "error_type": "invalid_response",
                "message": (
                    "AI returned an unexpected response format."
                ),
                "itinerary": None,
            }

        content = content.strip()

        # =================================================
        # JSON PARSING
        # =================================================

        try:

            itinerary = json.loads(content)

        except json.JSONDecodeError:

            # ---------------------------------------------
            # Remove markdown code fences
            # ---------------------------------------------

            cleaned_content = content.strip()

            if "```json" in cleaned_content:

                cleaned_content = cleaned_content.replace(
                    "```json",
                    "",
                    1,
                )

            cleaned_content = cleaned_content.replace(
                "```",
                "",
            ).strip()

            # ---------------------------------------------
            # Try normal JSON parsing again
            # ---------------------------------------------

            try:

                itinerary = json.loads(
                    cleaned_content
                )

            except json.JSONDecodeError:

                # -----------------------------------------
                # Extract JSON object from AI response
                # -----------------------------------------

                try:

                    start_index = cleaned_content.find("{")

                    end_index = cleaned_content.rfind("}")

                    if (
                        start_index == -1
                        or end_index == -1
                        or end_index <= start_index
                    ):
                        raise ValueError(
                            "No JSON object found."
                        )

                    json_text = cleaned_content[
                        start_index:end_index + 1
                    ]

                    itinerary = json.loads(
                        json_text
                    )

                except Exception:

                    print(
                        "Invalid LLM JSON response:"
                    )

                    print(
                        cleaned_content[:2000]
                    )

                    return {
                        "success": False,
                        "error_type": "invalid_json",
                        "message": (
                            "AI returned an invalid itinerary format. "
                            "Please try generating the trip again."
                        ),
                        "itinerary": None,
                    }

        # =================================================
        # STRUCTURED JSON VALIDATION
        # =================================================

        is_valid, validation_error = validate_itinerary(
            itinerary,
            duration,
        )

        if not is_valid:

            return {
                "success": False,
                "error_type": "schema_validation_error",
                "message": validation_error,
                "itinerary": None,
            }

        # =================================================
        # ADD SYSTEM FIELDS
        # =================================================

        itinerary["travel_sources"] = travel_sources

        itinerary["travel_style"] = travel_style

        # =================================================
        # SUCCESS RESPONSE
        # =================================================

        return {
            "success": True,
            "error_type": None,
            "message": "Itinerary generated successfully.",
            "itinerary": itinerary,
            "is_live": False,
        }

    # =====================================================
    # FINAL SAFETY NET
    # =====================================================

    except Exception as e:

        print(
            "Unexpected itinerary generation error:",
            e,
        )

        return {
            "success": False,
            "error_type": "unexpected_error",
            "message": (
                "Unable to generate itinerary. "
                "Please try again."
            ),
            "itinerary": None,
        }