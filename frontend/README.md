This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- Node.js 20+
- The [backend API](../backend) running locally (defaults to `http://localhost:4000`)

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `NEXTAUTH_URL` | Base URL of this app, used by NextAuth for callbacks. `http://localhost:3000` in development. |
| `NEXTAUTH_SECRET` | Random secret used to sign/encrypt NextAuth session tokens. Generate one with `openssl rand -base64 32`. |
| `GOOGLE_CLIENT_ID` | OAuth client ID from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials). |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret from the same Google Cloud credentials page. |
| `NEXT_PUBLIC_BACKEND_URL` | Base URL of the backend API this app talks to. Read from client components, so it must be `NEXT_PUBLIC_`-prefixed to reach the browser bundle. `http://localhost:4000` in development. |

To set up Google OAuth credentials:

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** of type "Web application".
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
4. Copy the generated client ID and secret into `.env`.

## Getting Started

Install dependencies, then run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing

Run the unit test suite with [Jest](https://jestjs.io):

```bash
npm test
# or, in watch mode
npm run test:watch
```

## Linting

```bash
npm run lint
```

## Docker

Build and run the production image:

```bash
docker build -t frontend .
docker run -p 3000:3000 --env-file .env frontend
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
