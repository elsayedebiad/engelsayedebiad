// اختبار دالة تحويل روابط Google Drive

// دالة تحويل Google Drive
function convertGoogleDriveUrl(url) {
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  return url;
}

// دالة getImageUrl المحسنة
function getImageUrl(imageUrl) {
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
  
  // إذا كان URL يبدأ بـ http أو https، استخدمه مباشرة
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  
  return cleanUrl;
}

// اختبار الروابط
const testUrls = [
  // رابط Google Drive الذي أرسلته
  'https://drive.google.com/file/d/1zPpB7XHD3-7hk1_Rzyn3C2rz9qbfm7pG/view?usp=sharing',
  
  // أمثلة أخرى
  'https://drive.google.com/file/d/1ABC123DEF456/view',
  'https://drive.google.com/open?id=1XYZ789GHI012',
  
  // روابط Dropbox
  'https://www.dropbox.com/s/abc123/image.jpg?dl=0',
  'https://dropbox.com/s/xyz789/photo.png',
  
  // روابط عادية
  'https://example.com/image.jpg',
  '/uploads/images/photo.jpg'
];

console.log('🧪 اختبار تحويل روابط التخزين السحابي:\n');

testUrls.forEach((url, index) => {
  const result = getImageUrl(url);
  console.log(`${index + 1}. المدخل:`);
  console.log(`   ${url}`);
  console.log(`   النتيجة:`);
  console.log(`   ${result}\n`);
});

// اختبار خاص لرابطك
console.log('🎯 اختبار رابط Google Drive الخاص بك:');
const yourUrl = 'https://drive.google.com/file/d/1zPpB7XHD3-7hk1_Rzyn3C2rz9qbfm7pG/view?usp=sharing';
const convertedUrl = getImageUrl(yourUrl);

console.log('الرابط الأصلي:');
console.log(yourUrl);
console.log('\nالرابط المحول:');
console.log(convertedUrl);

console.log('\n✅ انتهى الاختبار!');
