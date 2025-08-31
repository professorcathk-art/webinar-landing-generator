'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Download, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  instagram?: string
  landingPageId: string
  landingPageTitle: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  createdAt: string
  notes?: string
}

export default function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      // This would be replaced with actual API call
      // const response = await fetch('/api/leads')
      // const data = await response.json()
      
      // Mock data for now
      const mockLeads: Lead[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          landingPageId: 'page1',
          landingPageTitle: 'Webinar Landing Page 1',
          status: 'new',
          createdAt: '2024-01-15T10:30:00Z',
          notes: 'Interested in webinar'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          instagram: '@janesmith',
          landingPageId: 'page2',
          landingPageTitle: 'Webinar Landing Page 2',
          status: 'contacted',
          createdAt: '2024-01-14T15:45:00Z',
          notes: 'Follow up scheduled'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '+1987654321',
          landingPageId: 'page1',
          landingPageTitle: 'Webinar Landing Page 1',
          status: 'qualified',
          createdAt: '2024-01-13T09:15:00Z',
          notes: 'High potential lead'
        }
      ]
      
      setLeads(mockLeads)
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.landingPageTitle.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-orange-100 text-orange-800'
      case 'converted': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />
      case 'contacted': return <Eye className="w-4 h-4" />
      case 'qualified': return <CheckCircle className="w-4 h-4" />
      case 'converted': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const exportLeads = () => {
    const csvContent = [
      'Name,Email,Phone,Instagram,Landing Page,Status,Created At,Notes',
      ...filteredLeads.map(lead => 
        `"${lead.name}","${lead.email}","${lead.phone || ''}","${lead.instagram || ''}","${lead.landingPageTitle}","${lead.status}","${new Date(lead.createdAt).toLocaleDateString()}","${lead.notes || ''}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      // This would be replaced with actual API call
      // await fetch(`/api/leads/${leadId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // })
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus as any } : lead
      ))
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track leads from your landing pages
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportLeads}
                className="btn-secondary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button className="btn-primary flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-500">
                {filteredLeads.length} of {leads.length} leads
              </span>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Landing Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </div>
                        {lead.notes && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {lead.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.email}</div>
                      {lead.phone && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.instagram && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <span className="mr-1">@</span>
                          {lead.instagram.replace('@', '')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.landingPageTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(lead.status)} border-0 focus:ring-2 focus:ring-primary-500`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first landing page to capture leads.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
