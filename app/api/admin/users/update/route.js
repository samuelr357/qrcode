import { NextResponse } from "next/server";
import { getAuthUserOrNullFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

const ROLES = new Set(["ADMIN", "USER"]);
const SUBSCRIPTION_STATUSES = new Set(["ACTIVE", "PENDING", "INACTIVE"]);

const adminRedirect = (request, status, rangeParam) => {
  const url = new URL("/admin", request.url);
  if (status) url.searchParams.set("updated", status);
  if (rangeParam) url.searchParams.set("range", rangeParam);
  return NextResponse.redirect(url);
};

export async function POST(request) {
  const user = await getAuthUserOrNullFromRequest(request);
  const formData = await request.formData();
  const rangeParam = String(formData.get("range") || "").trim();

  if (!user || !hasPermission(user, PERMISSIONS.USERS_MANAGE)) {
    return adminRedirect(request, "forbidden", rangeParam);
  }

  const action = String(formData.get("action") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  if (!email || !action) return adminRedirect(request, "invalid", rangeParam);

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) return adminRedirect(request, "not_found", rangeParam);

  if (action === "setRole") {
    const role = String(formData.get("role") || "").trim();
    if (!ROLES.has(role)) return adminRedirect(request, "invalid", rangeParam);
    if (targetUser.id === user.id && role !== "ADMIN") {
      return adminRedirect(request, "self_downgrade", rangeParam);
    }
    if (targetUser.role === "ADMIN" && role === "USER") {
      const adminsCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminsCount <= 1) {
        return adminRedirect(request, "last_admin", rangeParam);
      }
    }

    const nextData = {
      role
    };
    if (role === "ADMIN") {
      nextData.subscriptionStatus = "ACTIVE";
      nextData.subscriptionEndsAt = null;
    }

    await prisma.user.update({
      where: { id: targetUser.id },
      data: nextData
    });
    return adminRedirect(request, "ok", rangeParam);
  }

  if (action === "setSubscription") {
    const subscriptionStatus = String(formData.get("subscriptionStatus") || "").trim();
    if (!SUBSCRIPTION_STATUSES.has(subscriptionStatus)) return adminRedirect(request, "invalid", rangeParam);

    const nextData = {
      subscriptionStatus
    };

    if (subscriptionStatus === "ACTIVE") {
      nextData.subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else {
      nextData.subscriptionEndsAt = null;
    }

    await prisma.user.update({
      where: { id: targetUser.id },
      data: nextData
    });
    return adminRedirect(request, "ok", rangeParam);
  }

  return adminRedirect(request, "invalid", rangeParam);
}
