import { Command } from "commander";
import { Job } from "../../db/jobModel.js";
import { logger } from "../../utils/logger.js";
import { printJobSummary } from "../helpers/cli-utils.js";

export const listCommand = new Command("list")
  .description("List jobs in the queue")
  .option("-s, --state <string>", "Filter jobs by state (pending, failed, etc.)", "pending")
  .action(async (options) => {
    try {
      const jobs = await Job.find({ state: options.state }).sort({ created_at: -1 }).limit(20);

      if (!jobs.length) {
        logger.info(`No jobs found with state '${options.state}'.`);
        return;
      }

      console.log(`\n🧾 Jobs (${options.state.toUpperCase()}):`);
      jobs.forEach((job) => {
        printJobSummary(job)
      });
    } catch (err) {
      logger.error(`Error listing jobs: ${err.message}`);
    }
  });
