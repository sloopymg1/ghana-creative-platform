import { prisma } from '../../plugins/prisma'
import { createContentSchema } from '~/utils/validators'
import slugify from 'slugify'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  const body = await readBody(event)

  try {
    const validatedData = createContentSchema.parse(body)

    // Validate VIDEO type requires externalUrl
    if (validatedData.type === 'VIDEO') {
      if (!validatedData.externalUrl) {
        throw createError({
          statusCode: 400,
          message: 'VIDEO content requires an externalUrl (YouTube, Facebook, or Vimeo link)',
        })
      }

      const isValid = validateVideoUrl(validatedData.externalUrl, validatedData.type)
      if (!isValid) {
        throw createError({
          statusCode: 400,
          message: 'Invalid video URL. Please provide a valid YouTube, Facebook, or Vimeo URL',
        })
      }
    }

    // Generate unique slug
    let slug = slugify(validatedData.title, { lower: true, strict: true })
    const existingSlug = await prisma.content.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    // Create content
    const content = await prisma.content.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        slug,
        type: validatedData.type,
        status: 'DRAFT',
        categories: validatedData.categories,
        tags: validatedData.tags,
        licenseType: validatedData.licenseType,
        externalUrl: validatedData.externalUrl || null,
        duration: validatedData.duration || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CONTENT_CREATED',
        resource: 'Content',
        resourceId: content.id,
        details: { title: content.title, type: content.type },
        ipAddress: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent'),
      },
    })

    return {
      success: true,
      message: 'Content created successfully',
      data: content,
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Validation failed',
        data: error.errors,
      })
    }
    throw error
  }
})
