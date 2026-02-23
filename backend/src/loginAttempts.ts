import { prisma } from "./prisma";
import { createHash } from "crypto";

/**
 * Hash a string using SHA-256 for privacy-preserving storage
 */
function hashString(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Log a login attempt to the database
 */
export async function logLoginAttempt({
  email,
  success,
  ipAddress,
  userAgent,
}: {
  email: string;
  success: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.loginAttempt.create({
      data: {
        email: email.toLowerCase(),
        success,
        ipHash: ipAddress ? hashString(ipAddress) : null,
        userAgentHash: userAgent ? hashString(userAgent) : null,
      },
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error("Failed to log login attempt:", error);
  }
}

/**
 * Get recent failed login attempts for admin monitoring
 */
export async function getRecentFailedAttempts(limit = 100) {
  return prisma.loginAttempt.findMany({
    where: {
      success: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

/**
 * Get login attempt statistics for a specific email
 */
export async function getLoginAttemptStats(email: string, minutes = 60) {
  const since = new Date(Date.now() - minutes * 60 * 1000);

  const attempts = await prisma.loginAttempt.findMany({
    where: {
      email: email.toLowerCase(),
      createdAt: {
        gte: since,
      },
    },
  });

  return {
    total: attempts.length,
    failed: attempts.filter((a) => !a.success).length,
    successful: attempts.filter((a) => a.success).length,
  };
}
