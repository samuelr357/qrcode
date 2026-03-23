import { NextResponse } from "next/server";
import { getAuthUserOrNullFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const user = await getAuthUserOrNullFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  if (!email) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  await prisma.user.update({
    where: { email },
    data: {
      role: "ADMIN",
      subscriptionStatus: "ACTIVE"
    }
  }).catch(() => null);

  return NextResponse.redirect(new URL("/admin", request.url));
}
