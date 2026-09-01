from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import func

from database import Base


# ============================================================
# TRIP MODEL
# ============================================================

class Trip(Base):

    __tablename__ = "trips"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    destination = Column(
        String(200),
        nullable=False,
    )

    start_date = Column(
        String(20),
        nullable=False,
    )

    end_date = Column(
        String(20),
        nullable=False,
    )

    travelers = Column(
        Integer,
        nullable=False,
    )

    budget = Column(
        Float,
        nullable=False,
    )

    currency = Column(
        String(10),
        default="INR",
    )

    travel_style = Column(
        String(100),
        default="Adventure",
    )

    interests = Column(
        Text,
        nullable=True,
    )

    travel_plan = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )