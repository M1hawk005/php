ALTER TABLE "threads"
  ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "is_pinned" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "upvotes" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "downvotes" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "posts"
  ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "upvotes" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "downvotes" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "threads" DROP COLUMN IF EXISTS "secret_key";
ALTER TABLE "posts" DROP COLUMN IF EXISTS "secret_key";

UPDATE "threads" AS thread
SET "reply_count" = (
  SELECT COUNT(*)::INTEGER FROM "posts" AS post WHERE post."thread_id" = thread."id"
);

CREATE INDEX IF NOT EXISTS "threads_is_archived_is_pinned_bumped_at_idx"
  ON "threads"("is_archived", "is_pinned", "bumped_at");
CREATE INDEX IF NOT EXISTS "posts_thread_id_created_at_idx"
  ON "posts"("thread_id", "created_at");

CREATE TABLE IF NOT EXISTS "forum_votes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "target_id" UUID NOT NULL,
  "target_type" TEXT NOT NULL,
  "voter_hash" TEXT NOT NULL,
  "direction" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "forum_votes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "forum_votes_direction_check" CHECK ("direction" IN (-1, 1)),
  CONSTRAINT "forum_votes_target_type_check" CHECK ("target_type" IN ('thread', 'post'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "forum_votes_target_type_target_id_voter_hash_key"
  ON "forum_votes"("target_type", "target_id", "voter_hash");
CREATE INDEX IF NOT EXISTS "forum_votes_target_type_target_id_idx"
  ON "forum_votes"("target_type", "target_id");

CREATE TABLE IF NOT EXISTS "rate_limit_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "fingerprint" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rate_limit_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "rate_limit_events_fingerprint_action_created_at_idx"
  ON "rate_limit_events"("fingerprint", "action", "created_at");
