/**
 * prisma/seed-admin.ts
 *
 * ONE-TIME admin bootstrap script. Run it once to create the first (and,
 * per this schema, ONLY) admin account, then delete this file or just
 * leave it — it safely refuses to run again once an AdminProfile exists
 * (AdminProfile.singleton is a unique column defaulting to `true`, so the
 * database itself only ever allows one admin row).
 *
 * ── USAGE ─────────────────────────────────────────────────────────────────
 * One-off, inline (credentials never touch a file):
 *
 *   ADMIN_EMAIL=you@company.com ADMIN_PASSWORD="Str0ng!Pass" ADMIN_NAME="Your Name" \
 *     npx ts-node prisma/seed-admin.ts
 *
 * Or wire it into package.json:
 *   "scripts": { "seed:admin": "ts-node prisma/seed-admin.ts" }
 * then:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... npm run seed:admin
 *
 * ── AFTER RUNNING ─────────────────────────────────────────────────────────
 *  - Log in once to confirm it worked.
 *  - Delete this file (or at least clear ADMIN_PASSWORD from your shell
 *    history — `history -d <line>` on bash, or just don't reuse that shell).
 *  - Never commit real credentials to a .env file that gets committed.
 */
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10; // matches the rounds used elsewhere in this app

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Admin';

  if (!email || !password) {
    console.error('❌ Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running this script.');
    console.error('   Example: ADMIN_EMAIL=you@company.com ADMIN_PASSWORD="Str0ng!Pass" npx ts-node prisma/seed-admin.ts');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  // The schema only allows ONE AdminProfile row ever (singleton @unique).
  // Check first and exit cleanly instead of crashing on a constraint error.
  const existingAdmin = await prisma.adminProfile.findFirst();
  if (existingAdmin) {
    console.log('⚠️  An admin account already exists — this script only bootstraps the first one.');
    console.log('   If you genuinely need to replace it, remove the existing AdminProfile/User rows manually first.');
    process.exit(0);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.error(`❌ A user with email "${email}" already exists (role: ${existingUser.role}). Use a different email.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.admin,
        isActive: true,
      },
    });

    const adminProfile = await tx.adminProfile.create({
      data: {
        userId: user.id,
        name,
        // `singleton` defaults to true and is @unique — this is the only
        // AdminProfile row that will ever successfully insert.
      },
    });

    // Pre-create AdminSettings too, so /settings and the 2FA endpoints
    // don't have to lazily create it on first touch.
    await tx.adminSettings.create({
      data: { adminProfileId: adminProfile.id },
    });

    return { user, adminProfile };
  });

  console.log('✅ Admin account created successfully.');
  console.log(`   Email : ${result.user.email}`);
  console.log(`   Name  : ${result.adminProfile.name}`);
  console.log('   Log in now, then delete this script (or clear ADMIN_PASSWORD from shell history).');
}

main()
  .catch((err) => {
    console.error('❌ Failed to seed admin:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });