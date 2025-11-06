import { Job } from "../db/jobModel.js";
import { logger } from "../utils/logger.js";

export const QueueManager = {
    async enqueue(jobData) {
        try {
            const job = new Job(jobData);
            await job.save();
            logger.info(` Enqueued job: ${job.id}`);
            return job;
        } catch (err) {
            logger.error(`Failed to enqueue job: ${err.message}`);
            throw err;
        }
    },

    async getNextPendingJob() {
        try {
            const job = await Job.findOneAndUpdate(
                { state : "pending" },
                { state : "processing" },
                { new : true }
            );
            return job;
        } catch (err) {
            logger.error(`Error fetching next job: ${err.message}`);
            throw err;
        }
    },

    async updateJobState(id, newState) {
        try {
            const job = await Job.findOneAndUpdate(
                { id },
                { state : newState, updated_at : new Date() },
                { new : true }
            );
            logger.info(`Job ${id} state updated to ${newState}`);
            return job;
        } catch (err) {
            logger.error(`Error updating job ${id} state: ${err.message}`);
            throw err;
        }
    },

    async incrementAttempts(id) {
        try {
            const job = await Job.findOneAndUpdate(
                { id },
                { $inc: { attempts: 1 }, updated_at: new Date() },
                { new: true }
            );
            return job;
        } catch (err) {
            logger.error(`Error incrementing attempts for job ${id}: ${err.message}`);
            throw err;
        }
    },
};