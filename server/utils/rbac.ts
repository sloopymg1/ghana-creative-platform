import { prisma } from '../plugins/prisma'

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const userWithRoles = await prisma.user.findUnique({
    where: { id: userId },
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
    },
  })

  if (!userWithRoles) {
    return []
  }

  // Extract all permissions from all roles
  const permissions = userWithRoles.roles.flatMap(userRole =>
    userRole.role.permissions.map(rp => rp.permission.name)
  )

  // Remove duplicates
  return [...new Set(permissions)]
}

/**
 * Check if user has a specific permission
 */
export async function checkUserPermission(
  userId: string,
  permission: string | string[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)

  // Check for wildcard (super admin)
  if (userPermissions.includes('*')) {
    return true
  }

  const requiredPermissions = Array.isArray(permission) ? permission : [permission]

  // Check if user has all required permissions
  return requiredPermissions.every(p => userPermissions.includes(p))
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(
  userId: string,
  roleId: string,
  assignedBy?: string
): Promise<void> {
  await prisma.userRole.create({
    data: {
      userId,
      roleId,
      assignedBy,
    },
  })
}

/**
 * Remove a role from a user
 */
export async function removeRoleFromUser(
  userId: string,
  roleId: string
): Promise<void> {
  await prisma.userRole.deleteMany({
    where: {
      userId,
      roleId,
    },
  })
}

/**
 * Require permission middleware helper
 */
export async function requirePermission(
  event: any,
  permission: string | string[]
): Promise<void> {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  const hasPermission = await checkUserPermission(session.user.id, permission)

  if (!hasPermission) {
    throw createError({
      statusCode: 403,
      message: 'Insufficient permissions',
    })
  }
}

/**
 * Get all available permissions
 */
export async function getAllPermissions() {
  return await prisma.permission.findMany({
    orderBy: [
      { resource: 'asc' },
      { action: 'asc' },
    ],
  })
}

/**
 * Get all roles with their permissions
 */
export async function getAllRoles() {
  return await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
    orderBy: {
      displayName: 'asc',
    },
  })
}
