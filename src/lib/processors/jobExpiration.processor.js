import { expirePastDeadlineJobs } from "@/services/jobs/jobService";

export const processJobExpiration = async (job) => {
  if (job.name !== "expire-past-deadline-jobs") {
    throw new Error(`Unknown job expiration task: ${job.name}`);
  }

  const expiredCount = await expirePastDeadlineJobs();
  console.log(`Expired ${expiredCount} job(s) with passed deadlines.`);

  return { expiredCount };
};
