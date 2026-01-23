// src/lib/auth.js
import { SignJWT, jwtVerify } from "jose";

// Ambil secret dari environment variable
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "kuncirahasia123");

export const buatToken = async (payload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("9h")
    .sign(SECRET);
};

export const verifikasiToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
};

export const getCurrentUser = async (request) => {
  // Pakai request.headers langsung (Headers object, bukan Promise)
  const authHeader = request.headers.get("authorization") ||
                     request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  const payload = await verifikasiToken(token);
  if (!payload) {
    return null;
  }

  if (!payload.id_user || !payload.peran) {
    return null;
  }

  return {
    id_user: payload.id_user,
    peran: payload.peran,
    bank_sampah_id: payload.bank_sampah_id || null,
    nickname: payload.nickname || null,
  };
};