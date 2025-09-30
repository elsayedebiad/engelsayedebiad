'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  Eye,
  Download,
  Play,
  BarChart3,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react'
import SmartImportProgress from '../../../components/SmartImportProgress'
import ImportStatistics from '../../../components/ImportStatistics'

interface ProcessedCV {
  rowNumber: number
  fullName: string
  fullNameArabic?: string
  email?: string
  phone?: string
  referenceCode?: string
  isUpdate: boolean
  existingId?: number
  duplicateReason?: string
  [key: string]: any
}

interface ImportResult {
  totalRows: number
  newRecords: number
  updatedRecords: number
  skippedRecords: number
  errorRecords: number
  details: {
    newCVs: ProcessedCV[]
    updatedCVs: ProcessedCV[]
    skippedCVs: ProcessedCV[]
    errorCVs: ProcessedCV[]
  }
  summary: string
}

export default function SmartImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ImportResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [activeTab, setActiveTab] = useState<'new' | 'update' | 'skip' | 'error'>('new')
  const [isExecuting, setIsExecuting] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [progressSteps, setProgressSteps] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState('')
  const [showStatistics, setShowStatistics] = useState(false)
  const [processingStartTime, setProcessingStartTime] = useState<number>(0)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setAnalysisResult(null)
      setShowDetails(false)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setAnalysisResult(null)
      setShowDetails(false)
    }
  }

  const analyzeFile = async () => {
    if (!selectedFile) {
      toast.error('يرجى اختيار ملف أولاً')
      return
    }

    // Initialize progress
    const steps = [
      { id: 'upload', label: 'رفع الملف', status: 'pending' },
      { id: 'parse', label: 'تحليل البيانات', status: 'pending' },
      { id: 'validate', label: 'التحقق من البيانات', status: 'pending' },
      { id: 'duplicates', label: 'فحص التكرارات', status: 'pending' },
      { id: 'complete', label: 'إنهاء التحليل', status: 'pending' }
    ]
    
    setProgressSteps(steps)
    setShowProgress(true)
    setProcessingStartTime(Date.now())
    setIsLoading(true)

    try {
      // Step 1: Upload
      setCurrentStep('upload')
      setProgressSteps(prev => prev.map(s => 
        s.id === 'upload' ? { ...s, status: 'processing' } : s
      ))
      
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate upload time
      
      setProgressSteps(prev => prev.map(s => 
        s.id === 'upload' ? { ...s, status: 'completed' } : s
      ))

      // Step 2: Parse
      setCurrentStep('parse')
      setProgressSteps(prev => prev.map(s => 
        s.id === 'parse' ? { ...s, status: 'processing' } : s
      ))

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('action', 'analyze')

      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('يرجى تسجيل الدخول مرة أخرى')
        router.push('/login')
        return
      }

      // Step 3: Validate
      setProgressSteps(prev => prev.map(s => 
        s.id === 'parse' ? { ...s, status: 'completed' } : s
      ))
      setCurrentStep('validate')
      setProgressSteps(prev => prev.map(s => 
        s.id === 'validate' ? { ...s, status: 'processing' } : s
      ))

      // Step 4: Check duplicates
      setProgressSteps(prev => prev.map(s => 
        s.id === 'validate' ? { ...s, status: 'completed' } : s
      ))
      setCurrentStep('duplicates')
      setProgressSteps(prev => prev.map(s => 
        s.id === 'duplicates' ? { ...s, status: 'processing' } : s
      ))

      const response = await fetch('/api/cvs/import-smart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': JSON.parse(atob(token.split('.')[1])).userId,
          'X-User-Role': JSON.parse(atob(token.split('.')[1])).role,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        // Step 5: Complete
        setProgressSteps(prev => prev.map(s => 
          s.id === 'duplicates' ? { ...s, status: 'completed' } : s
        ))
        setCurrentStep('complete')
        setProgressSteps(prev => prev.map(s => 
          s.id === 'complete' ? { ...s, status: 'processing' } : s
        ))

        await new Promise(resolve => setTimeout(resolve, 500))
        
        setProgressSteps(prev => prev.map(s => 
          s.id === 'complete' ? { ...s, status: 'completed' } : s
        ))

        setAnalysisResult(data)
        setShowDetails(true)
        setShowStatistics(true)
        toast.success('تم تحليل الملف بنجاح')
        
        // Hide progress after 2 seconds
        setTimeout(() => setShowProgress(false), 2000)
      } else {
        setProgressSteps(prev => prev.map(s => 
          s.status === 'processing' ? { ...s, status: 'error' } : s
        ))
        
        const errorMessage = data.error || 'فشل في تحليل الملف'
        const errorDetails = data.details ? `\nالتفاصيل: ${data.details}` : ''
        const suggestion = data.suggestion ? `\nاقتراح: ${data.suggestion}` : ''
        
        toast.error(errorMessage)
        
        // Show detailed error in console
        console.error('خطأ في التحليل:', {
          error: errorMessage,
          details: data.details,
          suggestion: data.suggestion
        })
        
        setTimeout(() => setShowProgress(false), 3000)
      }
    } catch (error) {
      setProgressSteps(prev => prev.map(s => 
        s.status === 'processing' ? { ...s, status: 'error' } : s
      ))
      toast.error('حدث خطأ أثناء تحليل الملف')
    } finally {
      setIsLoading(false)
    }
  }

  const executeImport = async () => {
    if (!selectedFile || !analysisResult) {
      return
    }

    setIsExecuting(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('action', 'execute')

      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('يرجى تسجيل الدخول مرة أخرى')
        router.push('/login')
        return
      }

      const response = await fetch('/api/cvs/import-smart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': JSON.parse(atob(token.split('.')[1])).userId,
          'X-User-Role': JSON.parse(atob(token.split('.')[1])).role,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        if (data.executionErrors && data.executionErrors.length > 0) {
          toast.success(`تم الاستيراد جزئياً! ${data.newRecords} جديد، ${data.updatedRecords} محدث`)
          toast.error(`أخطاء: ${data.executionErrors.length} عملية فشلت`)
        } else {
          toast.success(`تم الاستيراد بنجاح! ${data.newRecords} جديد، ${data.updatedRecords} محدث`)
        }
        
        // Show detailed results
        setTimeout(() => {
          if (data.executionErrors && data.executionErrors.length > 0) {
            console.error('أخطاء التنفيذ:', data.executionErrors)
            alert(`تفاصيل الأخطاء:\n${data.executionErrors.join('\n')}`)
          }
        }, 2000)
        
        router.push('/dashboard')
      } else {
        const errorMessage = data.error || 'فشل في استيراد البيانات'
        const errorDetails = data.details ? `\nالتفاصيل: ${data.details}` : ''
        const suggestion = data.suggestion ? `\nاقتراح: ${data.suggestion}` : ''
        
        toast.error(errorMessage)
        
        // Show detailed error in console
        console.error('خطأ في الاستيراد:', {
          error: errorMessage,
          details: data.details,
          suggestion: data.suggestion
        })
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الاستيراد')
    } finally {
      setIsExecuting(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/templates/excel-complete')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'قالب_السير_الذاتية_الشامل.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('تم تحميل القالب بنجاح')
      } else {
        toast.error('فشل في تحميل القالب')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل القالب')
    }
  }

  const getTabColor = (tab: string) => {
    switch (tab) {
      case 'new': return 'text-green-600 border-green-500'
      case 'update': return 'text-blue-600 border-blue-500'
      case 'skip': return 'text-yellow-600 border-yellow-500'
      case 'error': return 'text-red-600 border-red-500'
      default: return 'text-gray-600 border-gray-500'
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'new': return <UserCheck className="w-4 h-4" />
      case 'update': return <RefreshCw className="w-4 h-4" />
      case 'skip': return <UserX className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🧠 الاستيراد الذكي للسير الذاتية
              </h1>
              <p className="text-gray-600">
                نظام متقدم لمراجعة وتحديث البيانات تلقائياً - مقارنة بناءً على: رقم الجواز فقط
                <br />
                <span className="text-sm text-blue-600 font-semibold">ميزة جديدة: يمكنك الآن وضع روابط صور (URLs) في عمود الصورة الشخصية وسيتم تحميلها تلقائياً.</span>
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Download className="w-5 h-5" />
              تحميل القالب
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Upload className="w-7 h-7 text-blue-600" />
            رفع ملف البيانات
          </h2>

          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              selectedFile
                ? 'border-green-400 bg-green-50'
                : 'border-blue-300 bg-blue-50 hover:border-blue-400'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <FileSpreadsheet className="w-16 h-16 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  تم اختيار الملف
                </h3>
                <p className="text-green-700 mb-4">{selectedFile.name}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 text-green-700 border border-green-300 rounded-lg hover:bg-green-100 transition-colors"
                >
                  اختيار ملف آخر
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-16 h-16 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  اسحب الملف هنا أو انقر للاختيار
                </h3>
                <p className="text-gray-500 mb-6">
                  يدعم ملفات Excel (.xlsx, .xls) و CSV
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  اختيار ملف
                </button>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={analyzeFile}
                disabled={isLoading}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Eye className="w-6 h-6" />
                    تحليل الملف
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {showDetails && analysisResult && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">سجلات جديدة</p>
                    <p className="text-3xl font-bold">{analysisResult.newRecords}</p>
                  </div>
                  <UserCheck className="w-12 h-12 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">سيتم تحديثها</p>
                    <p className="text-3xl font-bold">{analysisResult.updatedRecords}</p>
                  </div>
                  <RefreshCw className="w-12 h-12 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">تم تخطيها</p>
                    <p className="text-3xl font-bold">{analysisResult.skippedRecords}</p>
                  </div>
                  <UserX className="w-12 h-12 text-yellow-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">أخطاء</p>
                    <p className="text-3xl font-bold">{analysisResult.errorRecords}</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-red-200" />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <BarChart3 className="w-8 h-8" />
                <h3 className="text-2xl font-bold">ملخص التحليل</h3>
              </div>
              <p className="text-xl text-indigo-100">{analysisResult.summary}</p>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="w-7 h-7 text-blue-600" />
                  تفاصيل البيانات
                </h3>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                {[
                  { key: 'new', label: 'الجديدة', count: analysisResult.newRecords },
                  { key: 'update', label: 'التحديثات', count: analysisResult.updatedRecords },
                  { key: 'skip', label: 'المتخطاة', count: analysisResult.skippedRecords },
                  { key: 'error', label: 'الأخطاء', count: analysisResult.errorRecords },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? getTabColor(tab.key)
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    {getTabIcon(tab.key)}
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'new' && (
                  <div className="space-y-4">
                    {analysisResult.details.newCVs.length > 0 ? (
                      analysisResult.details.newCVs.map((cv, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-green-800">
                                الصف {cv.rowNumber}: {cv.fullName}
                              </h4>
                              {cv.fullNameArabic && (
                                <p className="text-green-700">{cv.fullNameArabic}</p>
                              )}
                              <div className="flex gap-4 text-sm text-green-600 mt-2">
                                {cv.email && <span>📧 {cv.email}</span>}
                                {cv.phone && <span>📱 {cv.phone}</span>}
                                {cv.referenceCode && <span>🔖 {cv.referenceCode}</span>}
                              </div>
                            </div>
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">لا توجد سجلات جديدة</p>
                    )}
                  </div>
                )}

                {activeTab === 'update' && (
                  <div className="space-y-4">
                    {analysisResult.details.updatedCVs.length > 0 ? (
                      analysisResult.details.updatedCVs.map((cv, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-blue-800">
                                الصف {cv.rowNumber}: {cv.fullName}
                              </h4>
                              {cv.fullNameArabic && (
                                <p className="text-blue-700">{cv.fullNameArabic}</p>
                              )}
                              <p className="text-sm text-blue-600 mt-1">
                                سبب التطابق: {cv.duplicateReason}
                              </p>
                              <div className="flex gap-4 text-sm text-blue-600 mt-2">
                                {cv.email && <span>📧 {cv.email}</span>}
                                {cv.phone && <span>📱 {cv.phone}</span>}
                                {cv.referenceCode && <span>🔖 {cv.referenceCode}</span>}
                              </div>
                            </div>
                            <RefreshCw className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">لا توجد سجلات للتحديث</p>
                    )}
                  </div>
                )}

                {activeTab === 'skip' && (
                  <div className="space-y-4">
                    {analysisResult.details.skippedCVs.length > 0 ? (
                      analysisResult.details.skippedCVs.map((cv, index) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-yellow-800">
                                الصف {cv.rowNumber}: {cv.fullName || 'غير محدد'}
                              </h4>
                              <p className="text-sm text-yellow-700 mt-1">
                                سبب التخطي: {cv.duplicateReason}
                              </p>
                            </div>
                            <UserX className="w-6 h-6 text-yellow-600" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">لا توجد سجلات متخطاة</p>
                    )}
                  </div>
                )}

                {activeTab === 'error' && (
                  <div className="space-y-4">
                    {analysisResult.details.errorCVs.length > 0 ? (
                      analysisResult.details.errorCVs.map((cv, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-red-800">
                                الصف {cv.rowNumber}: {cv.fullName || 'غير محدد'}
                              </h4>
                              <p className="text-sm text-red-700 mt-1">
                                الخطأ: {cv.duplicateReason}
                              </p>
                            </div>
                            <XCircle className="w-6 h-6 text-red-600" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">لا توجد أخطاء</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Execute Import Button */}
            {(analysisResult.newRecords > 0 || analysisResult.updatedRecords > 0) && (
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    جاهز للتنفيذ!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    سيتم إضافة {analysisResult.newRecords} سجل جديد وتحديث {analysisResult.updatedRecords} سجل موجود
                  </p>
                  <button
                    onClick={executeImport}
                    disabled={isExecuting}
                    className="flex items-center gap-3 px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold mx-auto"
                  >
                    {isExecuting ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        جاري التنفيذ...
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6" />
                        تنفيذ الاستيراد
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Modal */}
        <SmartImportProgress
          isVisible={showProgress}
          currentStep={currentStep}
          steps={progressSteps}
          onClose={() => setShowProgress(false)}
        />

        {/* Statistics */}
        {showStatistics && analysisResult && (
          <ImportStatistics
            stats={{
              totalRows: analysisResult.totalRows,
              newRecords: analysisResult.newRecords,
              updatedRecords: analysisResult.updatedRecords,
              skippedRecords: analysisResult.skippedRecords,
              errorRecords: analysisResult.errorRecords,
              processingTime: processingStartTime ? (Date.now() - processingStartTime) / 1000 : undefined,
              duplicateReasons: analysisResult.details.updatedCVs.reduce((acc: any, cv) => {
                if (cv.duplicateReason) {
                  acc[cv.duplicateReason] = (acc[cv.duplicateReason] || 0) + 1
                }
                return acc
              }, {})
            }}
            isVisible={showStatistics}
          />
        )}
      </div>
    </div>
  )
}
