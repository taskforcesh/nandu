import config from "../../../config";
import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { Readable } from "stream";
import pino from "pino";
const mg = require("nodemailer-mailgun-transport");

// Create a logger instance for this service
const logger = pino({ name: "email-transport", level: config.logLevel });

// Define a simplified email transporter interface that focuses on the sendMail method
// both nodemailer transports and our console transport implement this interface
type EmailTransporter = {
  sendMail: (options: Mail.Options, callback: (err: Error | null, info: any) => void) => void;
};

/**
 * Creates and returns the appropriate email transport based on configuration
 * With enhanced validation and debugging
 */
export const getTransport = (): EmailTransporter | null => {
  // If no transport is configured or it's empty, default to console
  if (!config.email || !config.email.useTransport) {
    logger.warn("No email transport configured. Using console transport for development.");
    return getConsoleTransport();
  }

  try {
    switch (config.email.useTransport) {
      case "smtp":
        // Validate SMTP configuration
        if (!config.email.transports?.smtp?.auth?.user || !config.email.transports?.smtp?.auth?.pass) {
          logger.warn("SMTP transport selected but not fully configured. Falling back to console transport.");
          return getConsoleTransport();
        }
        
        const smtpConfig = config.email.transports.smtp;
        logger.info({ host: smtpConfig.host, port: smtpConfig.port }, "Configuring SMTP transport");
        
        return createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          auth: {
            user: smtpConfig.auth.user,
            pass: smtpConfig.auth.pass,
          },
          // Add debug option for more verbose logs if needed
          debug: process.env.NODE_ENV !== 'production'
        });

      case "mailgun":
        // Validate Mailgun configuration
        if (!config.email.transports?.mailgun?.apiKey || !config.email.transports?.mailgun?.domain) {
          logger.warn("Mailgun transport selected but not fully configured. Falling back to console transport.");
          return getConsoleTransport();
        }
        
        logger.info({ domain: config.email.transports.mailgun.domain }, "Using Mailgun transport for email delivery");
        return createTransport(mg({ auth: config.email.transports.mailgun }));
      
      case "console":
        return getConsoleTransport();
        
      default:
        logger.warn({ transport: config.email.useTransport }, "Unknown email transport. Falling back to console transport.");
        return getConsoleTransport();
    }
  } catch (error) {
    logger.error({ error }, "Error configuring email transport");
    logger.warn("Falling back to console transport due to configuration error.");
    return getConsoleTransport();
  }
};

/**
 * Helper function to safely extract content from html that could be 
 * different types (string, Buffer, Readable, etc.)
 */
function getContentPreview(html: string | Buffer | Readable | Mail.AttachmentLike | undefined): string {
  if (html === undefined) {
    return "[No content]";
  }
  
  if (typeof html === "string") {
    return html.length > 500 ? html.substring(0, 500) + "..." : html;
  }
  
  if (Buffer.isBuffer(html)) {
    const text = html.toString('utf-8');
    return text.length > 500 ? text.substring(0, 500) + "..." : text;
  }
  
  // For other types (Readable, AttachmentLike), just return a placeholder
  return "[Content not displayable in preview]";
}

/**
 * Returns a console transport that logs emails to the console instead of sending them
 * Useful for development and debugging
 */
function getConsoleTransport(): EmailTransporter {
  logger.info("Using console transport for email delivery (development mode)");
  return {
    sendMail: (options: Mail.Options, callback: (err: Error | null, info: any) => void): void => {
      const emailPreview = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        contentPreview: getContentPreview(options.html).substring(0, 100) + "..."
      };
      
      logger.info({ email: emailPreview }, "DEBUG EMAIL");
      
      // Simulate a successful send
      callback(null, { 
        messageId: `console-debug-${Date.now()}`,
        envelope: options,
        accepted: [options.to]
      });
    }
  };
}
