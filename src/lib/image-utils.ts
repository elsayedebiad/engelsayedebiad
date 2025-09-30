/**
 * مكتبة مساعدة لمعالجة URLs الصور
 */

/**
 * دالة لمعالجة وتنسيق URLs الصور لدعم جميع أنواع المسارات
 * @param imageUrl - رابط الصورة الأصلي
 * @returns رابط الصورة المُنسق أو null إذا لم يكن هناك صورة
 */
export const getImageUrl = (imageUrl?: string): string | null => {
  if (!imageUrl || imageUrl.trim() === '') return null;
  
  const cleanUrl = imageUrl.trim();
  
  // إذا كان URL يبدأ بـ http أو https، استخدمه مباشرة
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  
  // إذا كان URL يبدأ بـ data: (base64)، استخدمه مباشرة
  if (cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }
  
  // إذا كان URL يبدأ بـ blob:، استخدمه مباشرة
  if (cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }
  
  // إذا كان URL يبدأ بـ /uploads، أضف domain الموقع
  if (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('uploads/')) {
    const normalizedUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    return `${window.location.origin}${normalizedUrl}`;
  }
  
  // إذا كان URL يبدأ بـ /public، أضف domain الموقع
  if (cleanUrl.startsWith('/public/') || cleanUrl.startsWith('public/')) {
    const normalizedUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    return `${window.location.origin}${normalizedUrl}`;
  }
  
  // إذا كان مجرد اسم ملف (بدون مسار)، أضف المسار الافتراضي
  if (!cleanUrl.includes('/') && !cleanUrl.includes('\\')) {
    return `${window.location.origin}/uploads/images/${cleanUrl}`;
  }
  
  // إذا كان يبدأ بـ / فقط، أضف domain
  if (cleanUrl.startsWith('/')) {
    return `${window.location.origin}${cleanUrl}`;
  }
  
  // في الحالات الأخرى، حاول استخدام URL كما هو
  return cleanUrl;
};

/**
 * دالة للتحقق من صحة رابط الصورة
 * @param imageUrl - رابط الصورة
 * @returns Promise<boolean> - true إذا كانت الصورة صالحة
 */
export const validateImageUrl = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
};

/**
 * دالة لإنشاء صورة احتياطية بالأحرف الأولى من الاسم
 * @param name - اسم الشخص
 * @param size - حجم الصورة (افتراضي: 200)
 * @returns رابط صورة SVG
 */
export const generateAvatarUrl = (name: string, size: number = 200): string => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
    
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  const colorIndex = name.length % colors.length;
  const backgroundColor = colors[colorIndex];
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" 
            font-family="Arial, sans-serif" font-size="${size * 0.4}" 
            font-weight="bold" fill="white">
        ${initials}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * دالة لضغط الصورة قبل الرفع
 * @param file - ملف الصورة
 * @param maxWidth - العرض الأقصى (افتراضي: 800)
 * @param maxHeight - الارتفاع الأقصى (افتراضي: 800)
 * @param quality - جودة الضغط (افتراضي: 0.8)
 * @returns Promise<Blob> - الصورة المضغوطة
 */
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // حساب الأبعاد الجديدة مع الحفاظ على النسبة
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // رسم الصورة المضغوطة
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('فشل في ضغط الصورة'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('فشل في تحميل الصورة'));
    img.src = URL.createObjectURL(file);
  });
};
