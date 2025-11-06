import { Command } from "commander";
import { DLQManager } from "../../core/dlqManager.js";
import { logger } from "../../utils/logger.js";
import { printJobSummary } from "../helpers/cli-utils.js"

export const dlqCommand = new Command("dlq")
  .description("Manage the Dead Letter Queue (DLQ)");

dlqCommand
  .command("list")
  .description("List jobs in the Dead Letter Queue")
  .action(async () => {
    try {
      const jobs = await DLQManager.listDLQJobs();

      if (!jobs.length) {
        logger.info("No jobs in DLQ.");
        return;
      }

      console.log("\n☠️  Dead Letter Queue:");
      jobs.forEach((job) => {
        console.log(`${printJobSummary(job)} \n`)
      });
    } catch (err) {
      logger.error(`Error listing DLQ jobs: ${err.message}`);
    }
  });

dlqCommand
  .command("retry <jobId>")
  .description("Retry a job from DLQ by job ID")
  .action(async (jobId) => {
    try {
      const restoredJob = await DLQManager.retryFromDLQ(jobId);
      if (restoredJob) logger.info(`♻️ Job ${jobId} moved back to queue.`);
    } catch (err) {
      logger.error(`Failed to retry job from DLQ: ${err.message}`);
    }
  });