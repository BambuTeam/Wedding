import { SignJWT, jwtVerify } from "jose";

export const ROOT_COOKIE_NAME = "aurea_root_session";

const JWT_SECRET = process.env.JWT_SECRET || process.env.ROOT_JWT_SECRET || "aurea-superadmin-secret-key-2025-production-grade";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export interface RootJwtPayload {
  email: string;
  role: "ROOT_SUPERADMIN";
  [key: string]: any;
}

/**
 * Genera un token JWT firmado para la sesión de SuperAdmin en /root
 */
export async function signRootJwt(payload: { email: string }): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: "ROOT_SUPERADMIN",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * Verifica la firma y expiración del token JWT de Root
 */
export async function verifyRootJwt(token: string): Promise<RootJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as RootJwtPayload;
  } catch (err) {
    return null;
  }
}
