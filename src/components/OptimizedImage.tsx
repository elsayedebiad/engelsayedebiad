'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { getImageUrl, generateAvatarUrl } from '../lib/image-utils'

interface OptimizedImageProps {
  src?: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackName?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  style?: React.CSSProperties
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  fallbackName,
  priority = false,
  fill = false,
  sizes,
  style
}) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // معالجة URL الصورة
  const processedSrc = getImageUrl(src)

  // إذا لم يكن هناك صورة أو حدث خطأ، استخدم Avatar
  if (!processedSrc || imageError) {
    const avatarSrc = fallbackName 
      ? generateAvatarUrl(fallbackName, Math.max(width, height))
      : generateAvatarUrl(alt, Math.max(width, height))

    return (
      <div 
        className={`relative overflow-hidden ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}
      >
        <Image
          src={avatarSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className="object-cover"
          priority={priority}
          sizes={sizes}
        />
      </div>
    )
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}
    >
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width: '100%', height: '100%' }}
        >
          <div className="text-gray-400 text-sm">جاري التحميل...</div>
        </div>
      )}
      
      <Image
        src={processedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        priority={priority}
        sizes={sizes}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.log('خطأ في تحميل الصورة:', processedSrc)
          setImageError(true)
          setIsLoading(false)
        }}
        // إعدادات إضافية لـ Vercel
        unoptimized={processedSrc.includes('drive.google.com') || processedSrc.includes('dropbox.com')}
      />
    </div>
  )
}

export default OptimizedImage
