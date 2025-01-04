require('dotenv').config();

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const UserResource = require('../resources/UserResource');

//1. create an email transporter.
 //SMTP (Simple Mail Transfer Protocol)
 const mailTransport = nodemailer.createTransport({
  // service: 'gmail',
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false, // Add this option if you're connecting to a server with a self-signed certificate
  }
});

// 2. Create a function to send an email verification notification
const sendEmailVerificationNotification = async (user, res)=> {

  try{
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const params = {
      userId: user.id,
      token: token
    };
    const baseUrl = process.env.FRONT_APP + '/home/verify-email?';
    const queryString = querystring.stringify(params);
    const url = baseUrl + queryString;
    
    // Dynamically construct the image URL
    const imageUrl = `http://localhost:${process.env.PORT || 8000}/assets/appImage/mail_logo.png`;

    // Read the email template
    const templatePath = path.join(__dirname, '..', 'templates', 'EmailVerification.html');

    const html = await fs.promises.readFile(templatePath, 'utf8');

  // Check if the file exists before attempting to read it
  if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`);
    }
  
    // Replace placeholders with actual values
    const htmlBody = html.replace(/{url}/g, url)
                          .replace(/{imageUrl}/g, imageUrl)
                          .replace(/{appName}/g, process.env.APP_NAME);

    const textBody = `Please verify your email by clicking the following link: ${url}`;

    // 3. configure email content.
    const mailOptions = {
      from: process.env.MAIL_SENDER_DEFAULT, // sender address
      to: user.email,
      subject: 'E-mail Verify Notification', // plain text body
      text: textBody, // Plain text body
      html: htmlBody // HTML body
    }

    // 4. Send the email
    const info = await mailTransport.sendMail(mailOptions);
    // console.log('Message sent: %s', info.messageId);

    res.status(200).json({
      success: 1,
      message: 'Welcome, Your Registration is Completed. Please verify your E-mail before login.',
      user: new UserResource(user).toJSON()
    });
  } catch (error) {
    // console.error('Error sending email:', error);

    res.status(500).json({
      success: 0,
      message: 'Error sending email',
      error: error.message // Include the error message for more context
    });
  }
}

module.exports = { sendEmailVerificationNotification };
