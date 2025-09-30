const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImages() {
  try {
    console.log('🔍 فحص الصور في قاعدة البيانات...\n');
    
    // جلب السير الذاتية التي تحتوي على صور
    const cvsWithImages = await prisma.cV.findMany({
      where: {
        profileImage: {
          not: null
        }
      },
      select: {
        id: true,
        fullName: true,
        profileImage: true
      },
      take: 10
    });
    
    console.log(`📊 عدد السير الذاتية التي تحتوي على صور: ${cvsWithImages.length}\n`);
    
    if (cvsWithImages.length > 0) {
      console.log('📋 عينة من الصور:\n');
      cvsWithImages.forEach((cv, index) => {
        console.log(`${index + 1}. ${cv.fullName}`);
        console.log(`   ID: ${cv.id}`);
        console.log(`   رابط الصورة: ${cv.profileImage}`);
        console.log(`   نوع الرابط: ${getUrlType(cv.profileImage)}\n`);
      });
    } else {
      console.log('⚠️  لا توجد سير ذاتية تحتوي على صور');
    }
    
    // إحصائيات عامة
    const totalCvs = await prisma.cV.count();
    const cvsWithoutImages = totalCvs - cvsWithImages.length;
    
    console.log('📈 الإحصائيات:');
    console.log(`   إجمالي السير الذاتية: ${totalCvs}`);
    console.log(`   تحتوي على صور: ${cvsWithImages.length}`);
    console.log(`   بدون صور: ${cvsWithoutImages}`);
    
  } catch (error) {
    console.error('❌ خطأ في فحص البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getUrlType(url) {
  if (!url) return 'فارغ';
  if (url.startsWith('http://') || url.startsWith('https://')) return 'رابط خارجي';
  if (url.startsWith('data:')) return 'Base64';
  if (url.startsWith('blob:')) return 'Blob';
  if (url.startsWith('/uploads/')) return 'مسار محلي';
  if (url.startsWith('/public/')) return 'مسار عام';
  if (!url.includes('/')) return 'اسم ملف فقط';
  return 'نوع غير معروف';
}

checkImages();
