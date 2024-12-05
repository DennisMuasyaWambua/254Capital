import Image from 'next/image'
import React from 'react'

const About = () => {
  return (
    <div className="relative flex flex-col md:flex-row items-center bg-white px-4 py-8 md:px-20 md:py-16">
    {/* Image Section */}
    <div className="w-full md:w-1/2 flex justify-center">
      <Image 
        src={"/sme.jpg"} 
        width={700} 
        height={396} 
        alt="sme" 
        className="rounded-lg object-cover max-w-full h-auto"
      />
    </div>

    {/* Text Section */}
    <div className="mt-8 md:mt-0 md:ml-8 w-full md:w-1/2 text-center md:text-left">
      <h2 className="text-black text-2xl md:text-4xl font-semibold font-['Poppins']">
        We enable our customers to access affordable credit and financial services to transform livelihoods.
      </h2>
      <p className="text-[#736f6f] text-sm md:text-lg font-medium font-['Poppins'] mt-4">
        254 Capital aims to broaden credit access by simplifying the processes and collateral requirements for loan applicants. 
        We ensure that loans are issued within the same day. 254 Capital enables ease in handling financial emergencies and 
        helps our clients navigate the stormy waters of everyday life.
      </p>
      <div className="mt-6 flex justify-center md:justify-start">
        <button className="bg-black text-white text-lg md:text-xl font-semibold font-['Poppins'] px-6 py-3 rounded-2xl hover:bg-gray-800">
          Get started
        </button>
      </div>
    </div>
  </div>
  )
}

export default About