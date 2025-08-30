'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, Heart, Share2, Calendar, Users, Star } from 'lucide-react'
import Link from 'next/link'

interface MarketplacePage {
  id: string
  title: string
  description: string
  category: string
  author: string
  thumbnail: string
  views: number
  likes: number
  createdAt: string
  tags: string[]
  isListed: boolean
}

export default function Marketplace() {
  const [pages, setPages] = useState<MarketplacePage[]>([])
  const [filteredPages, setFilteredPages] = useState<MarketplacePage[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [isLoading, setIsLoading] = useState(true)

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'health', name: 'Health & Wellness' },
    { id: 'education', name: 'Education' },
    { id: 'finance', name: 'Finance' },
    { id: 'lifestyle', name: 'Lifestyle' },
  ]

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'views', name: 'Most Viewed' },
  ]

  useEffect(() => {
    fetchMarketplacePages()
  }, [])

  useEffect(() => {
    filterAndSortPages()
  }, [pages, searchTerm, selectedCategory, sortBy])

  const fetchMarketplacePages = async () => {
    try {
      const response = await fetch('/api/marketplace')
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages)
      }
    } catch (error) {
      console.error('Error fetching marketplace pages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortPages = () => {
    let filtered = pages.filter(page => page.isListed)

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(page => page.category === selectedCategory)
    }

    // Sort pages
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes)
        break
      case 'views':
        filtered.sort((a, b) => b.views - a.views)
        break
    }

    setFilteredPages(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Webinar Landing Page Marketplace
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover and get inspired by amazing webinar landing pages created by our community
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search pages, tags, or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredPages.length} of {pages.filter(p => p.isListed).length} pages
          </p>
        </div>

        {filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gray-100">
                  {page.thumbnail ? (
                    <img
                      src={page.thumbnail}
                      alt={page.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {categories.find(c => c.id === page.category)?.name}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs">{page.likes}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {page.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {page.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {page.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {page.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{page.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{page.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{page.likes}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(page.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/preview/${page.id}`}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      View Page
                    </Link>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
