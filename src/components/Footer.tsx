import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Use localStorage to track if the initial animation has played across page navigations
  useEffect(() => {
    const hasInitialAnimationPlayed = localStorage.getItem('footerAnimationPlayed');
    if (hasInitialAnimationPlayed) {
      setHasAnimated(true);
    } else {
      // Set after a small delay to ensure animation plays properly
      const timer = setTimeout(() => {
        localStorage.setItem('footerAnimationPlayed', 'true');
        setHasAnimated(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your newsletter service
    alert(`Thank you for subscribing with ${email}! You'll receive our updates soon.`);
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Investor Relations', path: '/investor-relations' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Contacts', path: '/contacts' }
  ];

  const contactInfo = [
    { icon: <MapPin size={18} className="text-[#48A7A7] flex-shrink-0 mt-1" />, text: 'IPS Building, 7th Floor Nairobi, Kenya', link: null },
    { icon: <Phone size={18} className="text-[#48A7A7] flex-shrink-0" />, text: '+254 742 064 270', link: 'tel:+254742064270' },
    { icon: <Mail size={18} className="text-[#48A7A7] flex-shrink-0" />, text: 'info@254-capital.com', link: 'mailto:info@254-capital.com' }
  ];



  return (
    <footer className={`bg-[#15133F] text-white pt-16 pb-8 ${!hasAnimated ? 'animate-fade-in' : ''}`}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Logo and About */}
          <div className={`space-y-4 ${!hasAnimated ? 'animate-slide-in' : ''}`} style={!hasAnimated ? {animationDelay: '0.1s'} : {}}>
            <Link to="/" className="inline-block hover-lift transition-transform duration-300">
              <img 
                src="/254-capital-logo.jpg" 
                alt="254 Capital" 
                className="h-12 w-auto bg-white rounded-md p-1 transition-transform duration-300 hover:scale-105" 
              />
            </Link>
            <p className="text-gray-300 mt-4">
              254 Capital provides innovative financial solutions to help businesses grow through supply chain financing, bridging loans, and more.
            </p>

          </div>

          {/* Column 2: Quick Links */}
          <div className={`${!hasAnimated ? 'animate-slide-in' : ''}`} style={!hasAnimated ? {animationDelay: '0.2s'} : {}}>
            <h3 className="text-lg font-semibold mb-4 text-[#48A7A7] transition-colors duration-300 hover:text-white">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index} className={`${!hasAnimated ? 'animate-slide-in' : ''}`} style={!hasAnimated ? {animationDelay: `${index * 0.05 + 0.3}s`} : {}}>
                  <Link to={link.path} className="text-gray-300 hover:text-white transition-colors duration-300 relative group inline-block">
                    {link.name}
                    <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}


            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className={`${!hasAnimated ? 'animate-slide-in' : ''}`} style={!hasAnimated ? {animationDelay: '0.3s'} : {}}>
            <h3 className="text-lg font-semibold mb-4 text-[#48A7A7] transition-colors duration-300 hover:text-white">Contact Us</h3>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li 
                  key={index} 
                  className={`flex items-${index === 0 ? 'start' : 'center'} space-x-3 ${!hasAnimated ? 'animate-slide-in' : ''} hover-lift transition-transform duration-300`}
                  style={!hasAnimated ? {animationDelay: `${index * 0.1 + 0.4}s`} : {}}
                >
                  {item.icon}
                  {item.link ? (
                    <a href={item.link} className="text-gray-300 hover:text-white transition-colors duration-300">{item.text}</a>
                  ) : (
                    <span className="text-gray-300">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
            <div className={`mt-6 ${!hasAnimated ? 'animate-slide-in' : ''}`} style={!hasAnimated ? {animationDelay: '0.7s'} : {}}>
              <Button 
                onClick={() => window.location.href = '/contacts'}
                className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm hover-lift transition-transform duration-300"
              >
                Get In Touch
              </Button>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div className={`${!hasAnimated ? 'animate-slide-in' : ''}`} style={!hasAnimated ? {animationDelay: '0.4s'} : {}}>
            <h3 className="text-lg font-semibold mb-4 text-[#48A7A7] transition-colors duration-300 hover:text-white">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter to receive updates on our services, offers, and financial tips.
            </p>
            <form onSubmit={handleSubscribe} className={`space-y-3 group ${!hasAnimated ? 'animate-slide-in' : ''}`} style={!hasAnimated ? {animationDelay: '0.5s'} : {}}>
              <div className="flex hover-shadow transition-all duration-300">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-grow px-4 py-2 bg-[#15133F]/80 border border-gray-600 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#48A7A7] text-white transition-all duration-300 focus:border-[#48A7A7]"
                />
                <button
                  type="submit"
                  className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white px-3 rounded-r-md flex items-center justify-center transition-colors duration-300"
                >
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>

          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8 animate-fade-in" style={{animationDelay: '0.7s'}}></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm animate-fade-in" style={{animationDelay: '0.8s'}}>
          <p>© {currentYear} 254 Capital. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <Link to="/privacy-policy" className="hover:text-[#48A7A7] transition-colors duration-300 hover-lift">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#48A7A7] transition-colors duration-300 hover-lift">Terms of Service</Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-[#48A7A7] transition-colors duration-300 hover-lift">Cookie Policy</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
