import nodemailer from "nodemailer";
import QRCode from "qrcode";

const SMTP_HOST = process.env.SMTP_HOST || "smtp-relay.brevo.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER =
  process.env.SMTP_USER ||
  process.env.EMAIL_FROM_ADDRESS ||
  "eventlifynoreply@gmail.com";
const SMTP_PASS =
  process.env.SMTP_PASS ||
  process.env.BREVO_API_KEY ||
  "";

const FROM_EMAIL =
  process.env.EMAIL_FROM || "Eventallify <eventlifynoreply@gmail.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function getTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user =
    process.env.SMTP_USER ||
    process.env.EMAIL_FROM_ADDRESS ||
    "eventlifynoreply@gmail.com";
  const pass =
    process.env.SMTP_PASS ||
    process.env.BREVO_API_KEY ||
    "";

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

// Any value that lands in an email template must be escaped — event titles,
// user names, etc. are attacker-controllable (an admin account, or anyone
// who can create an event/profile), and this HTML has no sanitizer downstream.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendMailOptions) {
  const brevoApiKey =
    process.env.BREVO_API_KEY ||
    (process.env.SMTP_PASS?.startsWith("xkeysib-") ? process.env.SMTP_PASS : "");

  // If Brevo REST API key is available, use fast, unrestricted HTTP delivery
  if (brevoApiKey && brevoApiKey.startsWith("xkeysib-")) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Eventallify",
            email: "eventlifynoreply@gmail.com",
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text || subject,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[email] Successfully delivered email via Brevo API to ${to} (Message ID: ${data.messageId})`);
        return { success: true, messageId: data.messageId };
      } else {
        const errJson = await res.json().catch(() => null);
        console.error(`[email] Brevo API error (${res.status}):`, errJson);
      }
    } catch (apiErr: any) {
      console.error("[email] Brevo API fetch failed:", apiErr?.message || apiErr);
    }
  }

  // Fallback to Nodemailer SMTP
  const transporter = getTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text: text || subject,
      });
      console.log(`[email] Sent email to ${to} via SMTP (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error("[email] SMTP send error:", err?.message || err);
    }
  }

  return { success: false };
}

interface SendVerificationEmailParams {
  user: {
    email: string;
    name: string;
    [key: string]: unknown;
  };
  url: string;
  token: string;
}

export interface SendOtpEmailParams {
  email: string;
  otp: string;
  type: string;
}

export async function sendOtpEmail({ email, otp, type }: SendOtpEmailParams) {
  let subject = "Your Verification Code - Eventallify";
  let title = "Verification Code";
  let description =
    "Use the 6-digit verification code below to verify your account.";

  if (type === "forget-password") {
    subject = "Password Reset Code - Eventallify";
    title = "Reset Password";
    description = "Use this code to reset your Eventallify password.";
  } else if (type === "sign-in") {
    subject = "Your Sign In Code - Eventallify";
    title = "Sign In Code";
    description = "Use this code to sign in to your Eventallify account.";
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f4f4f5;">
      <div style="max-width:480px;margin:40px auto;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        <div style="background:linear-gradient(135deg,#18181b,#27272a);padding:32px;text-align:center;border-bottom:1px solid #27272a;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Eventallify</h1>
          <p style="color:#a1a1aa;margin:6px 0 0;font-size:14px;">${title}</p>
        </div>
        <div style="padding:32px;text-align:center;">
          <p style="color:#d4d4d8;font-size:15px;line-height:22px;margin:0 0 24px;">
            ${description}
          </p>
          <div style="background:#27272a;border:1px solid #3f3f46;border-radius:12px;padding:20px;margin:24px 0;letter-spacing:8px;font-family:monospace;font-size:32px;font-weight:700;color:#38bdf8;text-align:center;">
            ${otp}
          </div>
          <p style="color:#a1a1aa;font-size:13px;line-height:20px;margin:0 0 8px;">
            This code will expire in <strong>10 minutes</strong>.
          </p>
          <p style="color:#71717a;font-size:12px;line-height:18px;margin:0;">
            If you did not request this verification code, please ignore this email.
          </p>
        </div>
        <div style="background:#09090b;padding:16px 32px;text-align:center;border-top:1px solid #27272a;">
          <p style="color:#71717a;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} Eventallify. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(`[email] Sending OTP [${otp}] to ${email} (type: ${type})`);
  return await sendEmail({
    to: email,
    subject,
    html,
    text: `Your Eventallify verification code is: ${otp}. It expires in 10 minutes.`,
  });
}

export async function sendVerificationEmail({
  user,
  url,
}: SendVerificationEmailParams) {
  const email = user.email;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="background:linear-gradient(135deg,#18181b,#27272a);padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Eventallify</h1>
          <p style="color:#a1a1aa;margin:8px 0 0;font-size:14px;">Verify your email address</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#27272a;font-size:16px;line-height:24px;margin:0 0 16px;">
            Thanks for signing up! Please verify your email address to get started.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${url}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
              Verify Email Address
            </a>
          </div>
          <p style="color:#71717a;font-size:13px;line-height:20px;margin:0;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color:#a1a1aa;font-size:11px;line-height:16px;margin:16px 0 0;word-break:break-all;">
            Direct link: ${url}
          </p>
        </div>
        <div style="background:#f4f4f5;padding:16px 32px;text-align:center;">
          <p style="color:#a1a1aa;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} Eventallify. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(`[email] Verification URL generated for ${email}: ${url}`);
  await sendEmail({
    to: email,
    subject: "Verify your email - Eventallify",
    html,
  });
}

interface SendEventRegistrationEmailParams {
  email: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventDescription: string;
  registrationId: string;
  eventId: string;
}

export async function sendEventRegistrationEmail({
  email,
  userName,
  eventTitle,
  eventDate,
  eventVenue,
  eventDescription,
  registrationId,
  eventId,
}: SendEventRegistrationEmailParams) {
  const eventUrl = `${APP_URL}/events/${eventId}`;
  const checkInUrl = `${APP_URL}/checkin/${registrationId}`;

  const qrDataUrl = await QRCode.toDataURL(checkInUrl, {
    width: 200,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  const safeUserName = escapeHtml(userName);
  const safeEventTitle = escapeHtml(eventTitle);
  const safeEventVenue = escapeHtml(eventVenue);
  const safeEventDate = escapeHtml(eventDate);
  const truncatedDescription = eventDescription
    ? eventDescription.slice(0, 200) +
      (eventDescription.length > 200 ? "..." : "")
    : "";
  const safeEventDescription = escapeHtml(truncatedDescription);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="background:linear-gradient(135deg,#18181b,#27272a);padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Eventallify</h1>
          <p style="color:#a1a1aa;margin:8px 0 0;font-size:14px;">Registration Confirmed</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#27272a;font-size:16px;line-height:24px;margin:0 0 24px;">
            Hi <strong>${safeUserName}</strong>, you're all set!
          </p>

          <div style="background:#f4f4f5;border-radius:8px;padding:20px;margin-bottom:24px;">
            <h2 style="color:#18181b;font-size:20px;font-weight:700;margin:0 0 12px;">${safeEventTitle}</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:4px 0;color:#71717a;font-size:14px;width:80px;vertical-align:top;">📅 Date</td>
                <td style="padding:4px 0;color:#27272a;font-size:14px;font-weight:500;">${safeEventDate}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#71717a;font-size:14px;vertical-align:top;">📍 Venue</td>
                <td style="padding:4px 0;color:#27272a;font-size:14px;font-weight:500;">${safeEventVenue}</td>
              </tr>
            </table>
            ${safeEventDescription ? `<p style="color:#52525b;font-size:13px;line-height:20px;margin:12px 0 0;">${safeEventDescription}</p>` : ""}
          </div>

          <div style="text-align:center;margin:24px 0;">
            <p style="color:#71717a;font-size:13px;margin:0 0 12px;">Your QR Code Ticket</p>
            <img src="${qrDataUrl}" alt="QR Code" style="width:200px;height:200px;border-radius:8px;border:1px solid #e4e4e7;" />
            <p style="color:#a1a1aa;font-size:12px;margin:8px 0 0;">Show this at the event entrance</p>
          </div>

          <div style="text-align:center;margin:24px 0 0;">
            <a href="${eventUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
              View Event Details
            </a>
          </div>
        </div>
        <div style="background:#f4f4f5;padding:16px 32px;text-align:center;">
          <p style="color:#a1a1aa;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} Eventallify. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Registration Confirmed: ${eventTitle}`,
    html,
  });
}
