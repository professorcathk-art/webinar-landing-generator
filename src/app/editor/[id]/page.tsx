// Updated: Fixed TypeScript compilation errors - Editor page implementation
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DragDropEditor from '@/components/editor/DragDropEditor'
import ChatInterface from '@/components/editor/ChatInterface'

interface LandingPage {
  id: string
  title: string
  content: any
  htmlContent: string
  cssContent: string
  jsContent: string
  isPublished?: boolean
  publishedAt?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.id as string
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [previewMode, setPreviewMode] = useState<'editor' | 'preview'>('preview')

  useEffect(() => {
    fetchLandingPage()
  }, [pageId])

  const fetchLandingPage = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/landing-pages/${pageId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch landing page')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load landing page')
      }
      
      setLandingPage(result.data)
    } catch (err) {
      setError('Failed to load landing page')
      console.error('Error fetching landing page:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (updatedContent: any) => {
    try {
      const response = await fetch(`/api/landing-pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlContent: updatedContent.htmlContent || landingPage?.htmlContent || '',
          cssContent: updatedContent.cssContent || landingPage?.cssContent || '',
          jsContent: updatedContent.jsContent || landingPage?.jsContent || '',
          title: updatedContent.title || landingPage?.title || ''
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save page')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save page')
      }
      
      setLandingPage(prev => prev ? { ...prev, ...result.data } : null)
      console.log('Page saved successfully')
    } catch (err) {
      console.error('Error saving page:', err)
      throw err // Re-throw to show error to user
    }
  }

  const handlePublish = async () => {
    try {
      // Update the page status to published
      const response = await fetch(`/api/landing-pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlContent: landingPage?.htmlContent || '',
          cssContent: landingPage?.cssContent || '',
          jsContent: landingPage?.jsContent || '',
          title: landingPage?.title || '',
          published: true
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to publish page')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to publish page')
      }
      
      // Generate the public URL
      const publicUrl = `${window.location.origin}/preview?id=${pageId}`
      
      // Show success message with copy option
      const shouldCopy = confirm(
        'Page published successfully!\n\n' +
        'Public URL: ' + publicUrl + '\n\n' +
        'Would you like to copy the share link to your clipboard?'
      )
      
      if (shouldCopy) {
        try {
          await navigator.clipboard.writeText(publicUrl)
          alert('Share link copied to clipboard!')
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = publicUrl
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          alert('Share link copied to clipboard!')
        }
      }
      
      // Update the landing page state
      setLandingPage(prev => prev ? { ...prev, isPublished: true } : null)
      
      // Redirect to dashboard after successful publish
      router.push('/dashboard')
      
    } catch (err) {
      console.error('Error publishing page:', err)
      alert('Failed to publish page. Please try again.')
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
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('preview')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  previewMode === 'preview' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setPreviewMode('editor')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  previewMode === 'editor' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Editor
              </button>
            </div>
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
            {landingPage.isPublished && (
              <button
                onClick={async () => {
                  const publicUrl = `${window.location.origin}/preview?id=${pageId}`
                  try {
                    await navigator.clipboard.writeText(publicUrl)
                    alert('Share link copied to clipboard!')
                  } catch (err) {
                    const textArea = document.createElement('textarea')
                    textArea.value = publicUrl
                    document.body.appendChild(textArea)
                    textArea.select()
                    document.execCommand('copy')
                    document.body.removeChild(textArea)
                    alert('Share link copied to clipboard!')
                  }
                }}
                className="btn-secondary"
              >
                Copy Share Link
              </button>
            )}
            <button
              onClick={handlePublish}
              className="btn-primary"
            >
              {landingPage.isPublished ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className={`flex-1 ${showChat ? 'w-2/3' : 'w-full'}`}>
          {previewMode === 'preview' ? (
            // Live Preview Mode
            <div className="h-full bg-gray-50 p-4">
              <div className="bg-white rounded-lg shadow-lg h-full overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Desktop</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">Mobile</span>
                  </div>
                </div>
                <div className="h-full overflow-auto">
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
                          <style>${landingPage.cssContent}</style>
                        </head>
                        <body>
                          ${landingPage.htmlContent}
                          <script>${landingPage.jsContent}</script>
                        </body>
                      </html>
                    `}
                    className="w-full h-full border-0"
                    title="Landing Page Preview"
                  />
                </div>
              </div>
            </div>
          ) : (
            // Editor Mode
            <DragDropEditor
              initialContent={{
                html: landingPage.htmlContent,
                css: landingPage.cssContent,
                js: landingPage.jsContent
              }}
              pageId={pageId}
            />
          )}
        </div>

        {/* Chat Interface */}
        {showChat && (
          <div className="w-1/3 border-l border-gray-200">
            <ChatInterface
              blockType="general"
              currentContent={landingPage.htmlContent}
              pageContext={{
                businessInfo: landingPage.content?.businessInfo || "Sample business",
                targetAudience: landingPage.content?.targetAudience || "Sample audience",
                webinarContent: landingPage.content?.webinarContent || "Sample content"
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
