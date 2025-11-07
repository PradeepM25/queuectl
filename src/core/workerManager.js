import { JobProcessor } from "./jobProcessor.js";
import { QueueManager } from "./queueManager.js";

export const WorkerManager = {
  running: false,

  async start(workerCount = 1) {
    this.running = true;
    console.log(`👷 ${workerCount} worker(s) started.`);

    const workers = [];
    for (let i = 0; i < workerCount; i++) {
      workers.push(this.runWorker(i + 1));
    }

    await Promise.all(workers);
  },

  async runWorker() {
    while (this.running) {
      try {
        const job = await QueueManager.getNextPendingJob();

        if (!job) {
          await new Promise((res) => setTimeout(res, 1000));
          continue;
        }

        await JobProcessor.process(job);
      } catch {
      
      }
    }
  },

  async stop() {
    this.running = false;
    console.log("🛑 Workers stopped.");
  },
};
