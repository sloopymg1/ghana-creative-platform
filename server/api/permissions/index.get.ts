import { requirePermission, getAllPermissions } from '../../utils/rbac'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'roles.read')

  const permissions = await getAllPermissions()

  // Group by resource
  const grouped = permissions.reduce((acc: any, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = []
    }
    acc[permission.resource].push(permission)
    return acc
  }, {})

  return {
    success: true,
    data: {
      permissions,
      grouped,
    },
  }
})
