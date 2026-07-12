import { hash, verify } from "@node-rs/argon2";

const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
} as const;

/**
 * Hash a password with argon2id. Server-side only — never log or persist plaintext.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, { ...ARGON2_OPTIONS, algorithm: 2 });
}

/**
 * Verify a plaintext password against an argon2id hash.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  try {
    return await verify(passwordHash, password, ARGON2_OPTIONS);
  } catch {
    return false;
  }
}
