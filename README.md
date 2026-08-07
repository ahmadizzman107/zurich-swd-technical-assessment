# Zurich Customer Portal — Users List Assessment

A mini fullstack application built for the Zurich Web Developer assessment. Users log in with Google, land on a protected users list screen, and view a filtered, paginated set of users with masked emails that can be revealed on demand.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), Redux Toolkit / RTK Query, NextAuth.js |
| Backend | NestJS (BFF / API layer) |
| Auth | Google OAuth2 via NextAuth, JWT validated on the backend |
| Data source | [reqres.in](https://reqres.in/api/users) users API, proxied through NestJS |
| Testing | Jest + React Testing Library (frontend), MSW for API mocking |
| Infra | Docker, Docker Compose |

## Architecture

```
Browser (Next.js) ──▶ NestJS BFF ──▶ reqres.in
       ▲                   │
       └── session/JWT ────┘
```

The frontend never calls reqres.in directly. All business logic — pagination aggregation across reqres.in's pages, the "first name starts with G or last name starts with W" filter, email masking, and auth verification — lives in the NestJS layer. This keeps business logic out of the browser bundle and gives the "masked email" feature a real security boundary rather than just UI hiding.

See `architecture-and-dev-strategy.md` for the full design rationale.

## Project Structure

```
.
├── frontend/
│   ├── app/
│   ├── components/
│   ├── store/
│   ├── lib/
│   ├── Dockerfile
│   └── .dockerignore
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   └── users/
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- A Google OAuth2 Client ID/Secret ([Google Cloud Console](https://console.cloud.google.com/apis/credentials)) with `http://localhost:3000/api/auth/callback/google` set as an authorized redirect URI

## Environment Variables

Copy `.env.example` to `.env` in the project root and fill in:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=          # generate with: openssl rand -base64 32
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=               # shared secret used by the backend to validate tokens
REQRES_BASE_URL=https://reqres.in/api
```

`NEXTAUTH_SECRET` and `JWT_SECRET` can be the same value for this project's scope, since both are just used to sign/verify the session token between the two services.

## Running with Docker (recommended)

```bash
docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:4000](http://localhost:4000)

This builds both services from their Dockerfiles and wires them together on the same Docker network, so the frontend can reach the backend at `http://backend:4000` internally.

## Running Locally (without Docker)

**Backend**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend** (in a separate terminal)
```bash
cd frontend
npm install
npm run dev
```

## Running Tests

Frontend unit tests (components, Redux slices, API layer with MSW mocks):

```bash
cd frontend
npm test
```

Backend unit tests (pagination aggregation, filter logic):

```bash
cd backend
npm test
```

## Key Functional Flows

1. **Login** — user authenticates via Google on `/login`; unauthenticated users hitting `/users` directly are redirected to `/unauthorized`.
2. **Users list** — content area fetches all users from the backend, which internally walks every page of the reqres.in response and applies the name filter before returning data.
3. **Email masking** — emails are returned masked by default; clicking "reveal" triggers an authenticated call to the backend to fetch the real value.

## Notes

- `reqres.in` is a public mock API with no real secrets — the backend's role here is to demonstrate correct BFF architecture (auth enforcement, business logic separation, pagination handling) rather than protecting a genuinely sensitive upstream key.
- Images are built multi-stage to keep runtime images minimal — dev dependencies and source/build tools are not present in the final containers.