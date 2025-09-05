'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Edit, Eye, Trash2, Plus, ExternalLink, User, Settings } from 'lucide-react'

interface LandingPage {
  id: string
  title: string
  slug: string
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  htmlContent: string
  cssContent: string
  jsContent: string
}

export default function DashboardPage() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        const response = await fetch('/api/auth/check')
        if (response.ok) {
          const data = await response.json()
          if (data.user.email === 'professor.cat.hk@gmail.com') {
            setIsAdmin(true)
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      }
      fetchLandingPages()
    }
    
    checkAdminAndFetch()
  }, [])

  const fetchLandingPages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/landing-pages')
      
      if (!response.ok) {
        throw new Error('Failed to fetch landing pages')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load landing pages')
      }
      
      setLandingPages(result.data)
    } catch (err) {
      setError('Failed to load landing pages')
      console.error('Error fetching landing pages:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Link copied to clipboard!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Link copied to clipboard!')
    }
  }

  const deletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/landing-pages/${pageId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete page')
      }
      
      // Remove from local state
      setLandingPages(prev => prev.filter(page => page.id !== pageId))
      alert('Page deleted successfully!')
    } catch (err) {
      console.error('Error deleting page:', err)
      alert('Failed to delete page. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your pages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Pages</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchLandingPages}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Landing Pages</h1>
            <p className="text-gray-600">Manage and share your webinar landing pages</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/account')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Account</span>
              </button>
              <button
                onClick={() => router.push('/leads')}
                className="btn-secondary flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>View Leads</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => router.push('/admin/users')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>All Users</span>
                </button>
              )}
              <button
                onClick={() => router.push('/create')}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Page</span>
              </button>
            </div>
            <button
              onClick={async () => {
                try {
                  await fetch('/api/auth/signout', { method: 'POST' })
                  router.push('/')
                } catch (error) {
                  console.error('Logout error:', error)
                }
              }}
              className="btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {landingPages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pages yet</h3>
            <p className="text-gray-600 mb-6">Create your first webinar landing page to get started</p>
            <button
              onClick={() => router.push('/create')}
              className="btn-primary"
            >
              Create Your First Page
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {landingPages.map((page) => (
              <div key={page.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Page Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {page.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          page.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {page.isPublished ? 'Published' : 'Draft'}
                        </span>
                        {page.isPublished && (
                          <span className="text-xs text-gray-500">
                            {formatDate(page.publishedAt || page.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page Content */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Created</span>
                      <span>{formatDate(page.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Last Updated</span>
                      <span>{formatDate(page.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/editor/${page.id}`)}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => window.open(`/preview?id=${page.id}`, '_blank')}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Preview</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {page.isPublished && (
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/preview?id=${page.id}`)}
                          className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                          <span>Copy Link</span>
                        </button>
                      )}
                      <button
                        onClick={() => deletePage(page.id)}
                        className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
