import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { FileText } from 'lucide-react'
import React from 'react'
import { loanProducts } from '../constants/content'

const LoanProducts = () => {
  return (
    <>
    {/* Title Section */}
    <div className="mx-auto text-center text-[#00888c] text-2xl md:text-4xl font-semibold font-['Poppins'] px-4">
      Our Loan Products
    </div>

    {/* Grid Section */}
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loanProducts.map((service, index) => (
          <Card
            key={index}
            className="relative flex flex-col items-center justify-center p-6 bg-[#1a0b2e] text-white rounded-xl shadow-lg transition-all duration-300 overflow-hidden group hover:scale-105"
          >
            {/* Image Section */}
            <div className="flex flex-col items-center transition-all duration-300 transform group-hover:-translate-y-2">
              <div className="relative w-16 h-16 mb-3">
                <Image
                  src={service.image}
                  alt={service.name}
                  layout="fill"
                  objectFit="contain"
                  className="transition-transform duration-300 group-hover:scale-90"
                />
              </div>
              <span className="text-sm md:text-base font-medium text-center mb-2">
                {service.name}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-center text-white/70 mt-2 max-h-0 opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-4">
              {service.description}
            </p>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-white/5 rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-20 rounded-xl" />
          </Card>
        ))}
      </div>
    </div>
  </>
  )
}

export default LoanProducts