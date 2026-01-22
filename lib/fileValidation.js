/**
 * File Validation Utilities
 * Provides magic number validation, filename sanitization, and extension whitelisting
 */

// Magic number signatures for allowed file types
const MAGIC_NUMBERS = {
  // Images
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0],
    [0xFF, 0xD8, 0xFF, 0xE1],
    [0xFF, 0xD8, 0xFF, 0xE2],
    [0xFF, 0xD8, 0xFF, 0xE3],
    [0xFF, 0xD8, 0xFF, 0xE8],
    [0xFF, 0xD8, 0xFF, 0xDB],
  ],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP container)
  // Documents
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

// Allowed extensions per category
const ALLOWED_EXTENSIONS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  document: ['pdf'],
};

// Dangerous patterns in filenames
const DANGEROUS_PATTERNS = [
  /\.\./,           // Path traversal
  /[<>:"|?*]/,      // Windows reserved chars
  /[\x00-\x1f]/,    // Control characters
  /^\.+$/,          // Hidden files (only dots)
  /\.(php|exe|sh|bat|cmd|ps1|js|vbs|wsf|scr|pif|com|dll)$/i, // Executable extensions
];

/**
 * Validate file magic numbers (actual file content)
 * @param {Buffer} buffer - File buffer
 * @param {string} expectedMimeType - Expected MIME type
 * @returns {boolean}
 */
export function validateMagicNumber(buffer, expectedMimeType) {
  const signatures = MAGIC_NUMBERS[expectedMimeType];
  
  if (!signatures) {
    // Unknown MIME type, cannot validate
    return false;
  }

  for (const signature of signatures) {
    let match = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }

  return false;
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return `file_${Date.now()}`;
  }

  // Get extension
  const lastDot = filename.lastIndexOf('.');
  let name = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  let ext = lastDot > 0 ? filename.slice(lastDot + 1).toLowerCase() : '';

  // Remove dangerous characters from name
  name = name
    .replace(/[^a-zA-Z0-9_\-]/g, '_') // Only alphanumeric, underscore, hyphen
    .replace(/_+/g, '_')              // Collapse multiple underscores
    .replace(/^_|_$/g, '')            // Trim underscores
    .slice(0, 100);                   // Limit length

  // Validate extension
  ext = ext.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);

  if (!name) {
    name = `file_${Date.now()}`;
  }

  return ext ? `${name}.${ext}` : name;
}

/**
 * Check if filename contains dangerous patterns
 * @param {string} filename 
 * @returns {boolean} - true if dangerous
 */
export function isDangerousFilename(filename) {
  if (!filename) return true;
  
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(filename)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Validate file extension against allowed list
 * @param {string} filename - Filename with extension
 * @param {string} category - 'image' or 'document'
 * @returns {boolean}
 */
export function isAllowedExtension(filename, category) {
  if (!filename || !category) return false;
  
  const ext = filename.split('.').pop()?.toLowerCase();
  const allowed = ALLOWED_EXTENSIONS[category];
  
  return allowed ? allowed.includes(ext) : false;
}

/**
 * Get the category of a MIME type
 * @param {string} mimeType 
 * @returns {'image' | 'document' | null}
 */
export function getMimeCategory(mimeType) {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'document';
  return null;
}

/**
 * Comprehensive file validation
 * @param {File} file - The uploaded file
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Validation options
 * @param {boolean} options.allowDocuments - Allow PDF documents
 * @param {number} options.maxSize - Maximum file size in bytes
 * @returns {{ valid: boolean, error?: string }}
 */
export async function validateFile(file, buffer, options = {}) {
  const { allowDocuments = false, maxSize = 2 * 1024 * 1024 } = options;

  // 1. Check if file exists
  if (!file || !buffer) {
    return { valid: false, error: 'Tidak ada file yang ditemukan' };
  }

  // 2. Validate filename
  if (isDangerousFilename(file.name)) {
    return { valid: false, error: 'Nama file tidak valid atau mengandung karakter berbahaya' };
  }

  // 3. Check file size
  if (buffer.length > maxSize) {
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    const maxMB = (maxSize / 1024 / 1024).toFixed(0);
    return { valid: false, error: `Ukuran file terlalu besar (${sizeMB}MB). Maksimal ${maxMB}MB.` };
  }

  // 4. Validate MIME type category
  const category = getMimeCategory(file.type);
  if (!category) {
    return { valid: false, error: 'Tipe file tidak didukung' };
  }

  if (category === 'document' && !allowDocuments) {
    return { valid: false, error: 'File harus berupa gambar (JPG, PNG, GIF, WebP)' };
  }

  // 5. Validate extension matches MIME type
  if (!isAllowedExtension(file.name, category)) {
    return { valid: false, error: 'Ekstensi file tidak sesuai dengan tipe file' };
  }

  // 6. Validate magic number (actual file content)
  if (!validateMagicNumber(buffer, file.type)) {
    return { valid: false, error: 'Konten file tidak sesuai dengan tipe yang diklaim. File mungkin dimodifikasi.' };
  }

  return { valid: true };
}

/**
 * Generate a safe filename with timestamp
 * @param {string} originalName - Original filename
 * @returns {string} - Safe filename with timestamp
 */
export function generateSafeFilename(originalName) {
  const sanitized = sanitizeFilename(originalName);
  const lastDot = sanitized.lastIndexOf('.');
  const name = lastDot > 0 ? sanitized.slice(0, lastDot) : sanitized;
  const ext = lastDot > 0 ? sanitized.slice(lastDot + 1) : '';
  
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return ext ? `${name}_${timestamp}_${random}.${ext}` : `${name}_${timestamp}_${random}`;
}
