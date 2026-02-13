import { autoModerateContent } from '../../utils/ai/moderation'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  const body = await readBody(event)

  if (!body.title) {
    throw createError({
      statusCode: 400,
      message: 'Title is required for moderation',
    })
  }

  try {
    const result = await autoModerateContent({
      title: body.title,
      description: body.description,
    })

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Moderation error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to moderate content',
    })
  }
})
