
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  // For hero section, we want it to be visible immediately on page load
  const [initialLoad, setInitialLoad] = useState(true);
  
  useEffect(() => {
    // Set a small timeout to allow for a subtle entrance animation
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  

  
  // For hero section, we want it visible immediately
  const shouldShow = true; // Hero should always be visible as it's at the top
  
  return (
    <section 
      className="relative py-20 px-4 md:px-20 lg:px-24 mx-4 my-6 rounded-3xl bg-[#15133F] overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <img
          src="/warehouse-hero-image.jpg"
          alt="Tax professionals working together"
          className="w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="border border-white/20 rounded-full inline-flex px-6 py-2 mb-6 animate-fade-in" style={{animationDuration: '0.7s'}}>
          <p className="text-sm text-white tracking-wide uppercase">YOUR SUCCESS, OUR PRIORITY</p>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in" style={{animationDuration: '0.7s', animationDelay: '0.1s'}}>
          Get the Funding <br/> You Need - Same <br/> Day Approval
        </h1>
        
        <p className="text-white/80 mb-8 max-w-md text-base animate-fade-in" style={{animationDuration: '0.7s', animationDelay: '0.2s'}}>
          At 254-Capital, we simplify access to credit so you can grow your business,
          achieve financial security and freedom - <b>without the hassle.</b>
        </p>
        
        <div className="flex items-center mb-[70px] animate-fade-in" style={{animationDuration: '0.7s', animationDelay: '0.3s'}}>
          <Button 
            asChild
            className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-300 ease-in-out hover:shadow-md"
          >
            <Link to="/contacts">Apply Now</Link>
          </Button>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
