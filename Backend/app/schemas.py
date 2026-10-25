from datetime import date, datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

# --- Symptom Schemas ---
class SymptomInput(BaseModel):
    snomed_code: str
    severity: int = Field(ge=1, le=5)
    symptom_name: Optional[str] = None
    notes: Optional[str] = None

class SymptomResponse(BaseModel):
    symptom_id: str
    snomed_code: str
    symptom_name: str
    severity_score: int
    notes: Optional[str] = None
    logged_date: date

# --- Telemetry Schemas ---
class TelemetryIngestRequest(BaseModel):
    user_id: str
    recorded_date: date
    systolic_bp: float
    diastolic_bp: float
    rhr_bpm: float
    hrv_rmssd: float
    basal_body_temp_c: Optional[float] = None
    weight_kg: Optional[float] = None
    symptoms: Optional[List[SymptomInput]] = []

class TelemetryIngestResponse(BaseModel):
    status: str = "success"
    telemetry_id: str
    calculated_map: float
    message: Optional[str] = "Telemetry logged successfully"

class TelemetryHistoryItem(BaseModel):
    telemetry_id: str
    recorded_date: date
    systolic_bp: float
    diastolic_bp: float
    map_mmhg: float
    rhr_bpm: float
    hrv_rmssd_ms: float
    basal_body_temp_c: Optional[float] = None
    weight_kg: Optional[float] = None

# --- Endocrine Schemas ---
class EndocrineInferenceRequest(BaseModel):
    user_id: str
    lh_fsh_ratio: float = Field(..., description="Luteinizing Hormone to FSH ratio")
    free_testosterone_ng_dl: float = Field(..., description="Free testosterone level in ng/dL")
    cycle_length_variance_days: float = Field(..., description="Variance in cycle length in days")
    hirsutism_score: Optional[int] = Field(default=8, description="Ferriman-Gallwey hirsutism score (0-36)")
    bmi: Optional[float] = Field(default=23.5, description="Body Mass Index")

class ShapAttribution(BaseModel):
    feature: str
    shap_value: float
    user_value: float

class EndocrineInferenceResponse(BaseModel):
    status: str = "success"
    pcos_risk_score: float
    endometriosis_risk_score: float
    risk_classification: str
    base_expected_value: float
    shap_attributions: List[ShapAttribution]
    plain_english_insights: Optional[List[str]] = []
    plain_feature_labels: Optional[dict] = {
        "lh_fsh_ratio": "Ovulation Balance Ratio",
        "free_testosterone_ng_dl": "Active Androgen Level",
        "cycle_length_variance_days": "Period Timing Shift",
        "hirsutism_score": "Body & Facial Hair Tracker",
        "bmi": "Body Composition Index"
    }

# --- Athletic Schemas ---
class RedsCheckRequest(BaseModel):
    user_id: str
    fat_free_mass_kg: float
    caloric_intake_kcal: float
    exercise_energy_expenditure_kcal: float
    acute_7d_workload: float
    chronic_28d_workload: float

class RedsCheckResponse(BaseModel):
    energy_availability_kcal_ffm: float
    acwr_index: float
    reds_risk_flag: bool
    warning_message: str
    workload_zone: Optional[str] = "Optimal Training"

# --- Gestational Schemas ---
class GestationalMapCheckRequest(BaseModel):
    user_id: str
    gestational_age_weeks: int = Field(ge=1, le=42)
    systolic_bp: float
    diastolic_bp: float
    historical_map_readings: Optional[List[float]] = []

class GestationalMapCheckResponse(BaseModel):
    current_map: float
    bayesian_baseline_map: float
    map_delta_from_baseline: float
    velocity_alert: bool
    preeclampsia_risk_classification: str
    recommendation: str

# --- User Schemas ---
class UserCreate(BaseModel):
    full_name: str
    email: str
    age: int
    is_athlete: bool = False
    fat_free_mass_kg: Optional[float] = None
    is_pregnant: bool = False
    gestational_age_weeks: Optional[int] = None

class UserResponse(BaseModel):
    user_id: str
    full_name: str
    email: str
    age: int
    is_athlete: bool
    fat_free_mass_kg: Optional[float]
    is_pregnant: bool
    gestational_age_weeks: Optional[int]
    created_at: datetime

# --- Community Hub Schemas ---
class CommunityPostCreate(BaseModel):
    user_id: str
    author_display_name: Optional[str] = "Anonymous Athlete"
    is_anonymous: bool = False
    topic_circle: str = "General Wellness"
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=5)

class CommunityPostResponse(BaseModel):
    post_id: str
    user_id: str
    author_display_name: str
    is_anonymous: bool
    topic_circle: str
    title: str
    content: str
    upvotes: int
    created_at: datetime
