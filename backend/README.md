<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

## Description

[NestJS](https://nestjs.com) API that proxies user data from [reqres.in](https://reqres.in) and exposes a JWT-protected endpoint for fetching a user's real email. The JWT is issued by the [frontend](../frontend)'s NextAuth setup and verified here using a shared secret.

## Prerequisites

- Node.js 20+
- A [reqres.in](https://reqres.in) API key

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `REQRES_BASE_URL` | Base URL of the reqres.in API. `https://reqres.in/api` by default. |
| `REQRES_API_KEY` | API key sent as the `x-api-key` header on every reqres.in request. Required — the app fails to start without it. |
| `REQRES_AUTH_TOKEN` | Reserved for reqres.in bearer auth; not currently read by the app. |
| `NEXTAUTH_SECRET` | Secret used to verify the JWT issued by the frontend's NextAuth. Must match the frontend's `NEXTAUTH_SECRET` exactly. |
| `FRONTEND_URL` | Origin allowed by CORS. Should match the frontend's `NEXTAUTH_URL`. `http://localhost:3000` in development. |
| `PORT` | Port this service listens on. `4000` by default. |
| `USERS_CACHE_TTL_MS` | How long the aggregated reqres.in user list is cached in memory, in milliseconds. `60000` by default. |

## Project setup

```bash
npm install
```

## Compile and run the project

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Run tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Linting

```bash
npm run lint
```

## Health Check

`GET /health` returns `{ status: 'ok', uptime, timestamp }` with a 200 status — no upstream dependency checks, so it stays healthy even if reqres.in is having issues. Used as the container's Docker healthcheck; see `docker-compose.yaml` at the repo root, where the frontend waits for this to go healthy before starting.

## Docker

Build and run the production image:

```bash
docker build -t backend .
docker run -p 4000:4000 --env-file .env backend
```

The image's `HEALTHCHECK` polls `/health` every 30s. Check its status with:

```bash
docker inspect --format='{{json .State.Health}}' <container>
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [reqres.in API Documentation](https://reqres.in)
