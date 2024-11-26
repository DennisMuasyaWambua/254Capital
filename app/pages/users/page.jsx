import Nav from '@/app/widgets/nav'
import About from '@/app/sections/about'
import LoanProducts from '@/app/sections/loan_products'
import Image from 'next/image'
import React from 'react'

const Users = () => {
  return (
    <div>
        <Nav/>
        <Image
        src={'/genZ.jpeg'}
        fill
        alt="genz"
        sizes="100vw"
        quality={100}
        style={{objectFit:'cover',zIndex:-1, opacity:0.8}}/>
        {/* Welcome message */}
        <div className='flex flex-col justify-center items-center min-h-screen'>
            <div className="w-[893px] h-[117px] text-center text-white text-5xl font-bold font-['Poppins']">Your wealth journey starts with us</div>
        </div>
        <About/>
        <LoanProducts/>
    </div>
  )
}

export default Users