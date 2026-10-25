from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import date
from app.database import get_db
from app.models import User, RiskInference, AthleticLog, DailyTelemetry
from app.schemas import (
    EndocrineInferenceRequest,
    EndocrineInferenceResponse,
    RedsCheckRequest,
    RedsCheckResponse,
    GestationalMapCheckRequest,
    GestationalMapCheckResponse
)
from app.services.ml_engine import endocrine_engine
from app.services.athletic_engine import athletic_engine
from app.services.gestational_engine import gestational_engine

router = APIRouter(prefix="/analytics", tags=["Dual Analytical Engines"])

@router.post("/endocrine/predict", response_model=EndocrineInferenceResponse)
def predict_endocrine_risk(payload: EndocrineInferenceRequest, db: Session = Depends(get_db)):
    """
    Pillar 1: Endocrine Risk Stratification Engine (PCOS & Endometriosis).
    Returns risk probabilities alongside localized TreeSHAP additive feature attributions.
    """
    user = db.query(User).filter(User.user_id == payload.user_id).first()
    if not user:
        user = User(
            user_id=payload.user_id,
            full_name="Endocrine Patient",
            email=f"patient-{payload.user_id[:8]}@lucina.ai",
            age=27,
            is_athlete=False,
            is_pregnant=False
        )
        db.add(user)
        db.commit()

    features = {
        "lh_fsh_ratio": payload.lh_fsh_ratio,
        "free_testosterone_ng_dl": payload.free_testosterone_ng_dl,
        "cycle_length_variance_days": payload.cycle_length_variance_days,
        "hirsutism_score": float(payload.hirsutism_score if payload.hirsutism_score is not None else 8),
        "bmi": float(payload.bmi if payload.bmi is not None else 23.5)
    }

    result = endocrine_engine.predict_with_shap(features)

    # Persist inference audit record
    inference_record = RiskInference(
        user_id=payload.user_id,
        mode="ENDOCRINE",
        predicted_risk_score=result["pcos_risk_score"],
        primary_diagnosis_flag=result["risk_classification"],
        shap_feature_attributions=result["shap_attributions"]
    )
    db.add(inference_record)
    db.commit()

    return EndocrineInferenceResponse(
        status="success",
        pcos_risk_score=result["pcos_risk_score"],
        endometriosis_risk_score=result["endometriosis_risk_score"],
        risk_classification=result["risk_classification"],
        base_expected_value=result["base_expected_value"],
        shap_attributions=result["shap_attributions"],
        plain_english_insights=result.get("plain_english_insights", [])
    )

@router.post("/athletic/reds-check", response_model=RedsCheckResponse)
def check_reds_risk(payload: RedsCheckRequest, db: Session = Depends(get_db)):
    """
    Pillar 1: Athletic Engine.
    Evaluates Energy Availability (EA) and Acute-to-Chronic Workload Ratio (ACWR).
    """
    result = athletic_engine.evaluate_reds(
        fat_free_mass_kg=payload.fat_free_mass_kg,
        caloric_intake_kcal=payload.caloric_intake_kcal,
        exercise_energy_expenditure_kcal=payload.exercise_energy_expenditure_kcal,
        acute_7d_workload=payload.acute_7d_workload,
        chronic_28d_workload=payload.chronic_28d_workload
    )

    # Optional: Log athletic summary to database
    try:
        athletic_entry = AthleticLog(
            user_id=payload.user_id,
            logged_date=date.today(),
            caloric_intake_kcal=payload.caloric_intake_kcal,
            exercise_expenditure_kcal=payload.exercise_energy_expenditure_kcal,
            workout_duration_mins=60,
            calculated_ea=result["energy_availability_kcal_ffm"],
            calculated_acwr=result["acwr_index"]
        )
        db.add(athletic_entry)
        db.commit()
    except Exception:
        db.rollback()

    return RedsCheckResponse(
        energy_availability_kcal_ffm=result["energy_availability_kcal_ffm"],
        acwr_index=result["acwr_index"],
        reds_risk_flag=result["reds_risk_flag"],
        warning_message=result["warning_message"],
        workload_zone=result["workload_zone"]
    )

@router.post("/gestational/map-check", response_model=GestationalMapCheckResponse)
def check_gestational_map(payload: GestationalMapCheckRequest, db: Session = Depends(get_db)):
    """
    Pillar 2: Gestational Safety Engine.
    Tracks Mean Arterial Pressure (MAP) velocity against dynamic Gaussian Bayesian baselines.
    """
    historical_readings = list(payload.historical_map_readings or [])

    # If historical readings were not provided, fetch from database telemetry
    if not historical_readings:
        past_telemetry = db.query(DailyTelemetry.map_mmhg)\
            .filter(DailyTelemetry.user_id == payload.user_id)\
            .order_by(DailyTelemetry.recorded_date.asc())\
            .all()
        historical_readings = [float(r[0]) for r in past_telemetry if r[0]]

    result = gestational_engine.evaluate_gestational_risk(
        gestational_age_weeks=payload.gestational_age_weeks,
        systolic_bp=payload.systolic_bp,
        diastolic_bp=payload.diastolic_bp,
        historical_map_readings=historical_readings
    )

    # Log Gestational Risk assessment
    try:
        inference_record = RiskInference(
            user_id=payload.user_id,
            mode="GESTATIONAL",
            predicted_risk_score=round(result["current_map"] / 120.0, 4),
            primary_diagnosis_flag=result["preeclampsia_risk_classification"],
            shap_feature_attributions=[
                {"feature": "Current_MAP", "shap_value": result["map_delta_from_baseline"], "user_value": result["current_map"]},
                {"feature": "Bayesian_Baseline", "shap_value": 0.0, "user_value": result["bayesian_baseline_map"]},
                {"feature": "Gestational_Age", "shap_value": 0.05 if payload.gestational_age_weeks >= 20 else 0.01, "user_value": float(payload.gestational_age_weeks)}
            ]
        )
        db.add(inference_record)
        db.commit()
    except Exception:
        db.rollback()

    return GestationalMapCheckResponse(
        current_map=result["current_map"],
        bayesian_baseline_map=result["bayesian_baseline_map"],
        map_delta_from_baseline=result["map_delta_from_baseline"],
        velocity_alert=result["velocity_alert"],
        preeclampsia_risk_classification=result["preeclampsia_risk_classification"],
        recommendation=result["recommendation"]
    )

@router.get("/history/{user_id}")
def get_analytics_history(user_id: str, db: Session = Depends(get_db)):
    """Retrieve historical risk assessments and SHAP audits for a patient."""
    records = db.query(RiskInference)\
        .filter(RiskInference.user_id == user_id)\
        .order_by(RiskInference.created_at.desc())\
        .limit(10)\
        .all()
    
    return [
        {
            "inference_id": r.inference_id,
            "mode": r.mode,
            "predicted_risk_score": r.predicted_risk_score,
            "primary_diagnosis_flag": r.primary_diagnosis_flag,
            "shap_attributions": r.shap_feature_attributions,
            "created_at": r.created_at.isoformat()
        } for r in records
    ]
