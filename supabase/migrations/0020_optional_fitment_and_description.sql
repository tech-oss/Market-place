-- Only the bike make is mandatory when listing a part now. A seller whose
-- exact model or year isn't in the admin catalog yet shouldn't be blocked
-- from listing at all -- previously fitments required all four columns, so
-- a listing either had complete fitment or none, and one with only a make
-- carried no fitment row and therefore never showed up in the homepage
-- make/model/year facets.
--
-- Making model and the year range nullable lets a listing record "fits BMW"
-- on its own, and fill in the model/years later.

alter table fitments alter column model     drop not null;
alter table fitments alter column year_from drop not null;
alter table fitments alter column year_to   drop not null;

-- products.description already exists (0001) but was never written or read.
-- It now stores the seller's rich-text description as sanitised HTML.
comment on column products.description is
  'Seller-authored part description. Sanitised HTML (allowlisted inline/blocked tags only) rendered on the public product page.';
