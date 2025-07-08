import React from 'react';
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Link } from 'react-router-dom';

const SupplyChainFinancing = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  const features = [
    {
      title: "Same-day Approval & Disbursement",
      description: "Get funds when you need them without delays.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Flexible Financing Range",
      description: "Tailored financing solutions to match your business needs and scale.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "No Fixed Collateral Required",
      description: "Invoice & purchase order financing options available.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Industry-Tailored Solutions",
      description: "Designed for manufacturers, retailers, and agri-businesses.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];
  

  
  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className="py-16 bg-white"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className={`transition-all duration-400 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-[#48A7A7] font-medium mb-2">Supply Chain Financing</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight transition-colors duration-300 ease-in-out hover:text-[#48A7A7]">
                Fuel Your Growth with Fast, Flexible Financing
              </h2>
              <p className="text-gray-700 mb-8">
                Need working capital to buy inventory, pay suppliers, or fulfill large orders? 254 Capital provides supply chain financing to help SMEs, distributors, and agribusinesses bridge cash flow gaps and seize growth opportunities—without lengthy bank processes.
              </p>
            </div>
            
            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`flex items-start gap-4 transition-all duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                  style={{transitionDelay: `${index * 0.1 + 0.1}s`}}
                >
                  <div className="bg-[#48A7A7]/10 p-3 rounded-full transition-colors duration-300 ease-in-out hover:bg-[#48A7A7]/30">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-300 ease-in-out hover:text-[#48A7A7]">{feature.title}</h3>
                    <p className="text-gray-700 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={`pt-6 flex items-center transition-all duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '0.5s'}}>
              <Button 
                asChild
                className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-300 ease-in-out hover:shadow-md"
              >
                <Link to="/contacts">Contact Us</Link>
              </Button>
            </div>

          </div>
          
          {/* Right side - Image */}
          <div className={`relative h-[400px] lg:h-auto rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '0.2s'}}>
            <img 
              src="/stockroom.jpg" 
              alt="Supply Chain Financing" 
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupplyChainFinancing;
