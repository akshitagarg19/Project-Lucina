from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from app.models import User, DailyTelemetry, ClinicalSymptomLog, AthleticLog, RiskInference, CommunityPost
from app.services.gestational_engine import gestational_engine

def seed_database(db: Session):
    """Seed initial clinical profiles, realistic telemetry, and community posts if database is empty."""
    if db.query(User).count() > 0:
        # Seed community posts if not present
        if db.query(CommunityPost).count() == 0:
            seed_community_posts(db)
        return  # Database already seeded

    print("[Lucina AI] Seeding initial clinical patient profiles & biometric telemetry...")

    # 1. Maya Patel - Endocrine & PCOS Clinical Profile
    maya_id = "123e4567-e89b-12d3-a456-426614174000"
    maya = User(
        user_id=maya_id,
        full_name="Maya Patel",
        email="maya.patel@recHERsion2026.org",
        age=26,
        is_athlete=False,
        fat_free_mass_kg=44.0,
        is_pregnant=False
    )
    db.add(maya)

    # 2. Sarah Jenkins - Elite Athletic / RED-S Profile
    sarah_id = "223e4567-e89b-12d3-a456-426614174001"
    sarah = User(
        user_id=sarah_id,
        full_name="Sarah Jenkins",
        email="sarah.jenkins@athletics.org",
        age=24,
        is_athlete=True,
        fat_free_mass_kg=50.0,
        is_pregnant=False
    )
    db.add(sarah)

    # 3. Priya Sharma - Gestational / Preeclampsia Velocity Profile
    priya_id = "323e4567-e89b-12d3-a456-426614174002"
    priya = User(
        user_id=priya_id,
        full_name="Priya Sharma",
        email="priya.sharma@maternalhealth.org",
        age=30,
        is_athlete=False,
        fat_free_mass_kg=48.0,
        is_pregnant=True,
        gestational_age_weeks=22
    )
    db.add(priya)

    db.commit()

    today = date.today()

    # Seed Maya's 10 days of Telemetry
    for i in range(10, 0, -1):
        rec_date = today - timedelta(days=i)
        sys_bp = 118.0 + (i % 3) * 2.0
        dia_bp = 76.0 + (i % 2) * 2.0
        map_val = gestational_engine.calculate_map(sys_bp, dia_bp)
        telem = DailyTelemetry(
            user_id=maya_id,
            recorded_date=rec_date,
            systolic_bp_mmhg=sys_bp,
            diastolic_bp_mmhg=dia_bp,
            map_mmhg=map_val,
            rhr_bpm=64.0 + (i % 4),
            hrv_rmssd_ms=48.0 - (i % 5),
            basal_body_temp_c=36.5 + (0.05 * (i % 3)),
            weight_kg=58.2
        )
        db.add(telem)

    # Seed Maya's Symptoms & Risk Inference
    db.add(ClinicalSymptomLog(
        user_id=maya_id,
        logged_date=today - timedelta(days=2),
        snomed_code="257386006",
        symptom_name="Pelvic Pain",
        severity_score=4,
        notes="Severe unilateral pelvic pain radiating during luteal phase"
    ))
    db.add(ClinicalSymptomLog(
        user_id=maya_id,
        logged_date=today - timedelta(days=1),
        snomed_code="247547006",
        symptom_name="Hirsutism",
        severity_score=3,
        notes="Coarse terminal hair distribution along jawline and chin"
    ))
    db.add(RiskInference(
        user_id=maya_id,
        mode="ENDOCRINE",
        predicted_risk_score=0.825,
        primary_diagnosis_flag="HIGH_PCOS_PROBABILITY",
        shap_feature_attributions=[
            {"feature": "lh_fsh_ratio", "shap_value": 0.320, "user_value": 2.80},
            {"feature": "free_testosterone_ng_dl", "shap_value": 0.210, "user_value": 68.50},
            {"feature": "cycle_length_variance_days", "shap_value": 0.145, "user_value": 12.40},
            {"feature": "hirsutism_score", "shap_value": 0.080, "user_value": 14.0},
            {"feature": "bmi", "shap_value": -0.080, "user_value": 22.40}
        ]
    ))

    # Seed Sarah's Athletic Logs & Telemetry
    for i in range(10, 0, -1):
        rec_date = today - timedelta(days=i)
        db.add(DailyTelemetry(
            user_id=sarah_id,
            recorded_date=rec_date,
            systolic_bp_mmhg=110.0,
            diastolic_bp_mmhg=70.0,
            map_mmhg=83.33,
            rhr_bpm=46.0 + (i % 3),
            hrv_rmssd_ms=75.0 - (i % 6),
            weight_kg=54.5
        ))
        db.add(AthleticLog(
            user_id=sarah_id,
            logged_date=rec_date,
            caloric_intake_kcal=1600.0,
            exercise_expenditure_kcal=750.0,
            workout_duration_mins=90,
            perceived_exertion_rpe=8,
            calculated_ea=17.0,
            calculated_acwr=1.35
        ))

    # Seed Priya's Gestational BP Telemetry (Increasing MAP velocity)
    for i in range(12, 0, -1):
        rec_date = today - timedelta(days=i)
        # Simulated progressive hemodynamic elevation
        sys_bp = 118.0 + (12 - i) * 1.8
        dia_bp = 76.0 + (12 - i) * 1.2
        map_val = gestational_engine.calculate_map(sys_bp, dia_bp)
        db.add(DailyTelemetry(
            user_id=priya_id,
            recorded_date=rec_date,
            systolic_bp_mmhg=round(sys_bp, 1),
            diastolic_bp_mmhg=round(dia_bp, 1),
            map_mmhg=map_val,
            rhr_bpm=78.0 + (12 - i) * 0.5,
            hrv_rmssd_ms=42.0 - (12 - i) * 0.4,
            weight_kg=64.0 + (12 - i) * 0.2
        ))

    db.commit()
    seed_community_posts(db)
    print("[Lucina AI] Database successfully initialized with seed patient cohorts.")

def seed_community_posts(db: Session):
    """Seed vibrant grassroots and elite athlete peer discussions across topic circles."""
    sarah_id = "223e4567-e89b-12d3-a456-426614174001"
    maya_id = "123e4567-e89b-12d3-a456-426614174000"
    priya_id = "323e4567-e89b-12d3-a456-426614174002"

    posts = [
        CommunityPost(
            user_id=sarah_id,
            author_display_name="Sarah Jenkins (Marathoner)",
            is_anonymous=False,
            topic_circle="Athletic Amenorrhea & REDs",
            title="Restoring cycle regularity after 9 months of low Energy Availability (<25 kcal/kg)",
            content="When my ACWR spiked over 1.6 and my period disappeared last season, my physio said it was 'normal for runners'. It was NOT normal. Lucina's EA formula helped me realize I was under-fueling by 650 kcal every single training day. Started bumping intra-workout carbs and my cycle returned in 11 weeks.",
            upvotes=28,
            created_at=datetime.utcnow() - timedelta(days=2)
        ),
        CommunityPost(
            user_id=maya_id,
            author_display_name="Grassroots Cricket Bowler",
            is_anonymous=True,
            topic_circle="Athletic Amenorrhea & REDs",
            title="How do you tell a male junior coach about heavy cycle cramps without getting benched?",
            content="I bowl for my school, club, and district in the same week (around 30 overs total). On day 1 of my cycle, my bowling pace dropped 5 km/h from lower back stiffness and nausea. Coach assumed I was unmotivated. Has anyone used the Doctor Brief export to show their workload numbers to coaches?",
            upvotes=42,
            created_at=datetime.utcnow() - timedelta(days=1)
        ),
        CommunityPost(
            user_id=maya_id,
            author_display_name="Maya Patel",
            is_anonymous=False,
            topic_circle="PCOS Fitness & Nutrition",
            title="High active androgen levels + strength training: my experience with the Rotterdam criteria",
            content="For years doctors told me to 'just do more cardio' for PCOS, which actually spiked my cortisol and fatigue. The TreeSHAP breakdown on Lucina showed how elevated LH/FSH ratio was the primary driver of my cycle delays. Switching to progressive barbell overload and steady-state walking has been night and day.",
            upvotes=19,
            created_at=datetime.utcnow() - timedelta(hours=14)
        ),
        CommunityPost(
            user_id=priya_id,
            author_display_name="Priya Sharma",
            is_anonymous=False,
            topic_circle="Maternal Care",
            title="Vascular Strain (MAP) monitoring during week 22 strength workouts",
            content="My OB/GYN told me to keep an eye on blood pressure velocity rather than just single spikes. When my Mean Arterial Pressure climbed past 90 mmHg, Lucina's Bayesian model caught the upward trajectory 3 weeks before my clinic visit. We adjusted my hydration and sodium.",
            upvotes=15,
            created_at=datetime.utcnow() - timedelta(hours=6)
        ),
        CommunityPost(
            user_id=sarah_id,
            author_display_name="Junior Track Captain",
            is_anonymous=True,
            topic_circle="General Wellness",
            title="Ferritin & Anaemia check: 59% of us in the state squad were deficient!",
            content="We just did a screening after learning the NFHS-5 stats. Over half our girls were below 18 ng/mL serum ferritin. If your legs feel like lead on easy runs, don't just blame motivation—get your iron profile checked!",
            upvotes=34,
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
    ]

    for p in posts:
        db.add(p)
    db.commit()
    print("[Lucina AI] Seeded community hub peer discussions.")
