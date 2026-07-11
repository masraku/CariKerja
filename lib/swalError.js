const TECHNICAL_PATTERNS = [
  /stack/i,
  /prisma/i,
  /supabase/i,
  /jwt/i,
  /token/i,
  /syntaxerror/i,
  /typeerror/i,
  /referenceerror/i,
  /failed to fetch/i,
  /network error/i,
  /request failed/i,
  /status code/i,
  /internal server error/i,
];

const cleanText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function getSafeErrorMessage(error, fallback = "Terjadi kesalahan. Silakan coba lagi.") {
  const rawMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    error;

  const message = cleanText(rawMessage);
  const lower = message.toLowerCase();

  if (!message) return fallback;

  if (
    lower.includes("only pdf") ||
    lower.includes("harus pdf") ||
    lower.includes("format pdf") ||
    lower.includes("application/pdf")
  ) {
    return "File harus berformat PDF. Silakan pilih file PDF yang valid, lalu coba unggah kembali.";
  }

  if (
    lower.includes("file harus berupa gambar") ||
    lower.includes("image") ||
    lower.includes("gambar") ||
    lower.includes("jpg") ||
    lower.includes("png") ||
    lower.includes("webp")
  ) {
    return "File harus berupa gambar dengan format JPG, PNG, GIF, atau WebP.";
  }

  if (
    lower.includes("too large") ||
    lower.includes("less than 5mb") ||
    lower.includes("maksimal 5mb") ||
    lower.includes("terlalu besar") ||
    lower.includes("ukuran file")
  ) {
    const maxMatch = message.match(/maksimal\s+(\d+)\s*mb/i) || message.match(/less than\s+(\d+)\s*mb/i);
    const maxSize = maxMatch?.[1] || "5";
    return `Ukuran file melebihi batas. Maksimal ukuran file adalah ${maxSize}MB. Silakan kompres file atau pilih file lain.`;
  }

  if (lower.includes("tipe file tidak didukung") || lower.includes("ekstensi file")) {
    return "Format file tidak didukung. Periksa kembali format file sesuai ketentuan pada formulir.";
  }

  if (lower.includes("konten file tidak sesuai")) {
    return "Isi file tidak sesuai dengan formatnya. Silakan gunakan file asli yang belum rusak atau belum dimodifikasi.";
  }

  if (lower.includes("nama file")) {
    return "Nama file tidak valid. Gunakan nama file sederhana tanpa simbol khusus, lalu coba lagi.";
  }

  if (lower.includes("unauthorized") || lower.includes("tidak memiliki akses") || lower.includes("login")) {
    return "Sesi login Anda sudah berakhir atau akses tidak diizinkan. Silakan login kembali.";
  }

  if (lower.includes("not found") || lower.includes("tidak ditemukan")) {
    return "Data yang diminta tidak ditemukan. Silakan muat ulang halaman atau kembali ke daftar sebelumnya.";
  }

  if (lower.includes("rate") || lower.includes("terlalu banyak permintaan")) {
    return "Terlalu banyak percobaan dalam waktu singkat. Tunggu sebentar, lalu coba lagi.";
  }

  if (lower.includes("network") || lower.includes("fetch") || lower.includes("koneksi")) {
    return "Koneksi bermasalah. Periksa internet Anda, lalu coba lagi.";
  }

  if (TECHNICAL_PATTERNS.some((pattern) => pattern.test(message))) {
    return fallback;
  }

  return message;
}

export function getUploadErrorMessage(error, options = {}) {
  const { kind = "file", maxSize = "5MB", formats = "PDF, JPG, PNG, GIF, atau WebP" } = options;
  const fallback = `Gagal mengunggah ${kind}. Pastikan format file adalah ${formats} dan ukurannya tidak melebihi ${maxSize}.`;

  return getSafeErrorMessage(error, fallback);
}
