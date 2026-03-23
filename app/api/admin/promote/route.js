import { NextResponse } from "next/server";
import { getAuthUserOrNullFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export async function POST(request) {
  const user = await getAuthUserOrNullFromRequest(request);
  if (!user || !hasPermission(user, PERMISSIONS.USERS_MANAGE)) {
    return NextResponse.redirect(new URL("/admin?updated=forbidden", request.url));
  }

  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  if (!email) {
    return NextResponse.redirect(new URL("/admin?updated=invalid", request.url));
  }

  await prisma.user.update({
    where: { email },
    data: {
      role: "ADMIN",
      subscriptionStatus: "ACTIVE"
    }
  }).catch(() => null);

  return NextResponse.redirect(new URL("/admin?updated=ok", request.url));
}
