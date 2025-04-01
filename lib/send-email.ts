import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email provider
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your app password (not your normal password)
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
  });
}
