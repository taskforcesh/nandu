import config from "../../../config";
import { createTransport } from "nodemailer";
const mg = require("nodemailer-mailgun-transport");

export const getTransport = () => {
  switch (config.email.useTransport) {
    case "smtp":
      return createTransport({
        host: config.email.transports.smtp.host,
        port: config.email.transports.smtp.port,
        auth: {
          user: config.email.transports.smtp.auth.user,
          pass: config.email.transports.smtp.auth.pass,
        },
      });

    case "mailgun":
      console.log("Using mailgun", config.email.transports.mailgun);
      return createTransport(mg({ auth: config.email.transports.mailgun }));
  }
};
