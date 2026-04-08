# Dating Backend (Express + TypeScript + MongoDB)

This backend provides OTP-based auth APIs for a dating app:

- OTP generate/validate flow
- Register user with required profile fields + email/password
- Login with email + password
- Protected user profile route with JWT access token

## Tech Stack

- Express
- TypeScript
- MongoDB + Mongoose
- JWT (access + refresh tokens)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and update values:

```bash
cp .env.example .env
```

3. Run in dev mode:

```bash
npm run dev
```

## Environment Variables

- `PORT`: API port
- `MONGO_URI`: MongoDB connection string
- `JWT_ACCESS_SECRET`: access token secret
- `JWT_REFRESH_SECRET`: refresh token secret
- `ACCESS_TOKEN_TTL`: e.g. `15m`
- `REFRESH_TOKEN_TTL`: e.g. `30d`
- `OTP_TTL_MINUTES`: OTP validity duration
- `CLIENT_ORIGIN`: allowed CORS origin

## Users Module Endpoints

Base URL: `/users`

### 1) Generate OTP

`GET /users/otp/:number`

Example:

`GET /users/otp/+919999999999`

This generates OTP and prints it in server console for now.

### 2) Validate OTP

`POST /users/otp/validate`

```json
{
  "number": "+919999999999",
  "otp": "1234"
}
```

### 3) Register (with email + password)

`POST /users/register`

```json
{
  "phoneNumber": "+919999999999",
  "name": "Alex",
  "dob": "1998-05-20",
  "gender": "male",
  "interestedIn": "female",
  "profile": "Love music, travel and coffee",
  "location": {
    "coordinates": [77.5946, 12.9716]
  },
  "active": true,
  "ipAddress": "203.0.113.10",
  "email": "alex@example.com",
  "password": "secret123"
}
```

### 4) Login (email + password)

`POST /users/login`

```json
{
  "email": "alex@example.com",
  "password": "secret123"
}
```

### 5) Protected profile route

`GET /users/me`

Headers:

`Authorization: Bearer <access_token>`

## Notes

- Replace OTP response with real SMS gateway integration (Twilio/Fast2SMS/etc.) in production.
- Keep secrets strong and never commit `.env`.
- Refresh tokens are rotated and old token is revoked on refresh.
