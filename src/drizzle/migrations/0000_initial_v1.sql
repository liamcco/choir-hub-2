CREATE TYPE "public"."MemberStatus" AS ENUM('active', 'passive', 'former');--> statement-breakpoint
CREATE TYPE "public"."GroupKind" AS ENUM('committee', 'board');--> statement-breakpoint
CREATE TYPE "public"."GroupScopeType" AS ENUM('csk', 'choir');--> statement-breakpoint
CREATE TYPE "public"."PositionScopeTargetType" AS ENUM('csk', 'choir', 'section', 'group');--> statement-breakpoint
CREATE TYPE "public"."SectionVoiceType" AS ENUM('S1', 'S2', 'A1', 'A2', 'T1', 'T2', 'B1', 'B2');--> statement-breakpoint
CREATE TYPE "public"."VoiceType" AS ENUM('S', 'S1', 'S2', 'A', 'A1', 'A2', 'T', 'T1', 'T2', 'B', 'B1', 'B2');--> statement-breakpoint
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
CREATE TABLE "Choir" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"shortName" text NOT NULL,
	CONSTRAINT "Choir_name_unique" UNIQUE("name"),
	CONSTRAINT "Choir_shortName_unique" UNIQUE("shortName")
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
CREATE TABLE "Group" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" "GroupKind" NOT NULL,
	"name" text NOT NULL,
	"scopeType" "GroupScopeType" NOT NULL,
	"scopeKey" text NOT NULL,
	"choirId" text,
	CONSTRAINT "Group_scope_key_name_key" UNIQUE("scopeKey","name"),
	CONSTRAINT "Group_valid_scope_check" CHECK (("scopeType" = 'csk' AND "scopeKey" = 'csk' AND "choirId" IS NULL) OR ("scopeType" = 'choir' AND "scopeKey" = "choirId" AND "choirId" IS NOT NULL))
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
CREATE TABLE "Position" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
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
CREATE TABLE "PositionScope" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"positionId" text NOT NULL,
	"targetType" "PositionScopeTargetType" NOT NULL,
	"targetKey" text NOT NULL,
	"choirId" text,
	"sectionId" text,
	"groupId" text,
	CONSTRAINT "PositionScope_position_id_target_key_key" UNIQUE("positionId","targetType","targetKey"),
	CONSTRAINT "PositionScope_valid_target_check" CHECK (("targetType" = 'csk' AND "targetKey" = 'csk' AND "choirId" IS NULL AND "sectionId" IS NULL AND "groupId" IS NULL) OR ("targetType" = 'choir' AND "targetKey" = "choirId" AND "choirId" IS NOT NULL AND "sectionId" IS NULL AND "groupId" IS NULL) OR ("targetType" = 'section' AND "targetKey" = "sectionId" AND "sectionId" IS NOT NULL AND "choirId" IS NULL AND "groupId" IS NULL) OR ("targetType" = 'group' AND "targetKey" = "groupId" AND "groupId" IS NOT NULL AND "choirId" IS NULL AND "sectionId" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "Section" (
	"id" text PRIMARY KEY NOT NULL,
	"choirId" text NOT NULL,
	"name" text NOT NULL,
	"voiceType" "SectionVoiceType" NOT NULL,
	CONSTRAINT "Section_choir_id_name_key" UNIQUE("choirId","name"),
	CONSTRAINT "Section_choir_id_voice_type_key" UNIQUE("choirId","voiceType")
);
--> statement-breakpoint
CREATE TABLE "SectionPlacement" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"userId" text NOT NULL,
	"sectionId" text NOT NULL,
	"startsAt" timestamp NOT NULL,
	"endsAt" timestamp,
	CONSTRAINT "SectionPlacement_user_id_starts_at_key" UNIQUE("userId","startsAt"),
	CONSTRAINT "SectionPlacement_valid_period_check" CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ChoirMembership" ADD CONSTRAINT "ChoirMembership_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ChoirMembership" ADD CONSTRAINT "ChoirMembership_choirId_Choir_id_fk" FOREIGN KEY ("choirId") REFERENCES "public"."Choir"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Group" ADD CONSTRAINT "Group_choirId_Choir_id_fk" FOREIGN KEY ("choirId") REFERENCES "public"."Choir"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_Group_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PositionAssignment" ADD CONSTRAINT "PositionAssignment_positionId_Position_id_fk" FOREIGN KEY ("positionId") REFERENCES "public"."Position"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PositionAssignment" ADD CONSTRAINT "PositionAssignment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PositionScope" ADD CONSTRAINT "PositionScope_positionId_Position_id_fk" FOREIGN KEY ("positionId") REFERENCES "public"."Position"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PositionScope" ADD CONSTRAINT "PositionScope_choirId_Choir_id_fk" FOREIGN KEY ("choirId") REFERENCES "public"."Choir"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PositionScope" ADD CONSTRAINT "PositionScope_sectionId_Section_id_fk" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PositionScope" ADD CONSTRAINT "PositionScope_groupId_Group_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Section" ADD CONSTRAINT "Section_choirId_Choir_id_fk" FOREIGN KEY ("choirId") REFERENCES "public"."Choir"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SectionPlacement" ADD CONSTRAINT "SectionPlacement_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SectionPlacement" ADD CONSTRAINT "SectionPlacement_sectionId_Section_id_fk" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "passkey_user_id_idx" ON "passkey" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "passkey_credential_id_idx" ON "passkey" USING btree ("credentialID");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "twoFactor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_user_id_idx" ON "twoFactor" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "ChoirMembership_user_id_ends_at_idx" ON "ChoirMembership" USING btree ("userId","endsAt");--> statement-breakpoint
CREATE INDEX "ChoirMembership_choir_id_ends_at_idx" ON "ChoirMembership" USING btree ("choirId","endsAt");--> statement-breakpoint
CREATE INDEX "Group_choir_id_idx" ON "Group" USING btree ("choirId");--> statement-breakpoint
CREATE INDEX "GroupMembership_user_id_ends_at_idx" ON "GroupMembership" USING btree ("userId","endsAt");--> statement-breakpoint
CREATE INDEX "GroupMembership_group_id_ends_at_idx" ON "GroupMembership" USING btree ("groupId","endsAt");--> statement-breakpoint
CREATE INDEX "PositionAssignment_position_id_ends_at_idx" ON "PositionAssignment" USING btree ("positionId","endsAt");--> statement-breakpoint
CREATE INDEX "PositionAssignment_user_id_ends_at_idx" ON "PositionAssignment" USING btree ("userId","endsAt");--> statement-breakpoint
CREATE INDEX "PositionScope_target_key_idx" ON "PositionScope" USING btree ("targetType","targetKey");--> statement-breakpoint
CREATE INDEX "Section_choir_id_idx" ON "Section" USING btree ("choirId");--> statement-breakpoint
CREATE INDEX "SectionPlacement_user_id_ends_at_idx" ON "SectionPlacement" USING btree ("userId","endsAt");--> statement-breakpoint
CREATE INDEX "SectionPlacement_section_id_ends_at_idx" ON "SectionPlacement" USING btree ("sectionId","endsAt");--> statement-breakpoint
-- PostgreSQL-specific V1 guarantees: Drizzle cannot express exclusion
-- constraints, partial current indexes, or cross-table relationship checks.
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
ALTER TABLE "ChoirMembership" ADD CONSTRAINT "ChoirMembership_user_period_excl" EXCLUDE USING gist ("userId" WITH =, tstzrange("startsAt", COALESCE("endsAt", 'infinity'::timestamp), '[)') WITH &&);--> statement-breakpoint
ALTER TABLE "SectionPlacement" ADD CONSTRAINT "SectionPlacement_user_period_excl" EXCLUDE USING gist ("userId" WITH =, tstzrange("startsAt", COALESCE("endsAt", 'infinity'::timestamp), '[)') WITH &&);--> statement-breakpoint
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_user_group_period_excl" EXCLUDE USING gist ("userId" WITH =, "groupId" WITH =, tstzrange("startsAt", COALESCE("endsAt", 'infinity'::timestamp), '[)') WITH &&);--> statement-breakpoint
ALTER TABLE "PositionAssignment" ADD CONSTRAINT "PositionAssignment_position_period_excl" EXCLUDE USING gist ("positionId" WITH =, tstzrange("startsAt", COALESCE("endsAt", 'infinity'::timestamp), '[)') WITH &&);--> statement-breakpoint
CREATE UNIQUE INDEX "ChoirMembership_one_current_per_user_idx" ON "ChoirMembership" ("userId") WHERE "endsAt" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "SectionPlacement_one_current_per_user_idx" ON "SectionPlacement" ("userId") WHERE "endsAt" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "PositionAssignment_one_current_per_position_idx" ON "PositionAssignment" ("positionId") WHERE "endsAt" IS NULL;--> statement-breakpoint
CREATE FUNCTION enforce_committee_membership() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT "kind" FROM "Group" WHERE "id" = NEW."groupId") <> 'committee' THEN
    RAISE EXCEPTION 'GroupMembership may target Committee groups only';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "GroupMembership_committee_only" BEFORE INSERT OR UPDATE OF "groupId" ON "GroupMembership" FOR EACH ROW EXECUTE FUNCTION enforce_committee_membership();--> statement-breakpoint
CREATE FUNCTION enforce_section_choir_coverage() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "ChoirMembership" cm
    JOIN "Section" s ON s."id" = NEW."sectionId" AND s."choirId" = cm."choirId"
    WHERE cm."userId" = NEW."userId" AND cm."startsAt" <= NEW."startsAt"
      AND (cm."endsAt" IS NULL OR NEW."endsAt" IS NULL OR cm."endsAt" >= NEW."endsAt")
  ) THEN
    RAISE EXCEPTION 'SectionPlacement must be covered by a matching ChoirMembership';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "SectionPlacement_choir_coverage" BEFORE INSERT OR UPDATE OF "userId", "sectionId", "startsAt", "endsAt" ON "SectionPlacement" FOR EACH ROW EXECUTE FUNCTION enforce_section_choir_coverage();
