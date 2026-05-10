-- Migration: track clone lineage on plants.
-- A plant is either a sexual cross (pod_parent_id + pollen_parent_id) or a
-- clone (clone_source_plant_id). The two are mutually exclusive at the data
-- model level; clone offspring are genetically identical to their source and
-- are surfaced in lineage views as a separate ribbon rather than as
-- descendants of a cross.

alter table plants
  add column if not exists clone_source_plant_id uuid references plants(id) on delete set null;

create index if not exists plants_clone_source_plant_id_idx
  on plants (clone_source_plant_id);

-- Backfill: any plant that was created via an established propagation and
-- has no recorded sexual lineage is, by definition, a clone of that
-- propagation's parent plant.
update plants p
set clone_source_plant_id = pr.parent_plant_id
from propagations pr
where pr.established_plant_id = p.id
  and pr.parent_plant_id is not null
  and p.clone_source_plant_id is null
  and p.pod_parent_id is null
  and p.pollen_parent_id is null;
