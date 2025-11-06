import { Command } from "commander";
import { WorkerManager } from "../../core/workerManager.js";
import { logger } from "../../utils/logger.js";

export const workerCommand = new Command("worker")
    .description("Manage background workers")
    .option("-c, --count <number>", "Number of workers to start", "1")
    .action(async (opts) => {
        try {
            const count = parseInt(opts.count);
            logger.info(`⚙️ Starting ${count} worker(s)...`);
            await WorkerManager.start(count);
        } catch (err) {
            logger.error(`Failed to start workers: ${err.message}`);
        }
    });