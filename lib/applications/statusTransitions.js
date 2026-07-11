export const RECRUITER_APPLICATION_STATUSES = [
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_COMPLETED",
  "ACCEPTED",
  "REJECTED",
];

export const INTERVIEW_ELIGIBLE_APPLICATION_STATUSES = [
  "REVIEWING",
  "SHORTLISTED",
];

const RECRUITER_TRANSITIONS = {
  PENDING: ["REVIEWING", "SHORTLISTED", "REJECTED"],
  REVIEWING: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEW_SCHEDULED", "REJECTED"],
  INTERVIEW_SCHEDULED: ["INTERVIEW_COMPLETED", "REJECTED"],
  INTERVIEW_COMPLETED: ["ACCEPTED", "REJECTED"],
};

export function canRecruiterSetApplicationStatus(currentStatus, nextStatus) {
  return RECRUITER_TRANSITIONS[currentStatus]?.includes(nextStatus) || false;
}

export function getInvalidRecruiterStatusMessage(currentStatus, nextStatus) {
  if (!RECRUITER_APPLICATION_STATUSES.includes(nextStatus)) {
    return "Status lamaran tidak valid untuk recruiter";
  }

  if (nextStatus === "WITHDRAWN") {
    return "Status ditarik hanya bisa dilakukan oleh pelamar";
  }

  if (nextStatus === "PENDING") {
    return "Lamaran tidak bisa dikembalikan ke status awal";
  }

  return `Status lamaran tidak bisa diubah dari ${currentStatus} ke ${nextStatus}`;
}
