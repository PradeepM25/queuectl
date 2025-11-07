import { Config } from "../db/configModel.js";
import { logger } from "../utils/logger.js";

export const ConfigManager = {
  defaults: {
    max_retries: 3,
    backoff_base: 2,
  },

  async ensureDefaults() {
    try {
      for (const [key, value] of Object.entries(this.defaults)) {
        const exists = await Config.findOne({ key });
        if (!exists) {
          await Config.create({ key, value });
          logger.info(`🧩 Default config created: ${key} = ${value}`);
        }
      }
    } catch (err) {
      logger.error(`Error initializing defaults: ${err.message}`);
    }
  },

  async setConfig(key, value) {
    try {
      const parsedValue = isNaN(value) ? value : Number(value);

      const config = await Config.findOneAndUpdate(
        { key },
        { value: parsedValue },
        { upsert: true, new: true }
      );

      logger.info(`⚙️ Config updated: ${key} = ${parsedValue}`);
      return config;
    } catch (err) {
      logger.error(`Error setting config: ${err.message}`);
      throw err;
    }
  },

  async getConfig(key) {
    try {
      const config = await Config.findOne({ key });
      if (config) return config.value;
      const defaultValue = this.defaults[key];
      if (defaultValue !== undefined) {
        await Config.create({ key, value: defaultValue });
        logger.info(`⚙️ Default value created for ${key}: ${defaultValue}`);
        return defaultValue;
      }

      return null;
    } catch (err) {
      logger.error(`Error getting config: ${err.message}`);
      throw err;
    }
  },

  async getAllConfigs() {
    try {
      await this.ensureDefaults();

      const configs = await Config.find({});
      const result = {};
      configs.forEach((c) => (result[c.key] = c.value));

      return result;
    } catch (err) {
      logger.error(`Error fetching configs: ${err.message}`);
      throw err;
    }
  },

  async printConfig() {
    const configs = await this.getAllConfigs();

    console.log("\n⚙️  Current Configurations:");
    for (const [key, value] of Object.entries(configs)) {
      console.log(`   ${key}: ${value}`);
    }
    console.log();
  },

  async resetDefaults() {
    try {
      await Config.deleteMany({});
      await this.ensureDefaults();
      logger.info("🔄 Configurations reset to defaults.");
    } catch (err) {
      logger.error(`Error resetting defaults: ${err.message}`);
      throw err;
    }
  },
};
