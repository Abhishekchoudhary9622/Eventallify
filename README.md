# Eventallify

A full-stack campus event management and ticketing platform built with **Next.js 16 (App Router)**, **React 19**, **MongoDB Atlas**, **Better Auth**, and **Tailwind CSS 4**. 

Eventallify streamlines the entire campus event lifecycle — from event creation, administrative approvals, and dynamic capacity tracking to 6-digit email OTP verification, digital QR pass issuance, and verifiable participation certificates.

---

## Key Features

- **Role-Based Portals:** Tailored interfaces and permissions for **Students**, **Organizers**, and **Administrators**.
- **Secure Email OTP Authentication:** 6-digit one-time passcode verification powered by Better Auth and transactional email delivery via Brevo.
- **Event Discovery & Filtering:** Search and filter campus workshops, hackathons, seminars, cultural fests, and sports tournaments by keyword, category, and date.
- **Live Capacity & Waitlist Engine:** Real-time registration tracking, duplicate registration prevention, and automatic waitlist queueing with auto-promotion when spots open up.
- **Digital QR Code Tickets:** Instant pass generation with scannable attendance verification tokens for event check-in.
- **Organizer Attendance Scanner:** In-app QR code camera scanner and registration ID lookup for live gate check-in.
- **Verifiable Digital Certificates:** Issue and publicly verify participation and achievement credentials via `/verify/[id]`.
- **Interactive Calendar:** Monthly visual agenda of scheduled university activities and events.
- **Campus Announcements:** Real-time priority notifications (*Urgent*, *Important*, *Normal*).
- **AI Event Assistant:** Integrated floating AI assistant powered by Groq (Llama 3.3 70B) to answer questions and guide students.
- **Theme Support:** Polished Dark and Light UI modes built with Tailwind CSS 4 and shadcn/ui.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) with native connection pooling & index management |
| **Authentication** | [Better Auth](https://www.better-auth.com/) (Email/Password, Email OTP Plugin, Session Cookies) |
| **Styling & UI** | [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/) |
| **Email Delivery** | [Brevo](https://www.brevo.com/) (REST API & SMTP Relay) |
| **QR Code Engine** | `qrcode` |
| **AI Integration** | [Groq SDK](https://console.groq.com/) (`llama-3.3-70b-versatile`) |

---

## Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- A **MongoDB Atlas** cluster connection string
- A **Brevo** account for sending OTP and registration emails

---

### Environment Configuration

Create a `.env` file in the root directory (or configure these variables in your deployment settings):

```env
# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:3000"

# Database Connection (MongoDB Atlas)
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/eventallify?retryWrites=true&w=majority"
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/eventallify?retryWrites=true&w=majority"

# Better Auth Secret
BETTER_AUTH_SECRET="your-secure-random-32-byte-secret"

# Email Delivery (Brevo)
BREVO_API_KEY="xkeysib-your-brevo-api-key"
EMAIL_FROM="Eventallify <your-verified-sender@example.com>"
EMAIL_FROM_ADDRESS="your-verified-sender@example.com"
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="your-brevo-smtp-login"
SMTP_PASS="your-brevo-smtp-key"

# Optional: AI Assistant (Groq)
GROQ_API_KEYS="gsk_your_groq_api_key"

# Optional: Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

### Installation & Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build and test production bundle
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Architecture

Eventallify uses native MongoDB collections:

| Collection | Purpose |
| :--- | :--- |
| `user` | User profiles, college departments, graduation years, and roles (`student`, `organizer`, `admin`) |
| `account` | Hashed credentials and provider account linkages |
| `session` | Active user authentication sessions and device metadata |
| `verification` | Email verification OTPs and expiration timestamps |
| `events` | Complete event records (schedules, rules, prizes, speakers, FAQs, capacity limits) |
| `registrations` | Event tickets, unique QR verification payloads, check-in status, and waitlist rankings |
| `certificates` | Issued digital participation credentials and verification hashes |
| `announcements` | Campus-wide broadcast alerts classified by priority |
| `feedback` | Star ratings and attendee reviews for completed sessions |
| `bookmarks` | Saved events per student profile |
| `notifications` | In-app alerts for registration confirmations, promotions, and certificate delivery |

---

## Project Structure

```
Eventallify/
├── app/                        # Next.js App Router (Pages & API Handlers)
│   ├── (auth)/                 # Authentication pages (/login, /register)
│   ├── admin/                  # Administrator control center & event approvals
│   ├── announcements/          # University announcements feed
│   ├── api/                    # Backend API route handlers
│   │   ├── admin/              #   Approval workflows & administrative actions
│   │   ├── auth/               #   Better Auth endpoint routes
│   │   ├── chat/               #   Groq AI chat endpoint
│   │   ├── events/             #   Events CRUD, check-in, certificates, feedback
│   │   ├── my-registrations/   #   Student active passes & registrations
│   │   └── verify/[id]/        #   Public certificate verification API
│   ├── calendar/               # Interactive monthly campus event calendar
│   ├── dashboard/              # Student dashboard & overview
│   ├── events/                 # Event explorer and detail pages
│   ├── organizer/              # Organizer management & attendance scanner
│   ├── profile/                # User profile editor & certificate showcase
│   └── verify/[id]/            # Public certificate verification landing page
├── components/                 # Reusable UI & Feature Components
│   ├── chat/                   # Floating AI assistant interface
│   ├── dashboards/             # Student, organizer & admin dashboard components
│   ├── events/                 # Event cards, registration dialogs, digital pass modals
│   └── ui/                     # shadcn/ui design primitives
├── db/                         # Database schema interfaces & admin utilities
│   ├── schema.ts               # Collection schemas & TypeScript interfaces
│   └── make-admin.ts           # Admin user promotion CLI utility
├── lib/                        # Core utilities & server singletons
│   ├── auth.ts                 # Better Auth server configuration
│   ├── auth-client.ts          # Better Auth React client hooks
│   ├── db.ts                   # MongoDB Atlas client singleton & index manager
│   ├── email.ts                # Brevo API & SMTP email sender
│   └── event-images.ts         # High-resolution event artwork gallery
└── middleware.ts               # Next.js route protection & session guards
```

---

## Useful Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts development server with Turbopack |
| `npm run build` | Compiles application for production |
| `npm run start` | Starts production server |
| `npm run lint` | Runs ESLint validation |
| `npm run db:make-admin <email>` | Promotes an existing user account to Administrator |

---

## License

This project is licensed under the [MIT License](LICENSE).
