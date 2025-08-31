'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Declare global functions for TypeScript
declare global {
  interface Window {
    openModal: () => void
    closeModal: () => void
    handleRegistration: (event: Event) => void
  }
}

function PreviewContent() {
  const searchParams = useSearchParams()
  const pageId = searchParams.get('id')
  const [previewData, setPreviewData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (pageId) {
      loadPreviewData()
    }
  }, [pageId])

  // Add global form handler for published pages
  useEffect(() => {
    if (previewData?.isPublished) {
      // Override the global openModal function
      window.openModal = () => {
        const modal = document.getElementById('registrationModal')
        if (modal) {
          modal.style.display = 'block'
          document.body.style.overflow = 'hidden'
        }
      }

      // Override the global closeModal function
      window.closeModal = () => {
        const modal = document.getElementById('registrationModal')
        if (modal) {
          modal.style.display = 'none'
          document.body.style.overflow = 'auto'
        }
      }

      // Override the global handleRegistration function
      window.handleRegistration = async (event) => {
        event.preventDefault()
        
        const target = event.target as HTMLFormElement
        const formData = new FormData(target)
        const data = {
          pageId: pageId,
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          instagram: formData.get('instagram') || '',
          additionalInfo: formData.get('question') || ''
        }
        
        console.log('Submitting registration data:', data)
        
        try {
          const response = await fetch('/api/leads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          })
          
          console.log('Response status:', response.status)
          
          if (response.ok) {
            const result = await response.json()
            console.log('Success response:', result)
            
            alert('感謝您的註冊！我們會盡快與您聯繫確認詳情。')
            window.closeModal()
            
            target.reset()
          } else {
            const errorText = await response.text()
            console.error('Error response:', errorText)
            throw new Error('Failed to submit registration: ' + response.status)
          }
        } catch (error) {
          console.error('Error submitting registration:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          alert('抱歉，提交時發生錯誤。請稍後再試。錯誤詳情: ' + errorMessage)
        }
      }

      // Add click outside modal handler
      window.onclick = function(event) {
        const modal = document.getElementById('registrationModal')
        if (event.target == modal) {
          window.closeModal()
        }
      }

      // Cleanup function
      return () => {
        window.openModal = undefined as any
        window.closeModal = undefined as any
        window.handleRegistration = undefined as any
        window.onclick = undefined as any
      }
    }
  }, [previewData, pageId])

  const loadPreviewData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/landing-pages/${pageId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch page data')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load page data')
      }
      
      setPreviewData(result.data)
    } catch (error) {
      console.error('Error loading preview:', error)
      setPreviewData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preview...</p>
        </div>
      </div>
    )
  }

  if (!previewData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Preview Not Available</h2>
          <p className="text-gray-600">The preview data could not be loaded.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Only show preview bar if it's not a published page */}
      {!previewData.isPublished && (
        <div className="bg-gray-100 px-4 py-2 border-b">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              Preview: {previewData.title}
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Desktop</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">Mobile</span>
            </div>
          </div>
        </div>
      )}
      
      <div className={previewData.isPublished ? "" : "max-w-4xl mx-auto p-4"}>
        <div 
          className={previewData.isPublished ? "" : "preview-frame border rounded-lg overflow-hidden"}
          dangerouslySetInnerHTML={{ __html: previewData.htmlContent }}
        />
        
        <style dangerouslySetInnerHTML={{ __html: previewData.cssContent }} />
        <script dangerouslySetInnerHTML={{ __html: previewData.jsContent }} />
      </div>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preview...</p>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  )
}
