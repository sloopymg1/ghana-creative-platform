import { prisma } from '../../plugins/prisma'
import { z } from 'zod'

// Base user schema
const baseUserSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().max(500).optional(),
})

// Artist profile schema
const artistProfileSchema = z.object({
  stageName: z.string().min(2).max(100).optional(),
  categories: z.array(z.enum([
    'MUSIC', 'VISUAL_ARTS', 'DANCE', 'THEATER', 'FILM',
    'LITERATURE', 'CRAFTS', 'DIGITAL_ARTS', 'FASHION',
    'CULINARY_ARTS', 'OTHER'
  ])).optional(),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
})

// Stakeholder profile schema
const stakeholderProfileSchema = z.object({
  organizationName: z.string().min(2).max(200).optional(),
  position: z.string().min(2).max(100).optional(),
  industry: z.string().max(100).optional(),
  companyWebsite: z.string().url().optional().or(z.literal('')),
})

// Government profile schema
const governmentProfileSchema = z.object({
  department: z.string().min(2).max(200).optional(),
  position: z.string().min(2).max(100).optional(),
  officeLocation: z.string().max(200).optional(),
})

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
    // Validate base user fields
    const userData = baseUserSchema.parse(body)

    // Get current user to check userType
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    })

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    // Update user base fields
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: userData,
    })

    // Handle profile updates based on userType
    let profileData: any = null

    if (currentUser.userType === 'ARTIST' && body.artistProfile) {
      const artistData = artistProfileSchema.parse(body.artistProfile)

      // Check if profile exists
      const existingProfile = await prisma.artistProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (existingProfile) {
        profileData = await prisma.artistProfile.update({
          where: { userId: session.user.id },
          data: artistData,
        })
      } else {
        profileData = await prisma.artistProfile.create({
          data: {
            userId: session.user.id,
            ...artistData,
          },
        })
      }
    } else if (currentUser.userType === 'STAKEHOLDER' && body.stakeholderProfile) {
      const stakeholderData = stakeholderProfileSchema.parse(body.stakeholderProfile)

      const existingProfile = await prisma.stakeholderProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (existingProfile) {
        profileData = await prisma.stakeholderProfile.update({
          where: { userId: session.user.id },
          data: stakeholderData,
        })
      } else {
        profileData = await prisma.stakeholderProfile.create({
          data: {
            userId: session.user.id,
            ...stakeholderData,
          },
        })
      }
    } else if (currentUser.userType === 'GOVERNMENT' && body.governmentProfile) {
      const governmentData = governmentProfileSchema.parse(body.governmentProfile)

      const existingProfile = await prisma.governmentProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (existingProfile) {
        profileData = await prisma.governmentProfile.update({
          where: { userId: session.user.id },
          data: governmentData,
        })
      } else {
        profileData = await prisma.governmentProfile.create({
          data: {
            userId: session.user.id,
            ...governmentData,
          },
        })
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PROFILE_UPDATED',
        resource: 'User',
        resourceId: session.user.id,
        details: { userData, profileData },
        ipAddress: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent'),
      },
    })

    // Fetch updated user with profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        artistProfile: true,
        stakeholderProfile: true,
        governmentProfile: true,
      },
    })

    return {
      success: true,
      message: 'Profile updated successfully',
      data: user,
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Validation failed',
        data: error.errors,
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to update profile',
    })
  }
})
