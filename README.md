# Practical Assignment

Authentication portal with role-based access control. Includes a Next.js web app and a React Native (Expo) mobile app, both using Firebase for auth and Firestore for data.

## Tech Stack

- Web: Next.js, React, TypeScript, Tailwind CSS
- Mobile: React Native, Expo, TypeScript
- Backend: Firebase Auth, Firestore

## Features

- Email/password registration and login
- Whitelist-based access control (web enforces it on login and registration)
- Admin panel to manage the whitelist (add/remove emails)
- User dashboard with password change and access status display
- Role badges: admin, desktop access granted, no desktop access

## Project Structure

- web-app/ -- Next.js application
- mobile-app/ -- Expo/React Native application

## Setup

### Prerequisites

- Node.js
- A Firebase project with Auth and Firestore enabled

### Web App

```
cd web-app
npm install
npm run dev
```

Create a .env.local file in web-app/ with your Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Mobile App

```
cd mobile-app
npm install
npm start
```

Create a .env file in mobile-app/ with your Firebase config:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## Firestore Collections

- whitelist -- emails allowed to access the web app
- admins -- emails with admin privileges
