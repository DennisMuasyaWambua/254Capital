
import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const ServiceHighlights = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  const highlights = [
    {
      title: "Reliability",
      description: "We deliver on our promises with consistency and integrity."
    },
    {
      title: "Innovation",
      description: "We offer tailored lending products designed to meet evolving financial needs."
    },
    {
      title: "Customer Focus",
      description: "We prioritize our clients' success, providing personalized support and guidance."
    }
  ];

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`container mx-auto px-4 -mt-24 relative z-10 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="bg-white rounded-xl shadow-lg p-8 hover-shadow transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, index) => (
            <div 
              key={index} 
              className={`flex items-start space-x-4 hover-lift transition-transform duration-300 transition-all ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} 
              style={{transitionDelay: `${index * 0.1 + 0.1}s`}}
            >
              <div className="rounded-full border-2 border-[#48A7A7] p-4 transition-colors duration-300 hover:bg-[#48A7A7]/10">
                <svg className="w-6 h-6 text-[#48A7A7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" />
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-1 transition-colors duration-300 hover:text-[#48A7A7]">{item.title}</h3>
                <p className="text-darkgray/70 text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceHighlights;
