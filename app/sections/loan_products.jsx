import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { FileText } from 'lucide-react'
import React from 'react'
import { loanProducts } from '../constants/content'

const LoanProducts = () => {
  return (
   <>
        <div className="mx-auto w-[475px] h-[106px] text-center text-[#00888c] text-4xl font-semibold font-['Poppins']">Our Loan products</div>
        <div className="ml-[10%] container flex justify-center items-center  p-8">
          <div className="grid grid-cols-3 gap-20 max-w-4xl">
            {loanProducts.map((service,index)=>(
              <Card key={index} className="relative flex flex-col items-center justify-center p-4 bg-[#1a0b2e] text-white rounded-xl shadow-lg transition-all duration-300 w-full aspect-square overflow-hidden group hover:aspect-auto hover:h-auto">
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
                <span className="text-base font-medium text-center mb-2">{service.name}</span>
              </div>
              <p className="text-xs text-center text-white/70 mt-2 max-h-0 opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-4">
                {service.description}
              </p>
              {/* Add subtle glow effect */}
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