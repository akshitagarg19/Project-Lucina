from datetime import datetime
from typing import Dict, Any, List, Optional
from app.models import User, DailyTelemetry, RiskInference

class FHIRSerializer:
    """
    HL7 FHIR Release 4 (R4) Bundle Serializer.
    Converts telemetry logs, patient demographics, and explainable ML risk assessments
    into standardized FHIR JSON collection bundles with LOINC and SNOMED-CT semantics.
    """

    @staticmethod
    def serialize_bundle(
        user: User,
        latest_telemetry: Optional[DailyTelemetry] = None,
        latest_inference: Optional[RiskInference] = None
    ) -> Dict[str, Any]:
        bundle_id = f"lucina-bundle-{user.user_id[:8]}"
        patient_ref_id = f"pat-{user.user_id[:8]}"
        now_iso = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

        # Split full name into given and family
        name_parts = user.full_name.split()
        family_name = name_parts[-1] if len(name_parts) > 1 else user.full_name
        given_names = name_parts[:-1] if len(name_parts) > 1 else [user.full_name]

        # Calculate approximate birth date from age
        birth_year = datetime.utcnow().year - user.age
        birth_date = f"{birth_year}-01-01"

        entries: List[Dict[str, Any]] = []

        # 1. Patient Resource
        patient_resource = {
            "resource": {
                "resourceType": "Patient",
                "id": patient_ref_id,
                "identifier": [
                    {
                        "system": "https://lucina.ai/patients",
                        "value": f"PAT-LUCINA-{user.user_id[:8].upper()}"
                    }
                ],
                "name": [
                    {
                        "use": "official",
                        "family": family_name,
                        "given": given_names
                    }
                ],
                "gender": "female",
                "birthDate": birth_date
            }
        }
        entries.append(patient_resource)

        # 2. Telemetry Observations (LOINC Coded)
        if latest_telemetry:
            telem_date = latest_telemetry.recorded_date.strftime("%Y-%m-%d") + "T08:00:00Z"

            # MAP Observation (LOINC 8478-0)
            obs_map = {
                "resource": {
                    "resourceType": "Observation",
                    "id": f"obs-map-{latest_telemetry.telemetry_id[:8]}",
                    "status": "final",
                    "category": [
                        {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                    "code": "vital-signs",
                                    "display": "Vital Signs"
                                }
                            ]
                        }
                    ],
                    "code": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "8478-0",
                                "display": "Mean Blood Pressure"
                            }
                        ]
                    },
                    "subject": {"reference": f"Patient/{patient_ref_id}"},
                    "effectiveDateTime": telem_date,
                    "valueQuantity": {
                        "value": float(latest_telemetry.map_mmhg),
                        "unit": "mmHg",
                        "system": "http://unitsofmeasure.org",
                        "code": "mm[Hg]"
                    }
                }
            }
            entries.append(obs_map)

            # Resting Heart Rate Observation (LOINC 8867-4)
            obs_rhr = {
                "resource": {
                    "resourceType": "Observation",
                    "id": f"obs-rhr-{latest_telemetry.telemetry_id[:8]}",
                    "status": "final",
                    "category": [
                        {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                    "code": "vital-signs",
                                    "display": "Vital Signs"
                                }
                            ]
                        }
                    ],
                    "code": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "8867-4",
                                "display": "Heart rate"
                            }
                        ]
                    },
                    "subject": {"reference": f"Patient/{patient_ref_id}"},
                    "effectiveDateTime": telem_date,
                    "valueQuantity": {
                        "value": float(latest_telemetry.rhr_bpm),
                        "unit": "/min",
                        "system": "http://unitsofmeasure.org",
                        "code": "/min"
                    }
                }
            }
            entries.append(obs_rhr)

            # HRV RMSSD Observation (LOINC 80404-7)
            obs_hrv = {
                "resource": {
                    "resourceType": "Observation",
                    "id": f"obs-hrv-{latest_telemetry.telemetry_id[:8]}",
                    "status": "final",
                    "category": [
                        {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                    "code": "vital-signs",
                                    "display": "Vital Signs"
                                }
                            ]
                        }
                    ],
                    "code": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "80404-7",
                                "display": "R-R interval.standard deviation (Heart rate variability)"
                            }
                        ]
                    },
                    "subject": {"reference": f"Patient/{patient_ref_id}"},
                    "effectiveDateTime": telem_date,
                    "valueQuantity": {
                        "value": float(latest_telemetry.hrv_rmssd_ms),
                        "unit": "ms",
                        "system": "http://unitsofmeasure.org",
                        "code": "ms"
                    }
                }
            }
            entries.append(obs_hrv)

        # 3. RiskAssessment Resource with TreeSHAP Attributions
        if latest_inference:
            attributions_extensions = []
            shap_data = latest_inference.shap_feature_attributions or []
            if isinstance(shap_data, list):
                for attr in shap_data:
                    attributions_extensions.append({
                        "url": "https://lucina.ai/fhir/StructureDefinition/shap-attribution",
                        "extension": [
                            {"url": "feature", "valueString": str(attr.get("feature", ""))},
                            {"url": "shap_value", "valueDecimal": float(attr.get("shap_value", 0.0))},
                            {"url": "user_value", "valueDecimal": float(attr.get("user_value", 0.0))}
                        ]
                    })

            risk_level = "low"
            if latest_inference.predicted_risk_score >= 0.70:
                risk_level = "high"
            elif latest_inference.predicted_risk_score >= 0.40:
                risk_level = "moderate"

            risk_resource = {
                "resource": {
                    "resourceType": "RiskAssessment",
                    "id": f"risk-{latest_inference.inference_id[:8]}",
                    "status": "final",
                    "subject": {"reference": f"Patient/{patient_ref_id}"},
                    "occurrenceDateTime": latest_inference.created_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "condition": {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "237055002",
                                "display": "Polycystic Ovary Syndrome"
                            }
                        ]
                    },
                    "prediction": [
                        {
                            "outcome": {
                                "text": f"{latest_inference.mode} Diagnostic Risk Probability"
                            },
                            "probabilityDecimal": float(latest_inference.predicted_risk_score),
                            "qualitativeRisk": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/risk-probability",
                                        "code": risk_level,
                                        "display": f"{risk_level.capitalize()} Likelihood"
                                    }
                                ]
                            },
                            "extension": attributions_extensions
                        }
                    ]
                }
            }
            entries.append(risk_resource)

        # Construct collection bundle
        bundle = {
            "resourceType": "Bundle",
            "id": bundle_id,
            "type": "collection",
            "timestamp": now_iso,
            "entry": entries
        }
        return bundle

fhir_serializer = FHIRSerializer()
