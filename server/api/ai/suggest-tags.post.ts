import { suggestTags } from '../../utils/ai/tagging'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  const body = await readBody(event)

  if (!body.title || !body.categories || !body.type) {
    throw createError({
      statusCode: 400,
      message: 'Title, categories, and type are required',
    })
  }

  try {
    const suggestions = suggestTags({
      title: body.title,
      description: body.description,
      categories: body.categories,
      type: body.type,
    })

    return {
      success: true,
      data: suggestions,
    }
  } catch (error) {
    console.error('Tag suggestion error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate tag suggestions',
    })
  }
})
