import { Command } from "commander";
import { QueueManager } from "../../core/queueManager.js";
import { logger } from "../../utils/logger.js";

export const enqueueCommand = new Command("enqueue")
  .description("Add a new job to the queue")
  .requiredOption("-c, --command <string>", "Command to execute (e.g. 'echo hello')")
  .option("-r, --retries <number>", "Maximum retries (default: 3)", "3")
  .action(async (options) => {
    try {
      const jobId = `job-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const jobData = {
        id: jobId,
        command: options.command,
        max_retries: parseInt(options.retries),
        state: "pending",
      };

      await QueueManager.enqueue(jobData);
      logger.info(`Job added: ${jobData.id}`);
    } catch (err) {
      logger.error(`Failed to enqueue job: ${err.message}`);
    }
  });
