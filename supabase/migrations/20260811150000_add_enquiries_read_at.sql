-- Additive: enquiry mark-as-read timestamp for admin inbox
alter table public.enquiries
  add column if not exists read_at timestamptz;

comment on column public.enquiries.read_at is 'When an admin first opened or marked the enquiry as read';
