/** Client portal session cookie (raw token; never stored in DB). */
export const CLIENT_SESSION_COOKIE_NAME = "amity_client_session";

/** Default client portal session lifetime: 8 hours. */
export const CLIENT_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export const CLIENT_INVALID_CREDENTIALS_MESSAGE =
  "invalid email or password";

/** Private storage bucket for matter documents. */
export const CLIENT_DOCUMENTS_BUCKET = "client-documents";

/** Signed URL TTL for client document downloads (seconds). */
export const CLIENT_DOCUMENT_SIGNED_URL_TTL_SECONDS = 60;
