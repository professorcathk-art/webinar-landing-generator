'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function GeneratingContent() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pageId = searchParams.get('pageId')
  const autoSubmit = searchParams.get('autoSubmit') === 'true'

  const steps = [
    'Analyzing your requirements...',
    'Generating HTML structure...',
    'Creating CSS styles...',
    'Adding JavaScript functionality...',
    'Optimizing for conversion...',
    'Finalizing your landing page...'
  ]

  // Auto-submit form data if needed
  useEffect(() => {
    if (autoSubmit && !pageId && !isAutoSubmitting) {
      setIsAutoSubmitting(true)
      
      const autoSubmitForm = async () => {
        try {
          const pendingFormData = sessionStorage.getItem('pendingFormData')
          const pendingFiles = sessionStorage.getItem('pendingFiles')
          
          if (pendingFormData) {
            const formData = JSON.parse(pendingFormData)
            
            // Create FormData for submission
            const submitData = new FormData()
            Object.keys(formData).forEach(key => {
              if (key !== 'photos' && formData[key]) {
                submitData.append(key, JSON.stringify(formData[key]))
              }
            })
            
            // Add files if any
            if (pendingFiles) {
              const files = JSON.parse(pendingFiles)
              // Note: We can't restore actual File objects, but we can proceed without them
            }
            
            const response = await fetch('/api/generate-landing-page', {
              method: 'POST',
              body: submitData,
            })
            
            if (response.ok) {
              const result = await response.json()
              if (result.success) {
                // Clear the stored data
                sessionStorage.removeItem('pendingFormData')
                sessionStorage.removeItem('pendingFiles')
                
                // Redirect to generating page with the new page ID
                router.push(`/generating?pageId=${result.pageId}`)
                return
              }
            }
          }
          
          // If auto-submit fails, redirect to create page
          router.push('/create')
        } catch (error) {
          console.error('Auto-submit error:', error)
          router.push('/create')
        }
      }
      
      autoSubmitForm()
    }
  }, [autoSubmit, pageId, isAutoSubmitting, router])

  useEffect(() => {
    if (!pageId) return

    let progressInterval: NodeJS.Timeout
    let checkInterval: NodeJS.Timeout

    // Start progress animation
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95 // Stop at 95% until page is ready
        return prev + 1
      })
    }, 100)

    // Check if page is ready
    const checkPageReady = async () => {
      try {
        const response = await fetch(`/api/landing-pages/${pageId}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            // Page is ready, complete the progress
            clearInterval(progressInterval)
            clearInterval(checkInterval)
            setProgress(100)
            
            // Wait a moment then redirect
            setTimeout(() => {
              router.push(`/preview?id=${pageId}`)
            }, 500)
          }
        }
      } catch (error) {
        console.error('Error checking page status:', error)
      }
    }

    // Check every 2 seconds
    checkInterval = setInterval(checkPageReady, 2000)
    
    // Initial check
    checkPageReady()

    return () => {
      if (progressInterval) clearInterval(progressInterval)
      if (checkInterval) clearInterval(checkInterval)
    }
  }, [pageId, router])

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const currentIndex = steps.findIndex(step => step === prev)
        const nextIndex = (currentIndex + 1) % steps.length
        return steps[nextIndex]
      })
    }, 1000)

    return () => clearInterval(stepInterval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {autoSubmit && !pageId ? 'Submitting Your Form' : 'Creating Your Landing Page'}
            </h1>
            <p className="text-gray-600">
              {autoSubmit && !pageId 
                ? 'Please wait while we submit your form and generate your landing page...'
                : 'Please wait while we generate your perfect webinar landing page...'
              }
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-700 font-medium">{currentStep}</p>
          </div>

          <div className="text-xs text-gray-500">
            <p>This usually takes 30-90 seconds</p>
            <p>Don't close this window</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GeneratingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <GeneratingContent />
    </Suspense>
  )
}
