import React from 'react';
import CountUp from 'react-countup';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const PerformanceMetrics = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  const metrics = [
    {
      value: 14.2,
      suffix: '%',
      decimals: 1,
      label: 'Average Annual Return'
    },
    {
      value: 81,
      suffix: 'K+',
      decimals: 0,
      label: 'Project Done'
    },
    {
      value: 271,
      suffix: '+',
      decimals: 0,
      label: 'Professional'
    },
    {
      value: 4.7,
      suffix: '',
      decimals: 1,
      label: 'Client Reviews'
    }
  ];
  
  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-16 relative overflow-hidden transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.95) 0%, rgba(15, 118, 110, 0.9) 100%)'
      }}
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-wrap justify-center items-center text-center gap-8 md:gap-16 lg:gap-24">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className={`text-center px-4 hover-lift transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{transitionDelay: `${index * 0.1 + 0.2}s`}}
            >
              <div className="text-white text-5xl font-bold mb-2 transition-transform duration-300 hover:scale-110">
                {isVisible ? 
                  <CountUp 
                    end={metric.value} 
                    decimals={metric.decimals} 
                    suffix={metric.suffix} 
                    duration={2.5} 
                  /> : 
                  `0${metric.decimals > 0 ? '.0' : ''}${metric.suffix}`
                }
              </div>
              <p className="text-white text-sm uppercase tracking-wider transition-colors duration-300 hover:text-[#48A7A7]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerformanceMetrics;
