import { Command } from 'commander';
import { Job } from "../../db/jobModel.js";
import { logger } from "../../utils/logger.js";

export const statusCommand = new Command('status')
    .description("Show current job queue status")
    .action(async () => {
        try {
            const counts = await Job.aggregate([
                { $group: { _id: "$state", count: { $sum: 1 } } },
            ]);
            logger.info("📊 Queue Status:");
            const stateCounts = {
                pending: 0,
                processing: 0,
                completed: 0,
                failed: 0,
                dead: 0,
            };

            counts.forEach((c) => {
                stateCounts[c._id] = c.count;
            });

            console.log(`
Pending:    ${stateCounts.pending}
Processing: ${stateCounts.processing}
Completed:  ${stateCounts.completed}
Failed:     ${stateCounts.failed}
Dead:       ${stateCounts.dead}
        `);
        } catch (err) {
            logger.error(`Error fetching queue status: ${err.message}`);
        }
    })