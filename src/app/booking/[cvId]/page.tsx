'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { CVStatus, Priority, SkillLevel } from '@prisma/client'
import { 
  ArrowLeft, 
  User, 
  IdCard, 
  MessageSquare, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Star,
  Baby,
  Home,
  BookOpen,
  Car,
  Heart,
  GraduationCap,
  Users,
  Languages,
  Globe,
  Briefcase,
  Award
} from 'lucide-react'
import CountryFlag from '../../../components/CountryFlag'
import DashboardLayout from '../../../components/DashboardLayout'

interface CV {
  id: string
  fullName: string
  fullNameArabic?: string
  email?: string
  phone?: string
  referenceCode?: string
  position?: string
  nationality?: string
  maritalStatus?: string
  age?: number
  profileImage?: string
  monthlySalary?: string
  contractPeriod?: string
  status: CVStatus
  priority: Priority
  // مهارات
  babySitting?: SkillLevel
  childrenCare?: SkillLevel
  tutoring?: SkillLevel
  disabledCare?: SkillLevel
  cleaning?: SkillLevel
  washing?: SkillLevel
  ironing?: SkillLevel
  arabicCooking?: SkillLevel
  sewing?: SkillLevel
  driving?: SkillLevel
  elderCare?: SkillLevel
  housekeeping?: SkillLevel
  cooking?: SkillLevel
  // خصائص إضافية
  experience?: string
  arabicLevel?: SkillLevel
  englishLevel?: SkillLevel
  religion?: string
  educationLevel?: string
  height?: string
  weight?: string
  numberOfChildren?: number
  livingTown?: string
  placeOfBirth?: string
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const [cv, setCv] = useState<CV | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    identityNumber: '',
    notes: ''
  })

  const cvId = params.cvId as string

  useEffect(() => {
    fetchCV()
  }, [cvId])

  const fetchCV = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/cv/${cvId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCv(data)
      } else {
        toast.error('فشل في تحميل بيانات السيرة الذاتية')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching CV:', error)
      toast.error('حدث خطأ أثناء تحميل البيانات')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.identityNumber.trim()) {
      toast.error('رقم الهوية مطلوب')
      return
    }

    if (formData.identityNumber.length < 10) {
      toast.error('رقم الهوية يجب أن يكون 10 أرقام على الأقل')
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cvId: cvId,
          identityNumber: formData.identityNumber,
          notes: formData.notes
        })
      })

      if (response.ok) {
        toast.success('تم حجز السيرة الذاتية بنجاح')
        router.push('/dashboard/bookings')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في حجز السيرة الذاتية')
      }
    } catch (error) {
      console.error('Error booking CV:', error)
      toast.error('حدث خطأ أثناء الحجز')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'babySitting': return <Baby className="h-4 w-4" />
      case 'childrenCare': return <Users className="h-4 w-4" />
      case 'tutoring': return <BookOpen className="h-4 w-4" />
      case 'disabledCare': return <Heart className="h-4 w-4" />
      case 'cleaning': return <Home className="h-4 w-4" />
      case 'washing': return <Home className="h-4 w-4" />
      case 'ironing': return <Home className="h-4 w-4" />
      case 'arabicCooking': return <Home className="h-4 w-4" />
      case 'sewing': return <Award className="h-4 w-4" />
      case 'driving': return <Car className="h-4 w-4" />
      case 'elderCare': return <Heart className="h-4 w-4" />
      case 'housekeeping': return <Home className="h-4 w-4" />
      case 'cooking': return <Home className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  const getSkillLabel = (skill: string) => {
    const labels: { [key: string]: string } = {
      babySitting: 'رعاية الأطفال',
      childrenCare: 'العناية بالأطفال',
      tutoring: 'التدريس',
      disabledCare: 'رعاية ذوي الاحتياجات الخاصة',
      cleaning: 'التنظيف',
      washing: 'الغسيل',
      ironing: 'الكي',
      arabicCooking: 'الطبخ العربي',
      sewing: 'الخياطة',
      driving: 'القيادة',
      elderCare: 'رعاية المسنين',
      housekeeping: 'إدارة المنزل',
      cooking: 'الطبخ'
    }
    return labels[skill] || skill
  }

  const getSkillLevelText = (level: SkillLevel) => {
    switch (level) {
      case 'YES': return 'نعم'
      case 'NO': return 'لا'
      case 'WILLING': return 'مستعدة للتعلم'
      default: return 'غير محدد'
    }
  }

  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
      case 'YES': return 'text-green-600 bg-green-50'
      case 'NO': return 'text-red-600 bg-red-50'
      case 'WILLING': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        {() => (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري التحميل...</p>
            </div>
          </div>
        )}
      </DashboardLayout>
    )
  }

  if (!cv) {
    return (
      <DashboardLayout>
        {() => (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">السيرة الذاتية غير موجودة</p>
            </div>
          </div>
        )}
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {() => (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Bookmark className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">حجز السيرة الذاتية</h1>
                <p className="text-gray-600">إدخال بيانات الحجز</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CV Preview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات السيرة الذاتية</h2>
              
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {cv.profileImage ? (
                    <img
                      src={cv.profileImage}
                      alt={cv.fullName}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{cv.fullName}</h3>
                    {cv.fullNameArabic && (
                      <p className="text-gray-600">{cv.fullNameArabic}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {cv.nationality && (
                        <>
                          <CountryFlag nationality={cv.nationality} />
                          <span className="text-sm text-gray-500">{cv.nationality}</span>
                        </>
                      )}
                      {cv.referenceCode && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          #{cv.referenceCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  {cv.position && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">المهنة</p>
                        <p className="text-sm font-medium text-gray-900">{cv.position}</p>
                      </div>
                    </div>
                  )}
                  
                  {cv.age && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">العمر</p>
                        <p className="text-sm font-medium text-gray-900">{cv.age} سنة</p>
                      </div>
                    </div>
                  )}

                  {cv.maritalStatus && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">الحالة الاجتماعية</p>
                        <p className="text-sm font-medium text-gray-900">{cv.maritalStatus}</p>
                      </div>
                    </div>
                  )}

                  {cv.religion && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">الديانة</p>
                        <p className="text-sm font-medium text-gray-900">{cv.religion}</p>
                      </div>
                    </div>
                  )}

                  {cv.monthlySalary && (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 text-gray-400">💰</span>
                      <div>
                        <p className="text-xs text-gray-500">الراتب الشهري</p>
                        <p className="text-sm font-medium text-gray-900">{cv.monthlySalary}</p>
                      </div>
                    </div>
                  )}

                  {cv.contractPeriod && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">مدة العقد</p>
                        <p className="text-sm font-medium text-gray-900">{cv.contractPeriod}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">المهارات</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(cv).map(([key, value]) => {
                      if (['babySitting', 'childrenCare', 'tutoring', 'disabledCare', 'cleaning', 'washing', 'ironing', 'arabicCooking', 'sewing', 'driving', 'elderCare', 'housekeeping', 'cooking'].includes(key) && value) {
                        return (
                          <div key={key} className="flex items-center gap-2">
                            {getSkillIcon(key)}
                            <span className="text-xs text-gray-600">{getSkillLabel(key)}</span>
                            <span className={`text-xs px-2 py-1 rounded ${getSkillLevelColor(value as SkillLevel)}`}>
                              {getSkillLevelText(value as SkillLevel)}
                            </span>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">بيانات الحجز</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identity Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IdCard className="h-4 w-4 inline ml-2" />
                    رقم الهوية *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="أدخل رقم الهوية (10 أرقام)"
                    value={formData.identityNumber}
                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    رقم هوية العميل الذي سيتم التعاقد معه
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="h-4 w-4 inline ml-2" />
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    placeholder="أدخل أي ملاحظات إضافية..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">تنبيه مهم</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        عند تأكيد الحجز سيتم تغيير حالة السيرة الذاتية إلى "محجوز" ولن يتمكن المستخدمون الآخرون من حجزها.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري الحجز...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        تأكيد الحجز
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
