import { registerSchema } from '~/utils/validators'
import { hashPassword, generateToken } from '../../utils/crypto'
import { sendVerificationEmail } from '../../utils/email'
import { prisma } from '../../plugins/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'A user with this email already exists',
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        userType: validatedData.userType,
        phoneNumber: validatedData.phoneNumber,
        status: 'PENDING_VERIFICATION',
      },
    })

    // Generate verification token (expires in 24 hours)
    const token = generateToken(32)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'EMAIL_VERIFICATION',
        expiresAt,
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.firstName, token)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail registration if email fails
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_CREATED',
        resource: 'User',
        resourceId: user.id,
        details: {
          userType: user.userType,
          email: user.email,
        },
        ipAddress: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent'),
      },
    })

    // Return success (don't auto-login)
    return {
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Validation failed',
        data: error.errors,
      })
    }

    // Re-throw HTTP errors
    if (error.statusCode) {
      throw error
    }

    // Handle unexpected errors
    console.error('Registration error:', error)
    throw createError({
      statusCode: 500,
      message: 'An error occurred during registration',
    })
  }
})
