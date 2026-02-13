import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create permissions
  console.log('Creating permissions...')
  const permissions = await Promise.all([
    // User permissions
    prisma.permission.upsert({
      where: { name: 'users.create' },
      update: {},
      create: { name: 'users.create', resource: 'users', action: 'create', description: 'Create new users' },
    }),
    prisma.permission.upsert({
      where: { name: 'users.read' },
      update: {},
      create: { name: 'users.read', resource: 'users', action: 'read', description: 'View user details' },
    }),
    prisma.permission.upsert({
      where: { name: 'users.update' },
      update: {},
      create: { name: 'users.update', resource: 'users', action: 'update', description: 'Update user information' },
    }),
    prisma.permission.upsert({
      where: { name: 'users.delete' },
      update: {},
      create: { name: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users' },
    }),
    prisma.permission.upsert({
      where: { name: 'users.suspend' },
      update: {},
      create: { name: 'users.suspend', resource: 'users', action: 'suspend', description: 'Suspend/ban users' },
    }),
    prisma.permission.upsert({
      where: { name: 'users.assign-roles' },
      update: {},
      create: { name: 'users.assign-roles', resource: 'users', action: 'assign-roles', description: 'Assign roles to users' },
    }),

    // Content permissions
    prisma.permission.upsert({
      where: { name: 'content.create' },
      update: {},
      create: { name: 'content.create', resource: 'content', action: 'create', description: 'Create content' },
    }),
    prisma.permission.upsert({
      where: { name: 'content.read' },
      update: {},
      create: { name: 'content.read', resource: 'content', action: 'read', description: 'View content' },
    }),
    prisma.permission.upsert({
      where: { name: 'content.update' },
      update: {},
      create: { name: 'content.update', resource: 'content', action: 'update', description: 'Update content' },
    }),
    prisma.permission.upsert({
      where: { name: 'content.delete' },
      update: {},
      create: { name: 'content.delete', resource: 'content', action: 'delete', description: 'Delete content' },
    }),
    prisma.permission.upsert({
      where: { name: 'content.moderate' },
      update: {},
      create: { name: 'content.moderate', resource: 'content', action: 'moderate', description: 'Moderate content' },
    }),
    prisma.permission.upsert({
      where: { name: 'content.publish' },
      update: {},
      create: { name: 'content.publish', resource: 'content', action: 'publish', description: 'Publish content' },
    }),

    // Role permissions
    prisma.permission.upsert({
      where: { name: 'roles.create' },
      update: {},
      create: { name: 'roles.create', resource: 'roles', action: 'create', description: 'Create roles' },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.read' },
      update: {},
      create: { name: 'roles.read', resource: 'roles', action: 'read', description: 'View roles' },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.update' },
      update: {},
      create: { name: 'roles.update', resource: 'roles', action: 'update', description: 'Update roles' },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.delete' },
      update: {},
      create: { name: 'roles.delete', resource: 'roles', action: 'delete', description: 'Delete roles' },
    }),

    // Analytics permissions
    prisma.permission.upsert({
      where: { name: 'analytics.view-own' },
      update: {},
      create: { name: 'analytics.view-own', resource: 'analytics', action: 'view-own', description: 'View own analytics' },
    }),
    prisma.permission.upsert({
      where: { name: 'analytics.view-all' },
      update: {},
      create: { name: 'analytics.view-all', resource: 'analytics', action: 'view-all', description: 'View all analytics' },
    }),
    prisma.permission.upsert({
      where: { name: 'analytics.view' },
      update: {},
      create: { name: 'analytics.view', resource: 'analytics', action: 'view', description: 'View analytics dashboard' },
    }),
    prisma.permission.upsert({
      where: { name: 'analytics.export' },
      update: {},
      create: { name: 'analytics.export', resource: 'analytics', action: 'export', description: 'Export analytics data' },
    }),
  ])

  console.log(`✓ Created ${permissions.length} permissions`)

  // Create roles
  console.log('Creating roles...')

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      displayName: 'Super Administrator',
      description: 'Full system access',
      isSystem: true,
    },
  })

  const userManagerRole = await prisma.role.upsert({
    where: { name: 'USER_MANAGER' },
    update: {},
    create: {
      name: 'USER_MANAGER',
      displayName: 'User Manager',
      description: 'Manage users and assign roles',
      isSystem: true,
    },
  })

  const contentModeratorRole = await prisma.role.upsert({
    where: { name: 'CONTENT_MODERATOR' },
    update: {},
    create: {
      name: 'CONTENT_MODERATOR',
      displayName: 'Content Moderator',
      description: 'Moderate and publish content',
      isSystem: true,
    },
  })

  const analyticsViewerRole = await prisma.role.upsert({
    where: { name: 'ANALYTICS_VIEWER' },
    update: {},
    create: {
      name: 'ANALYTICS_VIEWER',
      displayName: 'Analytics Viewer',
      description: 'View platform analytics',
      isSystem: true,
    },
  })

  console.log('✓ Created 4 default roles')

  // Assign permissions to roles
  console.log('Assigning permissions to roles...')

  // Super Admin gets all permissions (using wildcard)
  const wildcardPermission = await prisma.permission.upsert({
    where: { name: '*' },
    update: {},
    create: {
      name: '*',
      resource: '*',
      action: '*',
      description: 'All permissions (wildcard)',
    },
  })

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: wildcardPermission.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      permissionId: wildcardPermission.id,
    },
  })

  // User Manager permissions
  const userManagerPermissions = permissions.filter(p =>
    p.name.startsWith('users.') && !p.name.includes('delete')
  )
  for (const permission of userManagerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userManagerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userManagerRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Content Moderator permissions
  const contentModeratorPermissions = permissions.filter(p =>
    p.name.startsWith('content.')
  )
  for (const permission of contentModeratorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: contentModeratorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: contentModeratorRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Analytics Viewer permissions
  const analyticsPermissions = permissions.filter(p =>
    p.name.startsWith('analytics.')
  )
  for (const permission of analyticsPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: analyticsViewerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: analyticsViewerRole.id,
        permissionId: permission.id,
      },
    })
  }

  console.log('✓ Assigned permissions to roles')

  // Create test users
  console.log('Creating test users...')

  const hashedPassword = await bcrypt.hash('Test123!@#', 12)

  // Super Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ghanaarts.gov.gh' },
    update: {},
    create: {
      email: 'admin@ghanaarts.gov.gh',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      userType: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  })

  // Test Artist
  const artistUser = await prisma.user.upsert({
    where: { email: 'artist@test.com' },
    update: {},
    create: {
      email: 'artist@test.com',
      password: hashedPassword,
      firstName: 'Kwame',
      lastName: 'Mensah',
      userType: 'ARTIST',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  })

  await prisma.artistProfile.upsert({
    where: { userId: artistUser.id },
    update: {},
    create: {
      userId: artistUser.id,
      stageName: 'K-Mensah',
      categories: ['MUSIC', 'DIGITAL_ARTS'],
      yearsActive: 5,
    },
  })

  console.log('✓ Created test users')

  console.log('\n✅ Seeding complete!\n')
  console.log('Test Accounts:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email: admin@ghanaarts.gov.gh')
  console.log('🔑 Password: Test123!@#')
  console.log('👤 Role: Super Admin\n')
  console.log('📧 Email: artist@test.com')
  console.log('🔑 Password: Test123!@#')
  console.log('👤 Role: Artist')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
