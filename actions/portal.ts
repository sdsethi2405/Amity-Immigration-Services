"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import { assertValidCsrf } from "@/lib/auth/csrf";
import {
  CLIENT_DOCUMENTS_BUCKET,
  CLIENT_DOCUMENT_SIGNED_URL_TTL_SECONDS,
} from "@/lib/portal/constants";
import { getCurrentClient } from "@/lib/portal/session";
import {
  ALLOWED_CLIENT_DOCUMENT_MIME_TYPES,
  MAX_CLIENT_DOCUMENT_BYTES,
  portalToggleChecklistSchema,
  portalUploadDocumentSchema,
} from "@/lib/schemas/portal";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function extensionForMime(mime: string, fileName: string): string {
  switch (mime) {
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    default: {
      const parts = fileName.split(".");
      return parts.length > 1 ? parts.at(-1)!.slice(0, 8) : "bin";
    }
  }
}

async function assertClientOwnsMatter(
  clientId: string,
  matterId: string,
): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("matters")
    .select("id")
    .eq("id", matterId)
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function uploadMatterDocumentAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const client = await getCurrentClient();
    if (!client) {
      return actionFail("Unauthorized");
    }

    const csrfToken = String(formData.get("csrfToken") ?? "");
    const matterId = String(formData.get("matterId") ?? "");
    const file = formData.get("file");

    const parsed = portalUploadDocumentSchema.safeParse({ csrfToken, matterId });
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await assertValidCsrf(parsed.data.csrfToken);

    const owns = await assertClientOwnsMatter(client.id, parsed.data.matterId);
    if (!owns) {
      return actionFail("Matter not found");
    }

    if (!(file instanceof File)) {
      return actionFail("A file is required");
    }

    if (file.size <= 0 || file.size > MAX_CLIENT_DOCUMENT_BYTES) {
      return actionFail("File must be between 1 byte and 10 MB");
    }

    if (
      !ALLOWED_CLIENT_DOCUMENT_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_CLIENT_DOCUMENT_MIME_TYPES)[number],
      )
    ) {
      return actionFail(
        "Only PDF, Word, JPEG, PNG, and WebP files are allowed",
      );
    }

    const objectName = `${client.id}/${parsed.data.matterId}/${randomUUID()}.${extensionForMime(file.type, file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = createServerSupabaseClient();

    const { error: uploadError } = await supabase.storage
      .from(CLIENT_DOCUMENTS_BUCKET)
      .upload(objectName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return actionFail(uploadError.message);
    }

    const { data, error: insertError } = await supabase
      .from("matter_documents")
      .insert({
        matter_id: parsed.data.matterId,
        client_id: client.id,
        file_name: file.name.slice(0, 255),
        storage_path: objectName,
        mime_type: file.type || null,
        uploaded_by: "client",
      })
      .select("id")
      .single();

    if (insertError) {
      await supabase.storage.from(CLIENT_DOCUMENTS_BUCKET).remove([objectName]);
      throw insertError;
    }

    revalidatePath(`/portal/matters/${parsed.data.matterId}`);
    return actionOk({ id: data.id });
  } catch {
    return actionFail("Something went wrong. Please try again.");
  }
}

export async function toggleChecklistItemAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const client = await getCurrentClient();
    if (!client) {
      return actionFail("Unauthorized");
    }

    const parsed = portalToggleChecklistSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await assertValidCsrf(parsed.data.csrfToken);

    const owns = await assertClientOwnsMatter(client.id, parsed.data.matterId);
    if (!owns) {
      return actionFail("Matter not found");
    }

    const supabase = createServerSupabaseClient();

    const { data: item, error: itemError } = await supabase
      .from("matter_checklist_items")
      .select("id, matter_id")
      .eq("id", parsed.data.itemId)
      .eq("matter_id", parsed.data.matterId)
      .maybeSingle();

    if (itemError) throw itemError;
    if (!item) {
      return actionFail("Checklist item not found");
    }

    const { error } = await supabase
      .from("matter_checklist_items")
      .update({
        is_complete: parsed.data.isComplete,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.itemId);

    if (error) throw error;

    revalidatePath(`/portal/matters/${parsed.data.matterId}`);
    return actionOk();
  } catch {
    return actionFail("Something went wrong. Please try again.");
  }
}

export async function getMatterDocumentSignedUrlAction(
  input: unknown,
): Promise<ActionResult<{ url: string }>> {
  try {
    const client = await getCurrentClient();
    if (!client) {
      return actionFail("Unauthorized");
    }

    const documentId =
      input &&
      typeof input === "object" &&
      "documentId" in input &&
      typeof (input as { documentId: unknown }).documentId === "string"
        ? (input as { documentId: string }).documentId
        : "";

    if (!documentId) {
      return actionFail("Document not found");
    }

    const supabase = createServerSupabaseClient();
    const { data: doc, error } = await supabase
      .from("matter_documents")
      .select("id, storage_path, client_id")
      .eq("id", documentId)
      .eq("client_id", client.id)
      .maybeSingle();

    if (error) throw error;
    if (!doc) {
      return actionFail("Document not found");
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(CLIENT_DOCUMENTS_BUCKET)
      .createSignedUrl(doc.storage_path, CLIENT_DOCUMENT_SIGNED_URL_TTL_SECONDS);

    if (signError || !signed?.signedUrl) {
      return actionFail("Could not create download link");
    }

    return actionOk({ url: signed.signedUrl });
  } catch {
    return actionFail("Something went wrong. Please try again.");
  }
}
