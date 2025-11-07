import { Command } from "commander";
import { connectDB } from "../db/connection.js";
import { logger } from "../utils/logger.js";
import { enqueueCommand } from "./commands/enqueue.js";
import { workerCommand } from "./commands/worker.js";
import { statusCommand } from "./commands/status.js";
import { listCommand } from "./commands/list.js";
import { dlqCommand } from "./commands/dlq.js";
import { configCommand } from "./commands/config.js";

const program = new Command();

program
  .name("queuectl")
  .description("CLI for managing background job queue system")
  .version("1.0.0");

program.addCommand(enqueueCommand);
program.addCommand(workerCommand);
program.addCommand(statusCommand);
program.addCommand(listCommand);
program.addCommand(dlqCommand);
program.addCommand(configCommand);

program.hook("preAction", async () => {
  await connectDB();
});

program.hook("postAction", () => {
  logger.info("✅ Command executed successfully");
});

program.parse(process.argv);
