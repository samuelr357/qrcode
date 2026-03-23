import { prisma } from "@/lib/prisma";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const SUPPORTED_RANGES = [7, 30, 90, 180];

const getRangeDays = (inputDays) => {
  const parsed = Number(inputDays);
  if (!Number.isFinite(parsed)) return 30;
  return SUPPORTED_RANGES.includes(parsed) ? parsed : 30;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const monthKeyFromDate = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (key) => {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
};

const sumAmount = (payments) => payments.reduce((acc, payment) => acc + Number(payment.amount || 0), 0);

export const getAdminDashboardData = async ({ rangeDays }) => {
  const resolvedRangeDays = getRangeDays(rangeDays);
  const now = new Date();
  const rangeStart = startOfDay(new Date(Date.now() - (resolvedRangeDays - 1) * DAY_IN_MS));
  const newUsersTodayStart = startOfDay(now);
  const expiresSoonEnd = new Date(Date.now() + 7 * DAY_IN_MS);
  const monthlyRecurringRevenue = Number(process.env.PLAN_PRICE || 29.9);
  const seriesStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    usersCount,
    adminsCount,
    activeSubscriptions,
    pendingSubscriptions,
    inactiveSubscriptions,
    usersInRange,
    usersToday,
    subscriptionsExpiringSoon,
    totalQrGenerations,
    qrGenerationsInRange,
    recentUsers,
    recentPayments,
    paymentsInRange,
    approvedRevenueLifetime,
    approvedPaymentsSeries,
    topQrUsersRaw
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.user.count({ where: { subscriptionStatus: "PENDING" } }),
    prisma.user.count({ where: { subscriptionStatus: "INACTIVE" } }),
    prisma.user.count({ where: { createdAt: { gte: rangeStart } } }),
    prisma.user.count({ where: { createdAt: { gte: newUsersTodayStart } } }),
    prisma.user.count({
      where: {
        subscriptionStatus: "ACTIVE",
        subscriptionEndsAt: { gte: now, lte: expiresSoonEnd }
      }
    }),
    prisma.qrGeneration.count(),
    prisma.qrGeneration.count({ where: { createdAt: { gte: rangeStart } } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        createdAt: true
      }
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        status: true,
        plan: true,
        currency: true,
        createdAt: true,
        providerPaymentId: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    }),
    prisma.payment.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { amount: true, status: true, createdAt: true }
    }),
    prisma.payment.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
      _count: { _all: true }
    }),
    prisma.payment.findMany({
      where: { status: "APPROVED", createdAt: { gte: seriesStart } },
      select: { amount: true, createdAt: true }
    }),
    prisma.qrGeneration.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: rangeStart } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5
    })
  ]);

  const topUserIds = topQrUsersRaw.map((item) => item.userId);
  const topUsersMap = topUserIds.length
    ? await prisma.user.findMany({
        where: { id: { in: topUserIds } },
        select: { id: true, name: true, email: true }
      })
    : [];
  const usersById = new Map(topUsersMap.map((item) => [item.id, item]));

  const topQrUsers = topQrUsersRaw.map((item) => ({
    id: item.userId,
    name: usersById.get(item.userId)?.name || "Usuario removido",
    email: usersById.get(item.userId)?.email || "-",
    qrCount: item._count.id
  }));

  const approvedPayments = paymentsInRange.filter((payment) => payment.status === "APPROVED");
  const pendingPayments = paymentsInRange.filter((payment) => payment.status === "PENDING");
  const rejectedPayments = paymentsInRange.filter((payment) =>
    payment.status === "REJECTED" || payment.status === "CANCELED"
  );

  const revenueInRange = sumAmount(approvedPayments);
  const pendingAmountInRange = sumAmount(pendingPayments);
  const failedAmountInRange = sumAmount(rejectedPayments);
  const paymentsTotalInRange = paymentsInRange.length;
  const approvalRate = paymentsTotalInRange === 0 ? 0 : (approvedPayments.length / paymentsTotalInRange) * 100;

  const seriesMap = new Map();
  approvedPaymentsSeries.forEach((payment) => {
    const key = monthKeyFromDate(payment.createdAt);
    const previous = seriesMap.get(key) || 0;
    seriesMap.set(key, previous + Number(payment.amount || 0));
  });

  const revenueSeries = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = monthKeyFromDate(date);
    revenueSeries.push({
      key,
      label: formatMonthLabel(key),
      value: Number((seriesMap.get(key) || 0).toFixed(2))
    });
  }

  const activeRatio = usersCount === 0 ? 0 : (activeSubscriptions / usersCount) * 100;
  const adminRatio = usersCount === 0 ? 0 : (adminsCount / usersCount) * 100;

  return {
    rangeDays: resolvedRangeDays,
    rangeStart,
    monthlyRecurringRevenue,
    users: {
      total: usersCount,
      newInRange: usersInRange,
      newToday: usersToday,
      admins: adminsCount,
      adminsRatio: adminRatio,
      recent: recentUsers
    },
    subscriptions: {
      active: activeSubscriptions,
      pending: pendingSubscriptions,
      inactive: inactiveSubscriptions,
      activeRatio,
      expiringSoon: subscriptionsExpiringSoon,
      mrrEstimate: activeSubscriptions * monthlyRecurringRevenue
    },
    qr: {
      total: totalQrGenerations,
      inRange: qrGenerationsInRange,
      topUsers: topQrUsers
    },
    sales: {
      rangeRevenue: revenueInRange,
      rangePendingAmount: pendingAmountInRange,
      rangeFailedAmount: failedAmountInRange,
      approvedCount: approvedPayments.length,
      pendingCount: pendingPayments.length,
      failedCount: rejectedPayments.length,
      totalCount: paymentsTotalInRange,
      approvalRate,
      lifetimeRevenue: Number(approvedRevenueLifetime._sum.amount || 0),
      lifetimeApprovedCount: approvedRevenueLifetime._count._all,
      revenueSeries,
      recentPayments
    }
  };
};

export const getAvailableRanges = () => SUPPORTED_RANGES;
