import express from "express";
import bodyParser from "body-parser";
import { createLogger, format, transports } from "winston";
// @ts-ignore
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const app = express();
app.use(bodyParser.json());

const logDir = "/var/log/central-logs";

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    // errores diarios
    new DailyRotateFile({
      filename: path.join(logDir, "errors-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "7d",
      zippedArchive: true,
    }),
    // todos los logs diarios
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "7d",
      zippedArchive: true,
    }),
    new transports.Console(),
  ],
});

const performanceLogger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, "performance-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "15d",
      zippedArchive: true,
    }),
    new transports.Console(),
  ],
});

app.post("/log", (req, res) => {
  const { level, message, meta } = req.body;
  logger.log(level || "info", message, meta || {});
  res.sendStatus(200);
});

app.post("/performance", (req, res) => {
  const { level, message, meta } = req.body;
  performanceLogger.log(level || "info", message, meta || {});
  res.sendStatus(200);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Log server listening on port ${PORT}`));
