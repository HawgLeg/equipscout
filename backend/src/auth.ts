import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { prisma } from "./prisma";
import { env } from "./env";

// Initialize Resend client if API key is available
let resend: Resend | null = null;
if (env.RESEND_API_KEY) {
  resend = new Resend(env.RESEND_API_KEY);
  console.log("✅ Resend email provider configured");
} else {
  console.warn("⚠️ RESEND_API_KEY not set - email sending is disabled. Users will not receive verification or password reset emails.");
}

// Email template helper functions
function getEmailStyles(): string {
  return `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); padding: 40px; }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo-text { font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px; }
    .logo-icon { font-size: 32px; margin-right: 8px; }
    h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0; text-align: center; }
    p { font-size: 16px; color: #555; margin: 0 0 24px 0; text-align: center; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .button:hover { background-color: #1d4ed8; }
    .divider { border: none; border-top: 1px solid #e5e5e5; margin: 32px 0; }
    .footer { text-align: center; color: #888; font-size: 14px; margin-top: 32px; }
    .footer p { color: #888; font-size: 14px; margin: 8px 0; }
    .link { color: #2563eb; word-break: break-all; font-size: 14px; }
    .warning { background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0; }
    .warning p { color: #92400e; font-size: 14px; margin: 0; text-align: left; }
  `;
}

function getVerificationEmailHtml(url: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - EquipScout</title>
      <style>${getEmailStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">
            <span class="logo-icon">🔍</span>
            <span class="logo-text">EquipScout</span>
          </div>
          <h1>Verify Your Email Address</h1>
          <p>Welcome to EquipScout! Please click the button below to verify your email address and activate your account.</p>
          <div class="button-container">
            <a href="${url}" class="button">Verify Email Address</a>
          </div>
          <hr class="divider">
          <p style="font-size: 14px; color: #888;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p class="link">${url}</p>
          <div class="warning">
            <p><strong>Didn't request this?</strong> If you didn't create an account with EquipScout, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>This link will expire in 24 hours.</p>
            <p>&copy; ${new Date().getFullYear()} EquipScout. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getPasswordResetEmailHtml(url: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - EquipScout</title>
      <style>${getEmailStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">
            <span class="logo-icon">🔍</span>
            <span class="logo-text">EquipScout</span>
          </div>
          <h1>Reset Your Password</h1>
          <p>We received a request to reset your password. Click the button below to choose a new password.</p>
          <div class="button-container">
            <a href="${url}" class="button">Reset Password</a>
          </div>
          <hr class="divider">
          <p style="font-size: 14px; color: #888;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p class="link">${url}</p>
          <div class="warning">
            <p><strong>Didn't request this?</strong> If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>&copy; ${new Date().getFullYear()} EquipScout. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://*.dev.vibecode.run",
    "https://*.vibecode.run",
    "https://*.vibecodeapp.com",
    "https://*.vibecode.dev",
    "https://vibecode.dev",
  ],
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (!resend) {
        console.warn(`⚠️ Cannot send verification email to ${user.email} - Resend not configured`);
        return;
      }

      try {
        const { error } = await resend.emails.send({
          from: "EquipScout <noreply@equipscout.com>",
          to: user.email,
          subject: "Verify Your Email - EquipScout",
          html: getVerificationEmailHtml(url),
        });

        if (error) {
          console.error(`❌ Failed to send verification email to ${user.email}:`, error);
        } else {
          console.log(`✅ Verification email sent to ${user.email}`);
        }
      } catch (err) {
        console.error(`❌ Error sending verification email to ${user.email}:`, err);
      }
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.warn(`⚠️ Cannot send password reset email to ${user.email} - Resend not configured`);
        return;
      }

      try {
        const { error } = await resend.emails.send({
          from: "EquipScout <noreply@equipscout.com>",
          to: user.email,
          subject: "Reset Your Password - EquipScout",
          html: getPasswordResetEmailHtml(url),
        });

        if (error) {
          console.error(`❌ Failed to send password reset email to ${user.email}:`, error);
        } else {
          console.log(`✅ Password reset email sent to ${user.email}`);
        }
      } catch (err) {
        console.error(`❌ Error sending password reset email to ${user.email}:`, err);
      }
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "vendor",
        input: false,
      },
    },
  },
  advanced: {
    trustedProxyHeaders: true,
    disableCSRFCheck: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session, context) => {
          // Log successful login when a session is created
          if (context) {
            const { logLoginAttempt } = await import("./loginAttempts");
            const headers = context.request?.headers;

            // Get the user's email from the session
            const user = await prisma.user.findUnique({
              where: { id: session.userId },
              select: { email: true },
            });

            if (user) {
              const ipAddress = headers?.get("x-forwarded-for")?.split(",")[0] || headers?.get("x-real-ip");
              const userAgent = headers?.get("user-agent");

              await logLoginAttempt({
                email: user.email,
                success: true,
                ipAddress,
                userAgent,
              });
            }
          }
        },
      },
    },
  },
});
