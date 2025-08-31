'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Filter, Search, User, Mail, Phone, Instagram } from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  instagram: string
  additionalData: any
  createdAt: string
  landingPage: {
    id: string
    title: string
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPage, setSelectedPage] = useState('all')
  const [pages, setPages] = useState<Array<{id: string, title: string}>>([])
  const router = useRouter()

  useEffect(() => {
    fetchLeads()
    fetchPages()
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leads')
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch leads')
      }
      
      setLeads(result.data)
    } catch (error) {
      console.error('Error fetching leads:', error)
      setError('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/landing-pages')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setPages(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.instagram.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPage = selectedPage === 'all' || lead.landingPage.id === selectedPage
    
    return matchesSearch && matchesPage
  })

  const exportLeads = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Instagram', 'Additional Info', 'Page', 'Collected At'],
      ...filteredLeads.map(lead => [
        lead.name,
        lead.email,
        lead.phone,
        lead.instagram,
        JSON.stringify(lead.additionalData),
        lead.landingPage.title,
        new Date(lead.createdAt).toLocaleString()
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
            <p className="text-gray-600">View and manage all collected leads</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
            <button
              onClick={exportLeads}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Pages</option>
              {pages.map(page => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {error ? (
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Leads</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={fetchLeads} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Leads Found</h2>
            <p className="text-gray-600">
              {searchTerm || selectedPage !== 'all' 
                ? 'No leads match your current filters.' 
                : 'No leads have been collected yet. Start sharing your landing pages to collect leads!'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Page
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collected
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">
                              {lead.name || 'Not provided'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">{lead.phone}</span>
                            </div>
                          )}
                          {lead.instagram && (
                            <div className="flex items-center">
                              <Instagram className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">{lead.instagram}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{lead.landingPage.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const mailto = `mailto:${lead.email}?subject=Follow up from your webinar registration`
                              window.open(mailto)
                            }}
                            className="text-primary-600 hover:text-primary-900 text-sm"
                          >
                            Email
                          </button>
                          {lead.phone && (
                            <button
                              onClick={() => {
                                const tel = `tel:${lead.phone}`
                                window.open(tel)
                              }}
                              className="text-primary-600 hover:text-primary-900 text-sm"
                            >
                              Call
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
