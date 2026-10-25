const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function readResponse<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `API request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }
  return response.json();
}

export interface TelemetryLogPayload {
  user_id: string;
  recorded_date: string;
  systolic_bp: number;
  diastolic_bp: number;
  rhr_bpm: number;
  hrv_rmssd: number;
  basal_body_temp_c?: number;
  weight_kg?: number;
  symptoms?: Array<{
    snomed_code: string;
    severity: number;
    notes?: string;
  }>;
}

export interface EndocrinePayload {
  user_id: string;
  lh_fsh_ratio: number;
  free_testosterone_ng_dl: number;
  cycle_length_variance_days: number;
  hirsutism_score?: number;
  bmi?: number;
}

export interface RedsPayload {
  user_id: string;
  fat_free_mass_kg: number;
  caloric_intake_kcal: number;
  exercise_energy_expenditure_kcal: number;
  acute_7d_workload: number;
  chronic_28d_workload: number;
}

export interface GestationalPayload {
  user_id: string;
  gestational_age_weeks: number;
  systolic_bp: number;
  diastolic_bp: number;
  historical_map_readings?: number[];
}

export interface CommunityPostPayload {
  user_id: string;
  author_display_name?: string;
  is_anonymous: boolean;
  topic_circle: string;
  title: string;
  content: string;
}

export interface CommunityPost {
  post_id: string;
  user_id: string;
  author_display_name: string;
  is_anonymous: boolean;
  topic_circle: string;
  title: string;
  content: string;
  created_at: string;
  upvotes: number;
}

export const api = {
  // Telemetry
  logTelemetry: async (data: TelemetryLogPayload) => {
    const res = await fetch(`${BASE_URL}/telemetry/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return readResponse(res);
  },

  getTelemetryHistory: async (userId: string) => {
    const res = await fetch(`${BASE_URL}/telemetry/history/${userId}`);
    return readResponse(res);
  },

  // Endocrine Stratification & TreeSHAP
  // Endocrine Stratification & SHAP
  predictEndocrine: async (data: EndocrinePayload) => {
    const res = await fetch(`${BASE_URL}/analytics/endocrine/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return readResponse(res);
  },

  // Athletic RED-S & ACWR
  checkReds: async (data: RedsPayload) => {
    const res = await fetch(`${BASE_URL}/analytics/athletic/reds-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return readResponse(res);
  },

  // Gestational Bayesian MAP
  checkGestational: async (data: GestationalPayload) => {
    const res = await fetch(`${BASE_URL}/analytics/gestational/map-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return readResponse(res);
  },

  // Peer Community Hub
  getCommunityPosts: async (topicCircle?: string) => {
    let url = `${BASE_URL}/community/posts`;
    if (topicCircle && topicCircle.toLowerCase() !== "all") {
      url += `?topic_circle=${encodeURIComponent(topicCircle)}`;
    }
    const res = await fetch(url);
    return readResponse(res);
  },

  createCommunityPost: async (data: CommunityPostPayload) => {
    const res = await fetch(`${BASE_URL}/community/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return readResponse(res);
  },

  upvotePost: async (postId: string) => {
    const res = await fetch(`${BASE_URL}/community/posts/${postId}/upvote`, {
      method: "POST",
    });
    return readResponse(res);
  },

  // FHIR Export
  getFhirBundle: async (userId: string) => {
    const res = await fetch(`${BASE_URL}/export/fhir-bundle/${userId}`);
    return readResponse(res);
  },

  // Clinical Report URL
  getReportUrl: (userId: string) => `${BASE_URL}/export/clinical-report/${userId}`,

  // Users
  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/users`);
    return readResponse(res);
  }
};
