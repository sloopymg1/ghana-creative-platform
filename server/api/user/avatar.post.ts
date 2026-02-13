import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { prisma } from '../../plugins/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  try {
    const form = await readFormData(event)
    const file = form.get('avatar') as File

    if (!file) {
      throw createError({
        statusCode: 400,
        message: 'No file provided',
      })
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP)',
      })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw createError({
        statusCode: 400,
        message: 'File too large. Maximum size is 5MB',
      })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `avatar-${session.user.id}-${randomUUID()}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')

    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = join(uploadDir, filename)

    // Save file
    const buffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(buffer))

    // Get old avatar to delete it later
    const oldUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    })

    // Update user avatar in database
    const publicUrl = `/uploads/avatars/${filename}`
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: publicUrl },
      select: {
        id: true,
        avatar: true,
        firstName: true,
        lastName: true,
      },
    })

    // Delete old avatar file if it exists
    if (oldUser?.avatar && oldUser.avatar.startsWith('/uploads/avatars/')) {
      try {
        const oldFilePath = join(process.cwd(), 'public', oldUser.avatar)
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath)
        }
      } catch (error) {
        // Ignore errors when deleting old avatar
        console.warn('Failed to delete old avatar:', error)
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'AVATAR_UPDATED',
        resource: 'User',
        resourceId: session.user.id,
        details: { oldAvatar: oldUser?.avatar, newAvatar: publicUrl },
        ipAddress: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent'),
      },
    })

    return {
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: publicUrl,
        user: updatedUser,
      },
    }
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to upload avatar',
    })
  }
})
