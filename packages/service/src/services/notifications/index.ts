import config from "../../../config";
import { getTransport } from "./transport-factory";

const transporter = getTransport();

export const sendEmail = async (
  email: string,
  subject: string,
  html: string
) => {
  const options = () => {
    return {
      from: config.email.from,
      to: email,
      subject,
      html,
    };
  };

  return new Promise((resolve, reject) => {
    if (transporter) {
      transporter.sendMail(options(), (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    } else {
      throw new Error("No Email transporter found");
    }
  });
};
