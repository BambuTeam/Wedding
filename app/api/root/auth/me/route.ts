import { NextRequest, NextResponse } from "next/server";
import { verifyRootJwt, ROOT_COOKIE_NAME } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ROOT_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifyRootJwt(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: payload.email,
      role: payload.role,
    },
  });
}
