/**
 * Import function triggers from their respective submodules:
 */

import {setGlobalOptions} from "firebase-functions";
import {onDocumentCreated} from "firebase-functions/firestore";
import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Callable function to send email notification for feedback
export const sendFeedbackNotification = onCall(
  {
    region: "us-central1", // or your preferred region
  },
  async (request) => {
    const { subject, message, attachment, createdAt } = request.data as {
      subject: string;
      message: string;
      attachment?: string;
      createdAt: string;
    };

  logger.info("Sending feedback notification", { subject, message, attachment });

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "ocarslyobas@gmail.com", // Email address to receive notifications
    subject: `New Anonymous Feedback Received - ${subject}`,
    html: `
      <h2>New Anonymous Feedback</h2>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
      ${attachment ? `<p><strong>Attachment:</strong> ${attachment}</p>` : ""}
      <p><strong>Submitted at:</strong> ${createdAt || "Unknown"}</p>
      <hr>
      <p>This is an automated notification from your Anonymous Feedback App.</p>
    `,
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    logger.info("Email sent successfully", {messageId: info.messageId});
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error("Error sending email", error);
    throw new Error("Failed to send email notification");
  }
});

// Keep the original trigger function as backup (optional)
export const sendFeedbackNotificationOnCreate = onDocumentCreated("feedback/{feedbackId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.log("No data associated with the event");
    return;
  }

  const data = snapshot.data();
  const feedbackId = event.params.feedbackId;

  logger.info("New feedback submitted (trigger)", {feedbackId, data});

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "ocarslyobas@gmail.com", // Email address to receive notifications
    subject: `New Anonymous Feedback Received - ${data.subject}`,
    html: `
      <h2>New Anonymous Feedback</h2>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, "<br>")}</p>
      ${data.attachment ? `<p><strong>Attachment:</strong> ${data.attachment}</p>` : ""}
      <p><strong>Submitted at:</strong> ${data.createdAt?.toDate().toLocaleString() || "Unknown"}</p>
      <hr>
      <p>This is an automated notification from your Anonymous Feedback App.</p>
    `,
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    logger.info("Email sent successfully", {messageId: info.messageId});
  } catch (error) {
    logger.error("Error sending email", error);
  }
});
