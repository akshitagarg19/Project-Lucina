from typing import Dict, Any, Optional
from datetime import datetime

class ClinicalReportGenerator:
    """
    Generates clinical consultation summaries and handoff reports for OB/GYNs,
    endocrinologists, and sports medicine physicians.
    """

    @staticmethod
    def generate_html_report(
        user: Any,
        telemetry_logs: list,
        inference: Optional[Any] = None,
        athletic_log: Optional[Any] = None
    ) -> str:
        now_str = datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC")
        
        telemetry_rows = ""
        for t in (telemetry_logs or [])[:7]:
            telemetry_rows += f"""
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{t.recorded_date}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{t.systolic_bp_mmhg}/{t.diastolic_bp_mmhg} mmHg</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: {'#e53e3e' if t.map_mmhg >= 90 else '#2d3748'};">{t.map_mmhg} mmHg</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{t.rhr_bpm} bpm</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{t.hrv_rmssd_ms} ms</td>
            </tr>
            """

        shap_rows = ""
        if inference and inference.shap_feature_attributions:
            for attr in inference.shap_feature_attributions:
                val = attr.get('shap_value', 0)
                color = "#dc2626" if val > 0 else "#16a34a"
                sign = "+" if val > 0 else ""
                shap_rows += f"""
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{attr.get('feature')}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{attr.get('user_value')}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: {color};">{sign}{val:.4f}</td>
                </tr>
                """

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Lucina AI - Clinical Consultation Summary</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1a202c; background-color: #ffffff; }}
        .header {{ border-bottom: 3px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }}
        .title {{ font-size: 26px; font-weight: 800; color: #4338ca; margin: 0; }}
        .subtitle {{ font-size: 13px; color: #64748b; margin-top: 4px; }}
        .section {{ margin-bottom: 28px; }}
        .section-title {{ font-size: 16px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; }}
        .badge {{ display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }}
        .badge-red {{ background-color: #fee2e2; color: #991b1b; }}
        .badge-green {{ background-color: #dcfce7; color: #166534; }}
        table {{ width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }}
        th {{ background-color: #f8fafc; padding: 10px 8px; border-bottom: 2px solid #cbd5e1; font-weight: 600; color: #475569; }}
        .meta-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }}
        .meta-card {{ background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }}
        .meta-label {{ font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }}
        .meta-value {{ font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 2px; }}
        .footer {{ margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">LUCINA AI &bull; CLINICAL HANDOFF BRIEF</h1>
        <div class="subtitle">Interdisciplinary Endocrine, Gestational & Athletic Intelligence Engine | Generated {now_str}</div>
    </div>

    <div class="meta-grid">
        <div class="meta-card">
            <div class="meta-label">Patient Name</div>
            <div class="meta-value">{user.full_name}</div>
        </div>
        <div class="meta-card">
            <div class="meta-label">Patient ID & Age</div>
            <div class="meta-value">PAT-{user.user_id[:8].upper()} ({user.age} yrs)</div>
        </div>
        <div class="meta-card">
            <div class="meta-label">Clinical Status</div>
            <div class="meta-value">{'Pregnant (' + str(user.gestational_age_weeks) + 'w)' if user.is_pregnant else ('Athletic' if user.is_athlete else 'Endocrine')}</div>
        </div>
    </div>

    {f'''
    <div class="section">
        <div class="section-title">Explainable Risk Stratification (TreeSHAP Audit)</div>
        <div style="margin-bottom: 12px;">
            <strong>Diagnosis Flag:</strong> <span class="badge badge-red">{inference.primary_diagnosis_flag}</span>
            &nbsp;|&nbsp; <strong>Risk Score:</strong> {(inference.predicted_risk_score * 100):.1f}%
            &nbsp;|&nbsp; <strong>Mode:</strong> {inference.mode}
        </div>
        <table>
            <thead>
                <tr>
                    <th>Feature Biomarker</th>
                    <th>Observed Patient Value</th>
                    <th>TreeSHAP Attribution (Additive Impact)</th>
                </tr>
            </thead>
            <tbody>
                {shap_rows}
            </tbody>
        </table>
    </div>
    ''' if inference else ''}

    <div class="section">
        <div class="section-title">Recent Longitudinal Telemetry (LOINC Mapped)</div>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>BP (Systolic/Diastolic)</th>
                    <th>MAP (LOINC 8478-0)</th>
                    <th>Resting HR (LOINC 8867-4)</th>
                    <th>HRV RMSSD (LOINC 80404-7)</th>
                </tr>
            </thead>
            <tbody>
                {telemetry_rows}
            </tbody>
        </table>
    </div>

    <div class="footer">
        CONFIDENTIAL MEDICAL REPORT &bull; For Clinical Provider Decision Support Only &bull; Compliant with HL7 FHIR R4 Standards
    </div>
</body>
</html>"""
        return html

report_generator = ClinicalReportGenerator()
