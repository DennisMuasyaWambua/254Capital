import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FAQs from '../components/FAQs';
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#15133F] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in" style={{animationDuration: '0.7s'}}>
            Frequently Asked Questions
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 animate-fade-in" style={{animationDuration: '0.7s', animationDelay: '0.1s'}}>
            Find answers to common questions about our supply chain financing solutions.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative animate-fade-in" style={{animationDuration: '0.7s', animationDelay: '0.2s'}}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for questions..."
                className="w-full px-5 py-4 pr-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#48A7A7] transition-all duration-200"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
            </div>
            <p className="text-white/60 text-sm mt-2 text-left">
              Popular: Eligibility, Documents, Approval Time
            </p>
          </div>
        </div>
      </section>
      
      {/* FAQs Component */}
      <FAQs />
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#15133F] to-[#1E1B54] py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Still Have Questions?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Our team is ready to assist you with any questions about our supply chain financing solutions.
          </p>
          <div className="flex justify-center">
            <Button 
              asChild
              className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-6 py-3 text-sm transition-all duration-200 ease-in-out hover:shadow-md"
            >
              <Link to="/contacts">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default FAQsPage;
