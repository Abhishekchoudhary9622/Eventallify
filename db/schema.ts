// ─── Enums & Literals ──────────────────────────────────────────────────
export type Role = "student" | "organizer" | "admin";
export type RegistrationStatus = "confirmed" | "waitlisted" | "cancelled";
export type EventStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "published"
  | "rejected"
  | "completed"
  | "cancelled";
export type Priority = "low" | "normal" | "high";
export type NotificationType =
  | "registration"
  | "reminder"
  | "update"
  | "waitlist_promoted"
  | "certificate"
  | "announcement"
  | "approval"
  | "feedback";

// ─── Nested Event Models ───────────────────────────────────────────────

export interface ScheduleItem {
  time: string;
  activity: string;
  speaker?: string;
  location?: string;
}

export interface PrizeItem {
  position: string;
  reward: string;
  description?: string;
}

export interface SpeakerItem {
  name: string;
  role: string;
  organization?: string;
  avatar?: string;
  bio?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "select" | "checkbox";
  required?: boolean;
  options?: string[];
}

// ─── Better Auth & Application Interfaces ──────────────────────────────

export interface UserDoc {
  _id?: string;
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: Role;
  department?: string;
  collegeYear?: string;
  bio?: string;
  interests?: string[];
  notificationPreferences?: {
    email: boolean;
    reminders: boolean;
    announcements: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDoc {
  _id?: string;
  id: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountDoc {
  _id?: string;
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  password?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  idTokenExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationDoc {
  _id?: string;
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLimitDoc {
  _id?: string;
  id: string;
  key: string;
  count: number;
  lastRequest: number;
}

export interface EventDoc {
  _id?: string;
  id: string;
  title: string;
  shortDescription?: string;
  description: string;
  date: Date;
  endDate?: Date | null;
  venue: string;
  locationDetails?: string;
  category: string;
  imageUrl?: string | null;
  registrationDeadline: Date;
  maxParticipants?: number | null;
  organizerName?: string;
  organizerContact?: string;
  status: EventStatus;
  rejectionReason?: string;
  approvalFeedback?: string;
  schedule?: ScheduleItem[];
  rules?: string[];
  prizes?: PrizeItem[];
  speakers?: SpeakerItem[];
  faqs?: FAQItem[];
  allowWaitlist?: boolean;
  customQuestions?: CustomQuestion[];
  tags?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrationDoc {
  _id?: string;
  id: string; // Friendly ID e.g. "REG-849201"
  userId: string;
  eventId: string;
  status: RegistrationStatus;
  waitlistPosition?: number;
  customAnswers?: Record<string, any>;
  qrCode?: string | null;
  verificationToken: string; // Secure verification token
  checkedIn: boolean;
  checkedInAt?: Date | null;
  registeredAt: Date;
  studentName?: string;
  studentEmail?: string;
  department?: string;
  collegeYear?: string;
}

export interface BookmarkDoc {
  _id?: string;
  id: string;
  userId: string;
  eventId: string;
  createdAt: Date;
}

export interface NotificationDoc {
  _id?: string;
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  createdAt: Date;
}

export interface CertificateDoc {
  _id?: string;
  id: string; // e.g. "CERT-849201"
  userId: string;
  eventId: string;
  studentName: string;
  studentEmail?: string;
  eventTitle: string;
  eventDate: Date;
  organizerName: string;
  verificationCode: string;
  issuedAt: Date;
}

export interface FeedbackDoc {
  _id?: string;
  id: string;
  userId: string;
  eventId: string;
  rating: number; // 1 - 5
  comment?: string;
  userName?: string;
  createdAt: Date;
}

export interface AnnouncementDoc {
  _id?: string;
  id: string;
  title: string;
  content: string;
  eventId?: string | null;
  priority: Priority;
  createdBy: string;
  createdAt: Date;
}

// ─── Collection Names ──────────────────────────────────────────────────
export const COLLECTIONS = {
  USER: "user",
  SESSION: "session",
  ACCOUNT: "account",
  VERIFICATION: "verification",
  RATE_LIMIT: "rateLimit",
  EVENTS: "events",
  REGISTRATIONS: "registrations",
  ANNOUNCEMENTS: "announcements",
  BOOKMARKS: "bookmarks",
  NOTIFICATIONS: "notifications",
  CERTIFICATES: "certificates",
  FEEDBACK: "feedback",
} as const;
