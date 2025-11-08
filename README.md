# 🧰 QueueCTL – CLI-Based Background Job Queue System

A lightweight **Node.js + MongoDB** background job queue system with a clean CLI interface.  
QueueCTL manages background jobs, executes them using worker processes, automatically retries failed jobs with **exponential backoff**, and moves permanently failed jobs into a **Dead Letter Queue (DLQ)**.

---

Demo Link: **https://drive.google.com/file/d/19ge3u6MgrttP29aWdf_3FcbrQbClsWVB/view?usp=sharing**

---
## 🚀 1. Setup Instructions

### **Prerequisites**
- Node.js 
- MongoDB (local or cloud instance)

### **Installation**
```bash
git clone https://github.com/PradeepM25/queuectl.git
cd queuectl
npm install
```

### **Environment Configuration**
Create a `.env` file in the root directory with the following content:
```
MONGO_URI=mongodb://localhost:27017/queuectl
```

### **Start CLI**
```bash
node src/index.js
```

Once started, the interactive CLI prompt will appear:
```
queuectl>
```

---

## 💻 2. Usage Examples

### **Enqueue a Job**
```bash
queuectl> enqueue -c "echo Hello QueueCTL"
```

### **Start Workers**
```bash
queuectl> worker -c 3
```
Output:
```
👷 3 worker(s) started.
✅ Job job-1762534456781-3412 completed.
```

### **List Jobs**
```bash
queuectl> list
```
Displays all jobs by their current state.

### **Check Status**
```bash
queuectl> status
```
Shows a summary of all job states:
```
📊 Queue Status:
Pending: 1
Processing: 0
Completed: 3
Failed: 0
Dead: 1
```

### **View Dead Letter Queue**
```bash
queuectl> dlq list
```

### **Retry a DLQ Job**
```bash
queuectl> dlq retry job-1762534456782-7865
```

### **Change Configurations**
```bash
queuectl> config set max-retries 5
queuectl> config set backoff_base 2
queuectl> config get
```

---

## ⚙️ 3. Architecture Overview

### **Core Components**

| Component | Description |
|------------|--------------|
| **QueueManager** | Handles job creation, persistence, and state transitions. |
| **WorkerManager** | Manages worker lifecycle, job polling, and execution. |
| **JobProcessor** | Executes job commands, handles retries, and applies backoff logic. |
| **DLQManager** | Manages jobs that fail permanently after max retries. |
| **ConfigManager** | Stores runtime configuration (retry count, backoff base, etc.). |

## 🧩 3. Available Commands

| Command | Options / Usage | Description |
|----------|-----------------|--------------|
| **enqueue** | `-c "<command>"` | Enqueue a new job to the background queue. <br>Example: `queuectl enqueue -c "echo Hello World"` |
| **worker** | `-c <number>` | Start one or more workers to process jobs concurrently. <br>Example: `queuectl worker -c 2` |
| **worker --stop** | *(no args)* | Stop all running background workers gracefully. |
| **status** | *(no args)* | Show overall queue status — pending, completed, failed, and dead jobs. |
| **list** | `--state <state>` *(optional)* | List all jobs in the queue. Optionally filter by state (`pending`, `completed`, etc.). |
| **dlq list** | *(no args)* | List all jobs currently in the Dead Letter Queue (DLQ). |
| **dlq retry** | `<jobId>` | Retry a job from the DLQ. <br>Example: `queuectl dlq retry job-1762534456782-7865` |
| **config set** | `<key> <value>` | Update runtime configuration (e.g., `max-retries`, `backoff_base`). <br>Example: `queuectl config set max-retries 5` |
| **config get** | *(no args)* | Display all stored configuration settings. |

---

### 🧠 Command Summary

- 🧱 **enqueue** → Add background jobs to the queue.  
- ⚙️ **worker** → Run multiple concurrent workers.  
- 🛑 **worker --stop** → Gracefully stop all workers.  
- 📊 **status** → Get system-wide queue metrics.  
- 📜 **list** → View job details by status.  
- ☠️ **dlq list** → Inspect permanently failed jobs.  
- 🔁 **dlq retry** → Requeue jobs from the DLQ.  
- ⚙️ **config set / get** → Manage queue settings dynamically.  

---

### **Job Lifecycle**

| State | Description |
|--------|--------------|
| `pending` | Waiting to be picked up by a worker. |
| `processing` | Currently being executed. |
| `completed` | Successfully executed. |
| `failed` | Failed but still retryable. |
| `dead` | Permanently failed and moved to DLQ. |

---

### **Persistence**

- All jobs are persisted in **MongoDB**.
- If the system restarts, all unprocessed jobs remain in the queue.
- DLQ jobs are stored separately to allow retry or inspection later.

---

## 🔁 4. Assumptions & Trade-offs

| Area | Decision / Simplification |
|------|----------------------------|
| **Persistence** | MongoDB chosen for simplicity; could be replaced with Redis or PostgreSQL. |
| **Concurrency** | Workers run asynchronously inside Node.js. |
| **Fault Tolerance** | Atomic updates prevent duplicate job execution. |
| **Command Execution** | Uses Node's `child_process.exec()` to execute shell commands. |
| **Backoff Logic** | Simple exponential formula: `delay = base ^ attempts (seconds)`. |
| **DLQ Retry** | Jobs moved from DLQ reset attempts and re-enter queue. |
| **Testing** | Manual verification and CLI operations confirm behavior. |

---

## 🧪 5. Testing Instructions

### **Manual Functional Verification**
You can manually test system functionality using these commands:

1️⃣ **Enqueue Jobs**
```bash
queuectl> enqueue -c "echo Success job"
queuectl> enqueue -c notarealcommand
```

2️⃣ **Start Workers**
```bash
queuectl> worker -c 2
```

Expected Output:
```
👷 2 worker(s) started.
✅ Job job-... completed.
☠️ Job job-... moved to DLQ (max retries reached).
```

3️⃣ **List Jobs**
```bash
queuectl> list
```

4️⃣ **Check Dead Letter Queue**
```bash
queuectl> dlq list
```

5️⃣ **Retry from DLQ**
```bash
queuectl> dlq retry job-<id>
```

---

## 🧩 6. Key Features Summary

| Feature | Description |
|----------|--------------|
| ✅ CLI-Based Interface | Simple and intuitive command-line tool. |
| ✅ Persistent Storage | MongoDB-based job storage and recovery. |
| ✅ Multi-Worker Support | Multiple concurrent worker processes. |
| ✅ Retry & Backoff | Automatic exponential retry mechanism. |
| ✅ Dead Letter Queue | Separate queue for permanently failed jobs. |
| ✅ Configurable | Change retry and backoff settings at runtime. |
| ✅ Graceful Shutdown | Workers finish active jobs before stopping. |

---

## 📦 7. Folder Structure

```
queuectl/
├── src/
│   ├── cli/
│   │   └── commands/
│   │       ├── worker.js
│   │       ├── enqueue.js
│   │       ├── dlq.js
│   │       ├── status.js
│   │       └── config.js
│   ├── core/
│   │   ├── workerManager.js
│   │   ├── jobProcessor.js
│   │   ├── queueManager.js
│   │   └── dlqManager.js
│   ├── db/
│   │   ├── connection.js
│   │   ├── jobModel.js
│   │   ├── dlqModel.js
│   │   └── configModel.js
│   ├── utils/
│   │   ├── backoff.js
│   │   └── time.js
│   └── index.js
└── package.json
```

---

## 🧠 8. Future Improvements

- Add a **web dashboard** for job visualization.  
- Add **authentication** for sensitive commands.  
- Implement a **priority queue**.  
- Include **automatic stuck job recovery**.  
- Add **comprehensive test scripts** using Jest or Mocha.

---

## 🏁 9. Conclusion

QueueCTL is a fully functional CLI-based background job queue system built with **Node.js** and **MongoDB**, providing persistence, reliability, and retry mechanisms suitable for production-grade background processing systems.
