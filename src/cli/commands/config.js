import { Command } from "commander";
import { ConfigManager } from "../../core/configManager.js";
import { logger } from "../../utils/logger.js";

export const configCommand = new Command("config")
  .description("Manage queue configuration");

configCommand
  .command("set <key> <value>")
  .description("Set a configuration value (e.g. max_retries 5)")
  .action(async (key, value) => {
    try {
      const updated = await ConfigManager.setConfig(key, isNaN(value) ? value : Number(value));
      logger.info(`⚙️  Config updated: ${updated.key} = ${updated.value}`);
    } catch (err) {
      logger.error(`Failed to set config: ${err.message}`);
    }
  });

configCommand
  .command("get [key]")
  .description("Get one or all configuration values")
  .action(async (key) => {
    try {
      if (key) {
        const value = await ConfigManager.getConfig(key);
        if (value === null) logger.info(`No config found for key '${key}'`);
        else console.log(`${key}: ${value}`);
      } else {
        const configs = await ConfigManager.getAllConfigs();
        console.log("\n⚙️  Current Configurations:");
        Object.entries(configs).forEach(([k, v]) => console.log(`- ${k}: ${v}`));
      }
    } catch (err) {
      logger.error(`Error fetching config: ${err.message}`);
    }
  });
