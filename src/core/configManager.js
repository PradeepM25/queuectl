import { Config } from "../db/configModel.js";
import { logger } from "../utils/logger.js";

export const ConfigManager = {
  async setConfig(key, value) {
    try {
      const config = await Config.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
      logger.info(`⚙️ Config updated: ${key} = ${value}`);
      return config;
    } catch (err) {
      logger.error(`Error setting config: ${err.message}`);
      throw err;
    }
  },

  async getConfig(key) {
    try {
      const config = await Config.findOne({ key });
      return config ? config.value : null;
    } catch (err) {
      logger.error(`Error getting config: ${err.message}`);
      throw err;
    }
  },

  async getAllConfigs() {
    try {
      const configs = await Config.find({});
      const result = {};
      configs.forEach((c) => (result[c.key] = c.value));
      return result;
    } catch (err) {
      logger.error(`Error fetching configs: ${err.message}`);
      throw err;
    }
  },
};
