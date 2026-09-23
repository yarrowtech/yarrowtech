import { createRequire } from "module";
import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

// pino-pretty is a devDependency; fall back to JSON if the host didn't install it.
const hasPretty = (() => {
  try {
    createRequire(import.meta.url).resolve("pino-pretty");
    return true;
  } catch {
    return false;
  }
})();
const usePretty = !isProduction && hasPretty;

// JSON logs in production (for the host's log viewer); readable coloured logs locally.
const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  base: { service: "yarrowtech-api" },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Never write secrets to logs, even if a whole body or header set gets logged.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
      "password",
      "*.password",
      "newPassword",
      "*.newPassword",
      "currentPassword",
      "*.currentPassword",
      "token",
      "*.token",
      "credential",
      "*.credential",
    ],
    censor: "[REDACTED]",
  },
  ...(!usePretty
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,service" },
        },
      }),
});

export default logger;
