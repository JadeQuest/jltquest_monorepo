import crypto from 'crypto';

const KEY_STRING = process.env.ENCRYPTION_KEY || 'mock_encryption_key_32_bytes_long_!!!';

// Ensure exactly 32 bytes (256 bits) for aes-256-gcm
let ENCRYPTION_KEY: Buffer;
try {
  ENCRYPTION_KEY = Buffer.alloc(32);
  const keyBuffer = Buffer.from(KEY_STRING, 'utf8');
  keyBuffer.copy(ENCRYPTION_KEY);
} catch (err) {
  ENCRYPTION_KEY = crypto.scryptSync(KEY_STRING, 'salt-salt', 32);
}

export function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      // Return original text if it doesn't match the encrypted format (e.g. legacy plaintext)
      return encryptedText;
    }
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('[Encryption Utility] Decryption failed, returning input:', error);
    return encryptedText;
  }
}
