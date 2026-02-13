import { forgotPasswordSchema } from '~/utils/validators'
import { generateToken } from '../../utils/crypto'
import { sendPasswordResetEmail } from '../../utils/email'
import { prisma } from '../../plugins/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = forgotPasswordSchema.parse(body)

    // Find user (fail silently for security)
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    // Always return success to prevent email enumeration
    const successResponse = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    }

    if (!user) {
      return successResponse
    }

    // Generate reset token (expires in 1 hour)
    const token = generateToken(32)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.firstName, token)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
    }

    return successResponse
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Validation failed',
        data: error.errors,
      })
    }

    console.error('Forgot password error:', error)
    throw createError({
      statusCode: 500,
      message: 'An error occurred processing your request',
    })
  }
})
