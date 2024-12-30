'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'

const SHORT_TERM_RATES = {
  '1000-5000': { 1: 0.20, 2: 0.30 },
  '5001-10000': { 1: 0.20, 2: 0.30, 3: 0.35 },
  '10001-20000': { 1: 0.20, 2: 0.30, 3: 0.35 },
  '20001-30000': { 1: 0.20, 2: 0.30, 3: 0.35 },
  '30001-40000': { 1: 0.15, 2: 0.30, 3: 0.35, 4: 0.40 },
  '40001-50000': { 1: 0.15, 2: 0.30, 3: 0.35, 4: 0.40, 5: 0.50 }
}

const BRIDGING_LOANS = {
  'option-1': { name: 'Option 1: 10 months', rate: 0.60, months: 10 },
  'option-2': { name: 'Option 2: 12 months', rate: 0.70, months: 12 }
}
export default function LoanCalculator() {
  const [amount, setAmount] = useState('5000')
  const [months, setMonths] = useState('1')
  const [loanType, setLoanType] = useState('short-term')
  const [bridgingOption, setBridgingOption] = useState('option-1')

  const getApplicableRateTier = (amount) => {
    const numAmount = parseInt(amount)
    for (const [range, rates] of Object.entries(SHORT_TERM_RATES)) {
      const [min, max] = range.split('-').map(n => parseInt(n))
      if (numAmount >= min && numAmount <= max) {
        return rates
      }
    }
    return null
  }

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(amount)
    const numberOfMonths = parseInt(months)

    if (loanType === 'short-term') {
      const rateTier = getApplicableRateTier(principal)
      if (!rateTier || !rateTier[numberOfMonths]) {
        return 'Invalid amount or duration'
      }
      
      const monthlyRate = rateTier[numberOfMonths]
      const totalAmount = principal * (1 + (monthlyRate * numberOfMonths))
      return (totalAmount / numberOfMonths).toFixed(2)
    } else {
      // Bridging loan calculation
      const { rate, months: loanMonths } = BRIDGING_LOANS[bridgingOption]
      const totalAmount = principal * (1 + rate)
      return (totalAmount / loanMonths).toFixed(2)
    }
  }

  const availableMonths = useMemo(() => {
    if (loanType === 'short-term') {
      const rateTier = getApplicableRateTier(amount)
      return rateTier ? Object.keys(rateTier).map(Number) : []
    }
    return []
  }, [amount, loanType])

  const getInterestRate = () => {
    if (loanType === 'short-term') {
      const rateTier = getApplicableRateTier(amount)
      return rateTier && rateTier[months] ? `${(rateTier[months] * 100)}% per month` : 'N/A'
    } else {
      const { rate } = BRIDGING_LOANS[bridgingOption]
      return `${(rate * 100)}% over the loan period`
    }
  }
  return (
    <div className="flex flex-col lg:flex-row items-start gap-8 p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="w-full lg:w-1/2 space-y-6">
        <h2 className="text-2xl font-bold text-teal-600">Loan Calculator</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Loan Type</label>
            <select
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
            >
              <option value="short-term">Short Term Loan</option>
              <option value="bridging">Bridging Loan</option>
            </select>
          </div>

          {loanType === 'bridging' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Bridging Loan Option</label>
              <select
                value={bridgingOption}
                onChange={(e) => setBridgingOption(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
              >
                {Object.entries(BRIDGING_LOANS).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Loan Amount (Ksh {loanType === 'short-term' ? '1,000 - 50,000' : ''})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Ksh</span>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-12 w-full rounded-md border-gray-300 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
              />
            </div>
          </div>

          {loanType === 'short-term' && (
            <div className="space-y-2">
              <label htmlFor="months" className="block text-sm font-medium text-gray-700">Duration (months)</label>
              <select
                id="months"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
              >
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month} month{month > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-2 text-sm text-gray-600">
            Interest Rate: {getInterestRate()}
          </div>

          <div className="p-6 bg-gray-50 rounded-lg shadow">
            <p className="text-sm text-gray-600">Monthly Payment</p>
            <p className="text-3xl font-semibold text-teal-600">
              Ksh {calculateMonthlyPayment()}
            </p>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>Note:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Loans under 2 weeks are issued at 10% per month</li>
              <li>5 days grace period available. Late payments incur 5% penalty per week</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
        <div className="relative aspect-square max-w-md mx-auto">
          <Image
            src="/loan.jpg"
            alt="Person calculating finances"
            width={400}
            height={400}
            className="rounded-lg object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-purple-300 opacity-50 rounded-lg -z-10 translate-x-4 translate-y-4" />
        </div>
      </div>
    </div>
  )
}

