import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { MatterStatus } from "@/lib/schemas/matters";

export type ClientRow = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
};

export type MatterRow = {
  id: string;
  client_id: string;
  enquiry_id: string | null;
  visa_subclass_id: string | null;
  title: string;
  status: MatterStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
};

export type MatterListItem = MatterRow & {
  client_email: string;
  client_full_name: string;
  visa_name: string | null;
};

export type MatterChecklistItem = {
  id: string;
  matter_id: string;
  label: string;
  is_required: boolean;
  is_complete: boolean;
  sort_order: number;
};

export type MatterDocument = {
  id: string;
  matter_id: string;
  client_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  uploaded_by: "client" | "admin";
  created_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  locale: string;
  is_confirmed: boolean;
  created_at: string;
};

export async function adminListClients(): Promise<ClientRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, email, full_name, is_active, created_at")
    .order("full_name");

  if (error) throw error;
  return (data ?? []) as ClientRow[];
}

export async function adminListMatters(): Promise<MatterListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("matters")
    .select(
      `
      id,
      client_id,
      enquiry_id,
      visa_subclass_id,
      title,
      status,
      notes,
      created_at,
      updated_at,
      updated_by,
      clients ( email, full_name ),
      visa_subclasses ( name )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const clients = row.clients as
      | { email: string; full_name: string }
      | { email: string; full_name: string }[]
      | null;
    const visas = row.visa_subclasses as
      | { name: string }
      | { name: string }[]
      | null;
    const client = Array.isArray(clients) ? clients[0] : clients;
    const visa = Array.isArray(visas) ? visas[0] : visas;

    return {
      id: row.id,
      client_id: row.client_id,
      enquiry_id: row.enquiry_id,
      visa_subclass_id: row.visa_subclass_id,
      title: row.title,
      status: row.status as MatterStatus,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      client_email: client?.email ?? "",
      client_full_name: client?.full_name ?? "",
      visa_name: visa?.name ?? null,
    };
  });
}

export async function adminGetMatterById(
  id: string,
): Promise<MatterListItem | null> {
  const matters = await adminListMatters();
  return matters.find((matter) => matter.id === id) ?? null;
}

export async function listMattersForClient(
  clientId: string,
): Promise<MatterRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("matters")
    .select(
      "id, client_id, enquiry_id, visa_subclass_id, title, status, notes, created_at, updated_at, updated_by",
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as MatterRow[];
}

export async function getMatterForClient(
  matterId: string,
  clientId: string,
): Promise<MatterRow | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("matters")
    .select(
      "id, client_id, enquiry_id, visa_subclass_id, title, status, notes, created_at, updated_at, updated_by",
    )
    .eq("id", matterId)
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) throw error;
  return data as MatterRow | null;
}

export async function listChecklistItemsForMatter(
  matterId: string,
): Promise<MatterChecklistItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("matter_checklist_items")
    .select("id, matter_id, label, is_required, is_complete, sort_order")
    .eq("matter_id", matterId)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as MatterChecklistItem[];
}

export async function listDocumentsForMatter(
  matterId: string,
): Promise<MatterDocument[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("matter_documents")
    .select(
      "id, matter_id, client_id, file_name, storage_path, mime_type, uploaded_by, created_at",
    )
    .eq("matter_id", matterId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as MatterDocument[];
}

export async function adminListNewsletterSubscribers(): Promise<
  NewsletterSubscriber[]
> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, locale, is_confirmed, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  return (data ?? []) as NewsletterSubscriber[];
}
