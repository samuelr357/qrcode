import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie, signAuthToken, verifyPassword } from "@/lib/auth";

const sanitizeNext = (value) => {
  if (!value || typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//")) return "/dashboard";
  return value;
};

export async function POST(request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const nextPath = sanitizeNext(String(formData.get("next") || ""));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Email ou senha invalidos.")}`, request.url));
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Email ou senha invalidos.")}`, request.url));
  }

  const token = signAuthToken(user);
  await setAuthCookie(token);
  return NextResponse.redirect(new URL(nextPath, request.url));
}
