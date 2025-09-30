'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { CVStatus } from '@prisma/client'
import { 
  Bookmark, 
  User, 
  Calendar, 
  Eye, 
  Search, 
  Filter,
  ArrowLeft,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  UserCheck,
  AlertCircle,
  FileSignature,
  CheckCircle,
  X,
  IdCard,
  MessageSquare
} from 'lucide-react'
import DashboardLayout from '../../../components/DashboardLayout'
import CountryFlag from '../../../components/CountryFlag'

// Component لعرض صورة الملف الشخصي مع معالجة الأخطاء
const ProfileImage = ({ 
  src, 
  alt, 
  size = 'sm' 
}: { 
  src?: string; 
  alt: string; 
  size?: 'sm' | 'md' | 'lg' 
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  }

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  if (!src || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-blue-300`}>
        <User className={`${iconSizes[size]} text-blue-600`} />
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {imageLoading && (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse flex items-center justify-center border border-gray-300`}>
          <User className={`${iconSizes[size]} text-gray-400`} />
        </div>
      )}
      <img 
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        src={src} 
        alt={alt}
        loading="lazy"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true)
          setImageLoading(false)
        }}
      />
    </div>
  )
}

interface Booking {
  id: number
  identityNumber: string
  notes?: string
  bookedAt: string
  createdAt: string
  cv: {
    id: string
    fullName: string
    fullNameArabic?: string
    referenceCode?: string
    nationality?: string
    position?: string
    profileImage?: string
    status: CVStatus
  }
  bookedBy: {
    id: string
    name: string
    email: string
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [nationalityFilter, setNationalityFilter] = useState('')
  const router = useRouter()

  // حالات مودال التعاقد
  const [showContractModal, setShowContractModal] = useState(false)
  const [contractingBooking, setContractingBooking] = useState<Booking | null>(null)
  const [contractData, setContractData] = useState({
    identityNumber: '',
    contractStartDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [isCreatingContract, setIsCreatingContract] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, nationalityFilter])

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
        setBookings(data)
      } else {
        toast.error('فشل في تحميل الحجوزات')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('حدث خطأ أثناء تحميل الحجوزات')
    } finally {
      setIsLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    // فلترة بالبحث
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.cv.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.cv.fullNameArabic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.identityNumber.includes(searchTerm) ||
        booking.cv.referenceCode?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // فلترة بالجنسية
    if (nationalityFilter) {
      filtered = filtered.filter(booking => booking.cv.nationality === nationalityFilter)
    }

    setFilteredBookings(filtered)
  }

  const getUniqueNationalities = () => {
    const nationalities = bookings
      .map(booking => booking.cv.nationality)
      .filter(Boolean)
      .filter((nationality, index, array) => array.indexOf(nationality) === index)
      .sort()
    return nationalities
  }

  const viewCV = (cvId: string) => {
    router.push(`/dashboard/cv/${cvId}`)
  }

  // فتح مودال التعاقد
  const openContractModal = (booking: Booking) => {
    setContractingBooking(booking)
    setContractData({
      identityNumber: booking.identityNumber,
      contractStartDate: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setShowContractModal(true)
  }

  // إغلاق مودال التعاقد
  const closeContractModal = () => {
    setContractingBooking(null)
    setContractData({
      identityNumber: '',
      contractStartDate: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setShowContractModal(false)
    setIsCreatingContract(false)
  }

  // تأكيد التعاقد
  const confirmContract = async () => {
    if (!contractingBooking || !contractData.identityNumber.trim()) {
      toast.error('يرجى إدخال رقم الهوية')
      return
    }

    if (contractData.identityNumber.length < 10) {
      toast.error('رقم الهوية يجب أن يكون 10 أرقام على الأقل')
      return
    }

    setIsCreatingContract(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cvId: contractingBooking.cv.id,
          identityNumber: contractData.identityNumber.trim(),
          contractDate: contractData.contractStartDate,
          notes: contractData.notes.trim() || null
        })
      })

      if (response.ok) {
        toast.success('تم إنشاء التعاقد بنجاح')
        closeContractModal()
        fetchBookings() // تحديث قائمة الحجوزات
        router.push('/dashboard/contracts') // الانتقال إلى صفحة التعاقدات
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إنشاء التعاقد')
      }
    } catch (error) {
      console.error('Error creating contract:', error)
      toast.error('حدث خطأ أثناء إنشاء التعاقد')
    } finally {
      setIsCreatingContract(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      {(user) => (
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Bookmark className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">الحجوزات</h1>
                  <p className="text-gray-600">إدارة حجوزات السير الذاتية</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              إجمالي الحجوزات: {bookings.length}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="البحث في الحجوزات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Nationality Filter */}
              <div className="sm:w-48">
                <select
                  value={nationalityFilter}
                  onChange={(e) => setNationalityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">جميع الجنسيات</option>
                  {getUniqueNationalities().map(nationality => (
                    <option key={nationality} value={nationality}>
                      {nationality}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {bookings.length === 0 ? 'لا توجد حجوزات' : 'لا توجد نتائج'}
              </h3>
              <p className="text-gray-500">
                {bookings.length === 0 
                  ? 'لم يتم إجراء أي حجوزات بعد'
                  : 'جرب تغيير معايير البحث'
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        السيرة الذاتية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الهوية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ الحجز
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        محجوز بواسطة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ملاحظات
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <ProfileImage 
                              src={booking.cv.profileImage} 
                              alt={booking.cv.fullName}
                              size="sm"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">
                                {booking.cv.fullName}
                              </div>
                              {booking.cv.fullNameArabic && (
                                <div className="text-sm text-gray-500 truncate">
                                  {booking.cv.fullNameArabic}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                {booking.cv.nationality && (
                                  <>
                                    <CountryFlag nationality={booking.cv.nationality} />
                                    <span className="text-xs text-gray-500">
                                      {booking.cv.nationality}
                                    </span>
                                  </>
                                )}
                                {booking.cv.referenceCode && (
                                  <span className="text-xs text-gray-500">
                                    #{booking.cv.referenceCode}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {booking.identityNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div className="text-sm text-gray-900">
                              {new Date(booking.bookedAt).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(booking.bookedAt).toLocaleTimeString('ar-SA', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {booking.bookedBy.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.bookedBy.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {booking.notes ? (
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {booking.notes}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">لا توجد ملاحظات</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewCV(booking.cv.id)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="عرض السيرة الذاتية"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openContractModal(booking)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              title="إنشاء تعاقد"
                            >
                              <FileSignature className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {bookings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Bookmark className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {bookings.length}
                    </div>
                    <div className="text-sm text-gray-500">إجمالي الحجوزات</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {bookings.filter(b => 
                        new Date(b.bookedAt).toDateString() === new Date().toDateString()
                      ).length}
                    </div>
                    <div className="text-sm text-gray-500">حجوزات اليوم</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {getUniqueNationalities().length}
                    </div>
                    <div className="text-sm text-gray-500">جنسيات مختلفة</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* مودال إنشاء التعاقد */}
          {showContractModal && contractingBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-green-600" />
                    إنشاء تعاقد
                  </h3>
                  <button
                    onClick={closeContractModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isCreatingContract}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">معلومات الحجز:</h4>
                    <div className="flex items-start gap-3">
                      <ProfileImage 
                        src={contractingBooking.cv.profileImage} 
                        alt={contractingBooking.cv.fullName}
                        size="md"
                      />
                      <div className="flex-1 text-sm text-gray-700 space-y-1">
                        <p><span className="font-medium">الاسم:</span> {contractingBooking.cv.fullName}</p>
                        <p><span className="font-medium">رقم الهوية المحجوز:</span> {contractingBooking.identityNumber}</p>
                        {contractingBooking.cv.referenceCode && (
                          <p><span className="font-medium">الكود المرجعي:</span> {contractingBooking.cv.referenceCode}</p>
                        )}
                        {contractingBooking.cv.nationality && (
                          <p><span className="font-medium">الجنسية:</span> {contractingBooking.cv.nationality}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* رقم الهوية */}
                    <div>
                      <label htmlFor="contractIdentityNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        <IdCard className="h-4 w-4 inline ml-2" />
                        رقم الهوية للتعاقد *
                      </label>
                      <input
                        type="text"
                        id="contractIdentityNumber"
                        value={contractData.identityNumber}
                        onChange={(e) => setContractData({ ...contractData, identityNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="أدخل رقم الهوية (يمكن تأكيد أو تغيير الرقم)"
                        disabled={isCreatingContract}
                        dir="ltr"
                        maxLength={20}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        يمكنك تأكيد رقم الهوية المحجوز أو تغييره إذا لزم الأمر
                      </p>
                    </div>

                    {/* تاريخ بداية التعاقد */}
                    <div>
                      <label htmlFor="contractStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 inline ml-2" />
                        تاريخ بداية التعاقد *
                      </label>
                      <input
                        type="date"
                        id="contractStartDate"
                        value={contractData.contractStartDate}
                        onChange={(e) => setContractData({ ...contractData, contractStartDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isCreatingContract}
                      />
                    </div>

                    {/* ملاحظات */}
                    <div>
                      <label htmlFor="contractNotes" className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="h-4 w-4 inline ml-2" />
                        ملاحظات التعاقد (اختياري)
                      </label>
                      <textarea
                        id="contractNotes"
                        value={contractData.notes}
                        onChange={(e) => setContractData({ ...contractData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="أدخل أي ملاحظات خاصة بالتعاقد..."
                        rows={3}
                        disabled={isCreatingContract}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>تنبيه:</strong> عند إنشاء التعاقد سيتم:
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• تحويل حالة السيرة الذاتية إلى "متعاقد عليها"</li>
                      <li>• إنشاء سجل تعاقد جديد</li>
                      <li>• الانتقال إلى صفحة التعاقدات</li>
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
                    onClick={confirmContract}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    disabled={isCreatingContract || !contractData.identityNumber.trim()}
                  >
                    {isCreatingContract ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري إنشاء التعاقد...
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
      )}
    </DashboardLayout>
  )
}
