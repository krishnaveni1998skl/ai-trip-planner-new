from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.travel_agent import travel_agent


router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class ChatRequest(BaseModel):

    message: str = Field(
        ...,
        min_length=1,
    )

    destination: str | None = None


# ============================================================
# CHAT
# ============================================================

@router.post("")
def chat(request: ChatRequest):

    message = request.message.strip()

    if not message:

        raise HTTPException(
            status_code=400,
            detail={
                "error": "EMPTY_MESSAGE",
                "message": "Please enter a message.",
            },
        )

    # --------------------------------------------------------
    # Add destination context if available
    # --------------------------------------------------------

    if request.destination:

        question = f"""
The user is planning a trip to:

Destination:
{request.destination}

User question:
{message}

Answer the user's travel question clearly.
Use the available travel knowledge base and
travel tools whenever appropriate.

Do not invent information.
If the required information is unavailable,
clearly say so.
"""

    else:

        question = f"""
The user has asked a travel-related question.

User question:
{message}

Answer clearly using the available travel
knowledge base and travel tools whenever
appropriate.

Do not invent information.
If information is unavailable, clearly say so.
"""

    # ========================================================
    # CALL TRAVEL AGENT
    # ========================================================

    try:

        answer = travel_agent(
            question
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_REQUEST",
                "message": str(error),
            },
        )

    except Exception as error:

        error_text = str(error)

        print(
            "Chat error:",
            error_text,
        )

        # ----------------------------------------------------
        # GEMINI QUOTA
        # ----------------------------------------------------

        if (
            "429" in error_text
            or "RESOURCE_EXHAUSTED"
            in error_text
            or "quota" in error_text.lower()
            or "rate limit"
            in error_text.lower()
        ):

            raise HTTPException(
                status_code=429,
                detail={
                    "error":
                        "AI_QUOTA_EXCEEDED",

                    "message":
                        "The AI service quota has been exceeded. Please try again later.",
                },
            )

        # ----------------------------------------------------
        # GENERAL ERROR
        # ----------------------------------------------------

        raise HTTPException(
            status_code=503,
            detail={
                "error":
                    "AI_SERVICE_ERROR",

                "message":
                    "The AI service is temporarily unavailable.",
            },
        )

    # ========================================================
    # EMPTY RESPONSE
    # ========================================================

    if not answer:

        raise HTTPException(
            status_code=503,
            detail={
                "error":
                    "EMPTY_AI_RESPONSE",

                "message":
                    "The AI service returned an empty response.",
            },
        )

    # ========================================================
    # SUCCESS
    # ========================================================

    return {
        "success": True,

        "message":
            "Response generated successfully.",

        "user_message":
            message,

        "destination":
            request.destination,

        "answer":
            answer,
    }