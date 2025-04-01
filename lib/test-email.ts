import nodemailer from "nodemailer";

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER, // email user
        pass: process.env.EMAIL_SERVER_PASSWORD, // email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM, // sender address
      to: "test-recipient@example.com", // replace with a test recipient email
      subject: "Test Email from Azushop Admin", // Subject line
      text: "This is a test email to verify the email configuration.", // plain text body
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Test email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending test email:", error);
  }
}

// Run the test
testEmail();