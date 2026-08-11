-- Cover FKs introduced in phase2 portal schema
create index if not exists matter_documents_client_id_idx
  on public.matter_documents (client_id);
create index if not exists matters_enquiry_id_idx
  on public.matters (enquiry_id);
create index if not exists matters_visa_subclass_id_idx
  on public.matters (visa_subclass_id);
create index if not exists matters_updated_by_idx
  on public.matters (updated_by);
