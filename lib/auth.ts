import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { db } from "./db";
import { sendOtpEmail, sendVerificationEmail } from "./email";

const authSecret =
  process.env.BETTER_AUTH_SECRET ||
  "9a4f2e1c7b8d3e5f0a6b4c8d2e1f9a7b5c3d1e8f2a4b6c8d0e2f4a6b8c0d2e4f";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const hasGoogleAuth = Boolean(googleClientId && googleClientSecret);

const APP_URL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const auth = betterAuth({
  secret: authSecret,
  baseURL: APP_URL,

  // Google's OAuth redirect must land on a trusted origin, and this also
  // guards email/password endpoints against being hit from other origins.
  trustedOrigins: [
    APP_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://eventallify-neon.vercel.app",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],

  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
    autoSelect: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  emailVerification: {
    sendVerificationEmail,
    sendOnSignUp: true,
    expiresIn: 60 * 60 * 24, // 24 hours
  },

  socialProviders: hasGoogleAuth
    ? {
        google: {
          clientId: googleClientId!,
          clientSecret: googleClientSecret!,
        },
      }
    : {},

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  user: {
    changeEmail: { enabled: false },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false,
      },
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
    storage: "database",
  },

  advanced: {
    cookiePrefix: "eventhub",
    defaultCookieAttributes: {
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtpEmail({ email, otp, type });
      },
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 600, // 10 minutes
    }),
    nextCookies(),
  ],

  onAPIError: {
    throw: false,
    onError: (error) => {
      console.error("[better-auth]", error);
    },
  },
});

export type Session = typeof auth.$Infer.Session;
