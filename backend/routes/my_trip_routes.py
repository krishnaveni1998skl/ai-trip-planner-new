import json

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from database import get_db
from models import Trip


router = APIRouter(
    prefix="/api/my-trips",
    tags=["My Trips"],
)


# ============================================================
# SAVE TRIP
# ============================================================

@router.post("")
def save_trip(
    trip_data: dict,
    db: Session = Depends(get_db),
):

    try:

        trip = Trip(
            destination=trip_data.get(
                "destination",
                "",
            ),

            start_date=trip_data.get(
                "start_date",
                "",
            ),

            end_date=trip_data.get(
                "end_date",
                "",
            ),

            travelers=int(
                trip_data.get(
                    "travelers",
                    1,
                )
            ),

            budget=float(
                trip_data.get(
                    "budget",
                    0,
                )
            ),

            currency=trip_data.get(
                "currency",
                "INR",
            ),

            travel_style=trip_data.get(
                "travel_style",
                "Adventure",
            ),

            interests=json.dumps(
                trip_data.get(
                    "interests",
                    [],
                )
            ),

            travel_plan=str(
                trip_data.get(
                    "travel_plan",
                    "",
                )
            ),
        )

        db.add(trip)
        db.commit()
        db.refresh(trip)

        return {
            "success": True,
            "message": "Trip saved successfully.",
            "trip_id": trip.id,
        }

    except Exception as error:

        db.rollback()

        print(
            "Save trip error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to save trip.",
        )


# ============================================================
# GET ALL TRIPS
# ============================================================

@router.get("")
def get_my_trips(
    db: Session = Depends(get_db),
):

    trips = (
        db.query(Trip)
        .order_by(
            Trip.created_at.desc()
        )
        .all()
    )

    result = []

    for trip in trips:

        try:
            interests = json.loads(
                trip.interests
            ) if trip.interests else []

        except Exception:
            interests = []

        result.append(
            {
                "id": trip.id,
                "destination": trip.destination,
                "start_date": trip.start_date,
                "end_date": trip.end_date,
                "travelers": trip.travelers,
                "budget": trip.budget,
                "currency": trip.currency,
                "travel_style": trip.travel_style,
                "interests": interests,
                "travel_plan": trip.travel_plan,
                "created_at": trip.created_at,
            }
        )

    return {
        "success": True,
        "trips": result,
    }


# ============================================================
# GET SINGLE TRIP
# ============================================================

@router.get("/{trip_id}")
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
):

    trip = (
        db.query(Trip)
        .filter(
            Trip.id == trip_id
        )
        .first()
    )

    if not trip:

        raise HTTPException(
            status_code=404,
            detail="Trip not found.",
        )

    try:

        interests = json.loads(
            trip.interests
        ) if trip.interests else []

    except Exception:

        interests = []

    return {
        "success": True,

        "trip": {
            "id": trip.id,
            "destination": trip.destination,
            "start_date": trip.start_date,
            "end_date": trip.end_date,
            "travelers": trip.travelers,
            "budget": trip.budget,
            "currency": trip.currency,
            "travel_style": trip.travel_style,
            "interests": interests,
            "travel_plan": trip.travel_plan,
            "created_at": trip.created_at,
        },
    }


# ============================================================
# DELETE TRIP
# ============================================================

@router.delete("/{trip_id}")
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
):

    trip = (
        db.query(Trip)
        .filter(
            Trip.id == trip_id
        )
        .first()
    )

    if not trip:

        raise HTTPException(
            status_code=404,
            detail="Trip not found.",
        )

    db.delete(trip)
    db.commit()

    return {
        "success": True,
        "message": "Trip deleted successfully.",
    }