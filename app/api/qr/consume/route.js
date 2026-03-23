import { NextResponse } from "next/server";
import { getAuthUserOrNullFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUsageThisMonth } from "@/lib/dashboard";
import { getMonthlyLimit, hasActiveSubscription } from "@/lib/subscription";

export async function POST(request) {
  const user = await getAuthUserOrNullFromRequest(request);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  if (!hasActiveSubscription(user)) {
    return NextResponse.json({ error: "Pagamento necessario para acessar o gerador." }, { status: 402 });
  }

  if (user.role !== "ADMIN") {
    const used = await getUsageThisMonth(user.id);
    const limit = getMonthlyLimit(user);
    if (used >= limit) {
      return NextResponse.json({ error: "Voce atingiu o limite mensal de 30 QRs." }, { status: 429 });
    }
  }

  const body = await request.json().catch(() => ({}));
  const payload = String(body?.payload || "download").slice(0, 2000);

  await prisma.qrGeneration.create({
    data: {
      userId: user.id,
      payload
    }
  });

  if (user.role === "ADMIN") return NextResponse.json({ remaining: null, unlimited: true });

  const usedAfter = await getUsageThisMonth(user.id);
  const limit = getMonthlyLimit(user);
  return NextResponse.json({ remaining: Math.max(limit - usedAfter, 0), unlimited: false });
}
