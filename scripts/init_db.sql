-- Lucina AI Database Initialization DDL
-- Developed for recHERsion 2026 (ACM-W, NITK Surathkal)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT NOT NULL,
    is_athlete BOOLEAN DEFAULT FALSE,
    fat_free_mass_kg NUMERIC(5,2),
    is_pregnant BOOLEAN DEFAULT FALSE,
    gestational_age_weeks INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_telemetry (
    telemetry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    rhr_bpm NUMERIC(4,1) NOT NULL,
    hrv_rmssd_ms NUMERIC(5,2) NOT NULL,
    systolic_bp_mmhg NUMERIC(4,1) NOT NULL,
    diastolic_bp_mmhg NUMERIC(4,1) NOT NULL,
    map_mmhg NUMERIC(4,1) GENERATED ALWAYS AS (
        diastolic_bp_mmhg + ((systolic_bp_mmhg - diastolic_bp_mmhg) / 3.0)
    ) STORED,
    basal_body_temp_c NUMERIC(4,2),
    weight_kg NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS athletic_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    logged_date DATE NOT NULL,
    caloric_intake_kcal NUMERIC(6,2) NOT NULL,
    exercise_expenditure_kcal NUMERIC(6,2) NOT NULL,
    workout_duration_mins INT NOT NULL,
    perceived_exertion_rpe INT CHECK (perceived_exertion_rpe BETWEEN 1 AND 10),
    calculated_ea NUMERIC(5,2),
    calculated_acwr NUMERIC(4,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinical_symptom_logs (
    symptom_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    logged_date DATE NOT NULL,
    snomed_code VARCHAR(50) NOT NULL,
    symptom_name VARCHAR(100) NOT NULL,
    severity_score INT CHECK (severity_score BETWEEN 1 AND 5),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS risk_inferences (
    inference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    mode VARCHAR(30) CHECK (mode IN ('ENDOCRINE', 'ATHLETIC', 'GESTATIONAL')),
    predicted_risk_score NUMERIC(5,4) NOT NULL,
    primary_diagnosis_flag VARCHAR(100) NOT NULL,
    shap_feature_attributions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_telemetry_user_date ON daily_telemetry(user_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_athletic_user_date ON athletic_logs(user_id, logged_date DESC);
CREATE INDEX IF NOT EXISTS idx_inferences_user ON risk_inferences(user_id, created_at DESC);
