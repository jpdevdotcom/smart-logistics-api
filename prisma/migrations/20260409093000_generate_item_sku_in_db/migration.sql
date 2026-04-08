-- Generate item SKU in DB using item id, preserving existing explicit SKU inserts.
CREATE OR REPLACE FUNCTION set_items_sku_from_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id := nextval(pg_get_serial_sequence('items', 'id'));
  END IF;

  IF NEW.sku IS NULL OR btrim(NEW.sku) = '' THEN
    NEW.sku := 'SKU-' || lpad(NEW.id::text, 5, '0') || '-X';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_items_set_sku ON "items";

CREATE TRIGGER trg_items_set_sku
BEFORE INSERT ON "items"
FOR EACH ROW
EXECUTE FUNCTION set_items_sku_from_id();

ALTER TABLE "items"
ALTER COLUMN "sku" SET DEFAULT ''::character varying;
