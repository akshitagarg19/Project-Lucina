from typing import Dict, Any, List
import numpy as np

class GestationalEngine:
    """
    Dual Analytical Engine Pillar 2:
    Gestational Safety Engine with Dynamic Gaussian Bayesian MAP Baseline Tracking
    and Preeclampsia Velocity Monitoring.
    """

    @staticmethod
    def calculate_map(systolic_bp: float, diastolic_bp: float) -> float:
        """
        Mean Arterial Pressure (MAP) = Diastolic + (Systolic - Diastolic) / 3.0
        """
        map_val = diastolic_bp + ((systolic_bp - diastolic_bp) / 3.0)
        return round(map_val, 2)

    def evaluate_gestational_risk(
        self,
        gestational_age_weeks: int,
        systolic_bp: float,
        diastolic_bp: float,
        historical_map_readings: List[float] = None
    ) -> Dict[str, Any]:
        """
        Executes dynamic Gaussian Bayesian baseline update:
        Prior ~ N(mu_0, sigma_0^2)
        Likelihood ~ N(y, sigma^2)
        Posterior ~ N(mu_n, sigma_n^2)
        """
        current_map = self.calculate_map(systolic_bp, diastolic_bp)

        # Trimester 1 / general baseline prior
        mu_0 = 82.0
        sigma_0_sq = 36.0  # std = 6.0
        obs_variance = 16.0  # measurement noise std = 4.0

        readings = list(historical_map_readings or [])
        if readings:
            n = len(readings)
            sample_mean = float(np.mean(readings))
            # Conjugate Gaussian posterior mean update
            precision_prior = 1.0 / sigma_0_sq
            precision_obs = n / obs_variance
            mu_n = (precision_prior * mu_0 + precision_obs * sample_mean) / (precision_prior + precision_obs)
            bayesian_baseline = round(float(mu_n), 2)
        else:
            bayesian_baseline = mu_0

        map_delta = round(current_map - bayesian_baseline, 2)

        # Clinical Preeclampsia Risk Criteria:
        # 1. Absolute MAP >= 90 mmHg (especially critical in 2nd trimester, weeks 13-28)
        # 2. Velocity spike: Delta >= +15 mmHg above personalized Bayesian baseline
        # 3. Severe hypertension: Systolic >= 140 or Diastolic >= 90
        velocity_alert = False
        recommendations = []

        if current_map >= 90.0:
            classification = "HIGH_PREECLAMPSIA_RISK"
            velocity_alert = True
            recommendations.append(
                f"Elevated Mean Arterial Pressure ({current_map} mmHg >= 90 mmHg threshold at {gestational_age_weeks} weeks)."
            )
        elif map_delta >= 14.0:
            classification = "MODERATE_PREECLAMPSIA_RISK"
            velocity_alert = True
            recommendations.append(
                f"Accelerating MAP velocity detected (+{map_delta} mmHg above personalized baseline of {bayesian_baseline} mmHg)."
            )
        elif systolic_bp >= 135.0 or diastolic_bp >= 85.0:
            classification = "BORDERLINE_ELEVATED"
            recommendations.append("Gestational blood pressure borderline elevated. Increase monitoring frequency.")
        else:
            classification = "NORMOTENSIVE_GESTATIONAL"
            recommendations.append("Maternal hemodynamics within normal physiological gestational range.")

        if systolic_bp >= 140.0 or diastolic_bp >= 90.0:
            recommendations.append("Meets ACOG criteria for gestational hypertension; clinical lab evaluation recommended.")

        return {
            "current_map": current_map,
            "bayesian_baseline_map": bayesian_baseline,
            "map_delta_from_baseline": map_delta,
            "velocity_alert": velocity_alert,
            "preeclampsia_risk_classification": classification,
            "recommendation": " ".join(recommendations)
        }

gestational_engine = GestationalEngine()
