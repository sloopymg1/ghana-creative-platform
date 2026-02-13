import { verifyEmailSchema } from '~/utils/validators'
import { sendWelcomeEmail } from '../../utils/email'
import { prisma } from '../../plugins/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = verifyEmailSchema.parse(body)

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: validatedData.token },
      include: { user: true },
    })

    if (!verificationToken) {
      throw createError({
        statusCode: 400,
        message: 'Invalid or expired verification token',
      })
    }

    // Check if token is expired
    if (new Date() > verificationToken.expiresAt) {
      throw createError({
        statusCode: 400,
        message: 'Verification token has expired. Please request a new one.',
      })
    }

    // Check if token is already used
    if (verificationToken.usedAt) {
      throw createError({
        statusCode: 400,
        message: 'This verification token has already been used',
      })
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: new Date(),
        status: 'ACTIVE',
      },
    })

    // Mark token as used
    await prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    })

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.firstName)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_UPDATED',
        resource: 'User',
        resourceId: user.id,
        details: { action: 'email_verified' },
        ipAddress: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent'),
      },
    })

    // Auto-login user
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        userType: user.userType,
        status: user.status,
        emailVerified: user.emailVerified,
        permissions: [],
      },
      loggedInAt: new Date().toISOString(),
    })

    return {
      success: true,
      message: 'Email verified successfully! Welcome to Ghana Creative Arts Board.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Validation failed',
        data: error.errors,
      })
    }

    if (error.statusCode) {
      throw error
    }

    console.error('Email verification error:', error)
    throw createError({
      statusCode: 500,
      message: 'An error occurred during email verification',
    })
  }
})
