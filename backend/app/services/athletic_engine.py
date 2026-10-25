from typing import Dict, Any

class AthleticEngine:
    """
    Dual Analytical Engine Pillar 1 (Athletic):
    Energy Availability (EA), RED-S (Relative Energy Deficiency in Sport) Risk,
    and Acute-to-Chronic Workload Ratio (ACWR).
    """

    @staticmethod
    def evaluate_reds(
        fat_free_mass_kg: float,
        caloric_intake_kcal: float,
        exercise_energy_expenditure_kcal: float,
        acute_7d_workload: float,
        chronic_28d_workload: float
    ) -> Dict[str, Any]:
        """
        Calculates:
        1. Energy Availability (EA) = (Caloric Intake - Exercise Expenditure) / Fat Free Mass (kg)
        2. ACWR = acute_7d_workload / chronic_28d_workload
        """
        if fat_free_mass_kg <= 0:
            raise ValueError("Fat free mass (kg) must be greater than zero.")

        # 1. Energy Availability calculation
        energy_availability = (caloric_intake_kcal - exercise_energy_expenditure_kcal) / fat_free_mass_kg
        energy_availability = round(energy_availability, 2)

        # 2. ACWR calculation
        if chronic_28d_workload <= 0:
            acwr = 1.0
        else:
            acwr = round(acute_7d_workload / chronic_28d_workload, 2)

        # 3. Workload Zone classification
        if acwr < 0.8:
            workload_zone = "Under-training Zone (<0.80)"
        elif acwr <= 1.3:
            workload_zone = "Optimal Training Sweet Spot (0.80 - 1.30)"
        elif acwr <= 1.5:
            workload_zone = "High Load Caution Zone (1.30 - 1.50)"
        else:
            workload_zone = "Danger Spike Zone (>1.50) - Elevated Injury Risk"

        # 4. RED-S Clinical Stratification
        # Clinical IOC consensus: EA < 30 kcal/kg FFM/day triggers neuroendocrine & menstrual dysfunction
        if energy_availability < 30.0:
            reds_risk = True
            warning = "CRITICAL: Low Energy Availability (<30 kcal/kg FFM) detected. High risk of neuroendocrine suppression and RED-S."
        elif energy_availability < 45.0:
            reds_risk = False
            warning = "SUBCLINICAL: Reduced Energy Availability (30-45 kcal/kg FFM). Subclinical threshold; monitor bone density and cycle regularity."
        else:
            reds_risk = False
            warning = "OPTIMAL: Energy Availability is in the physiological sweet spot (>45 kcal/kg FFM/day)."

        # Append workload caution if ACWR in danger zone
        if acwr > 1.5:
            warning += f" Concurrently, ACWR ({acwr}) indicates an acute training workload spike."

        return {
            "energy_availability_kcal_ffm": energy_availability,
            "acwr_index": acwr,
            "reds_risk_flag": reds_risk,
            "warning_message": warning,
            "workload_zone": workload_zone
        }

athletic_engine = AthleticEngine()
