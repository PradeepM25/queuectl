import { exec } from "child_process";
import { promisify } from "util";
import { calculateBackoff } from "../utils/backoff.js";
import { sleep } from "../utils/time.js";
import { QueueManager } from "./queueManager.js";
import { DLQManager } from "./dlqManager.js";
import { logger } from "../utils/logger.js";
import { Config } from "../db/configModel.js";

const execAsync = promisify(exec);

export const JobProcessor = {
  async process(job, workerId) {
    logger.info(`👷 Worker ${workerId} processing job ${job.id}`);

    try {
      await execAsync(job.command);
      await QueueManager.updateJobState(job.id, "completed");
      logger.info(`✅ Job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`❌ Job ${job.id} failed: ${error.message}`);
      await this.handleFailure(job);
    }
  },

  async handleFailure(job) {
    const config = await Config.find({});
    const configMap = Object.fromEntries(config.map((c) => [c.key, c.value]));
    const base = configMap.backoff_base || 2;
    const maxRetries = configMap.max_retries || job.max_retries || 3;

    const updatedJob = await QueueManager.incrementAttempts(job.id);
    const { attempts } = updatedJob;

    if (attempts >= maxRetries) {
      await QueueManager.updateJobState(job.id, "dead");
      await DLQManager.moveToDLQ(updatedJob, "Max retries reached");
      return;
    }

    const delay = calculateBackoff(base, attempts);
    logger.info(`⏳ Retrying job ${job.id} in ${delay / 1000}s (attempt ${attempts})`);

    await QueueManager.updateJobState(job.id, "failed");
    await sleep(delay);
    await QueueManager.updateJobState(job.id, "pending");
  },
};
