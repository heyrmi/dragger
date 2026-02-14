import { pgTable, text, timestamp, integer, boolean, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Custom fields
  reminderIntervalDays: integer("reminder_interval_days").default(3),
  lastReminderSentAt: timestamp("last_reminder_sent_at"),
  pushSubscription: text("push_subscription"),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(false),
  timezone: text("timezone").default("UTC"),
  inviteCode: text("invite_code").unique(),
});

// ─── Sessions (Better Auth) ──────────────────────────
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Accounts (Better Auth) ─────────────────────────
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Verifications (Better Auth) ────────────────────
export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Drag Logs ──────────────────────────────────────
export const dragLogs = pgTable(
  "drag_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dragAt: timestamp("drag_at"),
    type: text("type").notNull(), // 'drag' | 'no_change'
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("drag_logs_user_created").on(table.userId, table.createdAt),
  ]
);

// ─── Friendships ────────────────────────────────────
export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // 'pending' | 'accepted' | 'declined'
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_friendship").on(table.requesterId, table.addresseeId),
    index("friendships_requester").on(table.requesterId),
    index("friendships_addressee").on(table.addresseeId),
  ]
);

// ─── Nudges ─────────────────────────────────────────
export const nudges = pgTable(
  "nudges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toUserId: text("to_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message"),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("nudges_to_user_read").on(table.toUserId, table.readAt),
  ]
);
