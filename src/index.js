import readline from "readline";
import { connectDB } from "./db/connection.js";
import { logger } from "./utils/logger.js";
import { enqueueCommand } from "./cli/commands/enqueue.js";
import { workerCommand } from "./cli/commands/worker.js";
import { statusCommand } from "./cli/commands/status.js";
import { listCommand } from "./cli/commands/list.js";
import { dlqCommand } from "./cli/commands/dlq.js";
import { configCommand } from "./cli/commands/config.js";

(async () => {
  await connectDB();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "queuectl> ",
  });

  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    if (input === "exit" || input === "quit") {
      console.log("👋Bye Bye\n");
      process.exit(0);
    }

    const args = input.split(" ");
    const cmd = args[0];
    const params = args.slice(1);

    switch (cmd) {
      case "enqueue":
        await enqueueCommand.parseAsync(["node", "queuectl", ...params]);
        break;
      case "worker":
        await workerCommand.parseAsync(["node", "queuectl", ...params]);
        break;
      case "status":
        await statusCommand.parseAsync(["node", "queuectl"]);
        break;
      case "list":
        await listCommand.parseAsync(["node", "queuectl", ...params]);
        break;
      case "dlq":
        await dlqCommand.parseAsync(["node", "queuectl", ...params]);
        break;
      case "config":
        await configCommand.parseAsync(["node", "queuectl", ...params]);
        break;
      default:
        console.log(`Unknown command: ${cmd}`);
        console.log("Type 'exit' to quit.");
    }

    rl.prompt();
  });
})();
