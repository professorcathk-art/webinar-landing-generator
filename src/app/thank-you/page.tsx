'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface UpsellProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  features: string[]
  buttonText: string
  popular?: boolean
}

export default function ThankYouPage() {
  const [upsellProducts, setUpsellProducts] = useState<UpsellProduct[]>([])
  const [userName, setUserName] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get user data from URL params or localStorage
    const name = searchParams.get('name') || localStorage.getItem('userName') || 'Valued Customer'
    setUserName(name)

    // Mock upsell products - in real implementation, these would come from the landing page configuration
    const mockUpsells: UpsellProduct[] = [
      {
        id: '1',
        name: 'Perfect Tunnel Pro',
        description: 'Complete webinar funnel system with advanced features',
        price: 197,
        originalPrice: 497,
        features: [
          'Unlimited landing pages',
          'Advanced analytics',
          'Email automation',
          'Payment integration',
          'Custom domains',
          'Priority support'
        ],
        buttonText: 'Get Perfect Tunnel Pro',
        popular: true
      },
      {
        id: '2',
        name: 'Webinar Mastery Course',
        description: 'Complete course on creating high-converting webinars',
        price: 97,
        originalPrice: 297,
        features: [
          '5-hour video course',
          'Templates and scripts',
          'Live Q&A sessions',
          'Certificate of completion',
          'Lifetime access'
        ],
        buttonText: 'Enroll Now'
      },
      {
        id: '3',
        name: 'Done-For-You Setup',
        description: 'We build your complete webinar funnel for you',
        price: 497,
        originalPrice: 997,
        features: [
          'Custom landing page design',
          'Email sequence setup',
          'Payment system integration',
          'Analytics configuration',
          '30-day support'
        ],
        buttonText: 'Get Started'
      }
    ]

    setUpsellProducts(mockUpsells)
  }, [searchParams])

  const handleUpsellClick = (product: UpsellProduct) => {
    // In real implementation, this would redirect to payment or add to cart
    alert(`Redirecting to purchase ${product.name} for $${product.price}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Success Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You, {userName}!</h1>
          <p className="text-lg text-gray-600 mb-4">You've successfully registered for our webinar</p>
          <p className="text-gray-500">Check your email for confirmation and webinar details</p>
        </div>
      </div>

      {/* Upsell Products */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">While You're Here...</h2>
          <p className="text-lg text-gray-600">Take your webinar success to the next level with these exclusive offers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {upsellProducts.map((product) => (
            <div 
              key={product.id} 
              className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                product.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
              }`}
            >
              {product.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="mb-4">
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through mr-2">
                      ${product.originalPrice}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-blue-600">
                    ${product.price}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpsellClick(product)}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                  product.popular
                    ? 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                {product.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* No Thanks Option */}
        <div className="text-center mt-12">
          <button className="text-gray-500 hover:text-gray-700 underline">
            No thanks, I'll stick with the free webinar
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">
          <p>Questions? Contact us at support@perfecttunnel.com</p>
          <p className="mt-2 text-sm">© 2025 Perfect Tunnel. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
