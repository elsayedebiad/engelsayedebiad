'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Briefcase, 
  Search, 
  Eye, 
  X, 
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Trash2,
  RefreshCw,
  Edit,
  IdCard
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

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

interface Contract {
  id: number
  cvId: number
  identityNumber: string
  contractStartDate: string
  contractEndDate?: string | null
  createdAt: string
  updatedAt: string
  cv: {
    id: number
    fullName: string
    fullNameArabic?: string
    referenceCode?: string
    nationality?: string
    position?: string
    profileImage?: string
    status: string
  }
}

export default function ContractsPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // حالات تعديل رقم الهوية
  const [showEditIdentityModal, setShowEditIdentityModal] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [newIdentityNumber, setNewIdentityNumber] = useState('')
  const [isUpdatingIdentity, setIsUpdatingIdentity] = useState(false)

  // جلب التعاقدات من قاعدة البيانات
  const fetchContracts = async () => {
    setIsLoading(true)
    try {
      console.log('🔍 جلب التعاقدات من قاعدة البيانات...')
      const response = await fetch('/api/contracts')
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ تم جلب ${data.length} تعاقد`)
        setContracts(data || [])
        setFilteredContracts(data || [])
        
        if (data.length > 0) {
          toast.success(`تم تحميل ${data.length} تعاقد من قاعدة البيانات`)
        }
      } else {
        const errorData = await response.json()
        console.error('❌ خطأ في جلب التعاقدات:', errorData)
        toast.error(`فشل في تحميل التعاقدات: ${errorData.error || 'خطأ غير معروف'}`)
      }
    } catch (error) {
      console.error('❌ خطأ في الشبكة:', error)
      toast.error('حدث خطأ أثناء الاتصال بقاعدة البيانات')
    } finally {
      setIsLoading(false)
    }
  }

  // تحميل التعاقدات عند بدء الصفحة
  useEffect(() => {
    fetchContracts()
  }, [])

  // فلترة التعاقدات حسب البحث
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredContracts(contracts)
    } else {
      const filtered = contracts.filter(contract =>
        contract.cv.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.identityNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contract.cv.referenceCode && contract.cv.referenceCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contract.cv.nationality && contract.cv.nationality.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredContracts(filtered)
    }
  }, [searchTerm, contracts])

  // تنسيق التاريخ والوقت (12 ساعة)
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const timeFormatted = format(date, 'hh:mm a')
      // تحويل AM/PM للعربية
      const timeArabic = timeFormatted
        .replace('AM', 'ص')
        .replace('PM', 'م')
      
      return {
        date: format(date, 'dd/MM/yyyy', { locale: ar }),
        time: timeArabic
      }
    } catch (error) {
      return { date: 'غير محدد', time: '' }
    }
  }

  // فتح مودال الحذف
  const openDeleteModal = (contract: Contract) => {
    setSelectedContract(contract)
    setShowDeleteModal(true)
  }

  // إغلاق مودال الحذف
  const closeDeleteModal = () => {
    setSelectedContract(null)
    setShowDeleteModal(false)
    setIsDeleting(false)
  }

  // تأكيد حذف التعاقد
  const confirmDeleteContract = async () => {
    if (!selectedContract) return

    setIsDeleting(true)
    
    try {
      console.log('🗑️ حذف التعاقد:', selectedContract.id)
      
      const response = await fetch(`/api/contracts?id=${selectedContract.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('تم حذف التعاقد بنجاح. السيرة الذاتية متاحة الآن للحجز.')
        closeDeleteModal()
        fetchContracts() // إعادة تحميل التعاقدات
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حذف التعاقد')
      }
    } catch (error) {
      console.error('❌ خطأ في حذف التعاقد:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف التعاقد')
    } finally {
      setIsDeleting(false)
    }
  }

  // فتح مودال تعديل رقم الهوية
  const openEditIdentityModal = (contract: Contract) => {
    setEditingContract(contract)
    setNewIdentityNumber(contract.identityNumber)
    setShowEditIdentityModal(true)
  }

  // إغلاق مودال تعديل رقم الهوية
  const closeEditIdentityModal = () => {
    setEditingContract(null)
    setNewIdentityNumber('')
    setShowEditIdentityModal(false)
    setIsUpdatingIdentity(false)
  }

  // تأكيد تعديل رقم الهوية
  const confirmUpdateIdentity = async () => {
    if (!editingContract || !newIdentityNumber.trim()) {
      toast.error('يرجى إدخال رقم الهوية الجديد')
      return
    }

    if (newIdentityNumber.length < 10) {
      toast.error('رقم الهوية يجب أن يكون 10 أرقام على الأقل')
      return
    }

    setIsUpdatingIdentity(true)

    try {
      const response = await fetch(`/api/contracts/${editingContract.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identityNumber: newIdentityNumber.trim()
        })
      })

      if (response.ok) {
        toast.success('تم تحديث رقم الهوية بنجاح')
        closeEditIdentityModal()
        fetchContracts() // إعادة تحميل التعاقدات
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في تحديث رقم الهوية')
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث رقم الهوية:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث رقم الهوية')
    } finally {
      setIsUpdatingIdentity(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        {() => (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل التعاقدات من قاعدة البيانات...</p>
            </div>
          </div>
        )}
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {() => (
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-indigo-600 ml-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">إدارة التعاقدات</h1>
                <p className="text-gray-600">عرض وإدارة جميع التعاقدات من قاعدة البيانات</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchContracts}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
              <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                <span className="text-indigo-600 font-semibold">
                  {filteredContracts.length} تعاقد
                </span>
              </div>
            </div>
          </div>

          {/* شريط البحث */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث بالاسم أو رقم الهوية أو الكود المرجعي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* جدول التعاقدات */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الهوية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الجنسية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الوظيفة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ وقت التعاقد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ProfileImage 
                          src={contract.cv.profileImage} 
                          alt={contract.cv.fullName}
                          size="sm"
                        />
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contract.cv.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contract.cv.referenceCode || 'بدون كود'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {contract.identityNumber || 'غير متوفر'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.cv.nationality || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.cv.position || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 space-y-2 border border-gray-200">
                        <div className="flex items-center text-gray-800">
                          <div className="bg-indigo-100 rounded-full p-1 ml-2">
                            <Calendar className="h-3 w-3 text-indigo-600" />
                          </div>
                          <span className="font-semibold text-xs">
                            {formatDateTime(contract.contractStartDate || contract.createdAt).date}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="bg-green-100 rounded-full p-1 ml-2">
                            <Clock className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-xs text-gray-600">
                            {formatDateTime(contract.contractStartDate || contract.createdAt).time}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-300">
                          تاريخ التعاقد (12 ساعة)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => router.push(`/dashboard/cv/${contract.cv.id}/alqaeid`)} 
                          className="text-gray-500 hover:text-indigo-600 transition-colors" 
                          title="عرض السيرة الذاتية"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openEditIdentityModal(contract)} 
                          className="text-gray-500 hover:text-blue-600 transition-colors" 
                          title="تعديل رقم الهوية"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(contract)} 
                          className="text-gray-500 hover:text-red-600 transition-colors" 
                          title="حذف التعاقد"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* رسالة عدم وجود تعاقدات */}
          {filteredContracts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد تعاقدات في قاعدة البيانات'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'جرّب البحث بكلمات أخرى.' : 'ابدأ بالتعاقد مع السير الذاتية من صفحة الحجوزات.'}
              </p>
              {!searchTerm && (
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/dashboard/bookings')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    اذهب لصفحة الحجوزات
                  </button>
                </div>
              )}
            </div>
          )}

          {/* مودال حذف التعاقد */}
          {showDeleteModal && selectedContract && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    تأكيد حذف التعاقد
                  </h3>
                  <button
                    onClick={closeDeleteModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isDeleting}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">معلومات التعاقد:</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><span className="font-medium">الاسم:</span> {selectedContract.cv.fullName}</p>
                      <p><span className="font-medium">رقم الهوية:</span> {selectedContract.identityNumber || 'غير محدد'}</p>
                      <p><span className="font-medium">الكود المرجعي:</span> {selectedContract.cv.referenceCode || 'غير محدد'}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>تحذير:</strong> عند حذف التعاقد سيتم:
                    </p>
                    <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                      <li>• حذف التعاقد نهائياً من قاعدة البيانات</li>
                      <li>• إرجاع السيرة الذاتية إلى حالة "جديد"</li>
                      <li>• إتاحة السيرة للحجز والتعاقد مرة أخرى</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeDeleteModal}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                    disabled={isDeleting}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmDeleteContract}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري الحذف...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        تأكيد الحذف
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* مودال تعديل رقم الهوية */}
          {showEditIdentityModal && editingContract && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <IdCard className="h-5 w-5 text-blue-600" />
                    تعديل رقم الهوية
                  </h3>
                  <button
                    onClick={closeEditIdentityModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isUpdatingIdentity}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">معلومات التعاقد:</h4>
                    <div className="flex items-start gap-3">
                      <ProfileImage 
                        src={editingContract.cv.profileImage} 
                        alt={editingContract.cv.fullName}
                        size="md"
                      />
                      <div className="flex-1 text-sm text-gray-700 space-y-1">
                        <p><span className="font-medium">الاسم:</span> {editingContract.cv.fullName}</p>
                        <p><span className="font-medium">رقم الهوية الحالي:</span> {editingContract.identityNumber}</p>
                        {editingContract.cv.referenceCode && (
                          <p><span className="font-medium">الكود المرجعي:</span> {editingContract.cv.referenceCode}</p>
                        )}
                        {editingContract.cv.nationality && (
                          <p><span className="font-medium">الجنسية:</span> {editingContract.cv.nationality}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="newIdentityNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهوية الجديد *
                    </label>
                    <input
                      type="text"
                      id="newIdentityNumber"
                      value={newIdentityNumber}
                      onChange={(e) => setNewIdentityNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل رقم الهوية الجديد"
                      disabled={isUpdatingIdentity}
                      dir="ltr"
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      يجب أن يكون رقم الهوية 10 أرقام على الأقل
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>تنبيه:</strong> سيتم تحديث رقم الهوية في سجل التعاقد فقط.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeEditIdentityModal}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                    disabled={isUpdatingIdentity}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmUpdateIdentity}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    disabled={isUpdatingIdentity || !newIdentityNumber.trim()}
                  >
                    {isUpdatingIdentity ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري التحديث...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        تأكيد التعديل
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
