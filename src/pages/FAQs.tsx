
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const FAQs = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { ref, isVisible } = useScrollAnimation();
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  

  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset open index when searching
    setOpenIndex(null);
  };

  const faqItems: FAQItem[] = [
    {
      question: "What is Supply Chain Financing?",
      answer: (
        <p>
          Supply chain financing is a credit solution where 254 Capital provides upfront funds to help your business <strong>pay suppliers, purchase inventory, or fulfill confirmed orders</strong>. You repay the amount once your buyers settle their invoices, ensuring smooth cash flow without delays.
        </p>
      )
    },
    {
      question: "How is This Different from a Traditional Loan?",
      answer: (
        <div>
          <p>Unlike traditional loans:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>No fixed collateral</strong> – Financing is secured against your invoices or purchase orders.</li>
            <li><strong>Repayment aligns with buyer payments</strong> – No fixed monthly installments.</li>
            <li><strong>Faster approval</strong> – Focuses on transaction history, not just credit scores.</li>
          </ul>
        </div>
      )
    },
    {
      question: "Which Industries Do You Support?",
      answer: (
        <div>
          <p>We specialize in supply chain financing for:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Agriculture</strong> (farm inputs, harvest financing)</li>
            <li><strong>Manufacturing</strong> (raw material procurement)</li>
            <li><strong>Retail & FMCG</strong> (inventory restocking)</li>
            <li><strong>Import/Export</strong> (cross-border trade orders)</li>
          </ul>
        </div>
      )
    },
    {
      question: "What Are the Eligibility Requirements?",
      answer: (
        <div>
          <p>To qualify, your business must:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Be registered in Kenya and operational for <strong>6+ months</strong>.</li>
            <li>Have <strong>consistent purchase orders or invoices</strong> from credible buyers.</li>
            <li>Provide 12 months of bank statements or sales records.</li>
          </ul>
        </div>
      )
    },
    {
      question: "How Do I Get Started?",
      answer: (
        <div>
          <ol className="list-decimal pl-5 space-y-1">
            <li><strong>Apply online</strong> in 2 minutes.</li>
            <li><strong>Upload documents</strong> online on our website.</li>
            <li><strong>Get funded</strong> same day!</li>
          </ol>
        </div>
      )
    }
  ];

  return (
    <Layout>
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
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search for questions..."
                className="w-full px-5 py-4 pr-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#48A7A7] transition-all duration-200"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
            </div>
            <p className="text-white/60 text-sm mt-2 text-left">
              <span>Popular: </span>
              <button 
                onClick={() => setSearchQuery('Eligibility')} 
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                Eligibility
              </button>
              <span className="mx-1">•</span>
              <button 
                onClick={() => setSearchQuery('Documents')} 
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                Documents
              </button>
              <span className="mx-1">•</span>
              <button 
                onClick={() => setSearchQuery('Approval')} 
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                Approval Time
              </button>
            </p>
          </div>
        </div>
      </section>
      
      {/* FAQs Section */}
      <section 
        ref={ref as React.RefObject<HTMLElement>}
        className="py-16 bg-gray-50"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className={`text-center mb-12 transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Find Answers Quickly</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to know about our supply chain financing solutions. 
                Can't find what you're looking for? Contact our team for assistance.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems
                .filter(faq => {
                  if (!searchQuery.trim()) return true;
                  
                  const searchTerms = searchQuery.toLowerCase().split(' ');
                  const questionText = faq.question.toLowerCase();
                  // Extract text from React elements for searching
                  let answerText = '';
                  if (typeof faq.answer === 'string') {
                    answerText = faq.answer.toLowerCase();
                  } else if (React.isValidElement(faq.answer)) {
                    // Handle React elements by converting to string representation
                    const extractText = (element: React.ReactNode): string => {
                      if (typeof element === 'string') return element;
                      if (!element) return '';
                      
                      if (React.isValidElement(element)) {
                        const children = element.props.children;
                        if (typeof children === 'string') return children;
                        if (Array.isArray(children)) {
                          return children.map(extractText).join(' ');
                        }
                        if (React.isValidElement(children)) {
                          return extractText(children);
                        }
                      }
                      return '';
                    };
                    
                    answerText = extractText(faq.answer).toLowerCase();
                  }
                  
                  return searchTerms.some(term => 
                    questionText.includes(term) || answerText.includes(term)
                  );
                })
                .map((faq, index) => (
                <div 
                  key={index}
                  className={`bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transitionDelay: `${index * 0.05}s` }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                  >
                    <h3 className="text-lg font-medium text-gray-900 pr-8">
                      {faq.question}
                    </h3>
                    <div className="text-[#48A7A7] transition-transform duration-200">
                      {openIndex === index ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-5 pt-0 text-gray-600">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* No results message */}
              {searchQuery.trim() !== '' && 
               faqItems.filter(faq => {
                 const searchTerms = searchQuery.toLowerCase().split(' ');
                 const questionText = faq.question.toLowerCase();
                 // Extract text from React elements for searching
                 let answerText = '';
                 if (typeof faq.answer === 'string') {
                   answerText = faq.answer.toLowerCase();
                 } else if (React.isValidElement(faq.answer)) {
                   // Handle React elements by converting to string representation
                   const extractText = (element: React.ReactNode): string => {
                     if (typeof element === 'string') return element;
                     if (!element) return '';
                     
                     if (React.isValidElement(element)) {
                       const children = element.props.children;
                       if (typeof children === 'string') return children;
                       if (Array.isArray(children)) {
                         return children.map(extractText).join(' ');
                       }
                       if (React.isValidElement(children)) {
                         return extractText(children);
                       }
                     }
                     return '';
                   };
                   
                   answerText = extractText(faq.answer).toLowerCase();
                 }
                 
                 return searchTerms.some(term => 
                   questionText.includes(term) || answerText.includes(term)
                 );
               }).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No matching questions found. Try a different search term.</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-[#48A7A7] hover:text-[#48A7A7]/80 transition-colors duration-200"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>


          </div>
        </div>
      </section>
      
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
      

    </Layout>
  );
};

export default FAQs;
