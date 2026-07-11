export function openApplicationDeadlineWhere(now = new Date()) {
  return {
    OR: [
      { applicationDeadline: null },
      { applicationDeadline: { gte: now } },
    ],
  };
}

export function publicActiveJobWhere(now = new Date()) {
  return {
    status: "ACTIVE",
    isActive: true,
    publishedAt: { not: null },
    companies: {
      is: {
        verified: true,
        status: "VERIFIED",
      },
    },
    ...openApplicationDeadlineWhere(now),
  };
}
