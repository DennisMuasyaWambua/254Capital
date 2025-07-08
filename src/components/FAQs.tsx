import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const FAQs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isVisible } = useScrollAnimation();
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
            <li>Provide 3–6 months of bank statements or sales records.</li>
          </ul>
        </div>
      )
    },
    {
      question: "How Much Can I Borrow?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Minimum:</strong> KES 100,000</li>
          <li><strong>Maximum:</strong> KES 20 million (based on order/invoice value)</li>
        </ul>
      )
    },
    {
      question: "What Documents Do I Need?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Business registration certificate</li>
          <li>Recent bank statements</li>
          <li>Purchase order/invoice from your buyer</li>
          <li>Supplier agreements (if applicable)</li>
        </ul>
      )
    },
    {
      question: "How Long Does Approval Take?",
      answer: (
        <p>
          Most applications are approved <strong>within 4 hours</strong> if submitted before 10 AM. Funds are disbursed the <strong>same day</strong> upon approval.
        </p>
      )
    },
    {
      question: "Do You Finance International Suppliers?",
      answer: (
        <p>
          Yes! We fund both <strong>local and international orders</strong>, including imports requiring Letters of Credit (LCs).
        </p>
      )
    },
    {
      question: "What Happens If My Buyer Delays Payment?",
      answer: (
        <p>
          We work with you to adjust repayment timelines, provided delays are communicated early. No penalties for genuine buyer-side issues.
        </p>
      )
    },
    {
      question: "Are There Hidden Fees?",
      answer: (
        <div>
          <p>No. You'll receive a <strong>clear breakdown</strong> of:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Interest rate (based on risk assessment)</li>
            <li>One-time processing fee (3–5% of loan amount)</li>
            <li>No charges for early repayment.</li>
          </ul>
        </div>
      )
    },
    {
      question: "Can I Use This for Multiple Orders/Suppliers?",
      answer: (
        <p>
          Yes! You can access financing for <strong>multiple transactions</strong> simultaneously, provided repayments are up-to-date.
        </p>
      )
    },
    {
      question: "How Do Repayments Work?",
      answer: (
        <div>
          <p>Repayment is automatically deducted when:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Your buyer pays their invoice.</li>
            <li>You receive payment for the financed order.</li>
          </ul>
          <p className="mt-2">You can also repay manually via M-Pesa or bank transfer.</p>
        </div>
      )
    },
    {
      question: "What If My Supplier Isn't Approved by 254 Capital?",
      answer: (
        <p>
          We'll conduct a quick due diligence process to verify new suppliers. Most are approved within <strong>1 business day</strong>.
        </p>
      )
    },
    {
      question: "Is 254 Capital Licensed by the Central Bank?",
      answer: (
        <p>
          Yes. We operate under full compliance with Kenyan financial regulations.
        </p>
      )
    },
    {
      question: "How Do I Track My Repayments?",
      answer: (
        <div>
          <p>Access a real-time dashboard via our <strong>online portal</strong> to monitor:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Outstanding balances</li>
            <li>Payment deadlines</li>
            <li>Transaction history</li>
          </ul>
        </div>
      )
    },
    {
      question: "Can Startups Apply?",
      answer: (
        <p>
          Startups operational for <strong>6+ months</strong> with confirmed purchase orders are eligible.
        </p>
      )
    },
    {
      question: "What's the Best Use Case for Supply Chain Financing?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Seasonal demand:</strong> Stock up before holidays/sales peaks.</li>
          <li><strong>Large orders:</strong> Accept bigger contracts without liquidity strain.</li>
          <li><strong>Supplier discounts:</strong> Buy bulk inventory at lower rates.</li>
        </ul>
      )
    },
    {
      question: "How Soon Can I Reapply After Repayment?",
      answer: (
        <p>
          Immediately! Once a transaction is repaid, you can access new financing for upcoming orders.
        </p>
      )
    },
    {
      question: "Is My Data Secure?",
      answer: (
        <p>
          Absolutely. We use <strong>bank-level encryption</strong> and never share your details with third parties.
        </p>
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
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className="py-16 bg-gray-50"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-12 transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our supply chain financing solutions. 
              Can't find what you're looking for? Contact our team for assistance.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((faq, index) => (
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
          </div>

          <div className={`mt-12 text-center transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '0.5s' }}>
            <Button 
              asChild
              className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-6 py-3 text-sm transition-all duration-200 ease-in-out hover:shadow-md"
            >
              <Link to="/contacts">Apply Now</Link>
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              Get funded in as little as 4 hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQs;
