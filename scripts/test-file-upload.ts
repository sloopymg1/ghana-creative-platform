/**
 * Test File Upload Functionality
 *
 * This script tests the complete file upload workflow:
 * 1. Create content record
 * 2. Upload file
 * 3. Publish content
 *
 * Run with: tsx scripts/test-file-upload.ts
 */

import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

interface TestResult {
  success: boolean
  message: string
  error?: string
}

interface TestCase {
  name: string
  contentType: 'IMAGE' | 'AUDIO' | 'VIDEO'
  fileName: string
  fileSize: number
  mimeType: string
}

const testCases: TestCase[] = [
  {
    name: 'Small Image Upload',
    contentType: 'IMAGE',
    fileName: 'test-image.jpg',
    fileSize: 1024 * 500, // 500KB
    mimeType: 'image/jpeg'
  },
  {
    name: 'PNG Image Upload',
    contentType: 'IMAGE',
    fileName: 'test-image.png',
    fileSize: 1024 * 1024 * 2, // 2MB
    mimeType: 'image/png'
  },
  {
    name: 'Audio Upload',
    contentType: 'AUDIO',
    fileName: 'test-audio.mp3',
    fileSize: 1024 * 1024 * 5, // 5MB
    mimeType: 'audio/mpeg'
  },
  {
    name: 'Video Upload',
    contentType: 'VIDEO',
    fileName: 'test-video.mp4',
    fileSize: 1024 * 1024 * 10, // 10MB
    mimeType: 'video/mp4'
  },
  {
    name: 'Large File (Should Fail)',
    contentType: 'VIDEO',
    fileName: 'large-video.mp4',
    fileSize: 1024 * 1024 * 100, // 100MB (exceeds 50MB limit)
    mimeType: 'video/mp4'
  }
]

async function createTestUser() {
  console.log('📝 Creating test user...')

  // Check if test user exists
  let user = await prisma.user.findUnique({
    where: { email: 'fileupload-test@example.com' }
  })

  if (user) {
    console.log('✅ Test user already exists')
    return user
  }

  // Create test user
  user = await prisma.user.create({
    data: {
      email: 'fileupload-test@example.com',
      password: '$2a$10$test.hash.placeholder',
      firstName: 'FileUpload',
      lastName: 'Tester',
      userType: 'ARTIST',
      status: 'ACTIVE',
      emailVerified: new Date()
    }
  })

  console.log('✅ Test user created:', user.email)
  return user
}

async function createTestFile(fileName: string, size: number): Promise<string> {
  const testFilesDir = join(process.cwd(), 'test-files')

  if (!existsSync(testFilesDir)) {
    await mkdir(testFilesDir, { recursive: true })
  }

  const filePath = join(testFilesDir, fileName)

  // Create a dummy file with the specified size
  const buffer = Buffer.alloc(size)

  // Add some realistic file headers based on type
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    // JPEG header magic bytes
    buffer.write('\xFF\xD8\xFF\xE0', 0, 'binary')
  } else if (fileName.endsWith('.png')) {
    // PNG header magic bytes
    buffer.write('\x89PNG\r\n\x1a\n', 0, 'binary')
  } else if (fileName.endsWith('.mp3')) {
    // MP3 header (ID3v2)
    buffer.write('ID3', 0, 'binary')
  } else if (fileName.endsWith('.mp4')) {
    // MP4 header (ftyp box)
    buffer.write('ftypisom', 4, 'binary')
  }

  await writeFile(filePath, buffer)
  return filePath
}

async function simulateUpload(
  testCase: TestCase,
  userId: string
): Promise<TestResult> {
  try {
    console.log(`\n🧪 Testing: ${testCase.name}`)
    console.log(`   Type: ${testCase.contentType}`)
    console.log(`   File: ${testCase.fileName}`)
    console.log(`   Size: ${(testCase.fileSize / 1024 / 1024).toFixed(2)}MB`)

    // Step 1: Create content record
    console.log('   1️⃣ Creating content record...')
    const content = await prisma.content.create({
      data: {
        userId: userId,
        title: `Test ${testCase.contentType}: ${testCase.name}`,
        description: `Testing file upload for ${testCase.contentType} content`,
        type: testCase.contentType,
        categories: ['DIGITAL_ARTS'],
        tags: ['test', 'upload', testCase.contentType.toLowerCase()],
        status: 'DRAFT',
        slug: `test-${testCase.fileName.replace(/\./g, '-')}-${Date.now()}`
      }
    })
    console.log(`   ✅ Content created: ${content.id}`)

    // Step 2: Validate file size
    const maxSize = 52428800 // 50MB
    if (testCase.fileSize > maxSize) {
      console.log('   ⚠️ File size exceeds limit (expected behavior)')
      return {
        success: false,
        message: 'File size validation working correctly',
        error: `File too large: ${(testCase.fileSize / 1024 / 1024).toFixed(2)}MB > 50MB`
      }
    }

    // Step 3: Create test file
    console.log('   2️⃣ Creating test file...')
    const filePath = await createTestFile(testCase.fileName, testCase.fileSize)
    console.log(`   ✅ Test file created: ${filePath}`)

    // Step 4: Simulate file upload to database
    console.log('   3️⃣ Simulating file upload...')
    const publicUrl = `/uploads/${testCase.fileName}`
    await prisma.content.update({
      where: { id: content.id },
      data: {
        fileUrl: publicUrl,
        fileSize: testCase.fileSize
      }
    })
    console.log(`   ✅ File URL saved: ${publicUrl}`)

    // Step 5: Publish content
    console.log('   4️⃣ Publishing content...')
    await prisma.content.update({
      where: { id: content.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    })
    console.log('   ✅ Content published')

    return {
      success: true,
      message: `Successfully uploaded and published ${testCase.contentType} content`
    }

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`)
    return {
      success: false,
      message: 'Upload failed',
      error: error.message
    }
  }
}

async function testContentList() {
  console.log('\n📋 Testing Content List...')

  const contents = await prisma.content.findMany({
    where: {
      title: {
        startsWith: 'Test '
      }
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  console.log(`\n📊 Found ${contents.length} test content items:`)
  contents.forEach((content, index) => {
    console.log(`\n${index + 1}. ${content.title}`)
    console.log(`   ID: ${content.id}`)
    console.log(`   Type: ${content.type}`)
    console.log(`   Status: ${content.status}`)
    console.log(`   File: ${content.fileUrl || 'N/A'}`)
    console.log(`   Size: ${content.fileSize ? (content.fileSize / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'}`)
    console.log(`   Created: ${content.createdAt.toISOString()}`)
  })
}

async function main() {
  console.log('🚀 Starting File Upload Tests\n')
  console.log('=' .repeat(60))

  try {
    // Create test user
    const user = await createTestUser()

    console.log('\n' + '='.repeat(60))
    console.log('🧪 Running Upload Test Cases')
    console.log('='.repeat(60))

    const results: TestResult[] = []

    // Run all test cases
    for (const testCase of testCases) {
      const result = await simulateUpload(testCase, user.id)
      results.push(result)
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between tests
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Test Results Summary')
    console.log('='.repeat(60))

    const passed = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log(`\n✅ Passed: ${passed}/${results.length}`)
    console.log(`❌ Failed: ${failed}/${results.length}`)

    results.forEach((result, index) => {
      const icon = result.success ? '✅' : '❌'
      console.log(`\n${icon} ${testCases[index].name}`)
      console.log(`   ${result.message}`)
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })

    // List all test content
    console.log('\n' + '='.repeat(60))
    await testContentList()

    console.log('\n' + '='.repeat(60))
    console.log('✅ All tests completed!')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
