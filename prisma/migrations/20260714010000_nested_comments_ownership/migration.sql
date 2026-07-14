ALTER TABLE "threads"
  ADD COLUMN "owner_hash" TEXT;

ALTER TABLE "posts"
  ADD COLUMN "owner_hash" TEXT,
  ADD COLUMN "parent_post_id" UUID,
  ADD COLUMN "reply_count" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "posts"
  ADD CONSTRAINT "posts_parent_post_id_fkey"
  FOREIGN KEY ("parent_post_id") REFERENCES "posts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "posts_parent_post_id_created_at_idx"
  ON "posts"("parent_post_id", "created_at");
