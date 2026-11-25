import { NextRequest, NextResponse } from "next/server";
import { signRootJwt, ROOT_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = process.env.ROOT_ADMIN_EMAIL || "admin@aurea.lat";
    const expectedPassword = process.env.ROOT_ADMIN_PASSWORD || "AureaAdmin2025!";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo electrónico y contraseña requeridos." },
        { status: 400 }
      );
    }

    if (
      email.trim().toLowerCase() !== expectedEmail.trim().toLowerCase() ||
      password !== expectedPassword
    ) {
      return NextResponse.json(
        { error: "Credenciales de SuperAdmin no válidas." },
        { status: 401 }
      );
    }

    // Firmar JWT
    const token = await signRootJwt({ email: expectedEmail });

    // Preparar respuesta con cookie HttpOnly segura
    const response = NextResponse.json({
      success: true,
      message: "Sesión de SuperAdmin iniciada correctamente.",
      user: {
        email: expectedEmail,
        role: "ROOT_SUPERADMIN",
      },
    });

    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set({
      name: ROOT_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: isProduction,
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (err: any) {
    console.error("[POST /api/root/auth/login] Error:", err);
    return NextResponse.json(
      { error: "Error interno al iniciar sesión." },
      { status: 500 }
    );
  }
}
