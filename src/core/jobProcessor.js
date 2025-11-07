import { exec } from "child_process";
import { promisify } from "util";
import { calculateBackoff } from "../utils/backoff.js";
import { sleep } from "../utils/time.js";
import { QueueManager } from "./queueManager.js";
import { DLQManager } from "./dlqManager.js";
import { Config } from "../db/configModel.js";

const execAsync = promisify(exec);

export const JobProcessor = {
  async process(job) {
    const updatedJob = await QueueManager.incrementAttempts(job.id);

    try {
      await execAsync(updatedJob.command);
      await QueueManager.updateJobState(updatedJob.id, "completed");
      console.log(`✅ Job ${updatedJob.id} completed.`);
    } catch {
      await this.handleFailure(updatedJob);
    }
  },

  async handleFailure(job) {
    const configEntries = await Config.find({});
    const configMap = Object.fromEntries(configEntries.map((c) => [c.key, c.value]));
    const base = parseInt(configMap.backoff_base || 2);
    const maxRetries = parseInt(configMap.max_retries || job.max_retries || 3);
    const { attempts } = job;

    if (attempts >= maxRetries) {
      await QueueManager.updateJobState(job.id, "dead");
      await DLQManager.moveToDLQ(job, "Max retries reached");
      console.log(`☠️ Job ${job.id} moved to DLQ (max retries reached).`);
      return;
    }

    const delay = calculateBackoff(base, attempts);
    await QueueManager.updateJobState(job.id, "failed");
    await sleep(delay);
    await QueueManager.updateJobState(job.id, "pending");
  },
};
