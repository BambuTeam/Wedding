import { NextResponse } from "next/server";
import { ROOT_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Sesión cerrada correctamente.",
  });

  response.cookies.set({
    name: ROOT_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
