import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    age = Column(Integer, nullable=False)
    is_athlete = Column(Boolean, default=False)
    fat_free_mass_kg = Column(Float, nullable=True)
    is_pregnant = Column(Boolean, default=False)
    gestational_age_weeks = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    telemetry_logs = relationship("DailyTelemetry", back_populates="user", cascade="all, delete-orphan")
    athletic_logs = relationship("AthleticLog", back_populates="user", cascade="all, delete-orphan")
    symptom_logs = relationship("ClinicalSymptomLog", back_populates="user", cascade="all, delete-orphan")
    risk_inferences = relationship("RiskInference", back_populates="user", cascade="all, delete-orphan")

class DailyTelemetry(Base):
    __tablename__ = "daily_telemetry"

    telemetry_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    recorded_date = Column(Date, nullable=False, default=date.today)
    rhr_bpm = Column(Float, nullable=False)
    hrv_rmssd_ms = Column(Float, nullable=False)
    systolic_bp_mmhg = Column(Float, nullable=False)
    diastolic_bp_mmhg = Column(Float, nullable=False)
    map_mmhg = Column(Float, nullable=False)
    basal_body_temp_c = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="telemetry_logs")

class AthleticLog(Base):
    __tablename__ = "athletic_logs"

    log_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    logged_date = Column(Date, nullable=False, default=date.today)
    caloric_intake_kcal = Column(Float, nullable=False)
    exercise_expenditure_kcal = Column(Float, nullable=False)
    workout_duration_mins = Column(Integer, nullable=False)
    perceived_exertion_rpe = Column(Integer, nullable=True)
    calculated_ea = Column(Float, nullable=True)
    calculated_acwr = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="athletic_logs")

class ClinicalSymptomLog(Base):
    __tablename__ = "clinical_symptom_logs"

    symptom_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    logged_date = Column(Date, nullable=False, default=date.today)
    snomed_code = Column(String(50), nullable=False)
    symptom_name = Column(String(100), nullable=False)
    severity_score = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="symptom_logs")

class RiskInference(Base):
    __tablename__ = "risk_inferences"

    inference_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    mode = Column(String(30), nullable=False)  # 'ENDOCRINE', 'ATHLETIC', 'GESTATIONAL'
    predicted_risk_score = Column(Float, nullable=False)
    primary_diagnosis_flag = Column(String(100), nullable=False)
    shap_feature_attributions = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="risk_inferences")

class CommunityPost(Base):
    __tablename__ = "community_posts"

    post_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    author_display_name = Column(String(100), nullable=False, default="Anonymous Athlete")
    is_anonymous = Column(Boolean, default=False)
    topic_circle = Column(String(60), nullable=False, default="General Wellness")
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
