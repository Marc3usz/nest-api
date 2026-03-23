-- PostgreSQL integrity hardening for linear cart design

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'CartItem_productId_fkey'
  ) THEN
    ALTER TABLE "CartItem"
      ADD CONSTRAINT "CartItem_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'CartItem_cartId_fkey'
  ) THEN
    ALTER TABLE "CartItem"
      ADD CONSTRAINT "CartItem_cartId_fkey"
      FOREIGN KEY ("cartId") REFERENCES "Cart"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Product_price_check'
  ) THEN
    ALTER TABLE "Product"
      ADD CONSTRAINT "Product_price_check"
      CHECK ("price" >= 0.01);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'CartItem_quantity_check'
  ) THEN
    ALTER TABLE "CartItem"
      ADD CONSTRAINT "CartItem_quantity_check"
      CHECK ("quantity" > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Cart_key_not_blank_check'
  ) THEN
    ALTER TABLE "Cart"
      ADD CONSTRAINT "Cart_key_not_blank_check"
      CHECK (length(btrim("key")) > 0);
  END IF;
END $$;
