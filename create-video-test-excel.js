const XLSX = require('xlsx')
const path = require('path')

// بيانات تجريبية مع روابط فيديو متنوعة
const testData = [
  {
    'الاسم الكامل': 'أحمد محمد علي',
    'الاسم بالعربية': 'أحمد محمد علي',
    'الجنسية': 'مصري',
    'الوظيفة المطلوبة': 'سائق',
    'العمر': '30',
    'الحالة الاجتماعية': 'متزوج',
    'عدد الأطفال': '2',
    'الراتب الشهري': '1500',
    'مدة العقد': '2 سنة',
    'رقم الجواز': 'A12345678',
    'تاريخ انتهاء الجواز': '2025-12-31',
    'الكود المرجعي': 'REF-001',
    'رابط الفيديو': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'الديانة': 'مسلم',
    'الطول': '175',
    'الوزن': '70',
    'القيادة': 'ممتاز',
    'العربية': 'ممتاز',
    'الإنجليزية': 'جيد'
  },
  {
    'الاسم الكامل': 'فاطمة حسن',
    'الاسم بالعربية': 'فاطمة حسن',
    'الجنسية': 'فلبينية',
    'الوظيفة المطلوبة': 'عاملة منزلية',
    'العمر': '28',
    'الحالة الاجتماعية': 'عزباء',
    'عدد الأطفال': '0',
    'الراتب الشهري': '1200',
    'مدة العقد': '2 سنة',
    'رقم الجواز': 'P87654321',
    'تاريخ انتهاء الجواز': '2026-06-15',
    'الكود المرجعي': 'REF-002',
    'فيديو': 'https://youtu.be/ScMzIvxBSi4',
    'الديانة': 'مسيحي',
    'الطول': '160',
    'الوزن': '55',
    'التنظيف': 'ممتاز',
    'الطبخ العربي': 'جيد',
    'رعاية الأطفال': 'ممتاز',
    'العربية': 'متوسط',
    'الإنجليزية': 'جيد'
  },
  {
    'الاسم الكامل': 'John Smith',
    'الاسم بالعربية': 'جون سميث',
    'الجنسية': 'أمريكي',
    'الوظيفة المطلوبة': 'مدرس خصوصي',
    'العمر': '35',
    'الحالة الاجتماعية': 'متزوج',
    'عدد الأطفال': '1',
    'الراتب الشهري': '2000',
    'مدة العقد': '1 سنة',
    'رقم الجواز': 'US123456789',
    'تاريخ انتهاء الجواز': '2027-03-20',
    'الكود المرجعي': 'REF-003',
    'Video URL': 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
    'الديانة': 'مسيحي',
    'الطول': '180',
    'الوزن': '75',
    'تعليم الأطفال': 'ممتاز',
    'العربية': 'مبتدئ',
    'الإنجليزية': 'ممتاز'
  },
  {
    'الاسم الكامل': 'Maria Santos',
    'الاسم بالعربية': 'ماريا سانتوس',
    'الجنسية': 'برازيلية',
    'الوظيفة المطلوبة': 'طباخة',
    'العمر': '32',
    'الحالة الاجتماعية': 'مطلقة',
    'عدد الأطفال': '1',
    'الراتب الشهري': '1400',
    'مدة العقد': '2 سنة',
    'رقم الجواز': 'BR987654321',
    'تاريخ انتهاء الجواز': '2025-09-10',
    'الكود المرجعي': 'REF-004',
    'Video': 'https://vimeo.com/123456789',
    'الديانة': 'مسيحي',
    'الطول': '165',
    'الوزن': '60',
    'الطبخ العربي': 'ممتاز',
    'التنظيف': 'جيد',
    'العربية': 'متوسط',
    'الإنجليزية': 'جيد'
  },
  {
    'الاسم الكامل': 'Ahmed Hassan',
    'الاسم بالعربية': 'أحمد حسن',
    'الجنسية': 'سوداني',
    'الوظيفة المطلوبة': 'حارس أمن',
    'العمر': '40',
    'الحالة الاجتماعية': 'متزوج',
    'عدد الأطفال': '3',
    'الراتب الشهري': '1300',
    'مدة العقد': '2 سنة',
    'رقم الجواز': 'SD456789123',
    'تاريخ انتهاء الجواز': '2026-01-25',
    'الكود المرجعي': 'REF-005',
    'Video Link': 'https://drive.google.com/file/d/0987654321zyxwvutsrqponmlk/view?usp=sharing',
    'الديانة': 'مسلم',
    'الطول': '178',
    'الوزن': '80',
    'العربية': 'ممتاز',
    'الإنجليزية': 'مبتدئ'
  }
]

function createVideoTestExcel() {
  console.log('📊 إنشاء ملف Excel تجريبي مع روابط الفيديو...')
  
  // إنشاء workbook جديد
  const wb = XLSX.utils.book_new()
  
  // تحويل البيانات إلى worksheet
  const ws = XLSX.utils.json_to_sheet(testData)
  
  // إضافة الـ worksheet إلى الـ workbook
  XLSX.utils.book_append_sheet(wb, ws, 'السير الذاتية مع الفيديوهات')
  
  // تحديد مسار الملف
  const filePath = path.join(__dirname, 'test-cvs-with-videos.xlsx')
  
  // حفظ الملف
  XLSX.writeFile(wb, filePath)
  
  console.log(`✅ تم إنشاء الملف بنجاح: ${filePath}`)
  console.log('\n📋 محتويات الملف:')
  console.log(`📄 عدد السير الذاتية: ${testData.length}`)
  
  // تحليل أنواع الفيديوهات
  const videoTypes = {
    youtube: 0,
    googleDrive: 0,
    vimeo: 0,
    other: 0
  }
  
  const videoColumns = ['رابط الفيديو', 'فيديو', 'Video URL', 'Video', 'Video Link']
  
  testData.forEach((row, index) => {
    let videoUrl = null
    let videoColumn = null
    
    // البحث عن عمود الفيديو
    for (const col of videoColumns) {
      if (row[col]) {
        videoUrl = row[col]
        videoColumn = col
        break
      }
    }
    
    if (videoUrl) {
      console.log(`\n${index + 1}. ${row['الاسم الكامل']}`)
      console.log(`   📺 عمود الفيديو: "${videoColumn}"`)
      console.log(`   🔗 رابط الفيديو: ${videoUrl}`)
      
      // تصنيف نوع الفيديو
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        videoTypes.youtube++
        console.log(`   📱 نوع الفيديو: YouTube`)
      } else if (videoUrl.includes('drive.google.com')) {
        videoTypes.googleDrive++
        console.log(`   📱 نوع الفيديو: Google Drive`)
      } else if (videoUrl.includes('vimeo.com')) {
        videoTypes.vimeo++
        console.log(`   📱 نوع الفيديو: Vimeo`)
      } else {
        videoTypes.other++
        console.log(`   📱 نوع الفيديو: أخرى`)
      }
    }
  })
  
  console.log('\n📊 إحصائيات الفيديوهات:')
  console.log(`🎬 YouTube: ${videoTypes.youtube}`)
  console.log(`💾 Google Drive: ${videoTypes.googleDrive}`)
  console.log(`🎭 Vimeo: ${videoTypes.vimeo}`)
  console.log(`🔗 أخرى: ${videoTypes.other}`)
  
  console.log('\n💡 خطوات الاختبار:')
  console.log('1. ارفع الملف test-cvs-with-videos.xlsx من الداشبورد')
  console.log('2. استخدم الاستيراد الذكي')
  console.log('3. تحقق من ظهور أزرار الفيديو في صفحات السيلز')
  console.log('4. اضغط على أزرار الفيديو للتأكد من عملها')
  
  return filePath
}

// تشغيل الدالة
try {
  const filePath = createVideoTestExcel()
  console.log('\n🎉 تم إنشاء ملف الاختبار بنجاح!')
  console.log(`📁 مسار الملف: ${filePath}`)
} catch (error) {
  console.error('❌ خطأ في إنشاء الملف:', error)
}
