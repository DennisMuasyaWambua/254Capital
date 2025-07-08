
import React from 'react';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

const Services = () => {

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-[#15133F] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in" style={{animationDuration: '0.7s'}}>
            Our Financial Solutions
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 animate-fade-in" style={{animationDuration: '0.7s', animationDelay: '0.1s'}}>
            Tailored financing options designed to help your business grow, manage cash flow, and seize new opportunities.
          </p>
        </div>
      </section>

      {/* Service Cards Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1 - For Sellers */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-[#48A7A7]/10 text-[#48A7A7] rounded-full text-sm font-medium">For Sellers</span>
              </div>
              <div className="mb-4">
                <div className="bg-[#48A7A7]/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Invoice Financing</h3>
              <p className="text-gray-600 mb-4">Turn unpaid invoices into working capital in 24 hours. No collateral needed.</p>
              <p className="text-sm text-gray-500 italic mb-4">Trusted by growing SMEs in Africa.</p>
              <Link to="/contacts" className="text-[#48A7A7] font-medium flex items-center hover:underline">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            
            {/* Card 2 - For Buyers */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-[#48A7A7]/10 text-[#48A7A7] rounded-full text-sm font-medium">For Buyers</span>
              </div>
              <div className="mb-4">
                <div className="bg-[#48A7A7]/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Supplier Payments</h3>
              <p className="text-gray-600 mb-4">Extend payment terms while keeping suppliers happy. Strengthen relationships.</p>
              <p className="text-sm text-gray-500 italic mb-4">Digital, seamless, and risk-free.</p>
              <Link to="/contacts" className="text-[#48A7A7] font-medium flex items-center hover:underline">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            
            {/* Card 3 - For Investors */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-[#48A7A7]/10 text-[#48A7A7] rounded-full text-sm font-medium">For Investors</span>
              </div>
              <div className="mb-4">
                <div className="bg-[#48A7A7]/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Investment Opportunities</h3>
              <p className="text-gray-600 mb-4">Earn attractive returns with verified, short-term invoices. New deals weekly.</p>
              <p className="text-sm text-gray-500 italic mb-4">New deals added Daily.</p>
              <Link to="/contacts" className="text-[#48A7A7] font-medium flex items-center hover:underline">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            
            {/* Card 4 - For Institutions */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-[#48A7A7]/10 text-[#48A7A7] rounded-full text-sm font-medium">For Institutions</span>
              </div>
              <div className="mb-4">
                <div className="bg-[#48A7A7]/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">SACCO Onward Lending</h3>
              <p className="text-gray-600 mb-4">We provide capital to Saccos who then extend loans to their members, enhancing their lending capacity.</p>
              <p className="text-sm text-gray-500 italic mb-4">Empowering community financial institutions.</p>
              <Link to="/contacts" className="text-[#48A7A7] font-medium flex items-center hover:underline">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            
            {/* Card 5 - Salary Check Off loan */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-[#48A7A7]/10 text-[#48A7A7] rounded-full text-sm font-medium">For Employees</span>
              </div>
              <div className="mb-4">
                <div className="bg-[#48A7A7]/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Salary Check Off loan</h3>
              <p className="text-gray-600 mb-4">Access affordable credit directly through your employer with automatic salary deductions for convenient repayment.</p>
              <p className="text-sm text-gray-500 italic mb-4">Competitive rates for employed professionals.</p>
              <Link to="/contacts" className="text-[#48A7A7] font-medium flex items-center hover:underline">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            
            {/* Card 6 - Personal Unsecured loan */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-[#48A7A7]/10 text-[#48A7A7] rounded-full text-sm font-medium">For Individuals</span>
              </div>
              <div className="mb-4">
                <div className="bg-[#48A7A7]/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Unsecured loan</h3>
              <p className="text-gray-600 mb-4">Quick access to funds without collateral for personal needs, emergencies, or opportunities with flexible repayment options.</p>
              <p className="text-sm text-gray-500 italic mb-4">Fast approval process with minimal documentation.</p>
              <Link to="/contacts" className="text-[#48A7A7] font-medium flex items-center hover:underline">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            
          </div>
        </div>
      </section>
      
    </Layout>
  );
};

export default Services;
