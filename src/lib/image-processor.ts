import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Helper function to process and save images (both URLs and Base64)
export const processImage = async (imageData: string): Promise<string | null> => {
  if (!imageData || !imageData.trim()) {
    return null
  }

  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)

    // Check if it's a Base64 image
    if (imageData.startsWith('data:image/')) {
      console.log('🖼️ معالجة صورة Base64...')
      
      // Extract the base64 data and mime type
      const matches = imageData.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
      if (!matches) {
        console.error('تنسيق Base64 غير صحيح')
        return null
      }

      const [, extension, base64Data] = matches
      const filename = `${timestamp}_${randomId}_base64.${extension}`
      const filepath = join(uploadsDir, filename)

      // Convert base64 to buffer and save
      const buffer = Buffer.from(base64Data, 'base64')
      await writeFile(filepath, buffer)

      console.log(`✅ تم حفظ صورة Base64: ${filename}`)
      return `/uploads/images/${filename}`
    }
    
    // Check if it's an HTTP URL
    else if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      console.log(`🖼️ تحميل صورة من URL: ${imageData}`)
      
      const response = await fetch(imageData)
      if (!response.ok) {
        console.error(`فشل في تحميل الصورة: ${response.statusText}`)
        return null
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.startsWith('image/')) {
        console.error('الرابط لا يشير إلى صورة صحيحة')
        return null
      }

      const extension = contentType.split('/')[1] || 'jpg'
      const filename = `${timestamp}_${randomId}_url.${extension}`
      const filepath = join(uploadsDir, filename)

      const buffer = Buffer.from(await response.arrayBuffer())
      await writeFile(filepath, buffer)

      console.log(`✅ تم تحميل الصورة من URL: ${filename}`)
      return `/uploads/images/${filename}`
    }
    
    // If it's neither Base64 nor URL, treat it as a local path
    else {
      console.log(`🖼️ مسار صورة محلي: ${imageData}`)
      // Return as is if it's already a valid local path
      if (imageData.startsWith('/uploads/') || imageData.startsWith('./uploads/')) {
        return imageData
      }
      
      // If it's just a filename, assume it's in uploads/images
      if (!imageData.includes('/')) {
        return `/uploads/images/${imageData}`
      }
      
      return imageData
    }
  } catch (error) {
    console.error(`خطأ في معالجة الصورة:`, error)
    return null
  }
}

// Legacy function for backward compatibility
export const downloadImage = processImage
