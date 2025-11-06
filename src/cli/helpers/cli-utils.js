export const printDivider = (label = "") => {
  const divider = "─".repeat(30);
  console.log(`\n${divider} ${label} ${divider}`);
};

export const printKeyValue = (key, value) => {
  console.log(`${key.padEnd(20, " ")} : ${value}`);
};

export const printJobSummary = (job) => {
  console.log(`{
    ID: ${job.id}
    Command: ${job.command}
    State: ${job.state}
    Attempts: ${job.attempts}/${job.max_retries}
    Updated: ${new Date(job.updated_at).toLocaleString()}
  }
  `);
};
