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
    serviceTargetId: uuid("service_target_id")
      .notNull()
      .references(() => serviceTarget.id),
    allowedWeekdays: integer("allowed_weekdays").array().notNull(),
    allowMorning: boolean("allow_morning").notNull(),
    allowAfternoon: boolean("allow_afternoon").notNull(),
    notificationMode: notificationModeEnum("notification_mode").notNull(),
    status: watchStatusEnum("status").notNull().default("pending_confirm"),
    confirmTokenHash: text("confirm_token_hash").notNull(),
    manageTokenHash: text("manage_token_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true }),
    baselineSnapshotId: uuid("baseline_snapshot_id").references(() => availabilitySnapshot.id),
  },
  (t) => [
    index("watch_target_status_idx").on(t.serviceTargetId, t.status),
    index("watch_email_hash_idx").on(t.emailHash),
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
