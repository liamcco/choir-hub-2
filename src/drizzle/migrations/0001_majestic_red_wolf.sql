ALTER TYPE "public"."SectionVoiceType" ADD VALUE 'S' BEFORE 'S1';--> statement-breakpoint
ALTER TYPE "public"."SectionVoiceType" ADD VALUE 'A' BEFORE 'A1';--> statement-breakpoint
ALTER TYPE "public"."SectionVoiceType" ADD VALUE 'T' BEFORE 'T1';--> statement-breakpoint
ALTER TYPE "public"."SectionVoiceType" ADD VALUE 'B' BEFORE 'B1';--> statement-breakpoint
ALTER TABLE "SectionPlacement" ADD COLUMN "voiceType" "VoiceType";
UPDATE "SectionPlacement" AS placement
SET "voiceType" = section."voiceType"::text::"VoiceType"
FROM "Section" AS section
WHERE placement."sectionId" = section."id";
ALTER TABLE "SectionPlacement" ALTER COLUMN "voiceType" SET NOT NULL;
