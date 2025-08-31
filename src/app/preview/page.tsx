'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

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

  const loadPreviewData = async () => {
    try {
      setLoading(true)
      // This would be replaced with actual API call
      // const response = await fetch(`/api/landing-pages/${pageId}/preview`)
      // const data = await response.json()
      
      // Mock data for now
      const mockData = {
        title: 'Sample Landing Page Preview',
        htmlContent: '<div class="preview-container"><h1>Landing Page Preview</h1><p>This is a preview of your landing page.</p></div>',
        cssContent: 'body { font-family: Arial, sans-serif; margin: 0; padding: 20px; } .preview-container { max-width: 800px; margin: 0 auto; }',
        jsContent: 'console.log("Preview loaded");'
      }
      
      setPreviewData(mockData)
    } catch (error) {
      console.error('Error loading preview:', error)
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
      
      <div className="max-w-4xl mx-auto p-4">
        <div 
          className="preview-frame border rounded-lg overflow-hidden"
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
