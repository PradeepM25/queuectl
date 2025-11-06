import { Command } from "commander";
import { QueueManager } from "../../core/queueManager.js";
import { logger } from "../../utils/logger.js";

export const enqueueCommand = new Command("enqueue")
  .description("Add a new job to the queue")
  .option("-c, --command <string...>", "Command to execute (e.g. echo hello)")
  .option("-r, --retries <number>", "Maximum retries (default: 3)", "3")
  .action(async (options) => {
    try {
      if (!options.command || !options.command.length) {
        logger.error("❌ Please provide a command using -c");
        return;
      }
      const commandString = Array.isArray(options.command)
        ? options.command.join(" ")
        : options.command;

      const jobId = `job-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const jobData = {
        id: jobId,
        command: commandString,
        max_retries: parseInt(options.retries),
        state: "pending",
      };

      await QueueManager.enqueue(jobData);
      logger.info(`📦 Job added: ${jobData.id} -> "${commandString}"`);
    } catch (err) {
      logger.error(`Failed to enqueue job: ${err.message}`);
    }
  });
