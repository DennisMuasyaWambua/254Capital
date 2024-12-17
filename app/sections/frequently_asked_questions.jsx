'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQSection() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-teal-600">
        Frequently asked questions
      </h2>

      <div className="border rounded-lg shadow-sm">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left"
          aria-expanded={isOpen}
        >
          <span className="font-medium text-sm sm:text-base">Why Choose 254Capital?</span>
          <ChevronDown 
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="px-4 sm:px-6 pb-3 sm:pb-4">
            <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm sm:text-base">
              <li>
                <span className="font-medium">Fast Approval Process:</span>{' '}
                Easy, quick access to funds with minimal paperwork.
              </li>
              <li>
                <span className="font-medium">Flexible Repayment Plans:</span>{' '}
                Our repayment options are designed to accommodate your financial situation.
              </li>
              <li>
                <span className="font-medium">Expert Support:</span>{' '}
                Our dedicated team is here to assist you throughout the loan process.
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

