import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const WhyChooseUs = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  const features = [
    {
      title: "Competitive Interest Rates",
      description: "Lower than overdrafts & short-term loans.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Repayment Aligned With Sales",
      description: "Settle when your buyers pay.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "No Hidden Fees",
      description: "Clear pricing from day one.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    },
    {
      title: "Pay Suppliers Upfront",
      description: "Secure stock even when buyers haven't paid you yet.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    },
    {
      title: "Fulfill Large Orders",
      description: "Take on bigger contracts without liquidity worries.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      title: "Avoid Stockouts",
      description: "Maintain inventory levels during peak seasons.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#48A7A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    }
  ];

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-16 bg-white transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side - Image */}
          <div className={`relative transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <img 
              src="/Why Chose us.jpg" 
              alt="Why Choose Us" 
              className="rounded-lg shadow-xl w-full h-auto object-cover transition-transform duration-700 hover:scale-105 hover-shadow"
            />
          </div>
          
          {/* Right side - Content */}
          <div className="space-y-8">
            <div className={`transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <p className="text-[#48A7A7] font-medium mb-2">Why Choose Us</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 transition-colors duration-300 hover:text-[#48A7A7]">Transparent & Flexible Terms</h2>
              <p className="text-gray-700 mb-8">
                We offer clear, straightforward financing solutions designed to help your business thrive.
              </p>
            </div>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-4 hover-lift transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{transitionDelay: `${index * 0.1 + 0.2}s`}}
                >
                  <div className="bg-[#48A7A7]/10 p-3 rounded-full transition-colors duration-300 hover:bg-[#48A7A7]/30">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-300 hover:text-[#48A7A7]">{feature.title}</h3>
                    <p className="text-gray-700 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
