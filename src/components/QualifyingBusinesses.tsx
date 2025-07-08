import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const QualifyingBusinesses = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  const businesses = [
    {
      number: "01",
      title: "Wholesalers & Distributors",
      description: "Stock up before high-demand seasons."
    },
    {
      number: "02",
      title: "Manufacturers",
      description: "Buy raw materials without cash flow strain."
    },
    {
      number: "03",
      title: "Agribusinesses",
      description: "Finance inputs (seeds, fertilizers) before harvest."
    },
    {
      number: "04",
      title: "Retail Chains",
      description: "Expand product range with supplier financing."
    }
  ];

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-16 bg-gray-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Who Qualifies for Supply Chain Financing?
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Ideal for:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businesses.map((business, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 hover-lift ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{transitionDelay: `${index * 0.1 + 0.2}s`}}
            >
              <div className="p-6">
                <div className="text-emerald-600 text-5xl font-bold mb-4 transition-transform duration-300 hover:scale-110">{business.number}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 hover:text-[#48A7A7]">
                  {business.title}
                </h3>
                <p className="text-gray-700">
                  {business.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QualifyingBusinesses;
