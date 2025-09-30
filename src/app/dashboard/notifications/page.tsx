'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import DashboardLayout from '../../../components/DashboardLayout'
import { 
  Bell, 
  BellRing,
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  RefreshCw,
  Calendar,
  User,
  FileText,
  Users,
  Settings,
  Upload,
  Download,
  BarChart3,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Notification {
  id: number
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  category: string
  data?: string
  isRead: boolean
  createdAt: string
  user: {
    id: number
    name: string
    email: string
  }
}

interface NotificationData {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  unreadCount: number
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [expandedNotification, setExpandedNotification] = useState<number | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [pagination.page, selectedCategory, selectedType])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedType) params.append('type', selectedType)

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: NotificationData = await response.json()
        setNotifications(data.notifications)
        setPagination(data.pagination)
        setUnreadCount(data.unreadCount)
      } else {
        toast.error('فشل في جلب الإشعارات')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب الإشعارات')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationAction = async (action: string, notificationId?: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, notificationId })
      })

      if (response.ok) {
        fetchNotifications()
        switch (action) {
          case 'markAsRead':
            toast.success('تم تحديد الإشعار كمقروء')
            break
          case 'markAllAsRead':
            toast.success('تم تحديد جميع الإشعارات كمقروءة')
            break
          case 'delete':
            toast.success('تم حذف الإشعار')
            break
        }
      } else {
        toast.error('فشل في تنفيذ العملية')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تنفيذ العملية')
    }
  }

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'import') return <Upload className="w-5 h-5" />
    if (category === 'cv') return <FileText className="w-5 h-5" />
    if (category === 'user') return <Users className="w-5 h-5" />
    if (category === 'contract') return <FileText className="w-5 h-5" />
    if (category === 'system') return <Settings className="w-5 h-5" />

    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5" />
      case 'WARNING': return <AlertTriangle className="w-5 h-5" />
      case 'ERROR': return <XCircle className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'text-green-600 bg-green-50 border-green-200'
      case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'ERROR': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getCategoryName = (category: string) => {
    const names = {
      'import': 'استيراد',
      'cv': 'السير الذاتية',
      'user': 'المستخدمين',
      'contract': 'العقود',
      'system': 'النظام'
    }
    return names[category as keyof typeof names] || category
  }

  const getTypeName = (type: string) => {
    const names = {
      'INFO': 'معلومات',
      'SUCCESS': 'نجاح',
      'WARNING': 'تحذير',
      'ERROR': 'خطأ'
    }
    return names[type as keyof typeof names] || type
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} يوم`
    
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const parseNotificationData = (dataString?: string) => {
    try {
      return dataString ? JSON.parse(dataString) : null
    } catch {
      return null
    }
  }

  const renderNotificationDetails = (notification: Notification) => {
    const data = parseNotificationData(notification.data)
    if (!data) return null

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3">تفاصيل إضافية:</h4>
        
        {notification.category === 'import' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-green-100 p-3 rounded-lg">
              <p className="text-green-800 font-medium">جديد</p>
              <p className="text-2xl font-bold text-green-900">{data.newRecords}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="text-blue-800 font-medium">محدث</p>
              <p className="text-2xl font-bold text-blue-900">{data.updatedRecords}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <p className="text-yellow-800 font-medium">متخطى</p>
              <p className="text-2xl font-bold text-yellow-900">{data.skippedRecords}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <p className="text-red-800 font-medium">خطأ</p>
              <p className="text-2xl font-bold text-red-900">{data.errorRecords}</p>
            </div>
            {data.successRate && (
              <div className="col-span-2 md:col-span-4 bg-indigo-100 p-3 rounded-lg">
                <p className="text-indigo-800 font-medium">معدل النجاح</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-indigo-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${data.successRate}%` }}
                    />
                  </div>
                  <span className="text-indigo-900 font-bold">{data.successRate}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {notification.category === 'cv' && data.cvId && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>رقم السيرة الذاتية:</strong> {data.cvId}
            </p>
            {data.oldStatus && data.newStatus && (
              <p className="text-sm text-blue-700 mt-1">
                <strong>تغيير الحالة:</strong> {data.oldStatus} ← {data.newStatus}
              </p>
            )}
          </div>
        )}

        {data.executedBy && (
          <div className="mt-3 text-sm text-gray-600">
            <strong>تم بواسطة:</strong> {data.executedBy.name}
          </div>
        )}
      </div>
    )
  }

  return (
    <DashboardLayout>
      {(user) => (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <Bell className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    🔔 مركز الإشعارات
                  </h1>
                  <p className="text-gray-600">
                    جميع الأنشطة والتحديثات في النظام
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {unreadCount} غير مقروء
                  </div>
                )}
                <button
                  onClick={() => handleNotificationAction('markAllAsRead')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={unreadCount === 0}
                >
                  <CheckCircle className="w-4 h-4" />
                  تحديد الكل كمقروء
                </button>
                <button
                  onClick={fetchNotifications}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  تحديث
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تصفية حسب الفئة
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">جميع الفئات</option>
                  <option value="import">استيراد</option>
                  <option value="cv">السير الذاتية</option>
                  <option value="user">المستخدمين</option>
                  <option value="contract">العقود</option>
                  <option value="system">النظام</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تصفية حسب النوع
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">جميع الأنواع</option>
                  <option value="INFO">معلومات</option>
                  <option value="SUCCESS">نجاح</option>
                  <option value="WARNING">تحذير</option>
                  <option value="ERROR">خطأ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100">
            {isLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">جاري تحميل الإشعارات...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600">لا توجد إشعارات</p>
                <p className="text-gray-500">ستظهر جميع أنشطة النظام هنا</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                            
                            <p className="text-gray-700 mb-3">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Filter className="w-3 h-3" />
                                {getCategoryName(notification.category)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(notification.createdAt)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.type === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                notification.type === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                notification.type === 'ERROR' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {getTypeName(notification.type)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedNotification(
                                expandedNotification === notification.id ? null : notification.id
                              )}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              title="عرض التفاصيل"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                            
                            {!notification.isRead && (
                              <button
                                onClick={() => handleNotificationAction('markAsRead', notification.id)}
                                className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                                title="تحديد كمقروء"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleNotificationAction('delete', notification.id)}
                              className="p-2 text-red-400 hover:text-red-600 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {expandedNotification === notification.id && renderNotificationDetails(notification)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    عرض {((pagination.page - 1) * pagination.limit) + 1} إلى {Math.min(pagination.page * pagination.limit, pagination.total)} من {pagination.total} إشعار
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
                      {pagination.page} / {pagination.pages}
                    </span>
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
