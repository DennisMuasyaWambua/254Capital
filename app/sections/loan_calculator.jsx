'use client'

import { useState } from 'react'
import Image from 'next/image'

const LOAN_TYPES = {
  'supply-chain': { name: 'Supply Chain Financing', annualRate: 0.15 },
  'business': { name: 'Business Loan', annualRate: 0.18 },
  'personal': { name: 'Personal Loan', annualRate: 0.22 },
}

export default function LoanCalculator() {
  const [amount, setAmount] = useState('1000000')
  const [months, setMonths] = useState('24')
  const [loanType, setLoanType] = useState('supply-chain')

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(amount)
    const numberOfMonths = parseFloat(months)
    const annualRate = LOAN_TYPES[loanType].annualRate
    const monthlyRate = annualRate / 12
    
    const monthlyPayment = (principal * (1 + (numberOfMonths * monthlyRate))) / numberOfMonths
    return monthlyPayment.toFixed(0)
  }

  return (
    <div className="flex flex-col lg:flex-row items-start gap-8 p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="w-full lg:w-1/2 space-y-6">
        <h2 className="text-2xl font-bold text-teal-600">Loan calculator</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">How much do you need</label>
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

          <div className="space-y-2">
            <label htmlFor="loan-type" className="block text-sm font-medium text-gray-700">Loan type</label>
            <select
              id="loan-type"
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
            >
              {Object.entries(LOAN_TYPES).map(([key, { name }]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <div className="mt-2 text-sm text-gray-600">
              Interest Rate: {(LOAN_TYPES[loanType].annualRate * 100).toFixed(2)}% per annum
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="months" className="block text-sm font-medium text-gray-700">How many months do you need</label>
            <input
              id="months"
              type="number"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
            />
          </div>

          <div className="p-6 bg-gray-50 rounded-lg shadow">
            <p className="text-sm text-gray-600">You will pay</p>
            <p className="text-3xl font-semibold text-teal-600">
              ksh {calculateMonthlyPayment()}
            </p>
            <p className="text-sm text-gray-600">Per month</p>
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

