import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Helper function to check if buffer contains valid image data
const isImageBuffer = (buffer: Buffer): boolean => {
  if (buffer.length < 4) return false
  
  // Check for common image file signatures
  const signature = buffer.toString('hex', 0, 4).toUpperCase()
  
  // JPEG: FF D8 FF
  if (signature.startsWith('FFD8FF')) return true
  
  // PNG: 89 50 4E 47
  if (signature === '89504E47') return true
  
  // GIF: 47 49 46 38
  if (signature.startsWith('47494638')) return true
  
  // BMP: 42 4D
  if (signature.startsWith('424D')) return true
  
  // WebP: starts with 'RIFF' and contains 'WEBP'
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return true
  
  // SVG: starts with '<svg' or '<?xml'
  const textStart = buffer.toString('utf8', 0, Math.min(100, buffer.length)).toLowerCase()
  if (textStart.includes('<svg') || (textStart.includes('<?xml') && textStart.includes('svg'))) return true
  
  return false
}

// Helper function to process and save images (both URLs and Base64)
export const processImage = async (imageData: string): Promise<string | null> => {
  if (!imageData || !imageData.trim()) {
    console.log('⚠️ لا توجد بيانات صورة للمعالجة')
    return null
  }

  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
      console.log('📁 تم إنشاء مجلد الصور:', uploadsDir)
    }

    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    
    console.log('🔍 نوع بيانات الصورة:', imageData.substring(0, 50) + '...')

    // Check if it's a Base64 image
    if (imageData.startsWith('data:image/')) {
      console.log('🖼️ معالجة صورة Base64...')
      
      try {
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
        
        // Check if buffer is valid (not empty)
        if (buffer.length === 0) {
          console.error('بيانات Base64 فارغة')
          return null
        }
        
        await writeFile(filepath, buffer)

        console.log(`✅ تم حفظ صورة Base64: ${filename} (${buffer.length} bytes)`)
        return `/uploads/images/${filename}`
      } catch (base64Error) {
        console.error('خطأ في معالجة صورة Base64:', base64Error)
        return null
      }
    }
    
    // Check if it's an HTTP URL
    else if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      console.log(`🖼️ تحميل صورة من URL: ${imageData}`)
      
      // Handle special URL types
      let processedUrl = imageData
      
      // Google Drive direct download links
      if (imageData.includes('drive.google.com')) {
        console.log('🔗 معالجة رابط Google Drive...')
        const fileIdMatch = imageData.match(/\/d\/([a-zA-Z0-9-_]+)/)
        if (fileIdMatch) {
          processedUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`
          console.log(`✅ تم تحويل رابط Google Drive: ${processedUrl}`)
        }
      }
      
      // Dropbox direct download links
      else if (imageData.includes('dropbox.com') && !imageData.includes('dl=1')) {
        console.log('🔗 معالجة رابط Dropbox...')
        processedUrl = imageData.replace('dl=0', 'dl=1').replace('?dl=0', '?dl=1')
        if (!processedUrl.includes('dl=1')) {
          processedUrl += (processedUrl.includes('?') ? '&' : '?') + 'dl=1'
        }
        console.log(`✅ تم تحويل رابط Dropbox: ${processedUrl}`)
      }
      
      try {
        // Add timeout using AbortController
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 seconds timeout
        
        const response = await fetch(processedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          console.error(`فشل في تحميل الصورة: ${response.status} ${response.statusText}`)
          
          // Try alternative approach for some URLs
          if (response.status === 403 || response.status === 429) {
            console.log('🔄 محاولة إعادة التحميل بدون headers...')
            const simpleResponse = await fetch(processedUrl)
            if (simpleResponse.ok) {
              const contentType = simpleResponse.headers.get('content-type')
              if (contentType && contentType.startsWith('image/')) {
                const extension = contentType.split('/')[1]?.split(';')[0] || 'jpg'
                const filename = `${timestamp}_${randomId}_url.${extension}`
                const filepath = join(uploadsDir, filename)
                
                const arrayBuffer = await simpleResponse.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)
                
                if (buffer.length > 0) {
                  await writeFile(filepath, buffer)
                  console.log(`✅ تم تحميل الصورة (محاولة ثانية): ${filename} (${buffer.length} bytes)`)
                  return `/uploads/images/${filename}`
                }
              }
            }
          }
          return null
        }

        const contentType = response.headers.get('content-type')
        console.log('🔍 نوع المحتوى:', contentType)
        
        // Be more flexible with content types
        if (!contentType) {
          console.log('⚠️ لا يوجد نوع محتوى، سيتم المحاولة كصورة...')
        } else if (!contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
          console.error('الرابط لا يشير إلى صورة صحيحة، نوع المحتوى:', contentType)
          return null
        }

        // Determine extension from content type or URL
        let extension = 'jpg' // default
        if (contentType && contentType.startsWith('image/')) {
          extension = contentType.split('/')[1]?.split(';')[0] || 'jpg'
        } else {
          // Try to get extension from URL
          const urlExtension = imageData.split('.').pop()?.toLowerCase()
          if (urlExtension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(urlExtension)) {
            extension = urlExtension === 'jpeg' ? 'jpg' : urlExtension
          }
        }
        
        const filename = `${timestamp}_${randomId}_url.${extension}`
        const filepath = join(uploadsDir, filename)

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Check if buffer is valid (not empty)
        if (buffer.length === 0) {
          console.error('الصورة المحملة فارغة')
          return null
        }
        
        // Additional validation: check if it's actually an image by looking at file signature
        const isValidImage = isImageBuffer(buffer)
        if (!isValidImage) {
          console.error('الملف المحمل ليس صورة صحيحة')
          return null
        }
        
        await writeFile(filepath, buffer)

        console.log(`✅ تم تحميل الصورة من URL: ${filename} (${buffer.length} bytes)`)
        return `/uploads/images/${filename}`
      } catch (fetchError) {
        console.error('خطأ في تحميل الصورة من URL:', fetchError)
        
        // If it's an AbortError, it means timeout
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('انتهت مهلة تحميل الصورة (30 ثانية)')
        }
        
        return null
      }
    }
    
    // If it's neither Base64 nor URL, treat it as a local path
    else {
      console.log(`🖼️ مسار صورة محلي: ${imageData}`)
      
      // Clean the path
      const cleanPath = imageData.trim()
      
      // Return as is if it's already a valid local path
      if (cleanPath.startsWith('/uploads/') || cleanPath.startsWith('./uploads/')) {
        console.log('✅ مسار محلي صحيح')
        return cleanPath
      }
      
      // If it's just a filename, assume it's in uploads/images
      if (!cleanPath.includes('/') && cleanPath.length > 0) {
        const localPath = `/uploads/images/${cleanPath}`
        console.log(`✅ تم تحويل اسم الملف إلى مسار: ${localPath}`)
        return localPath
      }
      
      // If it looks like a relative path, try to make it absolute
      if (cleanPath.startsWith('./') || cleanPath.startsWith('../')) {
        console.log('⚠️ مسار نسبي، سيتم إرجاعه كما هو')
        return cleanPath
      }
      
      // Last resort: return as is
      console.log('⚠️ نوع مسار غير معروف، سيتم إرجاعه كما هو')
      return cleanPath
    }
  } catch (error) {
    console.error(`خطأ في معالجة الصورة:`, error)
    return null
  }
}

// Helper function to validate image URL format
export const isValidImageUrl = (url: string): boolean => {
  if (!url || !url.trim()) return false
  
  const cleanUrl = url.trim()
  
  // Check for Base64 images
  if (cleanUrl.startsWith('data:image/')) return true
  
  // Check for HTTP/HTTPS URLs
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return true
  
  // Check for local paths
  if (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('./uploads/')) return true
  
  // Check for filenames with image extensions
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
  const extension = cleanUrl.split('.').pop()?.toLowerCase()
  if (extension && imageExtensions.includes(extension)) return true
  
  return false
}

// Function to clean and prepare image URL
export const prepareImageUrl = (url: string): string | null => {
  if (!url || !url.trim()) return null
  
  let cleanUrl = url.trim()
  
  // Remove any surrounding quotes
  cleanUrl = cleanUrl.replace(/^["']|["']$/g, '')
  
  // Handle Google Drive sharing URLs
  if (cleanUrl.includes('drive.google.com/file/d/')) {
    const fileIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (fileIdMatch) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`
    }
  }
  
  // Handle Dropbox sharing URLs
  if (cleanUrl.includes('dropbox.com') && !cleanUrl.includes('dl=1')) {
    cleanUrl = cleanUrl.replace('dl=0', 'dl=1')
    if (!cleanUrl.includes('dl=1')) {
      cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'dl=1'
    }
  }
  
  return cleanUrl
}

// Legacy function for backward compatibility
export const downloadImage = processImage
