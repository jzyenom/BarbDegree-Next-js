# BarbDegree App Explanation (Full)

This document explains the BarbDegree codebase in depth: architecture, data models, API routes, UI flows, Redux state, and realtime notifications. It is designed for developers who need to understand or extend the app.

## 1) High-Level Architecture

**Stack**
- **Next.js App Router** for pages and API routes (`src/app`).
- **MongoDB + Mongoose** for data persistence (`src/models`, `src/database/dbConnect.ts`).
- **NextAuth** for authentication and session management (`src/lib/authOptions.ts`).
- **Paystack** for payments (`src/app/api/paystack`, `src/app/api/booking/verify`).
- **Socket.io** for realtime notifications (`src/pages/api/socket-io.ts`).
- **Redux Toolkit** for client state (services, bookings, notifications, subscription, admin barbers).

**Routing split**
- App Router handles normal pages + API routes under `src/app`.
- Pages Router is only used for Socket.io server at `src/pages/api/socket-io.ts`.

**Core flows**
1. User signs in (Google or email/password).
2. Role is selected if missing.
3. User completes profile (barber/client).
4. Barbers create services.
5. Clients create bookings.
6. Paystack handles payments.
7. Notifications are emitted and shown live in the header.

---

## 2) Data Models (MongoDB / Mongoose)

### User (`src/models/User.ts`)
Fields:
- `name`, `email` (unique), `password` (optional, select:false), `avatar`
- `role`: `client`, `barber`, `admin`

Usage:
- Created automatically during Google OAuth or credentials login.
- Role is assigned after login using `/api/role`.

### Barber (`src/models/Barber.ts`)
Fields:
- `userId` (link to User)
- Contact info, address, bio, bank details
- `isSubscribed` (boolean)

Usage:
- Created when barber completes onboarding.
- `isSubscribed` is controlled by admin.

### Client (`src/models/Client.ts`)
Fields:
- `userId` (link to User)
- Contact info and address

Usage:
- Created when client completes onboarding.

### Service (`src/models/Service.ts`)
Fields:
- `barberId` (link to Barber)
- `name`, `description`, `price`, `durationMinutes`, `isActive`

Usage:
- Barbers add multiple services.

### Booking (`src/models/Booking.ts`)
Fields:
- `clientId`, `barberId`
- `service`, `address`, `dateTime`, `note`
- `estimatedPrice`, `amountPaid`
- `paymentStatus`: `pending`, `paid`, `failed`
- `status`: `pending`, `confirmed`, `completed`, `declined`

Usage:
- Created by client; later updated for reschedule or decline.

### Transaction (`src/models/Transaction.ts`)
Fields:
- `userId`, `bookingId`
- `amount`, `currency`, `reference`
- `status`: `pending`, `success`, `failed`
- `provider`, `providerResponse`

Usage:
- Created on Paystack initialization and updated after verification.

### Notification (`src/models/Notification.ts`)
Fields:
- `userId`
- `title`, `message`, `type`, `read`, `data`

Usage:
- Created on booking/reschedule/decline and emitted in realtime.

---

## 3) Authentication & Session

### NextAuth config
File: `src/lib/authOptions.ts`
- Providers: **Google** (if env vars provided), **Credentials**.
- Credentials flow:
  - If user exists, password is validated.
  - If user does not exist, a new user is created.
- Session callback attaches `user.id` and `user.role`.

### Session API route
File: `src/app/api/auth/[...nextauth]/route.ts`
- Exposes NextAuth handlers for GET/POST.

### Auth Guard
File: `src/lib/authGuard.ts`
- Helper that fetches server session and returns `{ user, unauthorized }`.

---

## 4) Role Selection Flow

### Role pages
- `/register` and `/register_role`
- Both render the same UI, selecting barber or client.

### Role API
File: `src/app/api/role/route.ts`
- Requires logged-in user.
- Updates that user’s role.

### Post-login redirect
File: `src/app/auth/redirect/page.tsx`
- If role exists ? `/dashboard/{role}`
- Else ? `/register`

---

## 5) Barber and Client Onboarding

### Barber form
File: `src/app/register/barber/page.tsx`
- Multi-step profile.
- Saves to `/api/barber`.

### Client form
File: `src/app/register/client/page.tsx`
- Single-step profile.
- Saves to `/api/client`.

---

## 6) Services (Barber Managed)

### API
- `GET /api/services`
  - If `barberId` query param exists ? public services.
  - If barber logged in ? their services.
  - Admin ? all services.

- `POST /api/services`
  - Creates a service for logged-in barber.

- `PUT /api/services/:id`
  - Update service (owner or admin).

- `DELETE /api/services/:id`
  - Delete service (owner or admin).

### UI
Page: `src/app/dashboard/barber/services/page.tsx`
- Create new service
- Toggle active status
- Delete service
- Shows subscription status

### Redux Slice
File: `src/features/services/servicesSlice.ts`
- `fetchServices`, `createService`, `updateService`, `deleteService`

---

## 7) Bookings

### API
- `GET /api/bookings`
  - Client sees their bookings.
  - Barber sees bookings assigned to them.
  - Admin sees all.
  - Filters: `date`, `service`, `from`, `to`.

- `POST /api/bookings`
  - Creates booking for logged-in client.
  - Checks barber subscription.
  - Sends realtime notification to barber.

- `PUT /api/bookings/:id`
  - Reschedule by updating `dateTime`.
  - Decline if barber owns booking.
  - Sends realtime notifications to the other party.

### UI
- Client bookings: `src/app/bookings/page.tsx`
- Barber bookings: `src/app/dashboard/barber/bookings/page.tsx`

### Redux Slice
File: `src/features/bookings/bookingsSlice.ts`
- `fetchBookings`
- `updateBooking`

---

## 8) Payments (Paystack)

### Initialize payment
File: `src/app/api/paystack/route.ts`
- Creates Paystack transaction and returns auth URL.
- Creates Transaction record in Mongo.

### Verify payment
File: `src/app/api/paystack/verify/route`
- Verifies Paystack reference.
- Updates Transaction + Booking.

### Alternative verification
File: `src/app/api/booking/verify/route.ts`
- Verifies using Paystack REST endpoint and updates booking.

---

## 9) Receipts

### PDFKit receipt
File: `src/app/api/booking/[id]/receipt/route.ts`
- Generates PDF inline and streams to the user.

### Puppeteer receipt
File: `src/app/api/receipt/[id]/route.ts`
- Generates HTML + QR, converts to PDF, uploads to S3.
- Note: depends on `uploadReceiptToS3` (currently missing).

---

## 10) Realtime Notifications

### Backend
- `notifyUser()` in `src/lib/notify.ts` writes to Mongo + emits socket event.
- Socket.io server runs in `src/pages/api/socket-io.ts`.

### Client
- Socket connects in `src/components/Providers.tsx`.
- User joins their room based on session id.
- Incoming notifications are added to Redux.

### UI
- Notifications appear in topbar dropdown.
- Component: `src/components/NotificationsBell.tsx`.

---

## 11) Subscription System (Barber Only)

### Barber subscription API
- `GET /api/barber/subscription`
  - returns `{ isSubscribed }`.

### Admin controls subscription
- `GET /api/admin/barbers`
- `POST /api/admin/barbers/subscription`
  - updates `isSubscribed` for a barber.

### Admin UI
- `src/app/dashboard/admin/subscriptions/page.tsx`

### Redux Slice
- `src/features/subscription/subscriptionSlice.ts`

---

## 12) Redux Toolkit (All State)

Slices and usage:
- **Services**: `src/features/services/servicesSlice.ts`
- **Bookings**: `src/features/bookings/bookingsSlice.ts`
- **Transactions**: `src/features/transactions/transactionsSlice.ts`
- **Notifications**: `src/features/notifications/notificationsSlice.ts`
- **Subscription**: `src/features/subscription/subscriptionSlice.ts`
- **Admin Barbers**: `src/features/admin/adminBarbersSlice.ts`

Store and hooks:
- `src/store/index.ts`
- `src/store/hooks.ts`

Provider:
- `src/components/Providers.tsx`

---

## 13) UI Components and Layouts

Important UI files:
- `src/components/HomeHeader.tsx`
- `src/components/Barber/BarberHeader.tsx`
- `src/components/ui/HeaderBack.tsx`
- `src/components/NotificationsBell.tsx`
- `src/components/LogoutButton.tsx`
- Auth layout and inputs (`src/components/layouts/AuthLayout.tsx`, `src/components/AuthInput.tsx`)

---

## 14) App Pages Summary

- `/` Home (client landing)
- `/login` Auth choice + login
- `/register` Role selection
- `/register/client` Client profile
- `/register/barber` Barber profile
- `/dashboard/barber` Barber dashboard
- `/dashboard/barber/services` Manage services
- `/dashboard/barber/bookings` Manage bookings
- `/dashboard/admin/subscriptions` Admin subscription control
- `/book` Client booking form
- `/book/confirm` Booking confirmation + payment
- `/bookings` Client booking management
- `/transactions` Transaction/booking history

---

## 15) Known Gaps / Follow-Ups

- `uploadReceiptToS3` is missing; the S3-based receipt route will fail until implemented.
- Some dashboards and pages (e.g. `/dashboard/client`) are empty.
- Booking UI still uses static barber IDs in some areas; service selection can be wired to real services.
- Transactions page still renders bookings rather than actual transaction docs.

---

## 16) Future Improvement Ideas

- Add service selection + barber service list into booking flow.
- Add admin dashboard for users, bookings, and payments.
- Add status history for bookings (audit trail).
- Add pagination to bookings/notifications/transactions.
- Add upload handling for barber images (S3/Cloudinary).

---

If you want, I can generate API reference examples for each endpoint or add flow diagrams.
