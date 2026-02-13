import { resetPasswordSchema } from '~/utils/validators'
import { hashPassword } from '../../utils/crypto'
import { prisma } from '../../plugins/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = resetPasswordSchema.parse(body)

    // Find reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token: validatedData.token },
      include: { user: true },
    })

    if (!resetToken) {
      throw createError({
        statusCode: 400,
        message: 'Invalid or expired reset token',
      })
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      throw createError({
        statusCode: 400,
        message: 'Reset token has expired. Please request a new one.',
      })
    }

    // Check if token is already used
    if (resetToken.usedAt) {
      throw createError({
        statusCode: 400,
        message: 'This reset token has already been used',
      })
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password)

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    })

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    })

    // Invalidate all existing sessions for this user
    // (This would require session management in the database,
    // or we can just let existing sessions expire naturally)

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: resetToken.userId,
        action: 'USER_UPDATED',
        resource: 'User',
        resourceId: resetToken.userId,
        details: { action: 'password_reset' },
        ipAddress: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent'),
      },
    })

    return {
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
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

    console.error('Password reset error:', error)
    throw createError({
      statusCode: 500,
      message: 'An error occurred resetting your password',
    })
  }
})
