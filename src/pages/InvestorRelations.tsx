import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Eye, TrendingUp, FileCheck, ShieldCheck, Network, Search, Receipt, BarChart3, LineChart, ArrowRight } from 'lucide-react';

const InvestorRelations = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#15133F] to-[#48A7A7] text-white py-36 px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Fund Africa's Future, <br />
              One Invoice at a Time
            </h1>
            <p className="text-xl max-w-2xl opacity-90 leading-relaxed">
              Create impact while earning returns by investing in African businesses that 
              need cash flow solutions today.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="rounded-lg overflow-hidden shadow-xl w-[130%] max-w-[600px]">
              <img 
                src="/investors.jpg" 
                alt="254 Capital team meeting with investors" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Why Institutions Choose 254 Capital Section */}
      <section className="py-24 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-[#15133F] mb-4">Why Institutions Choose 254 Capital</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Short-term deals. Real returns. And a direct line to Africa's next generation of businesses.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Benefit Card 1 */}
          <div className="p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white">
            <div className="w-14 h-14 rounded-md bg-[#48A7A7]/10 mb-5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-3 text-[#15133F]">See the Impact</h3>
            <p className="text-gray-600 leading-relaxed">
              Track how your capital helps African manufacturers and suppliers access cash when they need it most.
            </p>
          </div>
          
          {/* Benefit Card 2 */}
          <div className="p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white">
            <div className="w-14 h-14 rounded-md bg-[#48A7A7]/10 mb-5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-3 text-[#15133F]">Back Business Growth</h3>
            <p className="text-gray-600 leading-relaxed">
              Your investment closes working capital gaps—helping businesses restock, deliver, and thrive with confidence.
            </p>
          </div>
          
          {/* Benefit Card 3 */}
          <div className="p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white">
            <div className="w-14 h-14 rounded-md bg-[#48A7A7]/10 mb-5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-3 text-[#15133F]">Trust the Paper Trail</h3>
            <p className="text-gray-600 leading-relaxed">
              Each deal is tied to real invoices and audited supply chains. No guesswork. No fluff.
            </p>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Benefit Card 4 */}
          <div className="p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white">
            <div className="w-14 h-14 rounded-md bg-[#48A7A7]/10 mb-5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-3 text-[#15133F]">Invest with Confidence</h3>
            <p className="text-gray-600 leading-relaxed">
              Our platform is built with bank-grade security, automated reporting, and real-time deal tracking.
            </p>
          </div>
          
          {/* Benefit Card 5 */}
          <div className="p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white">
            <div className="w-14 h-14 rounded-md bg-[#48A7A7]/10 mb-5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-3 text-[#15133F]">Join a Real Network</h3>
            <p className="text-gray-600 leading-relaxed">
              You're not just investing—you're part of an ecosystem linking suppliers, buyers, and fellow institutions.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-[#15133F] mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Invest in real African businesses, track your impact, and fuel growth—one invoice at a time.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
          {/* Step 01 */}
          <div className="p-8 bg-white rounded-lg text-center shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#E3FCF7] mb-5 flex items-center justify-center mx-auto">
              <Search className="h-7 w-7 text-[#48A7A7]" />
            </div>
            <p className="text-sm text-[#48A7A7] font-medium mb-1">Step 01</p>
            <h3 className="font-bold text-lg mb-3 text-[#15133F]">Discover Real SME Deals</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Browse a daily pipeline of verified invoices from growing African businesses.
            </p>
          </div>

          {/* Step 02 */}
          <div className="p-8 bg-white rounded-lg text-center shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#E3FCF7] mb-5 flex items-center justify-center mx-auto">
              <Receipt className="h-7 w-7 text-[#48A7A7]" />
            </div>
            <p className="text-sm text-[#48A7A7] font-medium mb-1">Step 02</p>
            <h3 className="font-bold text-lg mb-3 text-[#15133F]">Invest in Short-Term Invoices</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Choose deals with 30-90 days cycles and help businesses unlock cash flow instantly.
            </p>
          </div>

          {/* Step 03 */}
          <div className="p-8 bg-white rounded-lg text-center shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#E3FCF7] mb-5 flex items-center justify-center mx-auto">
              <BarChart3 className="h-7 w-7 text-[#48A7A7]" />
            </div>
            <p className="text-sm text-[#48A7A7] font-medium mb-1">Step 03</p>
            <h3 className="font-bold text-lg mb-3 text-[#15133F]">Track Your Impact & Returns</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              See real-time updates as your capital helps SMEs grow. Get paid at the end of each cycle.
            </p>
          </div>

          {/* Step 04 */}
          <div className="p-8 bg-white rounded-lg text-center shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#E3FCF7] mb-5 flex items-center justify-center mx-auto">
              <LineChart className="h-7 w-7 text-[#48A7A7]" />
            </div>
            <p className="text-sm text-[#48A7A7] font-medium mb-1">Step 04</p>
            <h3 className="font-bold text-lg mb-3 text-[#15133F]">Help Businesses Grow</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your investment fuels Africa's supply chain, creating jobs and economic opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Who Can Invest? Section */}
      <section className="py-24 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-[#15133F] mb-4">Who Can Invest?</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Whether you're an individual or an institution, you can help African businesses grow
            by unlocking cash flow through invoice financing.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="p-8 border border-gray-100 rounded-lg flex items-start gap-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-md bg-[#E3FCF7] flex-shrink-0 flex items-center justify-center">
              <div className="w-7 h-7 bg-[#48A7A7] rounded-sm"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 text-[#15133F]">KYC/KYB Verification</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Complete a simple onboarding to verify your identity or business.
              </p>
              <span className="inline-block px-4 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Required
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 border border-gray-100 rounded-lg flex items-start gap-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-md bg-[#E3FCF7] flex-shrink-0 flex items-center justify-center">
              <div className="w-7 h-7 bg-[#48A7A7] rounded-sm"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 text-[#15133F]">Ready to Invest</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Start with flexible ticket sizes—no large minimums required.
              </p>
              <span className="inline-block px-4 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Flexible
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 border border-gray-100 rounded-lg flex items-start gap-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-md bg-[#E3FCF7] flex-shrink-0 flex items-center justify-center">
              <div className="w-7 h-7 bg-[#48A7A7] rounded-sm"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 text-[#15133F]">Support SME Growth</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Join a community of investors fueling Africa's business ecosystem.
              </p>
              <span className="inline-block px-4 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Impact
              </span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-8 border border-gray-100 rounded-lg flex items-start gap-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-md bg-[#E3FCF7] flex-shrink-0 flex items-center justify-center">
              <div className="w-7 h-7 bg-[#48A7A7] rounded-sm"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 text-[#15133F]">Short-Term Commitment</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Most deals are 30-90 days, so your capital is always working.
              </p>
              <span className="inline-block px-4 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Flexible
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Invest in Growth CTA Section */}
      <section className="py-24 px-4 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Content */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#48A7A7]/10 text-[#48A7A7] text-xs font-medium rounded-full mb-4">
                Ready to Make an Impact?
              </span>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#15133F]">
                Invest in Growth.
              </h2>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-[#48A7A7]">
                Fuel Africa's<br />Businesses
              </h2>
              
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                Join a network of investors helping African SMEs unlock 
                cash flow and grow. Transparent, tech-powered, and 
                impact-driven.
              </p>
              
              <div className="flex flex-wrap gap-5 mb-16">
                <Link to="/contact">
                  <Button size="lg" className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 shadow-sm px-6 py-6 text-base font-medium transition-all duration-300">
                    Start Investing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-[#48A7A7] mb-1">30-90 days</h3>
                  <p className="text-sm text-gray-600">Deal Cycles</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#48A7A7] mb-1">Daily</h3>
                  <p className="text-sm text-gray-600">New Opportunities</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#48A7A7] mb-1">100%</h3>
                  <p className="text-sm text-gray-600">Impact Visibility</p>
                </div>
              </div>
            </div>
            
            {/* Right Content - Image */}
            <img 
              src="/herbert.JPG" 
              alt="254 Capital leadership" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default InvestorRelations;
