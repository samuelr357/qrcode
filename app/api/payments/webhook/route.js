import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchPaymentById } from "@/lib/mercado-pago";

const PLAN_PRICE = Number(process.env.PLAN_PRICE || 29.9);

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const url = new URL(request.url);
  const paymentId =
    body?.data?.id ||
    body?.resource?.id ||
    url.searchParams.get("data.id") ||
    url.searchParams.get("data_id") ||
    url.searchParams.get("id");

  if (!paymentId) return NextResponse.json({ ok: true });

  const payment = await fetchPaymentById(String(paymentId));
  if (!payment) return NextResponse.json({ ok: true });

  const userId = payment.external_reference;
  if (!userId) return NextResponse.json({ ok: true });

  const approved = payment.status === "approved";
  const canceled = payment.status === "cancelled" || payment.status === "cancelled_by_user";
  const rejected = payment.status === "rejected";
  const status = approved ? "APPROVED" : rejected ? "REJECTED" : canceled ? "CANCELED" : "PENDING";

  const statusToSubscription = approved ? "ACTIVE" : rejected || canceled ? "INACTIVE" : "PENDING";
  const subscriptionEndsAt = approved ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

  await prisma.payment.upsert({
    where: { providerPaymentId: String(payment.id) },
    create: {
      userId,
      amount: Number(payment.transaction_amount || PLAN_PRICE),
      status,
      providerPaymentId: String(payment.id),
      plan: "PRO",
      rawPayload: JSON.stringify(payment)
    },
    update: {
      status,
      rawPayload: JSON.stringify(payment)
    }
  });

  if (approved) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: statusToSubscription,
        subscriptionEndsAt
      }
    });
  } else if (rejected || canceled) {
    await prisma.user.updateMany({
      where: { id: userId, subscriptionStatus: "PENDING" },
      data: {
        subscriptionStatus: statusToSubscription,
        subscriptionEndsAt: null
      }
    });
  } else {
    await prisma.user.updateMany({
      where: { id: userId, subscriptionStatus: "INACTIVE" },
      data: {
        subscriptionStatus: "PENDING"
      }
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
