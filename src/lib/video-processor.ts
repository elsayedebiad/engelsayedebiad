// Helper function to process and validate video URLs
export const processVideo = async (videoData: string): Promise<string | null> => {
  if (!videoData || !videoData.trim()) {
    console.log('⚠️ لا توجد بيانات فيديو للمعالجة')
    return null
  }

  try {
    const videoUrl = videoData.trim()
    console.log('🔍 معالجة رابط الفيديو:', videoUrl)

    // Check if it's a YouTube URL and convert to embed format
    if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/')) {
      console.log('🎥 معالجة رابط YouTube...')
      
      let videoId = ''
      
      // Extract video ID from different YouTube URL formats
      if (videoUrl.includes('youtube.com/watch?v=')) {
        const urlParams = new URLSearchParams(videoUrl.split('?')[1])
        videoId = urlParams.get('v') || ''
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || ''
      }
      
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`
        console.log(`✅ تم تحويل رابط YouTube إلى: ${embedUrl}`)
        return embedUrl
      } else {
        console.error('❌ فشل في استخراج معرف الفيديو من YouTube')
        return null
      }
    }
    
    // Check if it's a Vimeo URL and convert to embed format
    else if (videoUrl.includes('vimeo.com/')) {
      console.log('🎥 معالجة رابط Vimeo...')
      
      const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0]
      if (videoId && /^\d+$/.test(videoId)) {
        const embedUrl = `https://player.vimeo.com/video/${videoId}`
        console.log(`✅ تم تحويل رابط Vimeo إلى: ${embedUrl}`)
        return embedUrl
      } else {
        console.error('❌ فشل في استخراج معرف الفيديو من Vimeo')
        return null
      }
    }
    
    // Check if it's already an embed URL
    else if (videoUrl.includes('youtube.com/embed/') || videoUrl.includes('player.vimeo.com/video/')) {
      console.log('✅ الرابط جاهز للاستخدام (embed format)')
      return videoUrl
    }
    
    // Check if it's a direct video file URL
    else if (videoUrl.match(/\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i)) {
      console.log('🎥 رابط فيديو مباشر')
      
      try {
        // Test if the URL is accessible
        const response = await fetch(videoUrl, { method: 'HEAD' })
        if (response.ok) {
          console.log('✅ رابط الفيديو المباشر صالح')
          return videoUrl
        } else {
          console.error(`❌ رابط الفيديو غير صالح: ${response.status}`)
          return null
        }
      } catch (error) {
        console.error('❌ خطأ في التحقق من رابط الفيديو:', error)
        return null
      }
    }
    
    // If it's a generic HTTP/HTTPS URL, validate it
    else if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      console.log('🔍 التحقق من رابط عام...')
      
      try {
        const response = await fetch(videoUrl, { method: 'HEAD' })
        if (response.ok) {
          console.log('✅ الرابط صالح')
          return videoUrl
        } else {
          console.error(`❌ الرابط غير صالح: ${response.status}`)
          return null
        }
      } catch (error) {
        console.error('❌ خطأ في التحقق من الرابط:', error)
        return null
      }
    }
    
    // If none of the above, it might be an invalid URL
    else {
      console.error('❌ تنسيق رابط الفيديو غير مدعوم:', videoUrl)
      return null
    }
    
  } catch (error) {
    console.error('خطأ في معالجة الفيديو:', error)
    return null
  }
}

// Helper function to validate if a URL is a supported video platform
export const isValidVideoUrl = (url: string): boolean => {
  if (!url || !url.trim()) return false
  
  const videoUrl = url.trim()
  
  // Check for supported platforms
  return (
    videoUrl.includes('youtube.com') ||
    videoUrl.includes('youtu.be') ||
    videoUrl.includes('vimeo.com') ||
    videoUrl.includes('player.vimeo.com') ||
    videoUrl.match(/\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i) !== null ||
    (videoUrl.startsWith('http') && videoUrl.includes('embed'))
  )
}

// Legacy function for backward compatibility
export const downloadVideo = processVideo
