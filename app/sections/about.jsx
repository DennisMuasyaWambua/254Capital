import Image from 'next/image'
import React from 'react'

const About = () => {
  return (
    <>
    <div className="w-[1472px] h-[515px] relative ml-[10%] mr-[20%]">
    <div className="ml-5 w-[1472px] h-[515px] left-0 top-0 absolute bg-white">
        <Image src={"/sme.jpg"} width={700} height={396} alt='sme'/>
    </div>
    
        <div className="w-[715px] h-[385.70px] left-[747px] top-[58.07px] absolute">
            <span className="text-black text-[32px] font-semibold font-['Poppins']">We enable our customers access affordable credit and financial services to transform livelihoods.<br/></span>
            <span className="text-[#736f6f] text-xl font-medium font-['Poppins']">  254 Capital aims to broaden credit access by simplifying the processes  and collateral requirements for loan applicants. We ensure that the  loans are issued within the same day 254 Capital enables ease in  handling financial emergencies and helps our clients navigate the stormy waters of everyday life.<br/></span>
            <div className="w-[255px] h-[68px] relative mt-[5%]">
                <div className="w-[255px] h-[68px] left-0 top-0 absolute bg-black rounded-2xl"></div>
                <div className="w-48 h-10 left-[39px] top-[14px] absolute text-center text-white text-2xl font-semibold font-['Poppins']">Get started</div>
                </div>
        </div>
    </div>
    </>
  )
}

export default About