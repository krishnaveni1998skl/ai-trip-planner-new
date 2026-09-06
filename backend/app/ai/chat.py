import os
import json

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()


def modify_itinerary(trip_data, current_itinerary, user_message):
    api_key = os.getenv("GROQ_API_KEY")

    model = os.getenv(
        "GROQ_MODEL",
        "openai/gpt-oss-120b",
    )

    if not api_key:
        raise Exception("GROQ_API_KEY is not configured")

    llm = ChatGroq(
        model=model,
        api_key=api_key,
        temperature=0.2,
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
You are an expert AI travel planner.

The user already has an existing travel itinerary.

Modify the existing itinerary according to the
user's new request.

IMPORTANT RULES:

- Preserve all unchanged trip information.
- Do not restart the trip.
- Do not remove existing activities unless the user asks.
- Apply only the requested modification.
- Respect the original destination, dates, duration and travelers.
- Keep the exact number of days.
- Keep dates unchanged unless the user explicitly requests
  a date change.
- Do not invent live flight, hotel, restaurant or weather data.
- Return ONLY valid JSON.
- Do not use markdown.

The output must follow this structure:

{{
  "destination": "string",
  "duration": 0,
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
            (
                "human",
                """
ORIGINAL TRIP:

{trip_data}

CURRENT ITINERARY:

{current_itinerary}

USER'S NEW REQUEST:

{user_message}

Modify the CURRENT ITINERARY according to the
USER'S NEW REQUEST.

Return the complete updated itinerary.
                """,
            ),
        ]
    )

    chain = prompt | llm

    response = chain.invoke(
        {
            "trip_data": json.dumps(
                trip_data,
                ensure_ascii=False,
            ),
            "current_itinerary": json.dumps(
                current_itinerary,
                ensure_ascii=False,
            ),
            "user_message": user_message,
        }
    )

    content = response.content

    if isinstance(content, list):
        content = "".join(
            item.get("text", "")
            for item in content
            if isinstance(item, dict)
        )

    # Remove markdown code fences if the model returns them
    content = content.strip()

    if content.startswith("```json"):
        content = content[7:]

    elif content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    return json.loads(content)