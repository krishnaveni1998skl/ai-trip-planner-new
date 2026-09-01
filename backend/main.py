from datetime import date

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.travel_agent import travel_agent

from database import Base, engine
from routes.chat_routes import router as chat_router
from routes.my_trip_routes import router as my_trip_router
from models import Trip
# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="AI Trip Planner API",
    description="AI-powered travel planning backend",
    version="1.0.0",
)
Base.metadata.create_all(
    bind=engine
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(chat_router)

app.include_router(
    my_trip_router
)
# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class TripPlanRequest(BaseModel):

    destination: str = Field(
        ...,
        min_length=2,
    )

    start_date: str

    end_date: str

    travelers: int = Field(
        ...,
        ge=1,
    )

    budget: float = Field(
        ...,
        gt=0,
    )

    travel_style: str = "Adventure"

    interests: list[str] = Field(
        default_factory=list,
    )

    currency: str = "INR"


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def home():

    return {
        "message": "AI Trip Planner API is running",
        "status": "success",
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "AI Trip Planner",
    }


# ============================================================
# DATE VALIDATION
# ============================================================

def validate_dates(
    start_date: str,
    end_date: str,
):
    """
    Validate start date and end date.
    """

    try:

        start = date.fromisoformat(
            start_date
        )

        end = date.fromisoformat(
            end_date
        )

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_DATE",
                "message": (
                    "Please provide valid dates "
                    "in YYYY-MM-DD format."
                ),
            },
        )

    if end <= start:

        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_DATE_RANGE",
                "message": (
                    "End date must be after "
                    "start date."
                ),
            },
        )

    return start, end


# ============================================================
# PLAN TRIP
# ============================================================

@app.post("/api/plan-trip")
def plan_trip(
    request: TripPlanRequest,
):

    # ========================================================
    # BASIC VALIDATION
    # ========================================================

    destination = request.destination.strip()

    if not destination:

        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_DESTINATION",
                "message": (
                    "Destination cannot be empty."
                ),
            },
        )

    # ========================================================
    # DATE VALIDATION
    # ========================================================

    start_date, end_date = validate_dates(
        request.start_date,
        request.end_date,
    )

    # ========================================================
    # TRAVELER VALIDATION
    # ========================================================

    if request.travelers < 1:

        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_TRAVELERS",
                "message": (
                    "Number of travelers must "
                    "be at least 1."
                ),
            },
        )

    # ========================================================
    # BUDGET VALIDATION
    # ========================================================

    if request.budget <= 0:

        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_BUDGET",
                "message": (
                    "Budget must be greater than 0."
                ),
            },
        )

    # ========================================================
    # INTERESTS
    # ========================================================

    interests = [
        interest.strip()
        for interest in request.interests
        if interest
        and interest.strip()
    ]

    interests_text = (
        ", ".join(interests)
        if interests
        else "No specific interests provided"
    )

    # ========================================================
    # TRAVEL STYLE
    # ========================================================

    travel_style = (
        request.travel_style.strip()
        if request.travel_style
        else "General"
    )

    # ========================================================
    # AI PROMPT
    # ========================================================

    question = f"""
Create a complete personalized travel plan.

Destination:
{destination}

Start Date:
{request.start_date}

End Date:
{request.end_date}

Number of Travelers:
{request.travelers}

Total Budget:
{request.budget} {request.currency}

Travel Style:
{travel_style}

Interests:
{interests_text}

Please use the available travel knowledge base
and available travel tools.

Create the travel plan according to the exact
start date and end date.

Include:

1. Trip overview
2. Day-by-day itinerary
3. Places to visit
4. Hotel options
5. Flight options
6. Restaurant recommendations
7. Weather information
8. Transportation
9. Currency conversion if applicable
10. Detailed budget breakdown
11. Travel tips

Important instructions:

- Use the available travel tools whenever appropriate.
- Use the available travel knowledge base.
- Do not invent missing information.
- Clearly mention when information is unavailable.
- Keep the estimated cost within the user's budget
  where possible.
- Consider the number of travelers.
- Consider the selected travel style.
- Consider the selected interests.
- Calculate the itinerary using the exact
  start date and end date.
- Provide a clear day-by-day plan.
"""

    # ========================================================
    # LOG REQUEST
    # ========================================================

    print()
    print("========================================")
    print("        AI TRIP PLANNER REQUEST")
    print("========================================")
    print(f"Destination : {destination}")
    print(f"Start Date  : {request.start_date}")
    print(f"End Date    : {request.end_date}")
    print(f"Travelers   : {request.travelers}")
    print(
        f"Budget      : "
        f"{request.budget} {request.currency}"
    )
    print(f"Travel Style: {travel_style}")
    print(f"Interests   : {interests_text}")
    print("========================================")
    print()

    # ========================================================
    # CALL AI AGENT
    # ========================================================

    try:

        result = travel_agent(
            question
        )

    # ========================================================
    # VALUE ERROR
    # ========================================================

    except ValueError as error:

        print(
            "Validation error:",
            error,
        )

        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_REQUEST",
                "message": str(error),
            },
        )

    # ========================================================
    # GEMINI QUOTA / RATE LIMIT
    # ========================================================

    except Exception as error:

        error_text = str(error)

        print(
            "AI service error:",
            error_text,
        )

        # ----------------------------------------------------
        # Gemini 429 / quota
        # ----------------------------------------------------

        if (
            "429" in error_text
            or "RESOURCE_EXHAUSTED"
            in error_text
            or "quota" in error_text.lower()
            or "rate limit" in error_text.lower()
        ):

            raise HTTPException(
                status_code=429,
                detail={
                    "error": "AI_QUOTA_EXCEEDED",
                    "message": (
                        "The AI service quota has "
                        "been exceeded. "
                        "Please try again later."
                    ),
                },
            )

        # ----------------------------------------------------
        # API KEY ERROR
        # ----------------------------------------------------

        if (
            "API key" in error_text
            or "api_key" in error_text
            or "GEMINI_API_KEY"
            in error_text
        ):

            raise HTTPException(
                status_code=503,
                detail={
                    "error": "AI_CONFIGURATION_ERROR",
                    "message": (
                        "AI service is not "
                        "configured correctly."
                    ),
                },
            )

        # ----------------------------------------------------
        # RAG / VECTOR STORE ERROR
        # ----------------------------------------------------

        if (
            "Chroma" in error_text
            or "embedding" in error_text.lower()
            or "PDF" in error_text
            or "vector" in error_text.lower()
        ):

            raise HTTPException(
                status_code=503,
                detail={
                    "error": "RAG_SERVICE_ERROR",
                    "message": (
                        "Travel knowledge service "
                        "is temporarily unavailable."
                    ),
                },
            )

        # ----------------------------------------------------
        # GENERAL AI ERROR
        # ----------------------------------------------------

        raise HTTPException(
            status_code=503,
            detail={
                "error": "AI_SERVICE_ERROR",
                "message": (
                    "Unable to generate the "
                    "travel plan right now."
                ),
            },
        )

    # ========================================================
    # EMPTY RESULT
    # ========================================================

    if not result:

        raise HTTPException(
            status_code=503,
            detail={
                "error": "EMPTY_AI_RESPONSE",
                "message": (
                    "The AI service returned "
                    "an empty response."
                ),
            },
        )

    # ========================================================
    # SUCCESS RESPONSE
    # ========================================================

    return {
        "success": True,

        "message": (
            "Travel plan generated successfully."
        ),

        "trip_request": {

            "destination":
                destination,

            "start_date":
                request.start_date,

            "end_date":
                request.end_date,

            "travelers":
                request.travelers,

            "budget":
                request.budget,

            "currency":
                request.currency,

            "travel_style":
                travel_style,

            "interests":
                interests,
        },

        "travel_plan":
            result,
    }


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )