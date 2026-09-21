# Eventallify

A modern, full-stack college event management platform built with **Next.js 16 (App Router)**, **React 19**, **MongoDB Atlas**, **Better Auth**, and **Tailwind CSS 4**. Eventallify enables students to discover, register for, and track campus events with digital QR passes, while providing organizers and administrators with tools to publish events, manage capacities and waitlists, broadcast announcements, and issue verifiable digital certificates.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (base-nova theme)
- **Database:** MongoDB Atlas via official `mongodb` driver & Better Auth MongoDB adapter
- **Authentication:** Better Auth (Email/Password, 6-Digit Email OTP Verification, Optional Google OAuth)
- **Email Delivery:** Brevo (Sendinblue) API & SMTP (Verification OTPs, Ticket Passes with QR Codes)
- **QR Codes:** `qrcode` generation for real-time ticket check-ins
- **AI Assistant:** Groq (Llama 3.3 70B) site-wide floating assistant widget
- **Icons & UI:** Lucide React, Sonner (Toasts), Next Themes (Dark/Light mode)

---

## Key Features

- **Role-Based Access Control:** Distinct experiences for **Students**, **Organizers**, and **Admins**.
- **6-Digit Email OTP Verification:** Secure account registration flow with automatic verification code dispatch via Brevo.
- **Event Discovery & Filtering:** Filter upcoming hackathons, workshops, cultural fests, technical symposiums, and sports tournaments by category, date, and search keywords.
- **Dynamic Registration & Waitlists:** Live capacity tracking, duplicate registration prevention, and automatic waitlist queueing when events hit maximum capacity.
- **Digital QR Code Passes:** Instant QR ticket generation for confirmed registrations with downloadable pass cards.
- **Verifiable Digital Certificates:** Public credential verification (`/verify/[id]`) for attended workshops and competitions.
- **Interactive Calendar View:** Monthly grid visualizing all scheduled campus activities.
- **Campus Announcements Feed:** Real-time priority alerts (*Urgent*, *Important*, *Normal*).
- **AI Campus Assistant:** Floating AI chatbot powered by Groq & Llama 3.3 70B for instant event guidance.
- **Responsive Dark/Light UI:** Clean, minimal, and high-performance design system with full mobile support.

---

## Getting Started

### Prerequisites

- **Node.js** 18.18+ or 20+
- A **MongoDB Atlas** database cluster ([cloud.mongodb.com](https://www.mongodb.com/cloud/atlas))
- A **Brevo** account for transactional email delivery ([brevo.com](https://www.brevo.com))
- *(Optional)* A **Groq** API key for the AI chat widget ([console.groq.com](https://console.groq.com))
- *(Optional)* **Google OAuth** credentials for social sign-in

---

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Database (MongoDB Atlas)
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/eventallify?retryWrites=true&w=majority"
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/eventallify?retryWrites=true&w=majority"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-generated-random-32-byte-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Email Delivery (Brevo REST API & SMTP)
BREVO_API_KEY="xkeysib-your-brevo-api-key"
EMAIL_FROM="Eventallify <eventlifynoreply@gmail.com>"
EMAIL_FROM_ADDRESS="eventlifynoreply@gmail.com"
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="your-smtp-login@smtp-brevo.com"
SMTP_PASS="your-smtp-or-api-key"

# Optional — Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional — AI Chatbot (Groq)
GROQ_API_KEY=""
```

---

### Installation & Local Development

```bash
# 1. Install project dependencies
npm install

# 2. Seed MongoDB Atlas with sample campus events & 15 user accounts
npm run db:seed

# 3. Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied).

---

## Test Accounts (After Seeding)

All 15 seeded test accounts share the default password: **`password123`**

| Role | Name | Email | Department |
| :--- | :--- | :--- | :--- |
| **Student** | Abhishek Sharma | `student@college.edu` | Computer Science (SCOPE) |
| **Admin** | Prof. Raghavan S. | `admin@college.edu` | Faculty Coordinator, SCOPE |
| **Student** | Priya Patel | `priya.patel@college.edu` | Electronics Engineering (SENSE) |
| **Student** | Rohan Verma | `rohan.v@college.edu` | Cloud & DevOps Lead (SCOPE) |
| **Student** | Ananya Iyer | `ananya.iyer@college.edu` | Design & Creative Arts (V-SIGN) |
| **Student** | Sneha Reddy | `sneha.reddy@college.edu` | Cyber Security & Forensics |

> You can also register a new account on `/register` — a real 6-digit OTP will be dispatched to your email via Brevo.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the production Next.js bundle |
| `npm run start` | Runs the built production server |
| `npm run lint` | Checks codebase with ESLint rules |
| `npm run db:seed` | Populates MongoDB Atlas with 15 users, 15 rich events, registrations, certificates & announcements |
| `npm run db:make-admin` | Promotes an existing user email to `admin` role |

---

## Database Architecture (MongoDB Collections)

Eventallify uses native MongoDB collections managed via the official `mongodb` client singleton and Better Auth adapter:

| Collection | Purpose |
| :--- | :--- |
| `user` | User accounts, profile details, college departments, roles, and bio |
| `account` | Hashed password credentials & OAuth account mappings |
| `session` | Active user sessions & device tokens |
| `verification` | Secure store for email verification OTPs and expiration timestamps |
| `events` | Complete event records (title, description, venue, schedule, rules, prizes, capacity) |
| `registrations` | User-to-event tickets with unique QR code payload, check-in status, and waitlist order |
| `certificates` | Verifiable digital completion & distinction credentials with skill badges |
| `announcements` | Campus broadcasts with priority classification (*urgent*, *important*, *normal*) |
| `feedback` | Star ratings and student reviews for completed events |
| `bookmarks` | Saved events per student for quick access |
| `notifications` | In-app alerts for registration confirmations and certificate issuances |
| `rateLimit` | Database-backed rate limiting counter store |

---

## Project Structure

```
Eventallify/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication routes (no main navbar)
│   │   ├── login/              #   Sign in with email/password
│   │   └── register/           #   Sign up with 6-digit email OTP verification
│   ├── admin/                  # Admin dashboard & management
│   ├── announcements/          # Public announcements feed
│   ├── api/                    # API Route Handlers
│   │   ├── auth/               #   Better Auth endpoints (OTP, sessions, OAuth)
│   │   ├── announcements/      #   Announcements CRUD
│   │   ├── chat/               #   Groq Llama 3.3 70B chatbot streaming
│   │   ├── dashboard/          #   Aggregated stats & dashboard data
│   │   ├── events/             #   Events CRUD, bookmarks & feedback
│   │   ├── registrations/      #   Event registration & unregister
│   │   ├── verify/[id]/        #   Public certificate verification API
│   │   └── user/               #   User profile & settings
│   ├── calendar/               # Interactive event calendar
│   ├── dashboard/              # Student overview (registered events, stats)
│   ├── events/                 # Event explorer & details
│   │   └── [id]/               #   Single event page with registration modal
│   ├── profile/                # User profile editor & certificates
│   ├── verify/[id]/            # Public certificate verification page
│   ├── layout.tsx              # Root layout (theme provider, navbar, toaster, AI chat)
│   ├── page.tsx                # Landing homepage
│   └── globals.css             # Tailwind CSS tokens & theme variables
│
├── components/                 # Reusable React components
│   ├── chat/                   # Floating AI assistant widget
│   ├── dashboards/             # Student & admin dashboard views
│   ├── events/                 # Event cards, registration dialogs, digital passes
│   ├── layout/                 # Navbar, theme toggle, notifications dropdown
│   ├── ui/                     # shadcn/ui component primitives
│   └── theme-provider.tsx      # Dark/light mode context provider
│
├── db/                         # Database layer
│   ├── schema.ts               # MongoDB collection names & TypeScript interfaces
│   ├── seed.ts                 # Full database seeder script
│   └── make-admin.ts           # Admin promotion CLI helper
│
├── lib/                        # Shared utilities & configurations
│   ├── auth.ts                 # Better Auth server configuration & emailOTP plugin
│   ├── auth-client.ts          # Better Auth React client with emailOTPClient
│   ├── db.ts                   # MongoDB Atlas client singleton & index manager
│   ├── email.ts                # Brevo API & SMTP email delivery engine
│   ├── event-images.ts         # Curated event artwork gallery
│   └── utils.ts                # Tailwind CSS class merging helper (cn)
│
├── public/                     # Static assets & icons
└── proxy.ts                    # Edge route protection & redirect logic
```

---

## Route Protection & Security

- **Public Routes:** `/`, `/events`, `/events/[id]`, `/calendar`, `/announcements`, `/verify/[id]`
- **Authenticated Routes:** `/dashboard`, `/profile`, `/my-events`, `/saved-events`, `/notifications`
- **Admin-Only Routes:** `/admin/*`
- **Guest-Only Routes:** `/login`, `/register` (redirect authenticated users automatically to `/dashboard`)

---

## License

This project is licensed under the MIT License.
