'use client'

import { 
  TrendingUp, 
  Users, 
  UserCheck, 
  UserX, 
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

interface ImportStats {
  totalRows: number
  newRecords: number
  updatedRecords: number
  skippedRecords: number
  errorRecords: number
  processingTime?: number
  duplicateReasons?: { [key: string]: number }
}

interface ImportStatisticsProps {
  stats: ImportStats
  isVisible: boolean
}

export default function ImportStatistics({ stats, isVisible }: ImportStatisticsProps) {
  if (!isVisible) return null

  const successRate = ((stats.newRecords + stats.updatedRecords) / stats.totalRows) * 100
  const duplicateRate = (stats.updatedRecords / stats.totalRows) * 100
  const errorRate = (stats.errorRecords / stats.totalRows) * 100

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'غير محدد'
    if (seconds < 60) return `${seconds.toFixed(1)} ثانية`
    return `${Math.floor(seconds / 60)} دقيقة ${Math.floor(seconds % 60)} ثانية`
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">📊 إحصائيات الاستيراد</h3>
            <p className="text-indigo-100">تقرير مفصل عن عملية المعالجة</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Main Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Records */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-800">{stats.totalRows}</span>
            </div>
            <p className="text-blue-700 font-medium">إجمالي السجلات</p>
          </div>

          {/* New Records */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">{stats.newRecords}</span>
            </div>
            <p className="text-green-700 font-medium">سجلات جديدة</p>
          </div>

          {/* Updated Records */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-800">{stats.updatedRecords}</span>
            </div>
            <p className="text-yellow-700 font-medium">سجلات محدثة</p>
          </div>

          {/* Error Records */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-red-800">{stats.errorRecords}</span>
            </div>
            <p className="text-red-700 font-medium">سجلات خاطئة</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Success Rate */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <h4 className="font-semibold text-gray-900">معدل النجاح</h4>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getSuccessRateColor(successRate)}`}>
                {successRate.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    successRate >= 90 ? 'bg-green-500' : 
                    successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Duplicate Rate */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="w-6 h-6 text-blue-600" />
              <h4 className="font-semibold text-gray-900">معدل التكرار</h4>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {duplicateRate.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${duplicateRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Processing Time */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-purple-600" />
              <h4 className="font-semibold text-gray-900">وقت المعالجة</h4>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {formatTime(stats.processingTime)}
              </div>
              <p className="text-gray-600 text-sm">
                {stats.totalRows > 0 && stats.processingTime ? 
                  `~${(stats.processingTime / stats.totalRows).toFixed(2)} ثانية/سجل` : 
                  'متوسط السرعة'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Duplicate Reasons Breakdown */}
        {stats.duplicateReasons && Object.keys(stats.duplicateReasons).length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              أسباب التكرار
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stats.duplicateReasons).map(([reason, count]) => (
                <div key={reason} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                  <span className="text-gray-700">{reason}</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {count}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({((count / stats.updatedRecords) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-2">ملخص العملية</h4>
              <p className="text-green-800 leading-relaxed">
                تم معالجة <strong>{stats.totalRows}</strong> سجل بنجاح. 
                أضيف <strong>{stats.newRecords}</strong> سجل جديد، 
                وحُدث <strong>{stats.updatedRecords}</strong> سجل موجود، 
                وتُخطي <strong>{stats.skippedRecords}</strong> سجل، 
                مع <strong>{stats.errorRecords}</strong> خطأ في المعالجة.
                معدل النجاح الإجمالي: <strong className={getSuccessRateColor(successRate)}>
                  {successRate.toFixed(1)}%
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
