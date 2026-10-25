from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, DailyTelemetry, ClinicalSymptomLog
from app.schemas import (
    TelemetryIngestRequest,
    TelemetryIngestResponse,
    TelemetryHistoryItem
)
from app.services.gestational_engine import gestational_engine

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

# Standard SNOMED-CT clinical coding dictionary for symptoms
SNOMED_SYMPTOM_MAP = {
    "257386006": "Pelvic Pain",
    "247547006": "Hirsutism",
    "84229001": "Fatigue",
    "267036007": "Shortness of Breath",
    "271807003": "Peripheral Edema",
    "13655005": "General Cramping",
    "237055002": "Polycystic Ovary Syndrome Symptoms",
    "237731006": "Amenorrhea / Oligomenorrhea"
}

@router.post("/log", response_model=TelemetryIngestResponse, status_code=status.HTTP_201_CREATED)
def log_telemetry(payload: TelemetryIngestRequest, db: Session = Depends(get_db)):
    """
    Ingest multi-stream biometric and symptom telemetry.
    Calculates Mean Arterial Pressure (MAP) and stores normalized LOINC/SNOMED data.
    """
    user = db.query(User).filter(User.user_id == payload.user_id).first()
    if not user:
        # Create user automatically if not exists to facilitate frictionless developer testing
        user = User(
            user_id=payload.user_id,
            full_name="Auto-Registered Patient",
            email=f"patient-{payload.user_id[:8]}@lucina.ai",
            age=26,
            is_athlete=False,
            is_pregnant=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Compute MAP: Diastolic + (Systolic - Diastolic) / 3.0
    calculated_map = gestational_engine.calculate_map(payload.systolic_bp, payload.diastolic_bp)

    telemetry_record = DailyTelemetry(
        user_id=payload.user_id,
        recorded_date=payload.recorded_date,
        systolic_bp_mmhg=payload.systolic_bp,
        diastolic_bp_mmhg=payload.diastolic_bp,
        map_mmhg=calculated_map,
        rhr_bpm=payload.rhr_bpm,
        hrv_rmssd_ms=payload.hrv_rmssd,
        basal_body_temp_c=payload.basal_body_temp_c,
        weight_kg=payload.weight_kg
    )
    db.add(telemetry_record)

    # Ingest associated SNOMED-CT symptoms
    if payload.symptoms:
        for sym in payload.symptoms:
            snomed_name = sym.symptom_name or SNOMED_SYMPTOM_MAP.get(sym.snomed_code, "Clinical Symptom")
            symptom_entry = ClinicalSymptomLog(
                user_id=payload.user_id,
                logged_date=payload.recorded_date,
                snomed_code=sym.snomed_code,
                symptom_name=snomed_name,
                severity_score=sym.severity,
                notes=sym.notes
            )
            db.add(symptom_entry)

    db.commit()
    db.refresh(telemetry_record)

    return TelemetryIngestResponse(
        status="success",
        telemetry_id=telemetry_record.telemetry_id,
        calculated_map=calculated_map,
        message="Telemetry logged and normalized successfully"
    )

@router.get("/history/{user_id}", response_model=List[TelemetryHistoryItem])
def get_telemetry_history(user_id: str, limit: int = 30, db: Session = Depends(get_db)):
    """Retrieve time-series telemetry history for biometric charts."""
    records = db.query(DailyTelemetry)\
        .filter(DailyTelemetry.user_id == user_id)\
        .order_by(DailyTelemetry.recorded_date.asc())\
        .limit(limit)\
        .all()
    
    return [
        TelemetryHistoryItem(
            telemetry_id=r.telemetry_id,
            recorded_date=r.recorded_date,
            systolic_bp=r.systolic_bp_mmhg,
            diastolic_bp=r.diastolic_bp_mmhg,
            map_mmhg=r.map_mmhg,
            rhr_bpm=r.rhr_bpm,
            hrv_rmssd_ms=r.hrv_rmssd_ms,
            basal_body_temp_c=r.basal_body_temp_c,
            weight_kg=r.weight_kg
        ) for r in records
    ]
