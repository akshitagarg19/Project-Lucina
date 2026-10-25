# Lucina AI

**An exploratory health and sports-science dashboard for active women.**

Lucina AI brings together sample biometric tracking, illustrative risk-analysis workflows, a peer community, and clinical-data export in one project. It includes a FastAPI backend and a Next.js frontend, plus a standalone static dashboard served by the backend.

> **Important:** This project is a prototype for demonstration and evaluation. It is not a medical device and is not intended for diagnosis, treatment, or emergency decisions. Its sample profiles, health data, risk scores, and recommendations are illustrative only. Do not enter real personal or health information.

## At a glance

| Area | What it demonstrates |
| --- | --- |
| Cycle and endocrine patterns | Risk-score examples with feature-attribution explanations |
| Athletic energy and workload | Energy-availability and acute-to-chronic workload calculations |
| Gestational blood-pressure trends | Mean arterial pressure and a trend-based risk example |
| Community | Topic-based posts with an anonymous-posting option |
| Clinical export | FHIR-style JSON bundle and printable report |

## How it is structured

```text
.
├── backend/
│   ├── app/
│   │   ├── routers/       # FastAPI endpoints
│   │   ├── services/      # Analytics, FHIR serialization, and reports
│   │   ├── main.py        # API app, database initialization, and static dashboard
│   │   └── ...
│   ├── static/            # Standalone HTML dashboard
│   ├── tests/             # Backend test cases
│   ├── main.py            # Local server entry point
│   └── requirements.txt
├── frontend/
│   ├── src/               # Next.js app and components
│   ├── package.json
│   └── vercel.json        # Current deployment configuration
├── scripts/
│   └── init_db.sql        # PostgreSQL initialization SQL
├── start.bat              # Windows local launcher
├── run_backend.bat        # Windows backend launcher
└── run_frontend.bat       # Windows Next.js development launcher
```

## Run locally on Windows

### Option 1: Start the backend and built-in dashboard

Install Python and the packages listed in `backend/requirements.txt`, then run:

```bat
start.bat
```

The launcher checks Python, runs the project’s verification script, and starts the backend. The verification script may alter the local database by adding test records. The backend initializes its database and seeds sample profiles on startup.

Open:

- Dashboard: <http://localhost:8000/>
- API docs: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

Or start the backend manually:

```powershell
cd backend
python main.py
```

### Option 2: Run the Next.js frontend separately

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open <http://localhost:3000/>. The frontend defaults to the local backend at `http://localhost:8000/api/v1`. To point it at another API, set `NEXT_PUBLIC_API_URL` to the API base URL **before building** the frontend.

## Backend verification

The repository includes a backend verification runner:

```powershell
cd backend
python run_tests.py
```

It exercises telemetry, analytics, exports, and community workflows against the configured database. It writes test data, so use a disposable development database. Tests have not been run as part of this README update.

## Configuration notes

The backend reads `ENVIRONMENT`, `PORT`, `SECRET_KEY`, and `DATABASE_URL` from the environment. Without an explicit `DATABASE_URL`, it uses a SQLite file at `backend/lucina.db`. The project also includes PostgreSQL initialization SQL under `scripts/`.

The Next.js API client uses `NEXT_PUBLIC_API_URL`; if unset, it targets localhost. `NEXT_PUBLIC_` values are exposed to the browser and must not contain secrets.

## Deployment status

The included `frontend/vercel.json` is **not a verified deployment configuration**. The frontend and FastAPI backend are separate applications, and this file currently describes both using a `services` configuration that Vercel does not support in this form. Do not treat it as confirmation that the project is deployable on Vercel.

Before any public or production deployment, the deployment setup still needs to be designed and verified. At minimum:

- Deploy the frontend and API using supported project/runtime configurations and connect them using `NEXT_PUBLIC_API_URL`.
- Add authentication and enforce authorization for profiles, health records, analytics, and exports.
- Replace permissive CORS and development defaults with deployment-specific settings and secrets.
- Use a durable production database and a deliberate migration/initialization process.
- Prevent demo/test data from being seeded in production.
- Complete appropriate privacy, security, and clinical-safety reviews before handling real health information.

## License

No license file is currently included. Check the repository’s licensing status before redistributing or reusing this project.
