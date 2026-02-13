import { requirePermission, getAllRoles } from '../../utils/rbac'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'roles.read')

  const roles = await getAllRoles()

  return {
    success: true,
    data: roles,
  }
})
