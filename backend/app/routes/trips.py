from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.trip import Trip


router = APIRouter(prefix="/api/trips", tags=["Trips"])


class TripCreate(BaseModel):
    destination: str
    country: str | None = None
    duration_days: int
    travelers: int
    budget: float | None = None
    currency: str = "INR"
    departure_city: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    travel_style: str | None = None
    interests: list[str] = []
    itinerary: dict | list | None = None
    expenses: dict | None = None
    status: str = "planned"


@router.post("")
def create_trip(trip_data: TripCreate, db: Session = Depends(get_db)):
    try:
        trip = Trip(
            destination=trip_data.destination,
            country=trip_data.country,
            duration_days=trip_data.duration_days,
            travelers=trip_data.travelers,
            budget=trip_data.budget,
            currency=trip_data.currency,
            departure_city=trip_data.departure_city,
            start_date=trip_data.start_date,
            end_date=trip_data.end_date,
            travel_style=trip_data.travel_style,
            interests=trip_data.interests,
            itinerary=trip_data.itinerary,
            expenses=trip_data.expenses,
            status=trip_data.status,
        )

        db.add(trip)
        db.commit()
        db.refresh(trip)

        return {
            "success": True,
            "message": "Trip saved successfully",
            "trip_id": trip.id,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save trip: {str(e)}",
        )


@router.get("")
def get_trips(db: Session = Depends(get_db)):
    trips = db.query(Trip).order_by(Trip.id.desc()).all()

    return {
        "success": True,
        "count": len(trips),
        "trips": [
            {
                "id": trip.id,
                "destination": trip.destination,
                "country": trip.country,
                "duration_days": trip.duration_days,
                "travelers": trip.travelers,
                "budget": float(trip.budget) if trip.budget is not None else 0,
                "currency": trip.currency,
                "departure_city": trip.departure_city,
                "start_date": trip.start_date.isoformat() if trip.start_date else None,
                "end_date": trip.end_date.isoformat() if trip.end_date else None,
                "travel_style": trip.travel_style,
                "interests": trip.interests or [],
                "itinerary": trip.itinerary,
                "expenses": trip.expenses,
                "status": trip.status,
            }
            for trip in trips
        ],
    }