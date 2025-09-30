'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import QSOTemplate from '../../../../components/cv-templates/qso-template'
import { ArrowLeft, Download, Share2, MessageCircle, User, Calendar, Phone, Mail, MapPin, Star, Baby, Home, BookOpen, Car, Heart, GraduationCap, Users, Languages, Globe, Briefcase, Award } from 'lucide-react'

// Enums
enum SkillLevel {
  YES = 'yes',
  NO = 'no',
  WILLING = 'willing'
}

// Component for Country Flag
const CountryFlag = ({ nationality, size = 'sm' }: { nationality: string, size?: 'sm' | 'md' | 'lg' }) => {
  const getCountryFlag = (nationality: string): string => {
    const country = nationality.toLowerCase().trim();
    
    if (country === 'إثيوبيا' || country === 'ethiopia' || country === 'ethiopian') return '🇪🇹';
    if (country === 'الفلبين' || country === 'philippines' || country === 'filipino' || country === 'filipina') return '🇵🇭';
    if (country === 'إندونيسيا' || country === 'indonesia' || country === 'indonesian') return '🇮🇩';
    if (country === 'بنغلاديش' || country === 'bangladesh' || country === 'bangladeshi') return '🇧🇩';
    if (country === 'سريلانكا' || country === 'sri lanka' || country === 'srilanka' || country === 'sri lankan') return '🇱🇰';
    if (country === 'نيبال' || country === 'nepal' || country === 'nepalese') return '🇳🇵';
    if (country === 'الهند' || country === 'india' || country === 'indian') return '🇮🇳';
    if (country === 'كينيا' || country === 'kenya' || country === 'kenyan') return '🇰🇪';
    if (country === 'أوغندا' || country === 'uganda' || country === 'ugandan') return '🇺🇬';
    if (country === 'غانا' || country === 'ghana' || country === 'ghanaian') return '🇬🇭';
    
    return '🌍';
  };

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl', 
    lg: 'text-2xl'
  };

  return (
    <span className={`${sizeClasses[size]} flag-emoji`}>
      {getCountryFlag(nationality)}
    </span>
  );
};

// Interface شامل للسيرة الذاتية
interface CV {
  id: string;
  fullName: string;
  fullNameArabic?: string;
  email?: string;
  phone?: string;
  referenceCode?: string;
  position?: string;
  nationality?: string;
  religion?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  livingTown?: string;
  maritalStatus?: string;
  numberOfChildren?: number;
  weight?: string;
  height?: string;
  complexion?: string;
  age?: number;
  monthlySalary?: string;
  contractPeriod?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  passportIssuePlace?: string;
  englishLevel?: string;
  arabicLevel?: string;
  educationLevel?: string;
  babySitting?: string;
  childrenCare?: string;
  tutoring?: string;
  disabledCare?: string;
  cleaning?: string;
  washing?: string;
  ironing?: string;
  arabicCooking?: string;
  sewing?: string;
  driving?: string;
  elderCare?: string;
  housekeeping?: string;
  experience?: string;
  education?: string;
  skills?: string;
  summary?: string;
  priority?: string;
  notes?: string;
  profileImage?: string;
  videoLink?: string;
  // الحقول الإضافية الـ 22
  previousEmployment?: string;
  workExperienceYears?: number;
  lastEmployer?: string;
  reasonForLeaving?: string;
  contractType?: string;
  expectedSalary?: string;
  workingHours?: string;
  languages?: string;
  medicalCondition?: string;
  hobbies?: string;
  personalityTraits?: string;
  foodPreferences?: string;
  specialNeeds?: string;
  currentLocation?: string;
  availability?: string;
  preferredCountry?: string;
  visaStatus?: string;
  workPermit?: string;
  certificates?: string;
  references?: string;
  emergencyContact?: string;
}

export default function CVViewPage() {
  const params = useParams()
  const router = useRouter()
  
  const { isLoggedIn } = useAuth()
  const [cv, setCv] = useState<CV | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [hideUI, setHideUI] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const cvRef = useRef<HTMLDivElement>(null)

  // جلب بيانات السيرة الذاتية
  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await fetch(`/api/cv/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setCv(data)
        } else {
          const errorData = await response.json().catch(() => ({}))
          if (response.status === 404) {
            toast.error('لم يتم العثور على السيرة الذاتية')
          } else if (response.status === 400) {
            toast.error('رقم السيرة الذاتية غير صحيح')
          } else {
            toast.error('حدث خطأ في تحميل السيرة الذاتية')
          }
          console.error('API Error:', response.status, errorData)
        }
      } catch (error) {
        console.error('Error fetching CV:', error)
        toast.error('حدث خطأ في تحميل السيرة الذاتية')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCV()
    }
  }, [params.id])

  // جلب رقم الواتساب
  useEffect(() => {
    const fetchWhatsappNumber = async () => {
      try {
        const response = await fetch('/api/sales-config/sales1')
        if (response.ok) {
          const data = await response.json()
          setWhatsappNumber(data.whatsappNumber || '+201065201900')
        }
      } catch (error) {
        console.error('Error fetching WhatsApp number:', error)
        setWhatsappNumber('+201065201900')
      }
    }
    
    fetchWhatsappNumber()
  }, [])

  // حالة تسجيل الدخول تأتي من AuthContext

  // التحميل التلقائي
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('autoDownload') === 'true' && cv && !isLoading) {
      setHideUI(true)
      setTimeout(() => {
        downloadCV()
      }, 2000)
    }
  }, [cv, isLoading])

  // وظيفة التحميل
  const downloadCV = async () => {
    if (!cv || !cvRef.current) return

    const toastId = toast.loading('جاري إنشاء صورة السيرة الذاتية...')

    try {
      // استيراد html2canvas بشكل ديناميكي
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        logging: false
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `AlQaeid_CV_${cv.fullName}_${cv.referenceCode}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)

          toast.success('تم تحميل السيرة الذاتية بنجاح', { id: toastId })
        }
      }, 'image/png', 0.9)
    } catch (error) {
      console.error('Error downloading CV:', error)
      toast.error('حدث خطأ أثناء تحميل السيرة الذاتية', { id: toastId })
    }
  }

  // وظيفة المشاركة
  const shareCV = async () => {
    if (!cv) return

    const shareText = `🔗 مشاركة سيرة ذاتية من معرض الاسناد السريع

👤 الاسم: ${cv.fullName}
🏳️ الجنسية: ${cv.nationality || 'غير محدد'}
💼 الوظيفة: ${cv.position || 'غير محدد'}
🎂 العمر: ${cv.age || 'غير محدد'} سنة
🆔 الكود المرجعي: ${cv.referenceCode || 'غير محدد'}

🔗 رابط السيرة الذاتية: ${window.location.href}
📱 للحجز عبر واتساب: ${whatsappNumber}

#الاسناد_السريع #عمالة_منزلية`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `سيرة ذاتية - ${cv.fullName}`,
          text: shareText,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('تم نسخ معلومات السيرة الذاتية')
      }).catch(() => {
        toast.error('فشل في نسخ المعلومات')
      })
    }
  }

  // وظيفة إرسال رسالة واتساب
  const sendWhatsAppMessage = () => {
    if (!cv) return

    const message = `مرحباً، أريد الاستفسار عن هذه السيرة الذاتية:

👤 الاسم: ${cv.fullName}
🏳️ الجنسية: ${cv.nationality || 'غير محدد'}
💼 الوظيفة: ${cv.position || 'غير محدد'}
🆔 الكود المرجعي: ${cv.referenceCode || 'غير محدد'}

من معرض الاسناد السريع`

    const encodedMessage = encodeURIComponent(message)
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '')
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  // عرض الـ loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل السيرة الذاتية...</p>
        </div>
      </div>
    )
  }

  // إذا لم توجد السيرة الذاتية
  if (!cv) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">السيرة الذاتية غير موجودة</h2>
          <button
            onClick={() => router.push('/gallery')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            العودة للمعرض
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header - مخفي في حالة hideUI */}
      {!hideUI && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/gallery')}
                  className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>العودة للمعرض</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-xl font-bold text-gray-900">عرض السيرة الذاتية</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={shareCV}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  <Share2 className="h-4 w-4" />
                  مشاركة
                </button>
                <button
                  onClick={downloadCV}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  <Download className="h-4 w-4" />
                  تحميل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* محتوى السيرة الذاتية */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div 
          ref={cvRef}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ width: '794px', minHeight: '1123px', margin: '0 auto', position: 'relative' }}
        >
          {/* Watermark */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            overflow: 'hidden',
            pointerEvents: 'none'
          }}>
            {/* صف أول - الأعلى */}
            <img 
              src="/watermark-new.png" 
              alt="QSO Watermark"
              style={{
                position: 'absolute',
                top: '5%',
                left: '5%',
                width: '200px',
                height: 'auto',
                opacity: 0.12,
                transform: 'rotate(-25deg)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
            <img 
              src="/watermark-new.png" 
              alt="QSO Watermark"
              style={{
                position: 'absolute',
                top: '8%',
                right: '10%',
                width: '180px',
                height: 'auto',
                opacity: 0.1,
                transform: 'rotate(-35deg)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
            
            {/* صف ثاني */}
            <img 
              src="/watermark-new.png" 
              alt="QSO Watermark"
              style={{
                position: 'absolute',
                top: '25%',
                left: '15%',
                width: '190px',
                height: 'auto',
                opacity: 0.11,
                transform: 'rotate(-40deg)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
            <img 
              src="/watermark-new.png" 
              alt="QSO Watermark"
              style={{
                position: 'absolute',
                top: '30%',
                right: '5%',
                width: '185px',
                height: 'auto',
                opacity: 0.12,
                transform: 'rotate(-20deg)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
            
            {/* صف ثالث */}
            <img 
              src="/watermark-new.png" 
              alt="QSO Watermark"
              style={{
                position: 'absolute',
                top: '50%',
                left: '8%',
                width: '195px',
                height: 'auto',
                opacity: 0.1,
                transform: 'rotate(-30deg)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
            <img 
              src="/watermark-new.png" 
              alt="QSO Watermark"
              style={{
                position: 'absolute',
                top: '45%',
                right: '12%',
                width: '175px',
                height: 'auto',
                opacity: 0.11,
                transform: 'rotate(-45deg)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
            
            {/* صف رابع */}
            <img 
              src="/watermark-new.png" 
              alt="QSO Watermark"
              style={{
                position: 'absolute',
                top: '70%',
                left: '12%',
                width: '180px',
                height: 'auto',
                opacity: 0.12,
                transform: 'rotate(-35deg)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
            <img 
              src="/watermark-new.png" 
              alt="QSO Watermark"
              style={{
                position: 'absolute',
                top: '75%',
                right: '8%',
                width: '190px',
                height: 'auto',
                opacity: 0.1,
                transform: 'rotate(-25deg)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
            
            {/* صف خامس - الأسفل */}
            <img 
              src="/watermark-new.png" 
              alt="QSO Watermark"
              style={{
                position: 'absolute',
                top: '88%',
                left: '10%',
                width: '170px',
                height: 'auto',
                opacity: 0.11,
                transform: 'rotate(-40deg)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
            <img 
              src="/watermark-new.png" 
              alt="QSO Watermark"
              style={{
                position: 'absolute',
                top: '90%',
                right: '15%',
                width: '165px',
                height: 'auto',
                opacity: 0.12,
                transform: 'rotate(-30deg)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
          </div>
          {/* رأس السيرة الذاتية */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex items-start gap-6">
              {/* الصورة الشخصية */}
              <div className="flex-shrink-0">
                {cv.profileImage ? (
                  <img
                    src={cv.profileImage}
                    alt={cv.fullName}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-600" />
                  </div>
                )}
              </div>

              {/* المعلومات الأساسية */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{cv.fullName}</h1>
                {cv.fullNameArabic && (
                  <h2 className="text-xl mb-3 opacity-90">{cv.fullNameArabic}</h2>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <CountryFlag nationality={cv.nationality || ''} size="md" />
                    <span className="text-lg">{cv.nationality}</span>
                  </div>
                  {cv.age && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>{cv.age} سنة</span>
                    </div>
                  )}
                </div>
                <p className="text-xl font-semibold mb-2">{cv.position || 'عاملة منزلية'}</p>
                <p className="text-sm opacity-90">كود مرجعي: {cv.referenceCode}</p>
              </div>
            </div>
          </div>

          {/* معلومات الاتصال */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              معلومات الاتصال
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {cv.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{cv.phone}</span>
                </div>
              )}
              {cv.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{cv.email}</span>
                </div>
              )}
              {cv.livingTown && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{cv.livingTown}</span>
                </div>
              )}
            </div>
          </div>

          {/* المهارات */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              المهارات
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {cv.babySitting && cv.babySitting !== SkillLevel.NO && (
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-pink-500" />
                  <span>رعاية الأطفال</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    cv.babySitting === SkillLevel.YES ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cv.babySitting === SkillLevel.YES ? 'ممتاز' : 'مستعد للتعلم'}
                  </span>
                </div>
              )}
              {cv.cleaning && cv.cleaning !== SkillLevel.NO && (
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-blue-500" />
                  <span>التنظيف</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    cv.cleaning === SkillLevel.YES ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cv.cleaning === SkillLevel.YES ? 'ممتاز' : 'مستعد للتعلم'}
                  </span>
                </div>
              )}
              {cv.arabicCooking && cv.arabicCooking !== SkillLevel.NO && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span>الطبخ العربي</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    cv.arabicCooking === SkillLevel.YES ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cv.arabicCooking === SkillLevel.YES ? 'ممتاز' : 'مستعد للتعلم'}
                  </span>
                </div>
              )}
              {cv.driving && cv.driving !== SkillLevel.NO && (
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-red-500" />
                  <span>القيادة</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    cv.driving === SkillLevel.YES ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cv.driving === SkillLevel.YES ? 'ممتاز' : 'مستعد للتعلم'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* المعلومات الشخصية */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              المعلومات الشخصية
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {cv.maritalStatus && (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-gray-500" />
                  <span>الحالة الاجتماعية: {cv.maritalStatus}</span>
                </div>
              )}
              {cv.religion && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-500" />
                  <span>الديانة: {cv.religion}</span>
                </div>
              )}
              {cv.educationLevel && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span>التعليم: {cv.educationLevel}</span>
                </div>
              )}
              {cv.numberOfChildren !== undefined && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>عدد الأطفال: {cv.numberOfChildren}</span>
                </div>
              )}
            </div>
          </div>

          {/* اللغات */}
          {(cv.arabicLevel || cv.englishLevel) && (
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Languages className="w-5 h-5 text-blue-600" />
                اللغات
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {cv.arabicLevel && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span>العربية: {cv.arabicLevel === SkillLevel.YES ? 'ممتاز' : 'متوسط'}</span>
                  </div>
                )}
                {cv.englishLevel && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span>الإنجليزية: {cv.englishLevel === SkillLevel.YES ? 'ممتاز' : 'متوسط'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* معلومات إضافية */}
          {(cv.experience || cv.monthlySalary) && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                معلومات إضافية
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {cv.experience && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span>الخبرة: {cv.experience}</span>
                  </div>
                )}
                {cv.monthlySalary && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>الراتب المطلوب: {cv.monthlySalary} ريال</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* تذييل السيرة الذاتية */}
          <div className="bg-gray-50 p-6 text-center">
            <div className="text-blue-600 font-semibold text-lg mb-2">الاسناد السريع</div>
            <div className="text-gray-600 text-sm">للاستفسار والحجز: {whatsappNumber}</div>
          </div>
        </div>

        {/* أزرار العمل - مخفية في حالة hideUI */}
        {!hideUI && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={sendWhatsAppMessage}
              className="flex items-center gap-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 text-lg font-bold relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <MessageCircle className="w-6 h-6 relative z-10" />
              <span className="relative z-10">للحجز والطلب عبر واتساب</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
