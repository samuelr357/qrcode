import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchPaymentById } from "@/lib/mercado-pago";

const PLAN_PRICE = Number(process.env.PLAN_PRICE || 29.9);

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const url = new URL(request.url);
  const paymentId = body?.data?.id || url.searchParams.get("data_id");
  if (!paymentId) return NextResponse.json({ ok: true });

  const payment = await fetchPaymentById(String(paymentId));
  if (!payment) return NextResponse.json({ ok: true });

  const userId = payment.external_reference;
  if (!userId) return NextResponse.json({ ok: true });

  const approved = payment.status === "approved";
  const status = approved ? "APPROVED" : payment.status === "rejected" ? "REJECTED" : "PENDING";

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
        subscriptionStatus: "ACTIVE",
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
