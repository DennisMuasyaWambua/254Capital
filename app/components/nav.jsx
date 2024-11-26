import Image from 'next/image'
import React from 'react'

const Nav = () => {
  return (
    <>
        <div className="flex justify-between items-center h-full">
            <Image
            className="ml-40 mt-4"
            src={"/254capital-logo.png"}
            quality={100}
            width={200}
            height={100}
            alt="254Capital"
            />
            <nav className="mr-20 mt-2 flex justify-end">
                <a href="#" className="w-[121px] h-[53px] text-center text-[#00888c]/80 text-xl font-bold font-['Poppins']" aria-current="page">Home</a>
                <a href="#" className="w-[121px] h-[53px] text-center text-[#00888c]/80 text-xl font-bold font-['Poppins']">About us</a>
                <a href="#" className="w-[121px] h-[53px] text-center text-[#00888c]/80 text-xl font-bold font-['Poppins']">Products</a>
                <a href="#" className="w-[121px] h-[53px] text-center text-[#00888c]/80 text-xl font-bold font-['Poppins']">Blog</a>
                <a href="#" className="w-[121px] h-[53px] text-center text-[#00888c]/80 text-xl font-bold font-['Poppins']">Contact us</a>
            </nav>
        </div>
    </>
  )
}

export default Nav