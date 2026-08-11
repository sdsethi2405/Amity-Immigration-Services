/**
 * Portal password hashing — reuses the same argon2id config as admin auth.
 * Do not duplicate ARGON2_OPTIONS here.
 */
export { hashPassword, verifyPassword } from "@/lib/auth/password";
