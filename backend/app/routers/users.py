from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["Users & Patients"])

@router.get("", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all registered patients and athlete profiles."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        UserResponse(
            user_id=u.user_id,
            full_name=u.full_name,
            email=u.email,
            age=u.age,
            is_athlete=u.is_athlete,
            fat_free_mass_kg=u.fat_free_mass_kg,
            is_pregnant=u.is_pregnant,
            gestational_age_weeks=u.gestational_age_weeks,
            created_at=u.created_at
        ) for u in users
    ]

@router.post("", response_model=UserResponse)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new patient or athlete."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        age=payload.age,
        is_athlete=payload.is_athlete,
        fat_free_mass_kg=payload.fat_free_mass_kg,
        is_pregnant=payload.is_pregnant,
        gestational_age_weeks=payload.gestational_age_weeks
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserResponse(
        user_id=new_user.user_id,
        full_name=new_user.full_name,
        email=new_user.email,
        age=new_user.age,
        is_athlete=new_user.is_athlete,
        fat_free_mass_kg=new_user.fat_free_mass_kg,
        is_pregnant=new_user.is_pregnant,
        gestational_age_weeks=new_user.gestational_age_weeks,
        created_at=new_user.created_at
    )

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get single user profile by ID."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        age=user.age,
        is_athlete=user.is_athlete,
        fat_free_mass_kg=user.fat_free_mass_kg,
        is_pregnant=user.is_pregnant,
        gestational_age_weeks=user.gestational_age_weeks,
        created_at=user.created_at
    )
