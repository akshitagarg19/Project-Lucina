from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, DailyTelemetry, RiskInference, AthleticLog
from app.services.fhir_serializer import fhir_serializer
from app.services.pdf_generator import report_generator

router = APIRouter(prefix="/export", tags=["FHIR & Clinical Export"])

@router.get("/fhir-bundle/{user_id}")
def export_fhir_bundle(user_id: str, db: Session = Depends(get_db)):
    """
    Generate an HL7 FHIR Release 4 compliant JSON bundle for hospital EHR integration.
    Includes Patient, LOINC Vital Signs Observations, and RiskAssessment with SHAP attributions.
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    latest_telem = db.query(DailyTelemetry)\
        .filter(DailyTelemetry.user_id == user_id)\
        .order_by(DailyTelemetry.recorded_date.desc())\
        .first()

    latest_infer = db.query(RiskInference)\
        .filter(RiskInference.user_id == user_id)\
        .order_by(RiskInference.created_at.desc())\
        .first()

    bundle = fhir_serializer.serialize_bundle(
        user=user,
        latest_telemetry=latest_telem,
        latest_inference=latest_infer
    )
    return JSONResponse(content=bundle)

@router.get("/clinical-report/{user_id}", response_class=HTMLResponse)
def export_clinical_report(user_id: str, db: Session = Depends(get_db)):
    """
    Generate a printable clinical consultation and handoff summary for OB/GYN or athletic physicians.
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    telemetry_logs = db.query(DailyTelemetry)\
        .filter(DailyTelemetry.user_id == user_id)\
        .order_by(DailyTelemetry.recorded_date.desc())\
        .limit(14)\
        .all()

    latest_infer = db.query(RiskInference)\
        .filter(RiskInference.user_id == user_id)\
        .order_by(RiskInference.created_at.desc())\
        .first()

    latest_athletic = db.query(AthleticLog)\
        .filter(AthleticLog.user_id == user_id)\
        .order_by(AthleticLog.logged_date.desc())\
        .first()

    html_content = report_generator.generate_html_report(
        user=user,
        telemetry_logs=telemetry_logs,
        inference=latest_infer,
        athletic_log=latest_athletic
    )
    return HTMLResponse(content=html_content)
