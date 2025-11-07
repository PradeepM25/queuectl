import { DLQJob } from "../db/dlqModel.js";
import { Job } from "../db/jobModel.js";
import { logger } from "../utils/logger.js";

export const DLQManager = {
  async moveToDLQ(job, reason = "Unknown error") {
    try {
      const dlqJob = new DLQJob({
        id: job.id,
        command: job.command,
        state: job.state || "dead",
        attempts: job.attempts,
        max_retries: job.max_retries || 3,
        reason,
        updatedAt: new Date(),
      });

      await dlqJob.save();

      logger.warn(`☠️  Job ${job.id} moved to DLQ (${reason})`);
      return dlqJob;
    } catch (err) {
      logger.error(`❌ Failed to move job ${job.id} to DLQ: ${err.message}`);
      throw err;
    }
  },

  async listDLQJobs() {
    try {
      const jobs = await DLQJob.find({}).sort({ updatedAt: -1 });
      if (jobs.length === 0) logger.info("🟢 DLQ is empty.");
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
        logger.warn(`⚠️  Job ${jobId} not found in DLQ`);
        return null;
      }

      await Job.deleteOne({ id: jobId });
      const restoredJob = new Job({
        id: jobId,
        command: dlqJob.command,
        state: "pending",
        attempts: 0,
        max_retries: dlqJob.max_retries || 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await restoredJob.save();
      await DLQJob.deleteOne({ id: jobId });

      logger.info(`♻️  Job ${jobId} successfully requeued from DLQ.`);
      return restoredJob;
    } catch (err) {
      logger.error(`Error retrying DLQ job ${jobId}: ${err.message}`);
      throw err;
    }
  },

  async purgeDLQ() {
    try {
      const result = await DLQJob.deleteMany({});
      logger.info(`🗑️  Purged ${result.deletedCount} job(s) from DLQ.`);
      return result.deletedCount;
    } catch (err) {
      logger.error(`Error purging DLQ: ${err.message}`);
      throw err;
    }
  },
};
