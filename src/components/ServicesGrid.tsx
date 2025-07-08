
import React from 'react';
import { FileText } from 'lucide-react';

interface ServiceCardProps {
  number: string;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ number, title, description }) => {
  return (
    <div className="service-card">
      <div className="service-number">{number}</div>
      <div className="service-icon">
        <FileText />
      </div>
      <h3 className="service-title">{title}</h3>
      <p className="service-description">{description}</p>
      <a href="#" className="learn-more">Learn More</a>
    </div>
  );
};

const ServicesGrid = () => {
  const services = [
    {
      number: "01",
      title: "Tax Preparation & Filing",
      description: "Accurate and timely preparation of personal and business tax returns to ensure compliance and maximize deductions."
    },
    {
      number: "02",
      title: "Tax Planning & Strategy",
      description: "Proactive planning to minimize tax liabilities through customized strategies tailored to your financial situation."
    },
    {
      number: "03",
      title: "IRS Representation",
      description: "Accurate and timely preparation of personal and business tax returns to ensure compliance and maximize deductions."
    },
    {
      number: "04",
      title: "Business Tax Services",
      description: "Accurate and timely preparation of personal and business tax returns to ensure compliance and maximize deductions."
    },
    {
      number: "05",
      title: "Estate & Trust Taxation",
      description: "Specialized services to manage estate taxes and trusts, ensuring a smooth transition of wealth with minimized tax impact."
    },
    {
      number: "06",
      title: "Consultation & Advisory",
      description: "One-on-one consultations for financial planning, tax saving strategies, and long-term financial health."
    }
  ];

  return (
    <section className="bg-beige py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 relative">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Services</h2>
          <div className="absolute w-full text-center opacity-10 text-5xl md:text-7xl font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Customized
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              number={service.number}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
