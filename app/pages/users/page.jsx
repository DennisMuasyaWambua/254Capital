import Nav from '@/app/widgets/nav'
import About from '@/app/sections/about'
import LoanProducts from '@/app/sections/loan_products'
import Image from 'next/image'
import React from 'react'
import ContactForm from '@/app/sections/contact_form'
import ApplyForLoan from '@/app/sections/apply_for_loan'

const Users = () => {
  return (
    <div>
      <Nav />
      <Image
        src={'/genZ.jpeg'}
        fill
        alt="genz"
        sizes="100vw"
        quality={100}
        style={{ objectFit: 'cover', zIndex: -1, opacity: 0.8 }}
      />
      {/* Welcome message */}
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <div className="w-full max-w-xl text-center text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-['Poppins']">
          Your wealth journey starts with us
        </div>
      </div>
      <About />
      <LoanProducts />
      <ContactForm />
      <ApplyForLoan />
    </div>
  )
}

export default Users
