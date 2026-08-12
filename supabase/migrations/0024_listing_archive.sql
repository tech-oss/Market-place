-- Adds an "archived" listing status so sellers can move a listing to a sold
-- archive without deleting it. Archived listings are excluded from all
-- public queries the same way draft/out-of-stock/pending-review already are
-- (every public product query in src/lib/data/products.ts filters
-- status = 'active'), so archiving immediately pulls a listing off the site.
-- Run in the Supabase SQL editor. Safe to re-run.

alter type listing_status add value if not exists 'archived';
