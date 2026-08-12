import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInviteEmail(to: string, inviteLink: string, teamName: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `You're invited to join ${teamName} on SyntraFlow`,
    html: `<p>You've been invited to join <b>${teamName}</b>. 
           <a href="${inviteLink}">Click here to accept</a></p>`,
  });
}