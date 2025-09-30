'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { CVStatus, Priority } from '@prisma/client'
import { 
  UserCheck, 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  ArrowLeft,
  X,
  AlertTriangle,
  Eye
} from 'lucide-react'

interface Booking {
  id: number
  cvId: number
  identityNumber: string
  bookedAt: string
  notes?: string
  status: string
  cv: {
    id: number
    fullName: string
    fullNameArabic?: string
    referenceCode?: string
    nationality?: string
    position?: string
    profileImage?: string
    status: string
    email?: string
    phone?: string
    priority: Priority
  }
  bookedBy: {
    id: number
    name: string
    email: string
  }
}

export default function BookedCVsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // حالة مودال التعاقد
  const [showContractModal, setShowContractModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [contractIdentityNumber, setContractIdentityNumber] = useState('')
  const [isCreatingContract, setIsCreatingContract] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBookings(data || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      } else {
        toast.error('فشل في تحميل الحجوزات')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setIsLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.cv.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.cv.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.cv.phone?.includes(searchTerm) ||
        booking.cv.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.identityNumber.includes(searchTerm)
      )
    }

    setFilteredBookings(filtered)
  }

  // فتح مودال التعاقد
  const openContractModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setContractIdentityNumber(booking.identityNumber) // تعبئة رقم الهوية من الحجز
    setShowContractModal(true)
  }

  // إغلاق مودال التعاقد
  const closeContractModal = () => {
    setShowContractModal(false)
    setSelectedBooking(null)
    setContractIdentityNumber('')
    setIsCreatingContract(false)
  }

  // تأكيد إنشاء التعاقد
  const confirmCreateContract = async () => {
    if (!selectedBooking || !contractIdentityNumber.trim()) {
      toast.error('يرجى إدخال رقم الهوية')
      return
    }

    setIsCreatingContract(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/bookings/${selectedBooking.id}/contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          identityNumber: contractIdentityNumber.trim(),
          contractDate: new Date().toISOString(),
          notes: null
        })
      })

      if (response.ok) {
        toast.success('تم إنشاء التعاقد بنجاح')
        closeContractModal()
        fetchBookings() // تحديث قائمة الحجوزات
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إنشاء التعاقد')
      }
    } catch (error) {
      console.error('Error creating contract:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في إنشاء التعاقد')
    } finally {
      setIsCreatingContract(false)
    }
  }

  const handleStatusChange = async (cvId: string, newStatus: CVStatus) => {
    try {
      const response = await fetch(`/api/cvs/${cvId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('تم تحديث الحالة بنجاح')
        fetchBookings() // Refresh the list
      } else {
        toast.error('فشل في تحديث الحالة')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الحالة')
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return 'bg-gray-100 text-gray-800'
      case Priority.MEDIUM:
        return 'bg-blue-100 text-blue-800'
      case Priority.HIGH:
        return 'bg-orange-100 text-orange-800'
      case Priority.URGENT:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return 'منخفضة'
      case Priority.MEDIUM:
        return 'متوسطة'
      case Priority.HIGH:
        return 'عالية'
      case Priority.URGENT:
        return 'عاجلة'
      default:
        return priority
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="ml-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <UserCheck className="h-8 w-8 text-yellow-600 ml-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">السير الذاتية المحجوزة</h1>
                <p className="text-sm text-gray-600">المرشحون الذين تم حجزهم للمقابلات</p>
              </div>
            </div>
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
              <span className="font-medium">{filteredBookings.length} حجز نشط</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="البحث في السير الذاتية المحجوزة..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir="rtl"
            />
          </div>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{booking.cv.fullName}</h3>
                    {booking.cv.fullNameArabic && (
                      <p className="text-sm text-gray-500 mb-1">{booking.cv.fullNameArabic}</p>
                    )}
                    {booking.cv.position && (
                      <p className="text-sm text-gray-600 mb-2">{booking.cv.position}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(booking.cv.priority)}`}>
                    {getPriorityText(booking.cv.priority)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 ml-2" />
                    رقم الهوية: {booking.identityNumber}
                  </div>
                  {booking.cv.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 ml-2" />
                      {booking.cv.email}
                    </div>
                  )}
                  {booking.cv.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 ml-2" />
                      {booking.cv.phone}
                    </div>
                  )}
                  {booking.notes && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 ml-2" />
                      ملاحظات: {booking.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/cv/${booking.cv.id}`)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      title="عرض/تعديل"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                      title="تصدير PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => openContractModal(booking)}
                    className="inline-flex items-center px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-3 w-3 ml-1" />
                    تعاقد
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  تم الحجز: {new Date(booking.bookedAt).toLocaleDateString('ar-SA')} بواسطة {booking.bookedBy.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد سير ذاتية محجوزة</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لم يتم حجز أي مرشحين بعد'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                العودة للوحة التحكم
              </button>
            </div>
          </div>
        )}
      </main>

      {/* مودال تأكيد التعاقد */}
      {showContractModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">تأكيد التعاقد</h3>
              <button
                onClick={closeContractModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isCreatingContract}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">معلومات السيرة الذاتية:</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-medium">الاسم:</span> {selectedBooking.cv.fullName}</p>
                  <p><span className="font-medium">الوظيفة:</span> {selectedBooking.cv.position}</p>
                  <p><span className="font-medium">الكود المرجعي:</span> {selectedBooking.cv.referenceCode}</p>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="identityNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهوية للتعاقد:
                </label>
                <input
                  type="text"
                  id="identityNumber"
                  value={contractIdentityNumber}
                  onChange={(e) => setContractIdentityNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="أدخل رقم الهوية"
                  disabled={isCreatingContract}
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">
                  رقم الهوية المحفوظ من الحجز: {selectedBooking.identityNumber}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>تنبيه:</strong> عند التأكيد سيتم:
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• إنشاء تعاقد جديد برقم الهوية المحدد</li>
                  <li>• تحويل حالة السيرة الذاتية إلى "متعاقد"</li>
                  <li>• حذف الحجز الحالي</li>
                  <li>• حذف أي حجوزات أخرى لنفس السيرة الذاتية</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeContractModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                disabled={isCreatingContract}
              >
                إلغاء
              </button>
              <button
                onClick={confirmCreateContract}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                disabled={isCreatingContract || !contractIdentityNumber.trim()}
              >
                {isCreatingContract ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري التعاقد...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    تأكيد التعاقد
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
