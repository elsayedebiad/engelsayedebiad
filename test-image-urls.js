// اختبار دالة معالجة URLs الصور
const testImageUrls = [
  // URLs كاملة
  'https://example.com/image.jpg',
  'http://example.com/image.png',
  
  // مسارات محلية
  '/uploads/images/photo.jpg',
  'uploads/images/photo.jpg',
  '/public/images/avatar.png',
  'public/images/avatar.png',
  
  // أسماء ملفات فقط
  'profile.jpg',
  'avatar.png',
  
  // Base64
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  
  // Blob URLs
  'blob:http://localhost:3000/12345678-1234-1234-1234-123456789012',
  
  // URLs فارغة أو null
  '',
  null,
  undefined,
  
  // URLs مع مسارات معقدة
  '/uploads/images/subfolder/image.jpg',
  'images/users/profile_123.jpg'
];

// دالة الاختبار (نسخة Node.js من دالة getImageUrl)
function getImageUrl(imageUrl) {
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
    return `http://localhost:3001${normalizedUrl}`;
  }
  
  // إذا كان URL يبدأ بـ /public، أضف domain الموقع
  if (cleanUrl.startsWith('/public/') || cleanUrl.startsWith('public/')) {
    const normalizedUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    return `http://localhost:3001${normalizedUrl}`;
  }
  
  // إذا كان مجرد اسم ملف (بدون مسار)، أضف المسار الافتراضي
  if (!cleanUrl.includes('/') && !cleanUrl.includes('\\')) {
    return `http://localhost:3001/uploads/images/${cleanUrl}`;
  }
  
  // إذا كان يبدأ بـ / فقط، أضف domain
  if (cleanUrl.startsWith('/')) {
    return `http://localhost:3001${cleanUrl}`;
  }
  
  // في الحالات الأخرى، حاول استخدام URL كما هو
  return cleanUrl;
}

console.log('🧪 اختبار دالة معالجة URLs الصور:\n');

testImageUrls.forEach((url, index) => {
  const result = getImageUrl(url);
  console.log(`${index + 1}. المدخل: ${url === null ? 'null' : url === undefined ? 'undefined' : `"${url}"`}`);
  console.log(`   النتيجة: ${result === null ? 'null' : `"${result}"`}\n`);
});

console.log('✅ انتهى الاختبار!');
