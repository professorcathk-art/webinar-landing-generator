'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Globe, Edit, RefreshCw, User, Settings, History } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name?: string
  customDomain?: string
  createdAt: string
}

interface FormSubmission {
  id: string
  businessInfo: string
  webinarContent: string
  targetAudience: string
  webinarInfo: string
  instructorCreds: string
  contactFields: string[]
  style: string
  brandColors?: any
  uniqueSellingPoints?: string
  upsellProducts?: string
  specialRequirements?: string
  createdAt: string
  landingPageId?: string
}

export default function AccountPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'domains' | 'history'>('profile')
  const [customDomain, setCustomDomain] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchFormSubmissions()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
        setCustomDomain(data.user.customDomain || '')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchFormSubmissions = async () => {
    try {
      const response = await fetch('/api/form-submissions')
      if (response.ok) {
        const data = await response.json()
        setFormSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error('Error fetching form submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveCustomDomain = async () => {
    if (!customDomain.trim()) return

    setSaving(true)
    try {
      const response = await fetch('/api/user/update-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customDomain: customDomain.trim() }),
      })

      if (response.ok) {
        setUserProfile(prev => prev ? { ...prev, customDomain: customDomain.trim() } : null)
        setIsEditing(false)
        alert('Custom domain updated successfully!')
      } else {
        throw new Error('Failed to update domain')
      }
    } catch (error) {
      console.error('Error updating domain:', error)
      alert('Failed to update domain. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const regeneratePage = async (submissionId: string) => {
    try {
      const response = await fetch('/api/regenerate-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissionId }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/generating?pageId=${data.pageId}`)
      } else {
        throw new Error('Failed to regenerate page')
      }
    } catch (error) {
      console.error('Error regenerating page:', error)
      alert('Failed to regenerate page. Please try again.')
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account information...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
            <p className="text-gray-600">Manage your profile, domains, and form submissions</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('domains')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'domains'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>Custom Domains</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Form History</span>
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userProfile?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={userProfile?.name || ''}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <input
                  type="text"
                  value={userProfile ? formatDate(userProfile.createdAt) : ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Domains Tab */}
        {activeTab === 'domains' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Custom Domain Setup</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="yourdomain.com"
                    disabled={!isEditing}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={saveCustomDomain}
                        disabled={saving}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setCustomDomain(userProfile?.customDomain || '')
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Set up a custom domain for your landing pages. You'll need to configure DNS settings to point to our servers.
                </p>
              </div>

              {userProfile?.customDomain && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">DNS Configuration</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Type:</strong> CNAME</p>
                    <p><strong>Name:</strong> www</p>
                    <p><strong>Value:</strong> your-app.vercel.app</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Form Submission History</h2>
              
              {formSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-600 mb-4">Your form submissions will appear here</p>
                  <button
                    onClick={() => router.push('/create')}
                    className="btn-primary"
                  >
                    Create Your First Page
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formSubmissions.map((submission) => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {submission.businessInfo}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Webinar:</span> {submission.webinarContent}
                            </div>
                            <div>
                              <span className="font-medium">Style:</span> {submission.style}
                            </div>
                            <div>
                              <span className="font-medium">Target:</span> {submission.targetAudience}
                            </div>
                            <div>
                              <span className="font-medium">Submitted:</span> {formatDate(submission.createdAt)}
                            </div>
                          </div>
                          {submission.uniqueSellingPoints && (
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">USP:</span> {submission.uniqueSellingPoints}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {submission.landingPageId ? (
                            <button
                              onClick={() => window.open(`/preview?id=${submission.landingPageId}`, '_blank')}
                              className="btn-secondary text-sm"
                            >
                              View Page
                            </button>
                          ) : (
                            <button
                              onClick={() => regeneratePage(submission.id)}
                              className="btn-primary flex items-center space-x-2 text-sm"
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span>Generate Page</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
