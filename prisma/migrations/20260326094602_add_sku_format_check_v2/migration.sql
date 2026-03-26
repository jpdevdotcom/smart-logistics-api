-- This is an empty migration.
ALTER TABLE "items"
ADD CONSTRAINT "items_sku_format"
CHECK (sku ~ '^[A-Z]{3}-[0-9]{5}-[A-Z]$');
