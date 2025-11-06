import { DLQJob } from "../db/dlqModel.js";
import { Job } from "../db/jobModel.js";
import { logger } from "../utils/logger.js";

export const DLQManager = {
  async moveToDLQ(job, reason = "Unknown error") {
    try {
      const dlqJob = new DLQJob({
        id: job.id,
        command: job.command,
        attempts: job.attempts,
        reason,
      });

      await dlqJob.save();
      logger.warn(`☠️  Job ${job.id} moved to DLQ (${reason})`);
      return dlqJob;
    } catch (err) {
      logger.error(`Failed to move job ${job.id} to DLQ: ${err.message}`);
      throw err;
    }
  },

  async listDLQJobs() {
    try {
      const jobs = await DLQJob.find({});
      return jobs;
    } catch (err) {
      logger.error(`Error listing DLQ jobs: ${err.message}`);
      throw err;
    }
  },

  async retryFromDLQ(jobId) {
    try {
      const dlqJob = await DLQJob.findOne({ id: jobId });
      if (!dlqJob) {
        logger.warn(`Job ${jobId} not found in DLQ`);
        return null;
      }

      const restoredJob = new Job({
        id: dlqJob.id,
        command: dlqJob.command,
        state: "pending",
        attempts: 0,
      });

      await restoredJob.save();
      await DLQJob.deleteOne({ id: jobId });

      logger.info(`♻️  Job ${jobId} retried from DLQ`);
      return restoredJob;
    } catch (err) {
      logger.error(`Error retrying DLQ job ${jobId}: ${err.message}`);
      throw err;
    }
  },
};
