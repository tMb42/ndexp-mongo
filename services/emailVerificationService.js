require('dotenv').config();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const UserResource = require('../resources/UserResource');

// 1. Create an email transporter.
const mailTransport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Add this option if you're connecting to a server with a self-signed certificate
  },
});

// 2. Function to send an email verification notification
const sendEmailVerificationNotification = async (user, res) => {
  try {
    // Generate JWT token for email verification
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Construct URL with query parameters
    const params = { userId: user.id, token: token };
    const baseUrl = process.env.FRONT_APP + '/home/verify-email?';
    const queryString = querystring.stringify(params);
    const url = baseUrl + queryString;

    // Dynamically construct image URL
    // const imageUrl = `${process.env.APP_URL}/assets/appImage/mail_logo.jpg`;
    const imageUrl = `${process.env.APP_URL}/assets/appImage/mail_logo2.png`;

    // Read email template asynchronously
    const templatePath = path.join(__dirname, '..', 'templates', 'EmailVerification.html');
    const html = await fs.promises.readFile(templatePath, 'utf8');

    // Replace placeholders in template with actual values
    const htmlBody = html
      .replace(/{url}/g, url)
      .replace(/{imageUrl}/g, imageUrl)
      .replace(/{appName}/g, process.env.APP_NAME);

    const textBody = `Please verify your email by clicking the following link: ${url}`;

    // Configure email content
    const mailOptions = {
      from: process.env.MAIL_SENDER_DEFAULT, // Sender address
      to: user.email,
      subject: 'E-mail Verification Notification',
      text: textBody, // Plain text body
      html: htmlBody, // HTML body
    };

    // Send the email
    const info = await mailTransport.sendMail(mailOptions);

    // Send success response
    res.status(200).json({
      success: 1,
      message: 'Your registration is completed. Please verify your email.',
      user: new UserResource(user).toJSON(),
    });
  } catch (error) {
    console.error('Error sending email verification:', error);

    res.status(500).json({
      success: 0,
      message: 'Error sending email',
      error: error.message, // Provide more context with the error message
    });
  }
};

module.exports = { sendEmailVerificationNotification };
