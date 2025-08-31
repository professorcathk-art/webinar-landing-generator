// Updated: Fixed TypeScript compilation errors - Editor page implementation
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import DragDropEditor from '@/components/editor/DragDropEditor'
import ChatInterface from '@/components/editor/ChatInterface'

interface LandingPage {
  id: string
  title: string
  content: any
  htmlContent: string
  cssContent: string
  jsContent: string
}

export default function EditorPage() {
  const params = useParams()
  const pageId = params.id as string
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    fetchLandingPage()
  }, [pageId])

  const fetchLandingPage = async () => {
    try {
      setLoading(true)
      // This would be replaced with actual API call
      // const response = await fetch(`/api/landing-pages/${pageId}`)
      // const data = await response.json()
      
      // Mock data for now
      const mockData: LandingPage = {
        id: pageId,
        title: 'Sample Landing Page',
        content: {
          blocks: [
            {
              id: 'hero',
              type: 'hero',
              content: {
                title: 'Welcome to Our Webinar',
                subtitle: 'Learn the secrets of success',
                cta: 'Register Now'
              }
            },
            {
              id: 'features',
              type: 'features',
              content: {
                title: 'What You\'ll Learn',
                items: [
                  'Strategy 1',
                  'Strategy 2',
                  'Strategy 3'
                ]
              }
            }
          ]
        },
        htmlContent: '<div>Sample HTML</div>',
        cssContent: 'body { font-family: Arial; }',
        jsContent: 'console.log("Hello");'
      }
      
      setLandingPage(mockData)
    } catch (err) {
      setError('Failed to load landing page')
      console.error('Error fetching landing page:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (updatedContent: any) => {
    try {
      // This would be replaced with actual API call
      // await fetch(`/api/landing-pages/${pageId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedContent)
      // })
      
      setLandingPage(prev => prev ? { ...prev, content: updatedContent } : null)
      console.log('Page saved successfully')
    } catch (err) {
      console.error('Error saving page:', err)
    }
  }

  const handlePublish = async () => {
    try {
      // This would be replaced with actual API call
      // await fetch(`/api/landing-pages/${pageId}/publish`, {
      //   method: 'POST'
      // })
      
      console.log('Page published successfully')
    } catch (err) {
      console.error('Error publishing page:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading editor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Page</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchLandingPage}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!landingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600">The landing page you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {landingPage.title}
            </h1>
            <span className="text-sm text-gray-500">ID: {pageId}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowChat(!showChat)}
              className="btn-secondary"
            >
              {showChat ? 'Hide Chat' : 'AI Assistant'}
            </button>
            <button
              onClick={() => handleSave(landingPage.content)}
              className="btn-secondary"
            >
              Save
            </button>
            <button
              onClick={handlePublish}
              className="btn-primary"
            >
              Publish
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Editor */}
        <div className={`flex-1 ${showChat ? 'w-2/3' : 'w-full'}`}>
                  <DragDropEditor
          initialContent={{
            html: landingPage.htmlContent,
            css: landingPage.cssContent,
            js: landingPage.jsContent
          }}
          pageId={pageId}
        />
        </div>

        {/* Chat Interface */}
        {showChat && (
          <div className="w-1/3 border-l border-gray-200">
            <ChatInterface
              blockType="general"
              currentContent={landingPage.htmlContent}
              pageContext={{
                businessInfo: "Sample business",
                targetAudience: "Sample audience",
                webinarContent: "Sample content"
              }}
              onContentUpdate={(newContent) => {
                setLandingPage(prev => prev ? { ...prev, htmlContent: newContent } : null)
              }}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
