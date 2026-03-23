import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, setAuthCookie, signAuthToken } from "@/lib/auth";

export async function POST(request) {
  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const acceptedTerms = formData.get("acceptedTerms");
  const acceptedPrivacy = formData.get("acceptedPrivacy");

  if (!name || !email || !password) {
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent("Preencha todos os campos obrigatorios.")}`, request.url));
  }

  if (password.length < 6) {
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent("A senha precisa ter pelo menos 6 caracteres.")}`, request.url));
  }

  if (!acceptedTerms || !acceptedPrivacy) {
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent("Aceite os Termos de Uso e a Politica de Privacidade.")}`, request.url));
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const makeAdmin = adminEmail && email === adminEmail;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        acceptedTermsAt: new Date(),
        acceptedPrivacyAt: new Date(),
        role: makeAdmin ? "ADMIN" : "USER",
        subscriptionStatus: makeAdmin ? "ACTIVE" : "INACTIVE"
      }
    });

    const token = signAuthToken(user);
    await setAuthCookie(token);
    return NextResponse.redirect(new URL("/pricing", request.url));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent("Ja existe uma conta com este email.")}`, request.url));
    }
    throw error;
  }
}
