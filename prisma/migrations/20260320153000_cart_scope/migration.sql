-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_key_key" ON "Cart"("key");

-- Ensure the default cart exists for backfilling existing rows
INSERT INTO "Cart" ("key") VALUES ('default')
ON CONFLICT ("key") DO NOTHING;

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN "cartId" INTEGER;

-- Backfill all existing cart items into the default cart
UPDATE "CartItem"
SET "cartId" = (
    SELECT "id" FROM "Cart" WHERE "key" = 'default' LIMIT 1
);

-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "cartId" SET NOT NULL;

-- DropIndex
DROP INDEX "CartItem_productId_key";

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
