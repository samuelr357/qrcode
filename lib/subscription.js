export const USER_MONTHLY_LIMIT = 30;

export const getMonthBounds = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
};

export const hasActiveSubscription = (user) => {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.subscriptionStatus !== "ACTIVE") return false;
  if (!user.subscriptionEndsAt) return true;
  return user.subscriptionEndsAt > new Date();
};

export const getMonthlyLimit = (user) => {
  if (!user) return 0;
  return user.role === "ADMIN" ? Number.POSITIVE_INFINITY : USER_MONTHLY_LIMIT;
};

export const getPlanLabel = (user) => {
  if (!user) return "Visitante";
  if (user.role === "ADMIN") return "Administrador";
  if (hasActiveSubscription(user)) return "PRO";
  return "Free";
};
