/**
 * مكتبة مساعدة لمعالجة URLs الصور
 */

/**
 * دالة لتحويل روابط Google Drive إلى روابط مباشرة للصور
 * @param url - رابط Google Drive
 * @returns رابط مباشر للصورة
 */
const convertGoogleDriveUrl = (url: string): string => {
  // استخراج ID الملف من رابط Google Drive
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    // تحويل إلى رابط مباشر
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // إذا لم يتم العثور على ID، ارجع الرابط الأصلي
  return url;
};

/**
 * دالة لمعالجة وتنسيق URLs الصور لدعم جميع أنواع المسارات
 * @param imageUrl - رابط الصورة الأصلي
 * @returns رابط الصورة المُنسق أو null إذا لم يكن هناك صورة
 */
export const getImageUrl = (imageUrl?: string): string | null => {
  if (!imageUrl || imageUrl.trim() === '') return null;
  
  const cleanUrl = imageUrl.trim();
  
  // معالجة روابط Google Drive
  if (cleanUrl.includes('drive.google.com')) {
    return convertGoogleDriveUrl(cleanUrl);
  }
  
  // معالجة روابط Dropbox
  if (cleanUrl.includes('dropbox.com')) {
    if (cleanUrl.includes('?dl=0')) {
      return cleanUrl.replace('?dl=0', '?raw=1');
    }
    if (!cleanUrl.includes('?raw=1') && !cleanUrl.includes('?dl=1')) {
      return cleanUrl + '?raw=1';
    }
  }
  
  // معالجة روابط OneDrive
  if (cleanUrl.includes('1drv.ms') || cleanUrl.includes('onedrive.live.com')) {
    // تحويل روابط OneDrive إلى روابط مباشرة
    if (cleanUrl.includes('?') && !cleanUrl.includes('&download=1')) {
      return cleanUrl + '&download=1';
    }
  }
  
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
  
  // دالة مساعدة للحصول على origin بطريقة آمنة
  const getOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    // fallback للخادم أو SSR
    return '';
  };
  
  // إذا كان URL يبدأ بـ /uploads، أضف domain الموقع
  if (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('uploads/')) {
    const normalizedUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    const origin = getOrigin();
    return origin ? `${origin}${normalizedUrl}` : normalizedUrl;
  }
  
  // إذا كان URL يبدأ بـ /public، أضف domain الموقع
  if (cleanUrl.startsWith('/public/') || cleanUrl.startsWith('public/')) {
    const normalizedUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    const origin = getOrigin();
    return origin ? `${origin}${normalizedUrl}` : normalizedUrl;
  }
  
  // إذا كان مجرد اسم ملف (بدون مسار)، أضف المسار الافتراضي
  if (!cleanUrl.includes('/') && !cleanUrl.includes('\\')) {
    const origin = getOrigin();
    return origin ? `${origin}/uploads/images/${cleanUrl}` : `/uploads/images/${cleanUrl}`;
  }
  
  // إذا كان يبدأ بـ / فقط، أضف domain
  if (cleanUrl.startsWith('/')) {
    const origin = getOrigin();
    return origin ? `${origin}${cleanUrl}` : cleanUrl;
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
  if (!name || name.trim() === '') {
    name = 'User';
  }
  
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
  
  // استخدام Buffer في Node.js أو btoa في المتصفح
  if (typeof window === 'undefined') {
    // بيئة الخادم
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  } else {
    // بيئة المتصفح
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
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
