'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Share2, MessageCircle, ArrowLeft, Image } from 'lucide-react'
import QSOTemplate from '../../../components/cv-templates/qso-template'
import Head from 'next/head'

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

export default function PublicCVPage() {
  const params = useParams()
  const [cv, setCv] = useState<CV | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchCV(params.id as string)
    }
  }, [params.id])

  const fetchCV = async (id: string) => {
    try {
      const response = await fetch(`/api/cvs/${id}/public`)
      
      if (response.ok) {
        const data = await response.json()
        setCv(data.cv)
      } else {
        toast.error('السيرة الذاتية غير موجودة')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `سيرة ذاتية - ${cv?.fullName}`,
          text: `شاهد السيرة الذاتية لـ ${cv?.fullName}`,
          url: url
        })
      } catch (error) {
        // إذا فشلت المشاركة، انسخ الرابط
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
    }).catch(() => {
      toast.error('فشل في نسخ الرابط')
    })
  }

  const handleWhatsAppShare = () => {
    if (!cv) return
    
    const message = `مرحباً، أريد الاستفسار عن السيرة الذاتية لـ ${cv.fullName}
    
الرقم المرجعي: ${cv.referenceCode || 'غير محدد'}
الوظيفة: ${cv.position || 'غير محدد'}
الجنسية: ${cv.nationality || 'غير محدد'}

رابط السيرة الذاتية: ${window.location.href}`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleDownloadImage = async () => {
    try {
      // استيراد html2canvas بشكل ديناميكي
      const html2canvas = (await import('html2canvas')).default
      
      // العثور على عنصر السيرة الذاتية
      const cvElement = document.querySelector('.cv-container') as HTMLElement
      if (!cvElement) {
        toast.error('لم يتم العثور على السيرة الذاتية')
        return
      }

      // إنشاء canvas بالأبعاد المطلوبة
      const canvas = await html2canvas(cvElement, {
        width: 1459,
        height: 2048,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      })

      // تحويل إلى صورة وتنزيلها
      const link = document.createElement('a')
      link.download = `${cv?.fullName || 'CV'}-QSO.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      toast.success('تم تنزيل السيرة الذاتية كصورة')
    } catch (error) {
      console.error('خطأ في تنزيل الصورة:', error)
      toast.error('فشل في تنزيل الصورة')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  if (!cv) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">السيرة الذاتية غير موجودة</h1>
          <p className="text-gray-600">الرابط الذي تحاول الوصول إليه غير صحيح أو تم حذف السيرة الذاتية</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {cv.fullName}
              </h1>
              <p className="text-gray-600">
                {cv.position && `${cv.position} • `}
                {cv.nationality && `${cv.nationality} • `}
                {cv.referenceCode && `#${cv.referenceCode}`}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={handleShare}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Share2 className="h-4 w-4 ml-2" />
                مشاركة
              </button>
              
              <button
                onClick={handleWhatsAppShare}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <MessageCircle className="h-4 w-4 ml-2" />
                واتساب
              </button>
              
              <button
                onClick={handleDownloadImage}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              >
                <Image className="h-4 w-4 ml-2" />
                تحميل صورة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CV Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QSOTemplate 
          cv={cv} 
          selectedVideo={selectedVideo}
          setSelectedVideo={setSelectedVideo}
        />
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-4">نظام إدارة السير الذاتية - قالب QSO</p>
            <div className="flex justify-center space-x-6 space-x-reverse">
              <button
                onClick={handleShare}
                className="text-blue-600 hover:text-blue-700 flex items-center"
              >
                <Share2 className="h-4 w-4 ml-1" />
                مشاركة السيرة
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="text-green-600 hover:text-green-700 flex items-center"
              >
                <MessageCircle className="h-4 w-4 ml-1" />
                تواصل عبر واتساب
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cairo Font and Emoji Support */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap');
        
        .cv-container {
          font-family: 'Cairo', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', Arial, sans-serif !important;
        }
        
        /* Enhanced Emoji support */
        .emoji, [class*="emoji"] {
          font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', sans-serif !important;
          font-style: normal !important;
          font-variant: normal !important;
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          font-feature-settings: "liga" 1, "kern" 1 !important;
        }
        
        /* Force emoji rendering */
        span:has-emoji, div:has-emoji {
          font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji' !important;
        }
        
        /* Specific flag emoji support */
        .flag-emoji {
          font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'EmojiOne Color', 'Android Emoji' !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-variant-emoji: emoji !important;
          text-rendering: optimizeLegibility !important;
        }
        
        /* Force emoji display */
        .flag-emoji * {
          font-family: inherit !important;
          font-size: inherit !important;
        }
      `}</style>
      </div>
    </>
  )
}
