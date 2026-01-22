import * as argon2 from "argon2";
import bcrypt from "bcryptjs";

/**
 * Hash a password using Argon2
 * @param {string} password 
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  try {
    return await argon2.hash(password);
  } catch (err) {
    console.error("Argon2 hash error:", err);
    throw new Error("Password hashing failed");
  }
}

/**
 * Verify a password against a hash (supports Argon2 and legacy Bcrypt)
 * @param {string} password - Plain text password
 * @param {string} hash - The hash from database
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hash) {
  try {
    // Check if hash is bcrypt (starts with $2a$, $2b$, or $2y$)
    // Bcrypt hashes are typically 60 chars long
    if (hash.startsWith('$2')) {
      return await bcrypt.compare(password, hash);
    }
    
    // Otherwise assume Argon2
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error("Password verification error:", err);
    return false;
  }
}

/**
 * Check if the hash is a legacy hash that needs re-hashing
 * @param {string} hash 
 * @returns {boolean}
 */
export function needsRehash(hash) {
  // If it starts with $2 (bcrypt), it needs rehash to Argon2
  return hash.startsWith('$2');
}
