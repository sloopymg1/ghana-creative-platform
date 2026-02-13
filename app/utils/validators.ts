import { z } from 'zod'

// User registration schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  userType: z.enum(['ARTIST', 'STAKEHOLDER', 'GOVERNMENT', 'PUBLIC']),
  phoneNumber: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// Verify email schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// Profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  phoneNumber: z.string().optional(),
  avatar: z.string().url().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// Artist profile schema
export const artistProfileSchema = z.object({
  stageName: z.string().max(100).optional(),
  categories: z.array(z.enum([
    'MUSIC', 'VISUAL_ARTS', 'DANCE', 'THEATER', 'FILM',
    'LITERATURE', 'CRAFTS', 'DIGITAL_ARTS', 'FASHION',
    'CULINARY_ARTS', 'OTHER'
  ])).optional(),
  yearsActive: z.number().min(0).max(100).optional(),
  website: z.string().url().optional(),
  portfolio: z.string().url().optional(),
  facebookUrl: z.string().url().optional(),
  instagramUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  youtubeUrl: z.string().url().optional(),
  tiktokUrl: z.string().url().optional(),
})

export type ArtistProfileInput = z.infer<typeof artistProfileSchema>

// Content creation schema
export const createContentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(['AUDIO', 'VIDEO', 'IMAGE', 'DOCUMENT', 'LIVE_STREAM']),
  categories: z.array(z.string()),
  tags: z.array(z.string()).optional().default([]),
  licenseType: z.string().optional().default('ALL_RIGHTS_RESERVED'),
  externalUrl: z.string().url().optional().or(z.literal('')),
  duration: z.number().optional(),
})

export type CreateContentInput = z.infer<typeof createContentSchema>

// Content update schema
export const updateContentSchema = createContentSchema.partial()

export type UpdateContentInput = z.infer<typeof updateContentSchema>
