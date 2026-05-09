-- Migration: optional user-supplied label for disambiguating sibling propagations
-- (e.g. two cuttings taken from the same parent on the same day).

alter table propagations add column if not exists label text;
