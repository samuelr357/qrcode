import { prisma } from "@/lib/prisma";
import { getMonthBounds, getMonthlyLimit, getPlanLabel, hasActiveSubscription } from "@/lib/subscription";

export const getUsageThisMonth = async (userId) => {
  const { start, end } = getMonthBounds();
  return prisma.qrGeneration.count({
    where: {
      userId,
      createdAt: {
        gte: start,
        lt: end
      }
    }
  });
};

export const getDashboardData = async (user) => {
  const usedThisMonth = await getUsageThisMonth(user.id);
  const monthlyLimit = getMonthlyLimit(user);
  const unlimited = !Number.isFinite(monthlyLimit);

  return {
    planLabel: getPlanLabel(user),
    hasAccess: hasActiveSubscription(user),
    usedThisMonth,
    monthlyLimit,
    remaining: unlimited ? null : Math.max(monthlyLimit - usedThisMonth, 0),
    unlimited
  };
};
