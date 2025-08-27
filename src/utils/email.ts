import nodemailer from 'nodemailer'

interface EmailData {
	name: string
	email: string
	message: string
}

export async function sendContactEmail(data: EmailData): Promise<boolean> {
	try {
		// Create SMTP transporter using AWS SES SMTP
		const transporter = nodemailer.createTransporter({
			host: import.meta.env.AWS_SES_SMTP_HOST,
			port: parseInt(import.meta.env.AWS_SES_SMTP_PORT || '587'),
			secure: false, // true for 465, false for other ports
			auth: {
				user: import.meta.env.AWS_SES_SMTP_USERNAME,
				pass: import.meta.env.AWS_SES_SMTP_PASSWORD
			}
		})

		// HTML email content
		const htmlContent = `
			<h2>New Contact Form Submission</h2>
			<div style="font-family: Arial, sans-serif; max-width: 600px;">
				<p><strong>Name:</strong> ${data.name}</p>
				<p><strong>Email:</strong> ${data.email}</p>
				<p><strong>Message:</strong></p>
				<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
					${data.message.replace(/\n/g, '<br>')}
				</div>
				<hr style="margin: 20px 0;">
				<p style="color: #666; font-size: 12px;">
					This message was sent from your website contact form.
				</p>
			</div>
		`

		// Plain text content
		const textContent = `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}

Message:
${data.message}

---
This message was sent from your website contact form.
		`

		// Email options
		const mailOptions = {
			from: import.meta.env.AWS_SES_FROM_EMAIL,
			to: import.meta.env.AWS_SES_FROM_EMAIL, // Send to yourself
			replyTo: data.email, // Allow replying to the sender
			subject: `New Contact Form Message from ${data.name}`,
			text: textContent,
			html: htmlContent
		}

		// Send email
		const info = await transporter.sendMail(mailOptions)
		console.log('Email sent successfully:', info.messageId)
		return true
	} catch (error) {
		console.error('Error sending email:', error)
		return false
	}
}
