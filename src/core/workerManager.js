import { JobProcessor } from "./jobProcessor.js";
import { QueueManager } from "./queueManager.js";
import { logger } from "../utils/logger.js";

export const WorkerManager = {
  workers: [],
  running: false,

  async start(workerCount = 1) {
    this.running = true;
    logger.info(`🚀Starting ${workerCount} worker(s)...`);

    for (let i = 0; i < workerCount; i++) {
      const worker = this.runWorker(i + 1);
      this.workers.push(worker);
    }

    process.on("SIGINT", async () => {
      logger.info("🛑 Graceful shutdown initiated...");
      this.running = false;
      await Promise.all(this.workers);
    });
  },

  async runWorker(workerId) {
    logger.info(`👷 Worker ${workerId} started`);
    while (this.running) {
      const job = await QueueManager.getNextPendingJob();
      if (!job) {
        await new Promise((res) => setTimeout(res, 1000)); 
        continue;
      }
      await JobProcessor.process(job, workerId);
    }
  },
};