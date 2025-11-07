import { Job } from "../db/jobModel.js";
import { logger } from "../utils/logger.js";

export const LockManager = {
  async acquireLock(jobId) {
    try {
      const job = await Job.findOneAndUpdate(
        { id: jobId, state: "pending" },
        { state: "processing" },
        { new: true }
      );
      if (job) {
        logger.debug(`🔒 Lock acquired for job ${jobId}`);
        return true;
      }
      return false;
    } catch (err) {
      logger.error(`Error acquiring lock for job ${jobId}: ${err.message}`);
      return false;
    }
  },

  async releaseLock(jobId, newState = "pending") {
    try {
      await Job.findOneAndUpdate(
        { id: jobId },
        { state: newState, updated_at: new Date() }
      );
      logger.debug(`🔓 Lock released for job ${jobId} (set to ${newState})`);
    } catch (err) {
      logger.error(`Error releasing lock for job ${jobId}: ${err.message}`);
    }
  },
};
