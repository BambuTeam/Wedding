import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRootJwt, ROOT_COOKIE_NAME } from "./lib/auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo interceptamos rutas de /root y /api/root
  const isRootPage = pathname.startsWith("/root");
  const isRootApi = pathname.startsWith("/api/root");

  if (!isRootPage && !isRootApi) {
    return NextResponse.next();
  }

  // Rutas públicas de autenticación dentro de root
  const isLoginPage = pathname === "/root/login";
  const isAuthApi = pathname.startsWith("/api/root/auth");

  if (isAuthApi) {
    return NextResponse.next();
  }

  // Obtenemos la cookie de sesión de SuperAdmin
  const sessionCookie = request.cookies.get(ROOT_COOKIE_NAME)?.value;
  const verifiedUser = sessionCookie ? await verifyRootJwt(sessionCookie) : null;

  // Si ya está autenticado e intenta ir al login, redirigir directo al dashboard de /root
  if (isLoginPage) {
    if (verifiedUser) {
      return NextResponse.redirect(new URL("/root", request.url));
    }
    return NextResponse.next();
  }

  // Si no está autenticado:
  if (!verifiedUser) {
    if (isRootApi) {
      return NextResponse.json(
        { error: "No autorizado. Requiere sesión activa de SuperAdmin." },
        { status: 401 }
      );
    }

    // Para páginas /root/*, redirigir a /root/login guardando la ruta de retorno
    const loginUrl = new URL("/root/login", request.url);
    if (pathname !== "/root") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Sesión válida, continuar
  return NextResponse.next();
}

export const config = {
  matcher: ["/root/:path*", "/api/root/:path*"],
};
