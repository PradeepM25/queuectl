import { Command } from "commander";
import { WorkerManager } from "../../core/workerManager.js";

export const workerCommand = new Command("worker")
  .description("Start queue workers to process jobs")
  .option("-c, --count <number>", "Number of workers to start", "1")
  .option("--stop", "Stop all running workers gracefully")
  .action(async (opts) => {
    try {
      if (opts.stop) {
        await WorkerManager.stop();
        return;
      }

      const count = parseInt(opts.count);
      await WorkerManager.start(count);
    } catch {
    
    }
  });
