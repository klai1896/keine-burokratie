CREATE TYPE "public"."exam_system" AS ENUM('telc', 'goethe', 'other');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('email', 'browser_push');--> statement-breakpoint
CREATE TYPE "public"."notification_mode" AS ENUM('email_only', 'browser_session', 'browser_session_and_email');--> statement-breakpoint
CREATE TYPE "public"."watch_status" AS ENUM('pending_confirm', 'active', 'paused', 'cancelled');--> statement-breakpoint
CREATE TABLE "availability_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_target_id" uuid NOT NULL,
	"content_hash" text NOT NULL,
	"normalized_json" jsonb NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"raw_http_status" integer,
	"fetch_error" text
);
--> statement-breakpoint
CREATE TABLE "browser_event_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"watch_id" uuid NOT NULL,
	"open_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_listing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"area" text NOT NULL,
	"exam_system" "exam_system" NOT NULL,
	"levels" text[] NOT NULL,
	"price_display" text NOT NULL,
	"available_dates_display" text,
	"booking_url" text NOT NULL,
	"source_page_url" text NOT NULL,
	"last_verified" timestamp with time zone DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"watch_id" uuid NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"provider_message_id" text
);
--> statement-breakpoint
CREATE TABLE "service_target" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label_en" text NOT NULL,
	"service_berlin_url" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_target_poll_state" (
	"service_target_id" uuid PRIMARY KEY NOT NULL,
	"next_poll_at" timestamp with time zone NOT NULL,
	"backoff_sec" integer DEFAULT 60 NOT NULL,
	"last_error" text
);
--> statement-breakpoint
CREATE TABLE "watch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_hash" text NOT NULL,
	"service_target_id" uuid NOT NULL,
	"allowed_weekdays" integer[] NOT NULL,
	"allow_morning" boolean NOT NULL,
	"allow_afternoon" boolean NOT NULL,
	"notification_mode" "notification_mode" NOT NULL,
	"status" "watch_status" DEFAULT 'pending_confirm' NOT NULL,
	"confirm_token_hash" text NOT NULL,
	"manage_token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_notified_at" timestamp with time zone,
	"baseline_snapshot_id" uuid
);
--> statement-breakpoint
CREATE TABLE "worker_heartbeat" (
	"id" serial PRIMARY KEY NOT NULL,
	"last_run_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "availability_snapshot" ADD CONSTRAINT "availability_snapshot_service_target_id_service_target_id_fk" FOREIGN KEY ("service_target_id") REFERENCES "public"."service_target"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "browser_event_queue" ADD CONSTRAINT "browser_event_queue_watch_id_watch_id_fk" FOREIGN KEY ("watch_id") REFERENCES "public"."watch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_watch_id_watch_id_fk" FOREIGN KEY ("watch_id") REFERENCES "public"."watch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_snapshot_id_availability_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."availability_snapshot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_target_poll_state" ADD CONSTRAINT "service_target_poll_state_service_target_id_service_target_id_fk" FOREIGN KEY ("service_target_id") REFERENCES "public"."service_target"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch" ADD CONSTRAINT "watch_service_target_id_service_target_id_fk" FOREIGN KEY ("service_target_id") REFERENCES "public"."service_target"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch" ADD CONSTRAINT "watch_baseline_snapshot_id_availability_snapshot_id_fk" FOREIGN KEY ("baseline_snapshot_id") REFERENCES "public"."availability_snapshot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "snapshot_target_captured_idx" ON "availability_snapshot" USING btree ("service_target_id","captured_at");--> statement-breakpoint
CREATE INDEX "browser_event_watch_created_idx" ON "browser_event_queue" USING btree ("watch_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_listing_slug_uq" ON "exam_listing" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "service_target_slug_uq" ON "service_target" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "watch_target_status_idx" ON "watch" USING btree ("service_target_id","status");--> statement-breakpoint
CREATE INDEX "watch_email_hash_idx" ON "watch" USING btree ("email_hash");