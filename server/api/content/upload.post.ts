import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'

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
    const file = form.get('file') as File
    const contentId = form.get('contentId') as string

    if (!file) {
      throw createError({
        statusCode: 400,
        message: 'No file provided',
      })
    }

    if (!contentId) {
      throw createError({
        statusCode: 400,
        message: 'Content ID is required',
      })
    }

    // Validate file type and size
    const config = useRuntimeConfig()
    const allowedTypes = config.uploadAllowedTypes
    const maxSize = config.uploadMaxSize

    if (!allowedTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      })
    }

    if (file.size > maxSize) {
      throw createError({
        statusCode: 400,
        message: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`,
      })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${randomUUID()}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')

    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = join(uploadDir, filename)

    // Save file
    const buffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(buffer))

    // Update content with file URL
    const publicUrl = `/uploads/${filename}`

    await prisma.content.update({
      where: { id: contentId },
      data: {
        fileUrl: publicUrl,
        fileSize: file.size,
      },
    })

    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename,
        url: publicUrl,
        size: file.size,
        type: file.type,
      },
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to upload file',
    })
  }
})
