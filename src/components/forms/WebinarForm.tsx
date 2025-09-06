'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface FormData {
  // Required fields
  businessInfo: string
  webinarContent: string
  targetAudience: string
  webinarInfo: string
  instructorCreds: string
  contactFields: string[]
  
  // Optional fields
  visualStyle?: string
  brandColors?: string
  uniqueSellingPoints?: string
  upsellProducts?: string
  specialRequirements?: string
  photos?: File[]
}

const contactFieldOptions = ['姓名', 'Instagram帳號', '電話', 'Email']
const visualStyleOptions = ['科技感', '溫暖生活化', '專業商務', '創意活潑', '其他']

// Color Palette Preview Component
function ColorPalettePreview({ colors }: { colors?: string }) {
  if (!colors || colors.trim() === '') {
    return (
      <div className="text-sm text-gray-500">
        輸入顏色代碼後將顯示預覽
      </div>
    )
  }

  // Parse colors from the input string
  const parseColors = (colorString: string): string[] => {
    // Split by comma and clean up each color
    return colorString
      .split(',')
      .map(color => color.trim())
      .filter(color => {
        // Basic validation for hex colors
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) || 
               /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color) ||
               /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color)
      })
  }

  const validColors = parseColors(colors)

  if (validColors.length === 0) {
    return (
      <div className="text-sm text-red-500">
        請輸入有效的顏色代碼 (例如: #3B82F6, #10B981)
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">顏色預覽:</div>
      <div className="flex flex-wrap gap-2">
        {validColors.map((color, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
            <span className="text-xs text-gray-600 font-mono">{color}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500">
        共 {validColors.length} 個有效顏色
      </div>
      
      {/* Popular color combinations */}
      <div className="mt-4">
        <div className="text-xs text-gray-500 mb-2">熱門配色組合:</div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: '藍色系', colors: '#3B82F6, #1E40AF, #60A5FA' },
            { name: '綠色系', colors: '#10B981, #059669, #34D399' },
            { name: '紫色系', colors: '#8B5CF6, #7C3AED, #A78BFA' },
            { name: '橙色系', colors: '#F59E0B, #D97706, #FBBF24' },
            { name: '紅色系', colors: '#EF4444, #DC2626, #F87171' }
          ].map((combo, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                const input = document.querySelector('input[name="brandColors"]') as HTMLInputElement
                if (input) {
                  input.value = combo.colors
                  input.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
            >
              {combo.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function WebinarForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      contactFields: ['姓名', 'Email'],
      visualStyle: '現代簡約',
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    // Check if there's pending form data to restore
    const pendingFormData = sessionStorage.getItem('pendingFormData')
    const pendingFiles = sessionStorage.getItem('pendingFiles')
    
    if (pendingFormData && pendingFiles) {
      try {
        const formData = JSON.parse(pendingFormData)
        const files = JSON.parse(pendingFiles)
        
        // Restore form data
        Object.keys(formData).forEach(key => {
          if (key !== 'photos') {
            setValue(key as keyof FormData, formData[key])
          }
        })
        
        // Note: We can't restore actual File objects, but we can show the user what files were selected
        if (files.length > 0) {
          toast.success(`Form data restored. You had ${files.length} files selected.`)
        }
        
        // Clear the stored data
        sessionStorage.removeItem('pendingFormData')
        sessionStorage.removeItem('pendingFiles')
        
        // Auto-submit the form if user is authenticated
        const checkAndSubmit = async () => {
          const isAuthenticated = await checkAuthentication()
          if (isAuthenticated) {
            await onSubmit(formData)
          }
        }
        checkAndSubmit()
      } catch (error) {
        console.error('Error restoring form data:', error)
      }
    }
  }, [setValue])

  const steps = [
    {
      id: 1,
      title: '業務基本信息',
      description: '告訴我們關於您的業務',
    },
    {
      id: 2,
      title: 'Webinar 核心內容',
      description: '描述您的Webinar內容',
    },
    {
      id: 3,
      title: '目標受眾',
      description: '定義您的理想參與者',
    },
    {
      id: 4,
      title: 'Webinar 基本資訊',
      description: '設置Webinar詳情',
    },
    {
      id: 5,
      title: '講師資歷',
      description: '分享您的專業背景',
    },
    {
      id: 6,
      title: '聯絡資訊收集',
      description: '選擇要收集的聯絡資訊',
    },
    {
      id: 7,
      title: '視覺風格偏好',
      description: '自定義頁面外觀（可選）',
    },
    {
      id: 8,
      title: '獨特賣點',
      description: '突出您的優勢（可選）',
    },
    {
      id: 9,
      title: 'Upsell 產品',
      description: '設置轉換目標（可選）',
    },
    {
      id: 10,
      title: '特殊需求',
      description: '其他要求（可選）',
    },
  ]

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: FormData) => {
    // Check if user is authenticated
    const isAuthenticated = await checkAuthentication()
    
    if (!isAuthenticated) {
      // Store form data in sessionStorage before redirecting
      sessionStorage.setItem('pendingFormData', JSON.stringify(data))
      sessionStorage.setItem('pendingFiles', JSON.stringify(uploadedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))))
      toast.error('Please sign in to generate your landing page')
      // Redirect to login page with return URL
      window.location.href = '/login?returnTo=create'
      return
    }

    setIsSubmitting(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      
      // Add text fields
      Object.keys(data).forEach(key => {
        if (key !== 'photos' && data[key as keyof FormData]) {
          formData.append(key, JSON.stringify(data[key as keyof FormData]))
        }
      })
      
      // Add files
      uploadedFiles.forEach(file => {
        formData.append('photos', file)
      })

      const response = await fetch('/api/generate-landing-page', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to generate landing page')
      }

      const result = await response.json()
      
      // Save form submission for history
      try {
        await fetch('/api/form-submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessInfo: data.businessInfo,
            webinarContent: data.webinarContent,
            targetAudience: data.targetAudience,
            webinarInfo: data.webinarInfo,
            instructorCreds: data.instructorCreds,
            contactFields: data.contactFields,
            style: data.visualStyle || '現代簡約',
            brandColors: data.brandColors,
            uniqueSellingPoints: data.uniqueSellingPoints,
            upsellProducts: data.upsellProducts,
            specialRequirements: data.specialRequirements,
          }),
        })
      } catch (error) {
        console.error('Error saving form submission:', error)
      }
      
      // Redirect to loading page
      window.location.href = `/generating?pageId=${result.pageId}`
    } catch (error) {
      console.error('Error:', error)
      
      // Show more detailed error information
      let errorMessage = 'Failed to generate landing page. Please try again.'
      
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`
      }
      
      toast.error(errorMessage)
      
      // Also log to console for debugging
      console.error('Detailed error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image format`)
        return false
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }
      
      return true
    })
    
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                業務基本信息 *
              </label>
              <Controller
                name="businessInfo"
                control={control}
                rules={{ required: '此欄位為必填' }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="請簡述您的業務：您提供什麼產品/服務？主要幫助客戶解決什麼問題？"
                    className="form-textarea h-32"
                  />
                )}
              />
              {errors.businessInfo && (
                <p className="text-red-500 text-sm mt-1">{errors.businessInfo.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                範例：我提供數位行銷顧問服務，幫助小企業透過Instagram增加銷售
              </p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webinar 核心內容 *
              </label>
              <Controller
                name="webinarContent"
                control={control}
                rules={{ required: '此欄位為必填' }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="您的Webinar將教授什麼內容？客戶完成後會獲得什麼具體技能或知識？"
                    className="form-textarea h-32"
                  />
                )}
              />
              {errors.webinarContent && (
                <p className="text-red-500 text-sm mt-1">{errors.webinarContent.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                範例：教授Instagram故事行銷技巧，學員將學會撰寫高轉換貼文和獲得投資人關注
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目標受眾 *
              </label>
              <Controller
                name="targetAudience"
                control={control}
                rules={{ required: '此欄位為必填' }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="誰是您的理想參與者？請描述他們的職業、痛點和目標。"
                    className="form-textarea h-32"
                  />
                )}
              />
              {errors.targetAudience && (
                <p className="text-red-500 text-sm mt-1">{errors.targetAudience.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                範例：創業家、自由工作者、想用IG建立個人品牌但不知從何開始的人
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webinar 基本資訊 *
              </label>
              <Controller
                name="webinarInfo"
                control={control}
                rules={{ required: '此欄位為必填' }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="Webinar時間長度？預計日期(optional)？參與人數上限？是否提供回放？價值多少（不是價格）？"
                    className="form-textarea h-32"
                  />
                )}
              />
              {errors.webinarInfo && (
                <p className="text-red-500 text-sm mt-1">{errors.webinarInfo.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                範例：1.5小時，9月2日，限50人，不提供回放，價值$980現在免費
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                講師資歷/Testimonials *
              </label>
              <Controller
                name="instructorCreds"
                control={control}
                rules={{ required: '此欄位為必填' }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="請分享您的專業背景、過往成功案例、具體數據成果或學員見證。"
                    className="form-textarea h-32"
                  />
                )}
              />
              {errors.instructorCreds && (
                <p className="text-red-500 text-sm mt-1">{errors.instructorCreds.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                範例：5年行銷經驗，曾幫助客戶獲得300萬投資，學員平均增長1000粉絲
              </p>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                聯絡資訊收集 *
              </label>
              <Controller
                name="contactFields"
                control={control}
                rules={{ required: '此欄位為必填' }}
                render={({ field }) => (
                  <div className="space-y-3">
                    {contactFieldOptions.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.value.includes(option)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, option])
                            } else {
                              field.onChange(field.value.filter((item) => item !== option))
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.contactFields && (
                <p className="text-red-500 text-sm mt-1">{errors.contactFields.message}</p>
              )}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                視覺風格偏好
              </label>
              <Controller
                name="visualStyle"
                control={control}
                render={({ field }) => (
                  <select {...field} className="form-input">
                    {visualStyleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                品牌色彩
              </label>
              <Controller
                name="brandColors"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3">
                    <input
                      {...field}
                      type="text"
                      placeholder="例如：#3B82F6, #10B981, #F59E0B (用逗號分隔多個顏色)"
                      className="form-input"
                    />
                    <ColorPalettePreview colors={field.value} />
                  </div>
                )}
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                獨特賣點
              </label>
              <Controller
                name="uniqueSellingPoints"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="什麼讓您的方法與眾不同？您有什麼獨家框架、工具或秘密嗎？"
                    className="form-textarea h-32"
                  />
                )}
              />
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upsell 產品
              </label>
              <Controller
                name="upsellProducts"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="有什麼產品你想學員報名後的頁面展示？定價是多少？"
                    className="form-textarea h-32"
                  />
                )}
              />
            </div>
          </div>
        )

      case 10:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                相關照片
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    點擊上傳或拖拽圖片到這裡
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    支援 JPG, PNG, WebP，最大 10MB
                  </p>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                特殊需求及補充
              </label>
              <Controller
                name="specialRequirements"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="有任何特殊要求嗎？特定功能？必須避免的元素？技術整合需求？"
                    className="form-textarea h-32"
                  />
                )}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">創建 Webinar 登陸頁面</h1>
            <span className="text-sm text-gray-500">
              步驟 {currentStep} / {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-gray-600">
                    {steps[currentStep - 1].description}
                  </p>
                </div>
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                上一步
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center"
                >
                  下一步
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    const formData = getValues()
                    await onSubmit(formData)
                  }}
                  disabled={isSubmitting}
                  className="btn-primary flex items-center"
                >
                  {isSubmitting ? '生成中...' : '生成登陸頁面'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
