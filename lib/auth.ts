import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { db } from "./db";
import { sendOtpEmail, sendVerificationEmail } from "./email";

const requiredEnv = ["BETTER_AUTH_SECRET"] as const;
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const hasGoogleAuth = Boolean(googleClientId && googleClientSecret);

const APP_URL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: APP_URL,

  // Google's OAuth redirect must land on a trusted origin, and this also
  // guards email/password endpoints against being hit from other origins.
  trustedOrigins: [
    APP_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
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
