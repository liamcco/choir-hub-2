CREATE TYPE "public"."MemberStatus" AS ENUM('active', 'passive', 'former');--> statement-breakpoint
CREATE TYPE "public"."Voice" AS ENUM('S', 'S1', 'S2', 'A', 'A1', 'A2', 'T', 'T1', 'T2', 'B', 'B1', 'B2');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"publicKey" text NOT NULL,
	"userId" text NOT NULL,
	"credentialID" text NOT NULL,
	"counter" integer NOT NULL,
	"deviceType" text NOT NULL,
	"backedUp" boolean NOT NULL,
	"transports" text,
	"createdAt" timestamp,
	"aaguid" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"impersonatedBy" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "twoFactor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backupCodes" text NOT NULL,
	"userId" text NOT NULL,
	"verified" boolean DEFAULT true,
	"failedVerificationCount" integer DEFAULT 0,
	"lockedUntil" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"displayUsername" text,
	"role" text,
	"banned" boolean DEFAULT false,
	"banReason" text,
	"banExpires" timestamp,
	"twoFactorEnabled" boolean DEFAULT false,
	"status" "MemberStatus" DEFAULT 'active' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ChoirMembership" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"userId" text NOT NULL,
	"choirId" text NOT NULL,
	"startsAt" timestamp NOT NULL,
	"endsAt" timestamp,
	CONSTRAINT "ChoirMembership_user_id_starts_at_key" UNIQUE("userId","startsAt"),
	CONSTRAINT "ChoirMembership_valid_period_check" CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt")
);
--> statement-breakpoint
CREATE TABLE "GroupMembership" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"userId" text NOT NULL,
	"groupId" text NOT NULL,
	"startsAt" timestamp NOT NULL,
	"endsAt" timestamp,
	CONSTRAINT "GroupMembership_user_id_group_id_starts_at_key" UNIQUE("userId","groupId","startsAt"),
	CONSTRAINT "GroupMembership_valid_period_check" CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt")
);
--> statement-breakpoint
CREATE TABLE "PositionAssignment" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"positionId" text NOT NULL,
	"userId" text NOT NULL,
	"startsAt" timestamp NOT NULL,
	"endsAt" timestamp,
	CONSTRAINT "PositionAssignment_position_id_starts_at_key" UNIQUE("positionId","startsAt"),
	CONSTRAINT "PositionAssignment_valid_period_check" CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt")
);
--> statement-breakpoint
CREATE TABLE "SectionPlacement" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"userId" text NOT NULL,
	"sectionId" text NOT NULL,
	"voice" "Voice" NOT NULL,
	"startsAt" timestamp NOT NULL,
	"endsAt" timestamp,
	CONSTRAINT "SectionPlacement_user_id_starts_at_key" UNIQUE("userId","startsAt"),
	CONSTRAINT "SectionPlacement_fine_voice_check" CHECK ("voice" ~ '^(S|A|T|B)[12]$'),
	CONSTRAINT "SectionPlacement_valid_period_check" CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ChoirMembership" ADD CONSTRAINT "ChoirMembership_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PositionAssignment" ADD CONSTRAINT "PositionAssignment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SectionPlacement" ADD CONSTRAINT "SectionPlacement_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "passkey_user_id_idx" ON "passkey" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "passkey_credential_id_idx" ON "passkey" USING btree ("credentialID");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "twoFactor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_user_id_idx" ON "twoFactor" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "ChoirMembership_user_id_ends_at_idx" ON "ChoirMembership" USING btree ("userId","endsAt");--> statement-breakpoint
CREATE INDEX "ChoirMembership_choir_id_ends_at_idx" ON "ChoirMembership" USING btree ("choirId","endsAt");--> statement-breakpoint
CREATE INDEX "GroupMembership_user_id_ends_at_idx" ON "GroupMembership" USING btree ("userId","endsAt");--> statement-breakpoint
CREATE INDEX "GroupMembership_group_id_ends_at_idx" ON "GroupMembership" USING btree ("groupId","endsAt");--> statement-breakpoint
CREATE INDEX "PositionAssignment_position_id_ends_at_idx" ON "PositionAssignment" USING btree ("positionId","endsAt");--> statement-breakpoint
CREATE INDEX "PositionAssignment_user_id_ends_at_idx" ON "PositionAssignment" USING btree ("userId","endsAt");--> statement-breakpoint
CREATE INDEX "SectionPlacement_user_id_ends_at_idx" ON "SectionPlacement" USING btree ("userId","endsAt");--> statement-breakpoint
CREATE INDEX "SectionPlacement_section_id_ends_at_idx" ON "SectionPlacement" USING btree ("sectionId","endsAt");--> statement-breakpoint
-- PostgreSQL-specific V1 guarantees: Drizzle cannot express exclusion
-- constraints or partial current indexes.
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
ALTER TABLE "ChoirMembership" ADD CONSTRAINT "ChoirMembership_user_period_excl" EXCLUDE USING gist ("userId" WITH =, tsrange("startsAt", "endsAt", '[)') WITH &&);--> statement-breakpoint
ALTER TABLE "SectionPlacement" ADD CONSTRAINT "SectionPlacement_user_period_excl" EXCLUDE USING gist ("userId" WITH =, tsrange("startsAt", "endsAt", '[)') WITH &&);--> statement-breakpoint
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_user_group_period_excl" EXCLUDE USING gist ("userId" WITH =, "groupId" WITH =, tsrange("startsAt", "endsAt", '[)') WITH &&);--> statement-breakpoint
ALTER TABLE "PositionAssignment" ADD CONSTRAINT "PositionAssignment_position_period_excl" EXCLUDE USING gist ("positionId" WITH =, tsrange("startsAt", "endsAt", '[)') WITH &&);--> statement-breakpoint
CREATE UNIQUE INDEX "ChoirMembership_one_current_per_user_idx" ON "ChoirMembership" ("userId") WHERE "endsAt" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "SectionPlacement_one_current_per_user_idx" ON "SectionPlacement" ("userId") WHERE "endsAt" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "PositionAssignment_one_current_per_position_idx" ON "PositionAssignment" ("positionId") WHERE "endsAt" IS NULL;
