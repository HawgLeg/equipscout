import { PrismaClient } from "@prisma/client";
import { auth } from "../src/auth";

const prisma = new PrismaClient();

async function createAdmin() {
  const email = "admin@equipscout.io";
  const password = "admin123";
  const name = "Admin";

  // Delete existing admin user if exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await prisma.account.deleteMany({ where: { userId: existingUser.id } });
    await prisma.session.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
    console.log("Deleted existing admin user");
  }

  // Create user through Better Auth's signup
  const signUpResponse = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  if (!signUpResponse || !signUpResponse.user) {
    console.error("Failed to create admin user");
    return;
  }

  // Update user role to admin
  await prisma.user.update({
    where: { id: signUpResponse.user.id },
    data: { role: "admin" },
  });

  console.log("Admin user created successfully!");
  console.log("Email:", email);
  console.log("Password:", password);
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
