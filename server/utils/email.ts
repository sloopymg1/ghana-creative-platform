import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

let transporter: Transporter | null = null

/**
 * Get or create email transporter
 */
function getTransporter(): Transporter {
  if (transporter) {
    return transporter
  }

  const config = useRuntimeConfig()

  // If email is not configured, return a test transporter
  if (!config.emailHost || !config.emailUser) {
    console.warn('Email not configured. Emails will be logged to console.')
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    })
    return transporter
  }

  transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: Number(config.emailPort),
    secure: Number(config.emailPort) === 465,
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  })

  return transporter
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  firstName: string,
  token: string
) {
  const config = useRuntimeConfig()
  const verificationUrl = `${config.public.appUrl}/auth/verify-email?token=${token}`

  const mailOptions = {
    from: config.emailFrom,
    to: email,
    subject: 'Verify Your Email - Ghana Creative Arts Board',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #CE1126;">Welcome to Ghana Creative Arts Board!</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #CE1126; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  }

  const transporter = getTransporter()
  const info = await transporter.sendMail(mailOptions)

  // Log email if in development mode
  if (!useRuntimeConfig().emailHost) {
    console.log('📧 Verification Email:', {
      to: email,
      verificationUrl,
      messageId: info.messageId,
    })
  }

  return info
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  token: string
) {
  const config = useRuntimeConfig()
  const resetUrl = `${config.public.appUrl}/auth/reset-password?token=${token}`

  const mailOptions = {
    from: config.emailFrom,
    to: email,
    subject: 'Reset Your Password - Ghana Creative Arts Board',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #CE1126;">Password Reset Request</h2>
        <p>Hello ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #CE1126; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `,
  }

  const transporter = getTransporter()
  const info = await transporter.sendMail(mailOptions)

  if (!useRuntimeConfig().emailHost) {
    console.log('📧 Password Reset Email:', {
      to: email,
      resetUrl,
      messageId: info.messageId,
    })
  }

  return info
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email: string, firstName: string) {
  const config = useRuntimeConfig()

  const mailOptions = {
    from: config.emailFrom,
    to: email,
    subject: 'Welcome to Ghana Creative Arts Board!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #CE1126;">Welcome, ${firstName}!</h2>
        <p>Your email has been verified successfully.</p>
        <p>You can now explore the platform and connect with Ghana's creative community.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.public.appUrl}/dashboard"
             style="background-color: #006B3F; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #666; margin-top: 30px;">
          If you have any questions, please don't hesitate to contact us.
        </p>
      </div>
    `,
  }

  const transporter = getTransporter()
  const info = await transporter.sendMail(mailOptions)

  if (!useRuntimeConfig().emailHost) {
    console.log('📧 Welcome Email:', {
      to: email,
      messageId: info.messageId,
    })
  }

  return info
}
