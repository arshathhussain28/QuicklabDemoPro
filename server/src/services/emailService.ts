import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string, attachments: any[] = []) => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn("Email credentials missing. Skipping email.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false, // true for 465, false for other ports
        auth: { user, pass }
    });

    try {
        await transporter.sendMail({
            from: `"MedTech Automation" <${user}>`,
            to,
            subject,
            html,
            attachments
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Email Send Failed:", error);
    }
};
