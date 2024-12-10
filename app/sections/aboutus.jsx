import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function AboutUs() {
  return (
    <div id="aboutus" className="min-h-screen bg-background">
     
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#00888c]">About Us</h1>
        
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-[#00888c]">Empowering Growth, One Loan at a Time</h2>
          <p className="mb-4 text-muted-foreground">
            At 254 Capital, we believe in the power of financial inclusion to transform lives and businesses. We are a credit-only microfinance institution dedicated to providing tailored financial solutions that address the unique needs of our clients.
          </p>
          <p className="mb-4 text-muted-foreground">
            Our core focus is offering short-term loans to SACCOs, SMEs, and individuals facing temporary cash flow constraints. By providing reliable, and customized lending solutions, we enable our clients to seize opportunities, meet urgent financial obligations, and drive sustainable growth.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-secondary p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-[#00888c]">Our Mission</h3>
            <p className="text-secondary-foreground">
              To bridge financial gaps by offering accessible and flexible credit solutions that empower our clients to thrive.
            </p>
          </div>
          <div className="bg-secondary p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-[#00888c]">Our Vision</h3>
            <p className="text-secondary-foreground">
              To be a trusted financial partner for SACCOs, SMEs, and individuals, fostering economic growth and financial stability across Kenya.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-4 text-[#00888c]">Our Values</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Reliability:</strong> We deliver on our promises with consistency and integrity.</li>
            <li><strong>Innovation:</strong> We offer tailored lending products designed to meet evolving financial needs.</li>
            <li><strong>Customer Focus:</strong> We prioritize our clients' success, providing personalized support and guidance.</li>
          </ul>
        </section>

        <section className="mb-5">
          <p className="mb-4 text-muted-foreground">
            With a team of experienced professionals, we are committed to helping our clients navigate financial challenges and achieve their goals.
          </p>
          <p className="text-xl font-semibold">
            Join us in building a financially inclusive future
          </p>
        </section>

     
      </main>

     
    </div>
  )
}

