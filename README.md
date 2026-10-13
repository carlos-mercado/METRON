# METRON

A workout tracking app built with React, TypeScript, and Vite.

## Features

- Create workouts from scratch or pick from pre-built templates.
- Track sets, reps, and weight for each movement.
- View workout / movement stats with interactive charts
- Heatmap for daily usage.
- Google Sign-In via Firebase Auth.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Auth:** Firebase Authentication (Google OAuth)
- **Database:** Firebase Realtime Database
- **API:** Flask REST API
- **Charts:** Recharts, react-activity-calendar
- **Hosting:** Vercel, EC2

## API authentication

API requests use `src/api.ts` to obtain the signed-in user's Firebase ID token
and attach it as a bearer token. The backend verifies the token and enforces
user ownership. Deploy both projects together when enabling this requirement.

Run the API client regression tests with `npm run test:api`.
