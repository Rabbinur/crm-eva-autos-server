export type IRequestLog = {
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  contentLength?: number;
  success: boolean;
  message?: string;
  traceId?: string;
  timestamp: string;
};

export const logPerformance = (data: IRequestLog) => {
  const sizeKB = data.contentLength
    ? (data.contentLength / 1024).toFixed(2)
    : "0";

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 API PERFORMANCE LOG
🕒 ${data.timestamp}
➡️  ${data.method} ${data.url}
✅ Success: ${data.success}
📦 Status: ${data.statusCode}
⏱  Time: ${data.durationMs} ms
📏 Size: ${sizeKB} KB
🆔 TraceId: ${data.traceId || "N/A"}
📝 Message: ${data.message || "—"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
};
