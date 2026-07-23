CREATE TYPE "public"."aggregate_dimension" AS ENUM('overall', 'path', 'referrer', 'country', 'device', 'browser', 'os', 'screen');--> statement-breakpoint
CREATE TYPE "public"."analytics_event_type" AS ENUM('page_view', 'project_click', 'cv_download', 'contact_submit', 'outbound_click');--> statement-breakpoint
CREATE TYPE "public"."inquiry_type" AS ENUM('Job opportunity', 'Freelance project', 'Collaboration', 'Other');--> statement-breakpoint
CREATE TABLE "analytics_daily_aggregates" (
	"date" date NOT NULL,
	"eventType" "analytics_event_type" NOT NULL,
	"dimension" "aggregate_dimension" NOT NULL,
	"dimensionValue" varchar(512) NOT NULL,
	"eventCount" bigint NOT NULL,
	"uniqueVisitors" bigint NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_daily_aggregates_date_eventType_dimension_dimensionValue_pk" PRIMARY KEY("date","eventType","dimension","dimensionValue")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "analytics_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" "analytics_event_type" NOT NULL,
	"path" varchar(512) NOT NULL,
	"referrerDomain" varchar(253) DEFAULT 'direct' NOT NULL,
	"country" varchar(2) DEFAULT 'ZZ' NOT NULL,
	"device" varchar(16) NOT NULL,
	"browser" varchar(16) NOT NULL,
	"os" varchar(16) NOT NULL,
	"screen" varchar(16) NOT NULL,
	"visitorHash" char(64) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiryType" "inquiry_type" NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(254) NOT NULL,
	"message" varchar(5000) NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_buckets" (
	"scope" varchar(32) NOT NULL,
	"keyHash" char(64) NOT NULL,
	"windowStart" timestamp with time zone NOT NULL,
	"requestCount" integer DEFAULT 1 NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	CONSTRAINT "rate_limit_buckets_scope_keyHash_windowStart_pk" PRIMARY KEY("scope","keyHash","windowStart")
);
--> statement-breakpoint
CREATE INDEX "analytics_events_created_at_id_idx" ON "analytics_events" USING btree ("createdAt","id");--> statement-breakpoint
CREATE INDEX "analytics_events_type_created_at_idx" ON "analytics_events" USING btree ("type","createdAt");--> statement-breakpoint
CREATE INDEX "analytics_events_path_created_at_idx" ON "analytics_events" USING btree ("path","createdAt");--> statement-breakpoint
CREATE INDEX "analytics_events_visitor_hash_created_at_idx" ON "analytics_events" USING btree ("visitorHash","createdAt");--> statement-breakpoint
CREATE INDEX "contact_messages_created_at_id_idx" ON "contact_messages" USING btree ("createdAt","id");--> statement-breakpoint
CREATE INDEX "rate_limit_buckets_expires_at_idx" ON "rate_limit_buckets" USING btree ("expiresAt");