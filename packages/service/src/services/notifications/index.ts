import config from "../../../config";
import { getTransport } from "./transport-factory";
import fs from "fs";
import path from "path";
import { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import pino from "pino";

// Create a logger instance for this service
const logger = pino({ name: "notifications", level: config.logLevel });

// Define a type that represents our available transports
type EmailTransporter = {
  sendMail: (
    options: Mail.Options,
    callback: (err: Error | null, info: any) => void
  ) => void;
};

// Create a debug log directory for emails if it doesn't exist
const emailLogDir = path.join(__dirname, "../../../logs");
try {
  if (!fs.existsSync(emailLogDir)) {
    fs.mkdirSync(emailLogDir, { recursive: true });
  }
} catch (err) {
  logger.error({ err }, "Failed to create email log directory");
}

// Get the configured email transport or null if not set up
let transporter: EmailTransporter | null = null;
try {
  transporter = getTransport();
  if (transporter) {
    logger.info("Email transport initialized successfully");
  } else {
    logger.warn("No email transport configured - emails will be logged but not sent");
  }
} catch (error) {
  logger.error({ error }, "Failed to initialize email transport");
}

/**
 * Send an email to the specified address
 * If email transport is not configured, it will save emails to log files
 */
export const sendEmail = async (
  email: string,
  subject: string,
  html: string
): Promise<any> => {
  const options: Mail.Options = {
    from: config.email?.from || "noreply@nandu.local",
    to: email,
    subject,
    html,
  };

  logger.debug({ email, subject }, "Attempting to send email");

  // Always log the email content for debugging
  try {
    const timestamp = new Date().toISOString().replace(/[:\.]/g, "-");
    const logFile = path.join(
      emailLogDir,
      `email-${timestamp}-${email.replace("@", "_at_")}.html`
    );
    const logContent = `
To: ${email}
From: ${options.from}
Subject: ${subject}
Date: ${new Date().toString()}
Content-Type: text/html

${html}
    `;
    fs.writeFileSync(logFile, logContent);
    logger.debug({ logFile }, "Email logged to file");
  } catch (err) {
    logger.error({ err }, "Failed to log email content");
  }

  // Return early with console notification if no transport
  if (!transporter) {
    logger.info("No email transport configured. Email logged but not sent.");
    return { messageId: `not-sent-${Date.now()}`, logged: true };
  }

  return new Promise((resolve, reject) => {
    transporter!.sendMail(options, (err: Error | null, info: any) => {
      if (err) {
        logger.error({ err }, "Failed to send email");
        reject(err);
      } else {
        logger.info({ messageId: info.messageId }, "Email sent successfully");
        resolve(info);
      }
    });
  });
};
