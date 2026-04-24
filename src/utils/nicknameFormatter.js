const VALID_PREFIXES = [
  "KBU",
  "TLB",
  "TLK",
  "LGR",
  "CND",
  "KMR",
  "LDK",
  "PSN",
  "BYT",
];

/**
 * Auto-format nickname berdasarkan role yang dipilih
 * NASABAH/PETUGAS → format KBU-N-0001 / KBU-P-0001
 * ADMIN           → tidak diformat, kembalikan lowercase
 */
export function formatNickname(raw, role = "NASABAH") {
  if (role === "ADMIN") return raw.toLowerCase();

  const clean = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (clean.length < 8) return clean;

  const prefix = clean.slice(0, 3);
  const number = clean.slice(4, 8);
  const roleCode = role === "PETUGAS" ? "P" : "N";

  return `${prefix}-${roleCode}-${number}`;
}

/**
 * Validasi nickname berdasarkan role yang dipilih
 */

export function isValidNickname(nickname, role = "NASABAH") {
  if (role === "ADMIN") return nickname.trim().length > 0;

  const roleCode = role === "PETUGAS" ? "P" : "N";
  const regex = new RegExp(`^([A-Z]{3})-(${roleCode})-(\\d{4})$`);
  const match = nickname.match(regex);

  if (!match) return false;
  return VALID_PREFIXES.includes(match[1]);
}
