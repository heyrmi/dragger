# Dragger — Product Requirements Document

**Version:** 1.0
**Date:** February 14, 2026
**Status:** Planning

---

## 1. Product Overview

**Dragger** is a Next.js full-stack accountability app that helps friend groups track and reduce cigarette consumption. Users log when they last had a drag, maintain streaks of clean days, invite friends, and hold each other accountable through leaderboards, activity feeds, and nudges.

### 1.1 Core Value Proposition

Most quit-smoking apps are clinical and isolating. Dragger flips the script — it makes quitting social, competitive, and low-pressure. You're not "quitting forever," you're just seeing how long you can go. The friend layer creates natural accountability without nagging.

### 1.2 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Auth | Better Auth |
| ORM | Drizzle ORM |
| Database | Neon (Serverless Postgres) |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |
| Notifications | Resend (email) + Web Push API (browser) |
| Cron/Scheduled Jobs | Vercel Cron |

---

## 2. Design System & Visual Identity

### 2.1 Design Philosophy

Dragger should feel like a personal tool — not a SaaS product. Think: the aesthetic of a weathered notebook crossed with a brutalist dashboard. It should feel raw, honest, and slightly rebellious — matching the personality of people who smoke socially.

### 2.2 Color Palette

Avoid the typical startup blue/purple/gradient look. Use a grounded, earthy palette with a single high-contrast accent:

| Role | Color | Hex |
|---|---|---|
| Background (primary) | Off-black / charcoal | `#1A1A1A` |
| Background (surface) | Warm dark gray | `#252220` |
| Background (card) | Slightly lighter warm gray | `#2E2B28` |
| Text (primary) | Warm off-white / parchment | `#E8E0D4` |
| Text (secondary) | Muted sand | `#9C9488` |
| Accent (primary) | Burnt ember / deep orange-red | `#D4553A` |
| Accent (secondary) | Amber / warm gold | `#D4A03A` |
| Success / Clean streak | Sage green | `#6B8F71` |
| Danger / Relapse | Smoky red (muted) | `#A04040` |
| Border / Divider | Warm gray, very subtle | `#3A3735` |

### 2.3 Typography

Use a pairing that feels editorial and human, not corporate:

- **Headings:** `Space Grotesk` (variable weight) — geometric but with character, slightly quirky letterforms
- **Body text:** `Inter` — clean and highly readable at all sizes
- **Monospace / data / timestamps:** `JetBrains Mono` — for streak counters, timestamps, and numeric data
- Load via `next/font/google` for zero layout shift

### 2.4 Styling Principles

- **No rounded-everything:** Use `rounded-sm` (2-4px) or sharp corners. Reserve `rounded-full` only for avatars and small badges.
- **Subtle texture:** Add very faint noise/grain overlay on backgrounds (CSS `background-image` with a tiny repeating SVG pattern at ~3% opacity).
- **Borders over shadows:** Use thin `1px` borders (`border-[#3A3735]`) instead of box-shadows for cards and containers.
- **Whitespace is generous:** Let content breathe. Large `gap` values, `py-8` or more between sections.
- **Motion is minimal and purposeful:** Only animate streak counters (counting up) and status transitions. Use `transition-colors duration-200` for hover states. No bouncing, sliding, or attention-seeking animations.
- **Data is monospaced and large:** Streak numbers should be oversized (`text-5xl` or larger) in `JetBrains Mono`, making the core metric impossible to ignore.
- **Micro-interactions:** Subtle border color change on hover for interactive elements. A brief "pulse" on the streak counter when it updates. Button press states (slight scale-down `active:scale-[0.98]`).

### 2.5 Component Patterns

- **Cards:** `bg-[#2E2B28] border border-[#3A3735] rounded-sm p-6`
- **Buttons (primary):** `bg-[#D4553A] text-white rounded-sm px-5 py-2.5 font-medium hover:bg-[#B8432D] active:scale-[0.98] transition-all`
- **Buttons (secondary):** `border border-[#3A3735] text-[#E8E0D4] rounded-sm px-5 py-2.5 hover:border-[#9C9488] transition-colors`
- **Inputs:** `bg-[#1A1A1A] border border-[#3A3735] rounded-sm text-[#E8E0D4] placeholder-[#9C9488] focus:border-[#D4553A] focus:ring-1 focus:ring-[#D4553A]`
- **Badges/Tags:** `inline-flex text-xs font-mono px-2 py-0.5 rounded-sm` with color variants

---

## 3. Information Architecture

```
/                         → Landing page (public)
/login                    → Login form
/signup                   → Signup form
/invite/[code]            → Accept invite (auto-signup if new)
/dashboard                → Main hub: personal streak + friend feed
/dashboard/log            → Log a drag / confirm "no change"
/dashboard/friends        → Friend list, invite link, search
/dashboard/leaderboard    → Streak rankings among friends
/dashboard/settings       → Profile, reminder config, notification prefs
```

---

## 4. Database Schema (Drizzle ORM + Neon)

### 4.1 Tables

```typescript
// schema.ts

import { pgTable, text, timestamp, integer, boolean, uuid, uniqueIndex } from 'drizzle-orm/pg-core';

// ─── Users ────────────────────────────────────────────
export const users = pgTable('users', {
  id: text('id').primaryKey(),                          // Better Auth generates this
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),                                 // avatar URL
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  // Custom fields
  reminderIntervalDays: integer('reminder_interval_days').default(3),
  lastReminderSentAt: timestamp('last_reminder_sent_at'),
  pushSubscription: text('push_subscription'),          // JSON string of PushSubscription
  emailNotifications: boolean('email_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(false),
  timezone: text('timezone').default('UTC'),
  inviteCode: text('invite_code').unique(),             // 8-char unique code per user
});

// ─── Sessions (Better Auth) ──────────────────────────
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Accounts (Better Auth - OAuth providers) ────────
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),                           // hashed, for credential auth
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Verification (Better Auth) ─────────────────────
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Drag Logs ────────────────────────────────────────
// The core data: every time a user logs "I had a drag" or "no change"
export const dragLogs = pgTable('drag_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dragAt: timestamp('drag_at'),                         // null = "no change" entry
  type: text('type').notNull(),                         // 'drag' | 'no_change'
  note: text('note'),                                   // optional personal note
  createdAt: timestamp('created_at').defaultNow(),      // when the log was recorded
});

// ─── Friendships ──────────────────────────────────────
// Bidirectional: always store with requesterId < addresseeId to avoid dupes
export const friendships = pgTable('friendships', {
  id: uuid('id').defaultRandom().primaryKey(),
  requesterId: text('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  addresseeId: text('addressee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'),  // 'pending' | 'accepted' | 'declined'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  uniqueFriendship: uniqueIndex('unique_friendship').on(table.requesterId, table.addresseeId),
}));

// ─── Nudges ───────────────────────────────────────────
// When a friend pokes you to update
export const nudges = pgTable('nudges', {
  id: uuid('id').defaultRandom().primaryKey(),
  fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: text('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message'),                             // optional short message
  readAt: timestamp('read_at'),                         // null = unread
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 4.2 Derived / Computed Data

These are NOT stored in the DB — computed on the fly or via a materialized view:

- **Current streak:** Days between now and the user's most recent `drag_at` (where `type = 'drag'`)
- **Longest streak:** Max gap between consecutive `drag` entries
- **Last update:** Most recent `dragLogs.createdAt` for the user
- **Days since last update:** `now() - lastUpdate` → used to trigger reminders
- **Friend activity feed:** Recent `dragLogs` from friends, joined with user info

---

## 5. Feature Specifications

### 5.1 Authentication (Better Auth)

**Provider:** Email + password (credential auth). Optionally Google OAuth later.

**Signup flow:**
1. User visits `/signup` (or `/invite/[code]` which pre-fills the invite context)
2. Enter name, email, password
3. Better Auth creates user + session
4. On first login, generate a unique 8-character `inviteCode` for the user (nanoid, lowercase alphanumeric)
5. Redirect to `/dashboard`

**Login flow:**
1. Email + password → Better Auth validates → session cookie set
2. Redirect to `/dashboard`

**Session handling:**
- Better Auth manages sessions via HTTP-only cookies
- Middleware protects `/dashboard/*` routes — redirect to `/login` if unauthenticated

### 5.2 Logging a Drag

This is the core interaction and must be extremely fast (< 2 taps/clicks).

**Entry point:** Big prominent button on the dashboard — always visible.

**Two modes:**
1. **"I had a drag"** — User selects a date+time (defaults to "right now"). Creates a `dragLog` with `type: 'drag'` and `dragAt` set to the selected time.
2. **"No change"** — User confirms nothing has changed since last log. Creates a `dragLog` with `type: 'no_change'` and `dragAt: null`. This resets the reminder timer.

**Optional note:** Both modes allow an optional short text note (max 280 chars). Examples: "stressful day at work", "at a party, couldn't resist", "going strong 💪".

**Validation:**
- `dragAt` cannot be in the future
- `dragAt` cannot be before the user's account creation date
- Rate limit: max 10 logs per hour per user (prevent spam/abuse)

**After logging:**
- Dashboard streak counter updates immediately (optimistic UI)
- Entry appears in the friend activity feed for the user's friends

### 5.3 Dashboard (Main Hub)

The dashboard is the home screen after login. It should communicate the user's status at a glance.

**Layout (top to bottom):**

1. **Streak hero section:**
   - Massive streak counter (e.g., `14 days`) in `JetBrains Mono`, `text-6xl` or larger
   - Subtitle: "since your last drag" or "clean so far"
   - If streak is 0 (just logged a drag today): show "0 days — fresh start" in a neutral tone, not punitive
   - Small text below: exact date+time of last drag

2. **Quick action buttons:**
   - "I had a drag" (accent color, prominent)
   - "No change" (secondary/ghost style)
   - Side by side, full width on mobile

3. **Personal stats row:**
   - Longest streak ever
   - Total "no change" confirmations
   - Days since joining

4. **Friend activity feed (scrollable):**
   - Shows recent logs from friends (last 7 days)
   - Each entry: avatar, name, relative time ("2h ago"), type ("logged a drag" / "confirmed no change"), and note if present
   - Tapping a friend's name goes to their mini-profile (streak, join date, mutual friends)

5. **Pending nudges (if any):**
   - Banner or card showing "[Friend] nudged you to update!" with a dismiss button
   - Tapping "Update now" scrolls to the quick action buttons

### 5.4 Friends System

#### 5.4.1 Invite Link

- Every user gets a unique invite URL: `https://dragger.app/invite/[inviteCode]`
- Visiting the link as a new user → signup page with a banner: "[User] invited you to Dragger"
- After signup, a friendship is auto-created with `status: 'accepted'`
- Visiting the link as an existing user → auto-sends a friend request to the inviter
- Share button on the friends page copies the link or opens native share sheet (Web Share API)

#### 5.4.2 In-App Friend Search

- Search by username or email
- Results show name, avatar, mutual friend count
- "Add friend" sends a request (`status: 'pending'`)
- Addressee sees a notification and can accept/decline

#### 5.4.3 Friend List Page (`/dashboard/friends`)

**Sections:**
1. **Pending requests** (incoming) — accept / decline buttons
2. **Sent requests** (outgoing) — cancel button
3. **Your friends** — list with: avatar, name, their current streak, last update time
4. **Invite section** — your invite link + copy/share buttons

#### 5.4.4 Nudge/Poke

- On a friend's card (in friend list or leaderboard), if they haven't updated in > their `reminderIntervalDays`, show a "Nudge" button
- Nudge creates a `nudges` row and triggers a push notification + email to the friend
- Rate limit: max 1 nudge per friend per 24 hours
- Nudge message is optional (default: "[Your name] is wondering how you're doing!")

### 5.5 Leaderboard (`/dashboard/leaderboard`)

**Scope:** Only shows the current user's friends (not global).

**Ranking by:** Current streak (longest active streak at top).

**Display per row:**
- Rank number (#1, #2, #3 with subtle accent styling for top 3)
- Avatar + name
- Current streak (big, monospaced)
- Trend indicator: ↑ if streak grew since last week, → if same, ↓ if reset

**Additional:**
- "Your position" highlighted/pinned
- Toggle to sort by "Longest streak ever" instead of current
- If fewer than 3 friends, show a subtle CTA: "Invite more friends for a real competition"

### 5.6 Reminders & Notifications

#### 5.6.1 Reminder Logic

- Each user has a configurable `reminderIntervalDays` (default: 3, range: 1–14)
- A Vercel Cron job runs daily (e.g., 10:00 AM UTC)
- For each user, check: `now() - lastDragLogCreatedAt > reminderIntervalDays`
- If true AND `now() - lastReminderSentAt > 24 hours` (debounce): send reminder
- Reminder content: "Hey [name], it's been [N] days since your last update on Dragger. How are you doing?" with a deep link to `/dashboard/log`

#### 5.6.2 Notification Channels

**Email (via Resend):**
- Transactional emails for: reminders, friend requests, nudges
- Clean, minimal email template matching the app's dark aesthetic (dark background email with parchment text — test rendering across clients)
- Unsubscribe link in every email → toggles `emailNotifications` to false

**Browser Push (Web Push API):**
- Optional opt-in during onboarding or in settings
- Store `PushSubscription` JSON in user row
- Send push for: reminders, nudges, friend requests accepted
- Push payload: title, body, icon (app icon), deep link URL

#### 5.6.3 Settings (`/dashboard/settings`)

- **Profile:** Edit name, avatar (upload or URL)
- **Reminder interval:** Slider or number input (1–14 days)
- **Email notifications:** Toggle on/off
- **Push notifications:** Toggle on/off (triggers browser permission prompt if turning on)
- **Timezone:** Dropdown (auto-detected on signup, editable)
- **Danger zone:** Delete account (with confirmation modal — hard deletes all data)

---

## 6. API Routes (Next.js Route Handlers)

All under `/app/api/`:

```
POST   /api/auth/[...all]          → Better Auth catch-all
POST   /api/drag-logs              → Create a new drag log
GET    /api/drag-logs              → Get current user's logs (paginated)
GET    /api/drag-logs/stats        → Get streak, longest streak, etc.
GET    /api/friends                → Get friend list + pending requests
POST   /api/friends/request        → Send friend request (by userId or email)
POST   /api/friends/respond        → Accept/decline a request
DELETE /api/friends/[friendshipId] → Remove a friend
POST   /api/friends/nudge          → Send a nudge to a friend
GET    /api/friends/feed           → Get recent friend activity
GET    /api/leaderboard            → Get friend streak rankings
GET    /api/invite/[code]          → Validate invite code, return inviter info
POST   /api/settings               → Update user settings
DELETE /api/account                → Delete account
GET    /api/notifications          → Get unread nudges/notifications
POST   /api/notifications/read     → Mark notifications as read
POST   /api/cron/reminders         → Vercel Cron endpoint (secured with CRON_SECRET)
```

---

## 7. Edge Cases & Business Rules

1. **User logs a drag after a long streak:** The streak resets to 0. The old streak is preserved in history. No shaming — the UI should say something neutral like "Day 0 — fresh start."

2. **User logs "no change" multiple times in one day:** Allowed, but only the first one per day counts for reminder debouncing. The feed shows deduplicated entries.

3. **User signs up via invite link but inviter deleted their account:** Signup succeeds normally, but no friendship is created. Show a generic "Welcome to Dragger" instead of "[Deleted] invited you."

4. **Two users send friend requests to each other simultaneously:** The second request should auto-accept the first one instead of creating a duplicate.

5. **User has no friends yet:** Dashboard shows a friendly empty state: "It's quiet here. Invite a friend to start your accountability circle." with a prominent invite button.

6. **Timezone handling:** All `dragAt` timestamps are stored in UTC. Display is converted to the user's configured timezone. Streak calculation uses the user's timezone for "day" boundaries.

7. **Account deletion:** Hard delete all user data (logs, friendships, nudges). Remove user from friends' lists. Sent nudges become orphaned (show "A former member" in the UI).

---

## 8. Mobile Responsiveness

The app must be mobile-first since users will often log drags from their phone.

- Dashboard is a single column on mobile, comfortable thumb-reach for the log buttons
- Bottom navigation bar on mobile: Dashboard, Friends, Leaderboard, Settings (4 items)
- Top navigation bar on desktop with the same items
- The streak counter is always the first thing visible (no scrolling needed)
- Use `@media (min-width: 768px)` for two-column layouts on tablet/desktop (streak left, feed right)

---

## 9. Future Considerations (Out of Scope for V1)

- Google/Apple OAuth
- Native mobile app (React Native or PWA)
- Group challenges ("No drag November")
- Milestones & badges (7-day, 30-day, 100-day badges)
- Health stats ("You've saved $X by not buying packs")
- Public profile pages
- CSV export of personal data

---

## 10. Claude Code Prompt for UI Implementation

Use this prompt when working with Claude Code to build the frontend. It encodes all the design decisions above and ensures a distinctive visual output:

```
You are building the frontend for "Dragger", a cigarette accountability tracker.
Follow these design rules strictly — the goal is a UI that looks NOTHING like
a generic SaaS/startup template.

VISUAL IDENTITY:
- Dark, warm palette. NOT cool-toned. Background: #1A1A1A. Cards: #2E2B28 with
  1px solid #3A3735 borders. NO box-shadows anywhere. NO gradients.
- Text: primary #E8E0D4 (warm off-white), secondary #9C9488 (muted sand).
- Accent: #D4553A (burnt ember) for primary actions. #D4A03A (amber) for
  secondary highlights. #6B8F71 (sage) for success/streaks.
- Add a subtle noise texture overlay on the main background at ~3% opacity using
  a CSS pseudo-element with a tiny SVG noise pattern.

TYPOGRAPHY (load via next/font/google):
- Headings: "Space Grotesk" — bold, tracking-tight
- Body: "Inter" — regular weight, relaxed line-height (1.6)
- Data/numbers/timestamps: "JetBrains Mono" — this is critical for the streak
  counter and all numeric displays
- The streak counter on the dashboard should be text-7xl sm:text-8xl font-bold
  in JetBrains Mono. It should be the dominant visual element on the page.

COMPONENT RULES:
- Border radius: rounded-sm (2px) on cards and inputs. rounded-full ONLY on
  avatars. NEVER rounded-lg or rounded-xl.
- Buttons: squared-off (rounded-sm), firm padding (px-5 py-2.5), no uppercase,
  font-medium. Primary: bg-[#D4553A] hover:bg-[#B8432D]. Ghost/secondary:
  border border-[#3A3735] hover:border-[#9C9488].
- Inputs: bg-[#1A1A1A] with #3A3735 border, focus:border-[#D4553A] with a
  1px ring. Placeholder text in #9C9488.
- Cards: No shadows. Thin border. Generous internal padding (p-6).
- Avoid heavy nesting of bordered elements. Keep the visual hierarchy flat.

LAYOUT:
- Mobile-first. Single column on mobile, two-column on md+ for the dashboard
  (streak/actions left, feed right).
- Bottom nav on mobile (4 items: Dashboard, Friends, Leaderboard, Settings).
  Use icons from lucide-react, no labels on mobile, labels on desktop top nav.
- Generous whitespace. gap-6 minimum between sections. py-8 for page padding.
- Content max width: max-w-4xl mx-auto for the main content area.

MOTION & INTERACTION:
- Minimal animation. transition-colors duration-150 on hover states.
- active:scale-[0.98] on buttons for a tactile press feel.
- The streak counter should have a subtle countUp animation on page load
  (count from 0 to current value over ~1s using requestAnimationFrame).
- No page transitions, no slide-ins, no bouncing elements.

TONE:
- UI copy is casual, supportive, never clinical. "How's it going?" not
  "Update your status." "Fresh start" not "Streak reset." "No change — still
  going strong" not "No relapse reported."
- Error messages are human: "Hmm, that didn't work. Try again?" not
  "Error 500: Internal Server Error."
- Empty states have personality: "It's quiet here. Invite someone to keep
  you honest." not "No friends found."

DO NOT:
- Use any purple, blue, or teal. This is a warm-palette app.
- Use shadcn/ui default styling without heavy customization. If using shadcn
  components, restyle them completely to match this system.
- Use card shadows, gradients, or glassmorphism effects.
- Use rounded-lg, rounded-xl, or rounded-2xl on any element.
- Use generic stock illustrations or emoji as decorative elements.
- Make it look like Linear, Notion, or Vercel's dashboard. Those are cool-toned
  and minimal in a corporate way. This should feel warmer and more personal.
```

---

## 11. Development Phases

### Phase 1 — Foundation (Week 1)
- Project setup: Next.js 15, Tailwind, Drizzle, Neon connection
- Better Auth integration (email/password signup + login)
- Database schema migration
- Auth middleware for protected routes
- Basic layout shell with nav

### Phase 2 — Core Loop (Week 2)
- Dashboard page with streak display
- Drag log creation (both modes)
- Streak calculation logic
- Personal stats computation
- Settings page (reminder interval, notifications toggle)

### Phase 3 — Social Layer (Week 3)
- Friend request system (send, accept, decline)
- Invite link generation and acceptance flow
- In-app friend search
- Friend activity feed on dashboard
- Nudge system

### Phase 4 — Accountability (Week 4)
- Leaderboard page
- Email notifications via Resend (reminders, nudges, friend requests)
- Vercel Cron job for daily reminders
- Web Push notification setup (optional)
- Polish: empty states, error states, loading skeletons

### Phase 5 — Polish & Launch (Week 5)
- Mobile responsiveness audit
- Performance optimization (query efficiency, pagination)
- SEO and Open Graph meta for the landing page
- Landing page with "Get Started" CTA
- Bug fixes, edge case handling, testing