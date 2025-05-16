const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'viveksinhchavda@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'tj37OTJsoyDa1sxd' // App password
  }
});

/**
 * Send email function
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body (optional)
 * @param {string} options.html - HTML body (optional)
 * @returns {Promise} - Resolves with info about sent mail or rejects with error
 */
const sendEmail = async (options) => {
  try {
    const { to, subject, text, html } = options;

    if (!to || !subject || (!text && !html)) {
      throw new Error('Missing required email fields');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'VoloConnect <viveksinhchavda@gmail.com>',
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send volunteer application status update email
 * @param {Object} options - Options for the status update
 * @param {string} options.to - Volunteer email
 * @param {string} options.name - Volunteer name
 * @param {string} options.eventTitle - Event title
 * @param {string} options.status - Application status (approved/rejected)
 * @param {string} options.feedback - Optional feedback message
 * @returns {Promise} - Email sending promise
 */
const sendVolunteerStatusEmail = async (options) => {
  const { to, name, eventTitle, status, feedback = '' } = options;
  
  const subject = `Your volunteer application for "${eventTitle}" has been ${status}`;
  
  let htmlContent;
  if (status === 'approved') {
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #4CAF50;">Application Approved</h2>
        <p>Dear ${name},</p>
        <p>Congratulations! Your application to volunteer for <strong>${eventTitle}</strong> has been approved.</p>
        ${feedback ? `<p><strong>Message from organizer:</strong> ${feedback}</p>` : ''}
        <p>Please check the event details in your dashboard for more information.</p>
        <p>Thank you for your commitment to making a difference!</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">This is an automated message from VoloConnect.</p>
        </div>
      </div>
    `;
  } else {
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #F44336;">Application Not Approved</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your interest in volunteering for <strong>${eventTitle}</strong>.</p>
        <p>We regret to inform you that your application has not been approved at this time.</p>
        ${feedback ? `<p><strong>Feedback from organizer:</strong> ${feedback}</p>` : ''}
        <p>Please check our platform for other volunteer opportunities that might be a better fit.</p>
        <p>We appreciate your interest and hope you'll find other ways to contribute.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">This is an automated message from VoloConnect.</p>
        </div>
      </div>
    `;
  }
  
  const textContent = `
Dear ${name},

Your application to volunteer for "${eventTitle}" has been ${status}.
${feedback ? `Feedback from organizer: ${feedback}` : ''}

Please check your dashboard for more information.

Thank you,
VoloConnect Team
  `;
  
  return sendEmail({
    to,
    subject,
    text: textContent,
    html: htmlContent
  });
};

/**
 * Send custom email to volunteer
 * @param {Object} options - Options for the custom email
 * @param {string} options.to - Volunteer email
 * @param {string} options.name - Volunteer name
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message
 * @param {string} options.eventTitle - Event title
 * @returns {Promise} - Email sending promise
 */
const sendCustomVolunteerEmail = async (options) => {
  const { to, name, subject, message, eventTitle } = options;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #2196F3;">Message Regarding Your Volunteering</h2>
      <p>Dear ${name},</p>
      <p>${message}</p>
      <p>Event: <strong>${eventTitle}</strong></p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">This message was sent through VoloConnect.</p>
      </div>
    </div>
  `;
  
  const textContent = `
Dear ${name},

${message}

Event: ${eventTitle}

Sent via VoloConnect
  `;
  
  return sendEmail({
    to,
    subject,
    text: textContent,
    html: htmlContent
  });
};

module.exports = {
  sendEmail,
  sendVolunteerStatusEmail,
  sendCustomVolunteerEmail
}; 