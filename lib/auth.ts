import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { generateInviteCode } from "./utils/invite-code";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      reminderIntervalDays: {
        type: "number",
        defaultValue: 3,
        input: false,
      },
      emailNotifications: {
        type: "boolean",
        defaultValue: true,
        input: false,
      },
      pushNotifications: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      timezone: {
        type: "string",
        defaultValue: "UTC",
        input: false,
      },
      inviteCode: {
        type: "string",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const { db } = await import("./db");
          const { users } = await import("./db/schema");
          const { eq } = await import("drizzle-orm");
          const code = generateInviteCode();
          await db
            .update(users)
            .set({ inviteCode: code })
            .where(eq(users.id, user.id));
        },
      },
    },
  },
});
