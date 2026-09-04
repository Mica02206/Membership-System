# Memberly

A feature-driven membership management system with separate applications.

- `frontend/`: Next.js App Router UI. Feature ownership lives under `src/features/registration` and `src/features/check-in`; universal UI lives under `src/shared`.
- `backend/`: Express REST API. User routes, controllers, models, and services live under `src/features/users`.

## Run

```powershell
cd backend; npm install; npm run dev
cd ../frontend; npm install; npm run dev
```

API endpoints: `POST /api/members` (multipart registration), `GET /api/members/:memberId/status` (read-only status), and `GET /api/members`.
