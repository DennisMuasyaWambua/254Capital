import Image from 'next/image'
import React from 'react'

const Nav = () => {
  return (
    <header className="flex flex-wrap justify-between items-center px-4 py-4 md:px-10 md:py-6">
    {/* Logo Section */}
    <div className="flex-shrink-0">
      <Image
        className="ml-0 md:ml-10 mt-0 md:mt-2"
        src={"/254capital-logo.png"}
        quality={100}
        width={150} // Reduced size for better responsiveness
        height={75}
        alt="254Capital"
      />
    </div>

    {/* Navigation Links */}
    <nav className="flex flex-wrap justify-center md:justify-end items-center space-x-4 md:space-x-6">
      <a href="#" className="text-sm md:text-base text-[#00888c]/80 font-bold font-['Poppins'] hover:text-[#00888c]">Home</a>
      <a href="#" className="text-sm md:text-base text-[#00888c]/80 font-bold font-['Poppins'] hover:text-[#00888c]">About us</a>
      <a href="#" className="text-sm md:text-base text-[#00888c]/80 font-bold font-['Poppins'] hover:text-[#00888c]">Products</a>
      <a href="#" className="text-sm md:text-base text-[#00888c]/80 font-bold font-['Poppins'] hover:text-[#00888c]">Blog</a>
      <a href="#" className="text-sm md:text-base text-[#00888c]/80 font-bold font-['Poppins'] hover:text-[#00888c]">Contact us</a>
    </nav>
  </header>
  )
}

export default Nav