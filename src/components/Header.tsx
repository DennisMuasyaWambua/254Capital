
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Use localStorage to track if the initial animation has played across page navigations
  useEffect(() => {
    const hasInitialAnimationPlayed = localStorage.getItem('headerAnimationPlayed');
    if (hasInitialAnimationPlayed) {
      setHasAnimated(true);
    } else {
      // Set after a small delay to ensure animation plays properly
      const timer = setTimeout(() => {
        localStorage.setItem('headerAnimationPlayed', 'true');
        setHasAnimated(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Investor Relations', path: '/investor-relations' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Contacts', path: '/contacts' }
  ];
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className={`bg-white w-full py-4 px-6 flex items-center justify-between shadow-sm relative z-20 ${!hasAnimated ? 'animate-fade-in' : ''}`}>
      <div className={`flex items-center ${!hasAnimated ? 'animate-slide-in' : ''}`}>
        <Link to="/" className="flex items-center hover-lift transition-transform duration-300">
          <img 
            src="/254-capital-logo.jpg" 
            alt="254 Capital" 
            className="h-12 w-auto transition-transform duration-300 hover:scale-105" />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className={`hidden lg:flex items-center space-x-6 ${!hasAnimated ? 'animate-slide-in' : ''}`} style={!hasAnimated ? {animationDelay: '0.1s'} : {}}>
        {navLinks.map((link, index) => (
          <Link 
            key={index}
            to={link.path} 
            className={`text-darkgray hover:text-[#48A7A7] transition-colors duration-200 relative group hover-lift ${!hasAnimated ? 'animate-slide-in' : ''}`}
            style={!hasAnimated ? {animationDelay: `${index * 0.05 + 0.2}s`} : {}}
          >
            {link.name}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#48A7A7] transition-all duration-300 group-hover:w-full"></span>
          </Link>
        ))}
      </nav>

      <div className={`flex items-center space-x-4 ${!hasAnimated ? 'animate-slide-in' : ''}`} style={!hasAnimated ? {animationDelay: '0.3s'} : {}}>

        
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu} 
          className="lg:hidden flex items-center justify-center p-2 rounded-md text-[#15133F] hover:text-[#48A7A7] focus:outline-none transition-colors duration-200 hover-scale"
        >
          <div className="relative w-6 h-6">
            <X 
              size={24} 
              className={`absolute transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} 
            />
            <Menu 
              size={24} 
              className={`absolute transition-all duration-300 ${!isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} 
            />
          </div>
        </button>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div 
        className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-md z-30 transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      >
        <nav className="flex flex-col py-4 px-6">
          {navLinks.map((link, index) => (
            <Link 
              key={index}
              to={link.path} 
              className="py-3 text-darkgray hover:text-[#48A7A7] border-b border-gray-100 transition-colors duration-200 hover-lift"
              style={{}}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

        </nav>
      </div>

    </header>
  );
};

export default Header;
