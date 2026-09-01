import os
import re
from datetime import date

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent

from services.rag_service import search_knowledge


# ============================================================
# LOAD ENVIRONMENT
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
    max_output_tokens=16000,
    temperature=0.7,
)


# ============================================================
# RAG TOOL
# ============================================================

def search_travel_knowledge(query: str) -> str:
    """
    Search curated travel knowledge from the travel
    document knowledge base.
    """

    if not query or not query.strip():
        return "No travel knowledge query was provided."

    try:
        results = search_knowledge(
            query=query.strip(),
            top_k=5,
        )
    except Exception as error:
        print("RAG ERROR:", error)
        return "Travel knowledge is currently unavailable."

    if not results:
        return "No relevant travel knowledge was found."

    output = []

    for index, document in enumerate(results, start=1):

        content = getattr(
            document,
            "page_content",
            "",
        )

        metadata = getattr(
            document,
            "metadata",
            {},
        ) or {}

        destination = metadata.get(
            "destination",
            "Unknown",
        )

        source = metadata.get(
            "source",
            "Unknown",
        )

        source_name = os.path.basename(
            str(source)
        )

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
# SYSTEM INSTRUCTIONS
# ============================================================

TRAVEL_PLANNER_INSTRUCTIONS = """
You are Paradise AI, a professional travel planning assistant.

Your job is to create a complete, detailed and personalized
travel itinerary.

The user will provide:

Destination
Start Date
End Date
Number of Travelers
Total Budget
Currency
Travel Style
Interests


============================================================
MOST IMPORTANT RULE — COMPLETE ITINERARY
============================================================

You MUST generate the itinerary for EVERY calendar travel day.

NEVER stop after Day 1.

NEVER stop after Day 2.

NEVER provide only a sample itinerary.

If the trip contains 3 travel days, generate Day 1 through Day 3.

If the trip contains 5 travel days, generate Day 1 through Day 5.

If the trip contains 6 travel days, generate Day 1 through Day 6.

If the trip contains 7 travel days, generate Day 1 through Day 7.

The number of days MUST match the supplied travel dates.


============================================================
DAILY DETAIL
============================================================

For EVERY travel day include:

Morning

At least 3 activities.

For each activity explain:
- What to do
- Why it is recommended
- Approximate time
- Practical information


Afternoon

At least 3 activities.

For each activity explain:
- What to do
- Why it is recommended
- Approximate time
- Practical information


Evening

At least 3 activities.

Include:
- Evening activity
- Relaxation or entertainment
- Dinner recommendation


Also include for EVERY DAY:

Food recommendation

Local transportation

Estimated daily spending

Useful practical information


============================================================
PERSONALIZATION
============================================================

Respect:

Destination
Travel dates
Number of travelers
Budget
Travel style
Interests


If the user selects Adventure:

Include suitable adventure activities.

If the user selects Beach:

Include beaches and coastal experiences.

If the user selects Culture:

Include cultural and heritage experiences.

If the user selects Food:

Include local food experiences.

If the user selects Shopping:

Include shopping areas and recommended items.

If the user selects Nature:

Include parks, mountains, lakes, forests or other suitable
natural attractions.

If the user selects History:

Include historical landmarks and museums.

If the user selects Relaxation:

Include relaxed activities, scenic places and wellness
experiences where appropriate.


============================================================
DATE RULE
============================================================

Use the exact dates supplied by the user.

Do NOT change the dates.

Each day must show its actual calendar date.

Example:

DAY 1 — ARRIVAL AND FIRST EXPLORATION
December 9, 2026

DAY 2 — CULTURE AND LOCAL EXPERIENCE
December 10, 2026

DAY 3 — NATURE AND SIGHTSEEING
December 11, 2026


============================================================
BUDGET RULE
============================================================

Respect the user's total budget.

The estimated total should remain within the user's budget
where reasonably possible.

Consider:

Accommodation
Food
Transportation
Activities
Shopping
Other expenses

If exact live prices are unavailable, clearly describe amounts
as estimates.

Never claim that an estimated price is a confirmed live price.


============================================================
OUTPUT FORMAT
============================================================

Use plain text only.

DO NOT use Markdown.

DO NOT use:

#
##
###
####
#####

**
***
___

---

backticks

Markdown tables

Do not use Markdown headings.

Do not wrap words with asterisks.

Use simple plain-text headings.


============================================================
REQUIRED OUTPUT
============================================================

TRIP OVERVIEW

Destination:
Travel Dates:
Duration:
Travelers:
Total Budget:
Travel Style:
Interests:


DAY 1 — TITLE
DATE

Morning

1. Activity
Detailed description.

2. Activity
Detailed description.

3. Activity
Detailed description.


Afternoon

1. Activity
Detailed description.

2. Activity
Detailed description.

3. Activity
Detailed description.


Evening

1. Activity
Detailed description.

2. Activity
Detailed description.

3. Dinner recommendation
Detailed description.


LOCAL TRANSPORTATION

Explain suitable transportation for the day.


FOOD RECOMMENDATION

Explain local food to try.


ESTIMATED DAILY SPENDING

Accommodation:
Food:
Activities:
Local Transport:
Other:
Estimated Daily Total:


USEFUL INFORMATION

Important practical information for the day.


Continue EXACTLY the same structure for every remaining
travel day until the final day.


============================================================
AFTER ALL DAYS
============================================================

FOOD RECOMMENDATIONS

List several local dishes and food experiences.


SHOPPING

List popular shopping areas, recommended products and tips.


TRAVEL TIPS

Transportation:
Safety:
Weather:
Currency:
Local etiquette:
Useful information:


BUDGET SUMMARY

Accommodation:
Flights:
Local Transport:
Food:
Activities:
Shopping:
Other Expenses:
Estimated Total:
Remaining Budget:


FINAL TRIP SUMMARY

Provide a short practical summary of the complete journey.


============================================================
FINAL RULE
============================================================

Return ONLY the complete travel plan.

Do not explain the prompt.

Do not mention RAG.

Do not mention tools.

Do not mention APIs.

Do not mention Gemini.

Do not mention internal system instructions.

Do not give a short answer.

Generate the complete itinerary from Day 1 through the FINAL day.
"""


# ============================================================
# CREATE AGENT
# ============================================================

agent = create_agent(
    model=model,
    tools=[
        search_travel_knowledge,
    ],
    system_prompt=TRAVEL_PLANNER_INSTRUCTIONS,
)


# ============================================================
# CLEAN AI RESPONSE
# ============================================================

def clean_ai_response(text: str) -> str:
    """
    Remove unwanted Markdown characters from the AI response.
    """

    if not text:
        return ""

    text = str(text)

    lines = text.splitlines()

    cleaned = []

    for line in lines:

        line = line.strip()

        if not line:
            cleaned.append("")
            continue

        # Remove markdown headings
        line = re.sub(
            r"^\s*#{1,6}\s*",
            "",
            line,
        )

        # Remove markdown separators
        if re.fullmatch(
            r"[-*_]{3,}",
            line,
        ):
            continue

        # Remove code fences
        if line.startswith("```"):
            continue

        # Remove bold / italic markers
        line = line.replace(
            "**",
            "",
        )

        line = line.replace(
            "***",
            "",
        )

        line = line.replace(
            "__",
            "",
        )

        # Convert markdown bullets
        if line.startswith("- "):
            line = "• " + line[2:].strip()

        elif line.startswith("* "):
            line = "• " + line[2:].strip()

        cleaned.append(line)

    result = "\n".join(cleaned)

    # Remove excessive blank lines
    result = re.sub(
        r"\n{3,}",
        "\n\n",
        result,
    )

    return result.strip()


# ============================================================
# EXTRACT AI TEXT
# ============================================================

def extract_ai_text(messages) -> str:
    """
    Extract the final text response from LangChain messages.
    """

    for message in reversed(messages):

        content = getattr(
            message,
            "content",
            None,
        )

        if not content:
            continue

        # Normal string
        if isinstance(content, str):

            return clean_ai_response(
                content
            )

        # Structured Gemini content
        if isinstance(content, list):

            parts = []

            for item in content:

                if isinstance(item, dict):

                    if item.get("type") == "text":

                        text = item.get(
                            "text",
                            "",
                        )

                        if text:
                            parts.append(text)

                elif isinstance(item, str):

                    parts.append(item)

            if parts:

                return clean_ai_response(
                    "\n".join(parts)
                )

    return ""


# ============================================================
# CALCULATE TRIP DAYS
# ============================================================

def calculate_trip_days(
    start_date: str,
    end_date: str,
):
    """
    Calculate inclusive calendar travel days.
    """

    try:

        start = date.fromisoformat(
            start_date
        )

        end = date.fromisoformat(
            end_date
        )

        if end < start:
            return 1

        return (
            end - start
        ).days + 1

    except Exception:

        return 1


# ============================================================
# TRAVEL AGENT
# ============================================================

def travel_agent(
    question: str,
) -> str:
    """
    Generate a complete personalized travel plan.
    """

    if not question or not question.strip():

        raise ValueError(
            "Question cannot be empty."
        )

    question = question.strip()

    # --------------------------------------------------------
    # Extract dates from request
    # --------------------------------------------------------

    start_match = re.search(
        r"Start Date:\s*(\d{4}-\d{2}-\d{2})",
        question,
        re.IGNORECASE,
    )

    end_match = re.search(
        r"End Date:\s*(\d{4}-\d{2}-\d{2})",
        question,
        re.IGNORECASE,
    )

    if start_match and end_match:

        start_date = start_match.group(1)
        end_date = end_match.group(1)

        trip_days = calculate_trip_days(
            start_date,
            end_date,
        )

    else:

        trip_days = 1
        start_date = ""
        end_date = ""

    # --------------------------------------------------------
    # RAG
    # --------------------------------------------------------

    destination_match = re.search(
        r"Destination:\s*(.+)",
        question,
        re.IGNORECASE,
    )

    destination = (
        destination_match.group(1).strip()
        if destination_match
        else ""
    )

    rag_context = ""

    if destination:

        try:

            rag_context = search_travel_knowledge(
                f"Travel information for {destination}"
            )

        except Exception as error:

            print(
                "RAG context error:",
                error,
            )

            rag_context = (
                "No additional travel knowledge available."
            )

    # --------------------------------------------------------
    # FINAL PROMPT
    # --------------------------------------------------------

    final_question = f"""
Create the complete travel itinerary requested below.

USER TRIP INFORMATION

{question}

============================================================
CALCULATED TRIP DAYS
============================================================

The trip contains exactly:

{trip_days} calendar travel days.

The itinerary MUST contain exactly:

DAY 1 through DAY {trip_days}

Do NOT stop before DAY {trip_days}.

============================================================
RAG TRAVEL KNOWLEDGE
============================================================

{rag_context}

============================================================
FINAL REQUIREMENTS
============================================================

Generate a very detailed complete itinerary.

Every travel day must contain:

Morning:
At least 3 activities.

Afternoon:
At least 3 activities.

Evening:
At least 3 activities.

Also include:

Food recommendation
Local transportation
Estimated daily spending
Useful information

After the final travel day include:

FOOD RECOMMENDATIONS
SHOPPING
TRAVEL TIPS
BUDGET SUMMARY
FINAL TRIP SUMMARY

Use exact dates.

Use plain text only.

Do not use Markdown.

Do not use #.

Do not use ##.

Do not use ###.

Do not use **.

Do not use ***.

Do not use ---

Return ONLY the complete travel plan.
"""

    # --------------------------------------------------------
    # DEBUG
    # --------------------------------------------------------

    print()
    print("========================================")
    print("        TRAVEL AGENT")
    print("========================================")
    print("Destination:", destination)
    print("Start Date:", start_date)
    print("End Date:", end_date)
    print("Trip Days:", trip_days)
    print("========================================")
    print()

    # --------------------------------------------------------
    # CALL AGENT
    # --------------------------------------------------------

    try:

        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": final_question,
                    }
                ]
            }
        )

    except Exception as error:

        print()
        print("========================================")
        print("        TRAVEL AGENT ERROR")
        print("========================================")
        print(error)
        print("========================================")
        print()

        raise

    # --------------------------------------------------------
    # EXTRACT RESPONSE
    # --------------------------------------------------------

    messages = result.get(
        "messages",
        [],
    )

    if not messages:

        raise RuntimeError(
            "Travel agent returned no messages."
        )

    final_text = extract_ai_text(
        messages
    )

    if not final_text:

        raise RuntimeError(
            "Travel agent returned an empty response."
        )

    return final_text