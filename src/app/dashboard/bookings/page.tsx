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
  AlertCircle
} from 'lucide-react'
import DashboardLayout from '../../../components/DashboardLayout'
import CountryFlag from '../../../components/CountryFlag'

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
                            {booking.cv.profileImage ? (
                              <img
                                src={booking.cv.profileImage}
                                alt={booking.cv.fullName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
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
                          <button
                            onClick={() => viewCV(booking.cv.id)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="عرض السيرة الذاتية"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
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
        </div>
      )}
    </DashboardLayout>
  )
}
