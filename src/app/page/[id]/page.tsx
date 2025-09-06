'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'

function PublishedPageContent() {
  const params = useParams()
  const pageId = params.id as string
  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (pageId) {
      loadPageData()
    }
  }, [pageId])

  // Execute JavaScript after HTML content is loaded
  useEffect(() => {
    if (pageData?.jsContent) {
      // Create a script element and execute the JavaScript
      const script = document.createElement('script')
      script.textContent = pageData.jsContent
      document.head.appendChild(script)
      
      // Clean up
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
    }
  }, [pageData?.jsContent])

  const loadPageData = async () => {
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
      
      // Only show published pages
      if (!result.data.isPublished) {
        throw new Error('Page not published')
      }
      
      setPageData(result.data)
    } catch (error) {
      console.error('Error loading page:', error)
      setPageData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading page...</p>
        </div>
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600">The requested page could not be found or is not published.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div 
        dangerouslySetInnerHTML={{ __html: pageData.htmlContent }}
      />
      
      <style dangerouslySetInnerHTML={{ __html: pageData.cssContent }} />
    </div>
  )
}

export default function PublishedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PublishedPageContent />
    </Suspense>
  )
}
