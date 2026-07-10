'use server';

import { prisma } from '@/lib/prisma';

export async function sendMessage(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
        return { error: 'Please fill in all fields.' };
    }

    try {
        await prisma.message.create({
            data: { name, email, message }
        });

        // Try to send email via standard SMTP (Platform Agnostic)
        try {
            if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                const nodemailer = await import('nodemailer');
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT) || 587,
                    secure: Number(process.env.SMTP_PORT) === 465,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                await transporter.sendMail({
                    from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
                    to: process.env.PERSONAL_EMAIL || process.env.SMTP_USER,
                    subject: `New Message from ${name}`,
                    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                    replyTo: email,
                });
            }
        } catch (emailError) {
            console.error('Email failed to send, but message was saved to DB:', emailError);
        }

        return { success: true };
    } catch (error) {
        console.error('Error sending message:', error);
        return { error: 'Failed to send message. Please try again.' };
    }
}
