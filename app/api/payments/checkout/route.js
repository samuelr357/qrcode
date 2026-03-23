import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserOrNullFromRequest } from "@/lib/auth";
import { createCheckoutPreference } from "@/lib/mercado-pago";

const PLAN_PRICE = Number(process.env.PLAN_PRICE || 29.9);

export async function POST(request) {
  const user = await getAuthUserOrNullFromRequest(request);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (user.role === "ADMIN") return NextResponse.json({ error: "Admins nao precisam de plano." }, { status: 400 });

  const preference = await createCheckoutPreference({ user, amount: PLAN_PRICE });

  if (!preference) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "ACTIVE",
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: PLAN_PRICE,
        status: "APPROVED",
        plan: "PRO",
        rawPayload: JSON.stringify({ simulated: true })
      }
    });

    return NextResponse.json({ redirectUrl: "/dashboard?payment=simulated" });
  }

  await prisma.user.update({ where: { id: user.id }, data: { subscriptionStatus: "PENDING" } });

  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: PLAN_PRICE,
      status: "PENDING",
      preferenceId: preference.id,
      plan: "PRO",
      rawPayload: JSON.stringify(preference)
    }
  });

  const checkoutUrl = preference.init_point || preference.sandbox_init_point;
  if (!checkoutUrl) return NextResponse.json({ error: "Checkout indisponivel" }, { status: 500 });

  return NextResponse.json({ redirectUrl: checkoutUrl });
}
