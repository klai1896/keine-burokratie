import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  integer,
  serial,
  index,
  uniqueIndex,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";

export const notificationModeEnum = pgEnum("notification_mode", [
  "email_only",
  "browser_session",
  "browser_session_and_email",
]);

export const watchStatusEnum = pgEnum("watch_status", [
  "pending_confirm",
  "active",
  "paused",
  "cancelled",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "email",
  "browser_push",
]);

export const examSystemEnum = pgEnum("exam_system", ["telc", "goethe", "other"]);

export const serviceTarget = pgTable(
  "service_target",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    labelEn: text("label_en").notNull(),
    serviceBerlinUrl: text("service_berlin_url").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("service_target_slug_uq").on(t.slug)],
);

export const availabilitySnapshot = pgTable(
  "availability_snapshot",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceTargetId: uuid("service_target_id")
      .notNull()
      .references(() => serviceTarget.id),
    contentHash: text("content_hash").notNull(),
    normalizedJson: jsonb("normalized_json").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
    rawHttpStatus: integer("raw_http_status"),
    fetchError: text("fetch_error"),
  },
  (t) => [index("snapshot_target_captured_idx").on(t.serviceTargetId, t.capturedAt)],
);

export const watch = pgTable(
  "watch",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    emailHash: text("email_hash").notNull(),
    allowedWeekdays: integer("allowed_weekdays").array().notNull(),
    allowMorning: boolean("allow_morning").notNull(),
    allowAfternoon: boolean("allow_afternoon").notNull(),
    notificationMode: notificationModeEnum("notification_mode").notNull(),
    status: watchStatusEnum("status").notNull().default("pending_confirm"),
    confirmTokenHash: text("confirm_token_hash").notNull(),
    manageTokenHash: text("manage_token_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true }),
  },
  (t) => [index("watch_status_idx").on(t.status), index("watch_email_hash_idx").on(t.emailHash)],
);

/** Each active watch listens at one or more VHS campuses; baseline snapshots are per campus. */
export const watchLocation = pgTable(
  "watch_location",
  {
    watchId: uuid("watch_id")
      .notNull()
      .references(() => watch.id, { onDelete: "cascade" }),
    serviceTargetId: uuid("service_target_id")
      .notNull()
      .references(() => serviceTarget.id),
    baselineSnapshotId: uuid("baseline_snapshot_id").references(() => availabilitySnapshot.id),
  },
  (t) => [
    primaryKey({ columns: [t.watchId, t.serviceTargetId] }),
    index("watch_location_target_idx").on(t.serviceTargetId),
  ],
);

export const notificationLog = pgTable("notification_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  watchId: uuid("watch_id")
    .notNull()
    .references(() => watch.id),
  snapshotId: uuid("snapshot_id")
    .notNull()
    .references(() => availabilitySnapshot.id),
  channel: notificationChannelEnum("channel").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  providerMessageId: text("provider_message_id"),
});

export const browserEventQueue = pgTable(
  "browser_event_queue",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    watchId: uuid("watch_id")
      .notNull()
      .references(() => watch.id),
    openUrl: text("open_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("browser_event_watch_created_idx").on(t.watchId, t.createdAt)],
);

export const examListing = pgTable(
  "exam_listing",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    area: text("area").notNull(),
    examSystem: examSystemEnum("exam_system").notNull(),
    levels: text("levels").array().notNull(),
    priceDisplay: text("price_display").notNull(),
    availableDatesDisplay: text("available_dates_display"),
    /** First exam date where the institute still shows an active booking control (may be null if ingest cannot reach the API). */
    soonestBookableAt: timestamp("soonest_bookable_at", { withTimezone: true }),
    bookingUrl: text("booking_url").notNull(),
    sourcePageUrl: text("source_page_url").notNull(),
    lastVerified: timestamp("last_verified", { withTimezone: true }).notNull().defaultNow(),
    active: boolean("active").notNull().default(true),
  },
  (t) => [uniqueIndex("exam_listing_slug_uq").on(t.slug)],
);

export const workerHeartbeat = pgTable("worker_heartbeat", {
  id: serial("id").primaryKey(),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serviceTargetPollState = pgTable(
  "service_target_poll_state",
  {
    serviceTargetId: uuid("service_target_id")
      .primaryKey()
      .references(() => serviceTarget.id),
    nextPollAt: timestamp("next_poll_at", { withTimezone: true }).notNull(),
    backoffSec: integer("backoff_sec").notNull().default(60),
    lastError: text("last_error"),
  },
);

/** Saves permanent-residence checklist progress + optional daily email reminders (hashed lookup by access token). */
export const prChecklistProgress = pgTable(
  "pr_checklist_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accessToken: text("access_token").notNull().unique(),
    email: text("email").notNull(),
    emailHash: text("email_hash").notNull(),
    pathwayId: text("pathway_id").notNull(),
    checkedJson: jsonb("checked_json").notNull().$type<Record<string, boolean>>(),
    remindersEnabled: boolean("reminders_enabled").notNull().default(false),
    consentPrivacy: boolean("consent_privacy").notNull().default(false),
    consentReminders: boolean("consent_reminders").notNull().default(false),
    lastReminderAt: timestamp("last_reminder_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("pr_progress_email_hash_idx").on(t.emailHash),
    index("pr_progress_reminders_idx").on(t.remindersEnabled, t.lastReminderAt),
  ],
);
