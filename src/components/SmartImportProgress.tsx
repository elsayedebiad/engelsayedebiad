'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, RefreshCw, AlertCircle, XCircle } from 'lucide-react'

interface ProgressStep {
  id: string
  label: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  details?: string
}

interface SmartImportProgressProps {
  isVisible: boolean
  currentStep: string
  steps: ProgressStep[]
  onClose?: () => void
}

export default function SmartImportProgress({ 
  isVisible, 
  currentStep, 
  steps, 
  onClose 
}: SmartImportProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const completedSteps = steps.filter(step => step.status === 'completed').length
    const totalSteps = steps.length
    setProgress((completedSteps / totalSteps) * 100)
  }, [steps])

  if (!isVisible) return null

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'processing':
        return 'bg-blue-50 border-blue-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🚀 جاري المعالجة الذكية
          </h3>
          <p className="text-gray-600">
            يرجى الانتظار أثناء معالجة البيانات...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>التقدم</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-all duration-200 ${getStepColor(step.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {step.label}
                    </p>
                    {step.details && (
                      <p className="text-sm text-gray-600">
                        {step.details}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Step Indicator */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-blue-800 font-medium">
              الخطوة الحالية: {steps.find(s => s.id === currentStep)?.label || 'معالجة البيانات...'}
            </p>
          </div>
        </div>

        {/* Close Button (only show when all steps are completed) */}
        {progress === 100 && onClose && (
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-medium"
            >
              ✅ تم الانتهاء
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
