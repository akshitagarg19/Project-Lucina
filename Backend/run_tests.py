import os
import sys

# Ensure backend root is on sys.path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database import SessionLocal, engine, Base
from app.models import User, DailyTelemetry, RiskInference
from app.services.ml_engine import endocrine_engine
from app.services.athletic_engine import athletic_engine
from app.services.gestational_engine import gestational_engine
from app.services.fhir_serializer import fhir_serializer
from app.services.pdf_generator import report_generator
from app.routers.telemetry import log_telemetry
from app.routers.analytics import predict_endocrine_risk, check_reds_risk, check_gestational_map
from app.routers.export import export_fhir_bundle, export_clinical_report
from app.routers.community import get_community_posts, create_community_post, upvote_post
from app.schemas import (
    TelemetryIngestRequest,
    EndocrineInferenceRequest,
    RedsCheckRequest,
    GestationalMapCheckRequest,
    SymptomInput,
    CommunityPostCreate
)
from datetime import date

def run_all_tests():
    print("==================================================")
    print("      LUCINA AI &bull; BACKEND INTEGRITY TEST SUITE      ")
    print("==================================================")
    
    db = SessionLocal()
    try:
        # Test 1: Telemetry Ingest & MAP Calculation
        print("[1/6] Testing Telemetry Ingestion & MAP Formula...")
        telem_req = TelemetryIngestRequest(
            user_id="123e4567-e89b-12d3-a456-426614174000",
            recorded_date=date.today(),
            systolic_bp=120.0,
            diastolic_bp=80.0,
            rhr_bpm=60.0,
            hrv_rmssd=55.0,
            symptoms=[SymptomInput(snomed_code="257386006", severity=3)]
        )
        telem_resp = log_telemetry(telem_req, db)
        assert telem_resp.status == "success"
        # MAP = 80 + (120 - 80) / 3.0 = 93.33
        assert abs(telem_resp.calculated_map - 93.33) < 0.1, f"Expected ~93.33, got {telem_resp.calculated_map}"
        print(f"  [PASS] MAP calculated accurately: {telem_resp.calculated_map} mmHg (Telemetry ID: {telem_resp.telemetry_id[:8]})")

        # Test 2: Endocrine ML Engine & TreeSHAP
        print("[2/6] Testing Endocrine Risk Engine & Local TreeSHAP...")
        endo_req = EndocrineInferenceRequest(
            user_id="123e4567-e89b-12d3-a456-426614174000",
            lh_fsh_ratio=2.8,
            free_testosterone_ng_dl=68.5,
            cycle_length_variance_days=12.4,
            hirsutism_score=14
        )
        endo_resp = predict_endocrine_risk(endo_req, db)
        assert endo_resp.status == "success"
        assert endo_resp.pcos_risk_score > 0.50, f"Expected elevated PCOS risk, got {endo_resp.pcos_risk_score}"
        assert len(endo_resp.shap_attributions) > 0
        total_shap = sum(a.shap_value for a in endo_resp.shap_attributions)
        # Efficiency axiom check: base_expected_value + sum(shap) == predicted_risk
        diff = abs((endo_resp.base_expected_value + total_shap) - endo_resp.pcos_risk_score)
        assert diff < 0.05, f"SHAP efficiency axiom mismatch: diff={diff}"
        print(f"  [PASS] PCOS Risk: {endo_resp.pcos_risk_score:.4f} ({endo_resp.risk_classification})")
        print(f"  [PASS] TreeSHAP Efficiency: Base={endo_resp.base_expected_value:.4f} + Sum(SHAP)={total_shap:.4f}")

        # Test 3: Athletic RED-S & ACWR
        print("[3/6] Testing Athletic RED-S & Workload Engine...")
        reds_req = RedsCheckRequest(
            user_id="123e4567-e89b-12d3-a456-426614174000",
            fat_free_mass_kg=50.0,
            caloric_intake_kcal=1500.0,
            exercise_energy_expenditure_kcal=600.0,
            acute_7d_workload=1400.0,
            chronic_28d_workload=1000.0
        )
        reds_resp = check_reds_risk(reds_req, db)
        # EA = (1500 - 600) / 50 = 18.0 kcal/kg FFM (<30)
        assert reds_resp.energy_availability_kcal_ffm == 18.0, f"Expected 18.0, got {reds_resp.energy_availability_kcal_ffm}"
        assert reds_resp.reds_risk_flag is True, "Expected critical RED-S flag"
        assert reds_resp.acwr_index == 1.40, f"Expected ACWR 1.40, got {reds_resp.acwr_index}"
        print(f"  [PASS] EA: {reds_resp.energy_availability_kcal_ffm} kcal/kg FFM (Flag: {reds_resp.reds_risk_flag})")
        print(f"  [PASS] ACWR: {reds_resp.acwr_index} ({reds_resp.workload_zone})")

        # Test 4: Gestational MAP Velocity
        print("[4/6] Testing Gestational Bayesian MAP Velocity...")
        gest_req = GestationalMapCheckRequest(
            user_id="323e4567-e89b-12d3-a456-426614174002",
            gestational_age_weeks=22,
            systolic_bp=134.0,
            diastolic_bp=88.0,
            historical_map_readings=[82.0, 83.5, 84.0]
        )
        gest_resp = check_gestational_map(gest_req, db)
        assert gest_resp.current_map >= 90.0, f"Expected current MAP >= 90, got {gest_resp.current_map}"
        assert gest_resp.velocity_alert is True
        print(f"  [PASS] Gestational MAP: {gest_resp.current_map} mmHg (Baseline: {gest_resp.bayesian_baseline_map} mmHg)")
        print(f"  [PASS] Preeclampsia Alert: {gest_resp.preeclampsia_risk_classification}")

        # Test 5: HL7 FHIR Release 4 Bundle Export
        print("[5/6] Testing HL7 FHIR R4 Bundle Serializer...")
        fhir_resp = export_fhir_bundle("123e4567-e89b-12d3-a456-426614174000", db)
        import json
        bundle_data = json.loads(fhir_resp.body.decode("utf-8"))
        assert bundle_data["resourceType"] == "Bundle"
        assert bundle_data["type"] == "collection"
        res_types = [e["resource"]["resourceType"] for e in bundle_data["entry"]]
        assert "Patient" in res_types, "Missing Patient resource"
        assert "Observation" in res_types, "Missing Observation resource"
        assert "RiskAssessment" in res_types, "Missing RiskAssessment resource"
        print(f"  [PASS] FHIR Bundle validated: {len(bundle_data['entry'])} HL7 resources generated")

        # Test 6: Clinical PDF / HTML Summary
        print("[6/7] Testing Clinical Consultation Handoff Brief...")
        report_resp = export_clinical_report("123e4567-e89b-12d3-a456-426614174000", db)
        report_html = report_resp.body.decode("utf-8")
        assert "LUCINA AI" in report_html
        assert "Maya Patel" in report_html
        assert "TreeSHAP" in report_html
        print("  [PASS] Clinical handoff report successfully rendered")

        # Test 7: Community Hub & Anonymous Posting (PRD v5)
        print("[7/7] Testing Peer Community Hub & Anonymous Posting...")
        new_post_payload = CommunityPostCreate(
            user_id="223e4567-e89b-12d3-a456-426614174001",
            author_display_name="Sarah Jenkins",
            is_anonymous=True,
            topic_circle="Athletic Amenorrhea & REDs",
            title="How to manage workload spikes during tournament week?",
            content="Looking for advice from other runners on managing back-to-back race loads."
        )
        created_post = create_community_post(new_post_payload, db)
        assert created_post.is_anonymous is True
        assert created_post.author_display_name == "Anonymous Athlete"
        assert created_post.post_id is not None

        # Test Upvoting
        upvote_res = upvote_post(created_post.post_id, db)
        assert upvote_res["upvotes"] == 2

        # Test List & Filter
        posts = get_community_posts(topic_circle="Athletic Amenorrhea & REDs", db=db)
        assert len(posts) > 0
        print(f"  [PASS] Community Hub verified: {len(posts)} posts in circle, anonymous masking validated")

        print("\n==================================================")
        print(" [SUCCESS] ALL 7 CORE ENGINES & COMMUNITY PASSED! ")
        print("==================================================")
        return True

    finally:
        db.close()

if __name__ == "__main__":
    success = run_all_tests()
    if not success:
        sys.exit(1)
