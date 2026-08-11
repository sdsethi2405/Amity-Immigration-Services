-- Add internal notes and updated_at to enquiries (idempotent).
alter table public.enquiries
  add column if not exists notes text;

alter table public.enquiries
  add column if not exists updated_at timestamptz;
