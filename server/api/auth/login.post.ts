import { loginSchema } from '~/utils/validators'
import { verifyPassword } from '../../utils/crypto'
import { prisma } from '../../plugins/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        artistProfile: true,
        stakeholderProfile: true,
        governmentProfile: true,
      },
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      })
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)

    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      })
    }

    // Check user status
    if (user.status === 'BANNED') {
      throw createError({
        statusCode: 403,
        message: 'Your account has been banned. Please contact support.',
      })
    }

    if (user.status === 'SUSPENDED') {
      throw createError({
        statusCode: 403,
        message: 'Your account has been suspended. Please contact support.',
      })
    }

    // Extract permissions
    const permissions = user.roles.flatMap(userRole =>
      userRole.role.permissions.map(rp => rp.permission.name)
    )

    // Update last login info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: getRequestIP(event),
        loginCount: { increment: 1 },
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'User',
        resourceId: user.id,
        ipAddress: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent'),
      },
    })

    // Create session using nuxt-auth-utils
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
        permissions,
      },
      loggedInAt: new Date().toISOString(),
    })

    // Determine redirect based on user type
    let redirectUrl = '/dashboard'
    if (permissions.some(p => p.startsWith('users.') || p.startsWith('roles.'))) {
      redirectUrl = '/admin'
    }

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          userType: user.userType,
          status: user.status,
          emailVerified: user.emailVerified,
          permissions,
        },
        redirectUrl,
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
    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      message: 'An error occurred during login',
    })
  }
})
