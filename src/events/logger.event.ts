import fs from "fs";
import path from "path";
import { emitter } from "./eventEmitter";

emitter.on("apiLog", async (logData) => {
  const logsDir = path.join(__dirname, "../../logs");

  const logFilePath = path.join(
    logsDir,
    `api_data_logger_${new Date().toISOString().slice(0, 10)}.log`
  );

  try {
    // ensure logs directory exists
    await fs.promises.mkdir(logsDir, { recursive: true });

    // append log
    await fs.promises.appendFile(logFilePath, JSON.stringify(logData) + "\n");
  } catch (err) {
    console.error("Error writing to log file:", err);
  }
});
