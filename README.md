# Memberly

A feature-driven membership management system using a Next.js frontend and Supabase.

- `frontend/`: Next.js App Router UI. Feature ownership lives under `src/features/registration` and `src/features/check-in`; universal UI lives under `src/shared`.

## Run

```powershell
cd frontend
npm install
npm run dev
```

The frontend connects directly to Supabase using the public environment variables in `frontend/.env.local`.
