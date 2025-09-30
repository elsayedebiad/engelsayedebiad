
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { CVStatus } from '@prisma/client'
import {
  Briefcase,
  Download,
  Edit,
  Search,
  Trash2,
  Undo2,
  User,
  Clock,
  Calendar,
  X,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { ar } from 'date-fns/locale'
import DashboardLayout from '../../../components/DashboardLayout'
import CountryFlag from '../../../components/CountryFlag'
import { CVActivityLogger } from '../../../lib/activity-logger'
import { getCountryInfo } from '../../../lib/country-utils'

interface CV {
  id: string
  fullName: string
  position?: string
  referenceCode?: string
  nationality?: string
  contract?: { identityNumber: string } | null
  contractDate?: string
  updatedAt?: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<CV[]>([])
  const [filteredContracts, setFilteredContracts] = useState<CV[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedContract, setSelectedContract] = useState<CV | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()

  // دالة لتنسيق التاريخ والوقت بتوقيت مصر الصحيح
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return { date: 'غير محدد', time: 'غير محدد' }
    
    try {
      const timeZone = 'Africa/Cairo' // توقيت مصر
      const date = new Date(dateString)
      
      if (isNaN(date.getTime())) {
        return { date: 'تاريخ غير صالح', time: 'وقت غير صالح' }
      }

      // تنسيق التاريخ الميلادي
      const formattedDate = format(date, 'dd/MM/yyyy', { locale: ar })
      
      // تنسيق الوقت بالعربية مع AM/PM
      const period = format(date, 'a', { locale: ar })
      const formattedTime = `${format(date, 'hh:mm', { locale: ar })} ${period === 'ص' ? 'صباحاً' : 'مساءً'}`
      
      return { date: formattedDate, time: formattedTime }
    } catch (error) {
      console.error('Error formatting date:', error)
      return { date: 'خطأ في التاريخ', time: 'خطأ في الوقت' }
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  useEffect(() => {
    let filtered = contracts
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase()
      filtered = contracts.filter(
        (cv) =>
          cv.fullName.toLowerCase().includes(lowercasedTerm) ||
          (cv.contract?.identityNumber &&
            cv.contract.identityNumber.toLowerCase().includes(lowercasedTerm))
      )
    }
    setFilteredContracts(filtered)
  }, [searchTerm, contracts])

  const fetchContracts = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await fetch('/api/cvs?status=HIRED', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        // إضافة تواريخ ثابتة للعقود إذا لم تكن موجودة (بتوقيت مصر الصحيح)
        const contractsWithDates = (data.cvs || []).map((cv: CV) => {
          if (!cv.contractDate) {
            return {
              ...cv,
              contractDate: null
            }
          }
          
          // تحويل التاريخ إلى كائن Date
          const contractDate = new Date(cv.contractDate)
          return {
            ...cv,
            contractDate: contractDate.toISOString()
          }
        })
        setContracts(contractsWithDates)
      } else {
        toast.error('فشل في تحميل العقود')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setIsLoading(false)
    }
  }

  // فتح مودال إلغاء التعاقد
  const openCancelModal = (contract: CV) => {
    setSelectedContract(contract)
    setShowCancelModal(true)
  }

  // إغلاق مودال إلغاء التعاقد
  const closeCancelModal = () => {
    setShowCancelModal(false)
    setSelectedContract(null)
    setIsCancelling(false)
  }

  // تأكيد إلغاء التعاقد
  const confirmCancelContract = async () => {
    if (!selectedContract) return

    setIsCancelling(true)
    
    try {
      const token = localStorage.getItem('token')
      
      // البحث عن التعاقد أولاً
      const contractsResponse = await fetch(`/api/contracts?cvId=${selectedContract.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!contractsResponse.ok) {
        throw new Error('فشل في العثور على التعاقد')
      }
      
      const contractsData = await contractsResponse.json()
      const contract = contractsData.find((c: any) => c.cvId === parseInt(selectedContract.id))
      
      if (!contract) {
        throw new Error('التعاقد غير موجود')
      }
      
      // إلغاء التعاقد
      const response = await fetch(`/api/contracts/${contract.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        toast.success('تم إلغاء التعاقد بنجاح. السيرة الذاتية متاحة الآن للحجز.')
        closeCancelModal()
        fetchContracts()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إلغاء التعاقد')
      }
    } catch (error) {
      console.error('Error cancelling contract:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء إلغاء التعاقد')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleReturnContract = async (cvId: string) => {
    const cv = contracts.find(c => c.id === cvId)
    if (!confirm(`هل أنت متأكد من استرجاع عقد ${cv?.fullName}؟`)) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/cvs/${cvId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: CVStatus.RETURNED }),
      })
      if (response.ok) {
        // تسجيل النشاط
        if (cv) {
          CVActivityLogger.statusChanged(cvId, cv.fullName, 'متعاقد', 'معاد')
        }
        
        toast.success('تم استرجاع العقد بنجاح. ستظهر السيرة الآن في الصفحة الرئيسية.')
        fetchContracts()
      } else {
        toast.error('فشل في استرجاع العقد')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء استرجاع العقد')
    }
  }

  const handleDelete = async (cvIds: string[]) => {
    if (!confirm(`هل أنت متأكد من حذف ${cvIds.length} عقد (عقود)؟`)) return

    const apiEndpoint =
      cvIds.length === 1 ? `/api/cvs/${cvIds[0]}` : '/api/cvs/bulk'
    const method = cvIds.length === 1 ? 'DELETE' : 'POST'
    const body =
      cvIds.length > 1 ? JSON.stringify({ cvIds, action: 'delete' }) : null

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(apiEndpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      })
      if (response.ok) {
        toast.success('تم الحذف بنجاح')
        setSelectedContracts([])
        fetchContracts()
      } else {
        toast.error('فشل في عملية الحذف')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

  const toggleSelection = (cvId: string) => {
    setSelectedContracts((prev) =>
      prev.includes(cvId) ? prev.filter((id) => id !== cvId) : [...prev, cvId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedContracts.length === filteredContracts.length) {
      setSelectedContracts([])
    } else {
      setSelectedContracts(filteredContracts.map((cv) => cv.id))
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
    <DashboardLayout>
      {(user) => (
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-indigo-600 ml-3" />
              <h1 className="text-2xl font-bold text-gray-900\">العقود المبرمة</h1>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث بالاسم أو رقم الهوية..."
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                dir="rtl"
              />
            </div>

            {selectedContracts.length > 0 && user?.role === 'ADMIN' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
                <span className="font-medium text-red-800 text-sm">
                  {selectedContracts.length} عقد محدد
                </span>
                <button
                  onClick={() => handleDelete(selectedContracts)}
                  className="px-4 py-2 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  حذف المحدد
                </button>
              </div>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {user?.role === 'ADMIN' && (
                    <th className="px-6 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={
                          filteredContracts.length > 0 &&
                          selectedContracts.length === filteredContracts.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العامل/ة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الهوية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوظيفة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الجنسية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ ووقت العقد</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((cv) => (
                  <tr
                    key={cv.id}
                    className={`hover:bg-gray-50 ${
                      selectedContracts.includes(cv.id) ? 'bg-indigo-50' : ''
                    }`}
                  >
                    {user?.role === 'ADMIN' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          checked={selectedContracts.includes(cv.id)}
                          onChange={() => toggleSelection(cv.id)}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center ml-3">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <div
                            className="text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors duration-200 hover:underline"
                            onClick={() => {
                              CVActivityLogger.viewed(cv.id, cv.fullName)
                              router.push(`/dashboard/cv/${cv.id}/alqaeid`)
                            }}
                            title="اضغط لعرض السيرة الذاتية"
                          >
                            {cv.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cv.referenceCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cv.contract?.identityNumber || 'غير متوفر'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cv.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <CountryFlag nationality={cv.nationality || ''} size="md" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 space-y-2 border border-gray-200">
                        <div className="flex items-center text-gray-800">
                          <div className="bg-indigo-100 rounded-full p-1 ml-2">
                            <Calendar className="h-3 w-3 text-indigo-600" />
                          </div>
                          <span className="font-semibold text-xs">{formatDateTime(cv.contractDate || cv.updatedAt).date}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="bg-green-100 rounded-full p-1 ml-2">
                            <Clock className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-xs font-medium">{formatDateTime(cv.contractDate || cv.updatedAt).time}</span>
                        </div>
                        <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-300">
                          تاريخ التعاقد (توقيت مصر)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button onClick={() => router.push(`/dashboard/cv/${cv.id}`)} className="text-gray-500 hover:text-indigo-600" title="عرض التفاصيل"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => window.open(`/api/cvs/${cv.id}/export-alqaeid`, '_blank')} className="text-gray-500 hover:text-blue-600" title="تصدير العقد"><Download className="h-4 w-4" /></button>
                        {user?.role !== 'USER' && (
                          <button onClick={() => openCancelModal(cv)} className="text-gray-500 hover:text-red-600" title="إلغاء التعاقد"><X className="h-4 w-4" /></button>
                        )}
                        {user?.role !== 'USER' && (
                          <button onClick={() => handleReturnContract(cv.id)} className="text-gray-500 hover:text-orange-600" title="استرجاع العقد"><Undo2 className="h-4 w-4" /></button>
                        )}
                        {user?.role === 'ADMIN' && (
                          <button onClick={() => handleDelete([cv.id])} className="text-gray-500 hover:text-red-600" title="حذف العقد نهائياً"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredContracts.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد عقود حالياً'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'جرّب البحث بكلمات أخرى.' : 'ابدأ بالتعاقد مع السير الذاتية من الصفحة الرئيسية.'}
              </p>
            </div>
          )}

          {/* مودال إلغاء التعاقد */}
          {showCancelModal && selectedContract && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    تأكيد إلغاء التعاقد
                  </h3>
                  <button
                    onClick={closeCancelModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isCancelling}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">معلومات التعاقد:</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><span className="font-medium">الاسم:</span> {selectedContract.fullName}</p>
                      <p><span className="font-medium">رقم الهوية:</span> {selectedContract.contract?.identityNumber || 'غير محدد'}</p>
                      <p><span className="font-medium">الكود المرجعي:</span> {selectedContract.referenceCode}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>تحذير:</strong> عند إلغاء التعاقد سيتم:
                    </p>
                    <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                      <li>• حذف التعاقد نهائياً من النظام</li>
                      <li>• إرجاع السيرة الذاتية إلى حالة "جديد"</li>
                      <li>• إتاحة السيرة للحجز والتعاقد مرة أخرى</li>
                      <li>• تسجيل هذا الإجراء في سجل الأنشطة</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeCancelModal}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                    disabled={isCancelling}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmCancelContract}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري الإلغاء...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        تأكيد الإلغاء
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