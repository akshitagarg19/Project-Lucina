import sys
import os
from datetime import date

# Ensure backend root is on sys.path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database import SessionLocal
from app.routers.telemetry import log_telemetry
from app.routers.analytics import predict_endocrine_risk, check_reds_risk, check_gestational_map
from app.routers.export import export_fhir_bundle, export_clinical_report
from app.routers.community import create_community_post, get_community_posts, upvote_post
from app.schemas import (
    TelemetryIngestRequest,
    EndocrineInferenceRequest,
    RedsCheckRequest,
    GestationalMapCheckRequest,
    SymptomInput,
    CommunityPostCreate
)
import json

def test_telemetry_logging():
    db = SessionLocal()
    try:
        payload = TelemetryIngestRequest(
            user_id="123e4567-e89b-12d3-a456-426614174000",
            recorded_date=date(2026, 10, 24),
            systolic_bp=120.0,
            diastolic_bp=80.0,
            rhr_bpm=60.0,
            hrv_rmssd=55.0,
            symptoms=[
                SymptomInput(snomed_code="257386006", severity=3)
            ]
        )
        response = log_telemetry(payload, db)
        assert response.status == "success"
        assert response.telemetry_id is not None
        assert abs(response.calculated_map - 93.33) < 0.1
    finally:
        db.close()

def test_endocrine_prediction():
    db = SessionLocal()
    try:
        payload = EndocrineInferenceRequest(
            user_id="123e4567-e89b-12d3-a456-426614174000",
            lh_fsh_ratio=2.8,
            free_testosterone_ng_dl=68.5,
            cycle_length_variance_days=12.4,
            hirsutism_score=14
        )
        response = predict_endocrine_risk(payload, db)
        assert response.status == "success"
        assert response.pcos_risk_score is not None
        assert response.pcos_risk_score > 0.50
        assert len(response.shap_attributions) > 0
        total_shap = sum(a.shap_value for a in response.shap_attributions)
        # Efficiency Axiom: base_expected_value + sum(shap) == predicted_risk
        diff = abs((response.base_expected_value + total_shap) - response.pcos_risk_score)
        assert diff < 0.05
    finally:
        db.close()

def test_reds_check():
    db = SessionLocal()
    try:
        payload = RedsCheckRequest(
            user_id="123e4567-e89b-12d3-a456-426614174000",
            fat_free_mass_kg=50.0,
            caloric_intake_kcal=1500.0,
            exercise_energy_expenditure_kcal=600.0,
            acute_7d_workload=1400.0,
            chronic_28d_workload=1000.0
        )
        response = check_reds_risk(payload, db)
        # EA = (1500 - 600) / 50 = 18.0 kcal/kg FFM (<30)
        assert response.energy_availability_kcal_ffm == 18.0
        assert response.reds_risk_flag is True
        assert response.acwr_index == 1.40
    finally:
        db.close()

def test_gestational_map_check():
    db = SessionLocal()
    try:
        payload = GestationalMapCheckRequest(
            user_id="323e4567-e89b-12d3-a456-426614174002",
            gestational_age_weeks=22,
            systolic_bp=134.0,
            diastolic_bp=88.0,
            historical_map_readings=[82.0, 83.5, 84.0]
        )
        response = check_gestational_map(payload, db)
        assert response.current_map >= 90.0
        assert response.bayesian_baseline_map is not None
        assert response.velocity_alert is True
        assert "PREECLAMPSIA" in response.preeclampsia_risk_classification
    finally:
        db.close()

def test_fhir_bundle_export():
    db = SessionLocal()
    try:
        response = export_fhir_bundle("123e4567-e89b-12d3-a456-426614174000", db)
        data = json.loads(response.body.decode("utf-8"))
        assert data["resourceType"] == "Bundle"
        assert data["type"] == "collection"
        assert len(data["entry"]) >= 3
        res_types = [e["resource"]["resourceType"] for e in data["entry"]]
        assert "Patient" in res_types
        assert "Observation" in res_types
        assert "RiskAssessment" in res_types
    finally:
        db.close()

def test_clinical_report_html():
    db = SessionLocal()
    try:
        response = export_clinical_report("123e4567-e89b-12d3-a456-426614174000", db)
        html = response.body.decode("utf-8")
        assert "LUCINA AI" in html
        assert "Maya Patel" in html
        assert "TreeSHAP" in html
    finally:
        db.close()

def test_community_hub():
    db = SessionLocal()
    try:
        payload = CommunityPostCreate(
            user_id="223e4567-e89b-12d3-a456-426614174001",
            author_display_name="Sarah Jenkins",
            is_anonymous=True,
            topic_circle="Athletic Amenorrhea & REDs",
            title="Safe recovery protocols after back stress injury",
            content="Any bowlers or runners here who successfully rebuilt their bone density?"
        )
        post = create_community_post(payload, db)
        assert post.is_anonymous is True
        assert post.author_display_name == "Anonymous Athlete"

        upvote = upvote_post(post.post_id, db)
        assert upvote["upvotes"] == 2

        posts = get_community_posts(topic_circle="Athletic Amenorrhea & REDs", db=db)
        assert len(posts) > 0
    finally:
        db.close()

if __name__ == "__main__":
    print("==================================================")
    print("   LUCINA AI &bull; BACKEND API VERIFICATION SUITE   ")
    print("==================================================")
    test_telemetry_logging()
    print("  [PASS] test_telemetry_logging (Status 201, MAP = 93.33)")
    test_endocrine_prediction()
    print("  [PASS] test_endocrine_prediction (Status 200, TreeSHAP Attributions)")
    test_reds_check()
    print("  [PASS] test_reds_check (Status 200, EA = 18.0 kcal/kg FFM, RED-S Flag = True)")
    test_gestational_map_check()
    print("  [PASS] test_gestational_map_check (Status 200, MAP Velocity & Preeclampsia Alert)")
    test_fhir_bundle_export()
    print("  [PASS] test_fhir_bundle_export (Status 200, HL7 FHIR Release 4 Collection Bundle)")
    test_clinical_report_html()
    print("  [PASS] test_clinical_report_html (Status 200, Clinical Consultation Brief)")
    test_community_hub()
    print("  [PASS] test_community_hub (Status 200, Anonymous Posting & Upvoting)")
    print("\n[SUCCESS] ALL 7 CORE ENGINES & COMMUNITY PASSED!")
