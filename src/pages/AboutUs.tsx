
import React from 'react';
import Layout from '@/components/Layout';

const AboutUs = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#15133F] to-[#48A7A7] text-white py-36 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            Meet Our Team
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90 leading-relaxed mb-8">
            The people behind 254 Capital's mission to connect investors with African businesses
            and drive economic growth through innovative financing solutions.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#15133F] mb-16 text-center">Our Leadership</h2>
          
          {/* Team Member 1 - Herbert (Content on Left, Image on Right) */}

          {/* Team Member 1 - Herbert (Content on Left, Image on Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            {/* Content Column */}
            <div>
              <h3 className="text-2xl font-bold text-[#15133F] mb-2">Herbert Wattanga</h3>
              <p className="text-lg font-medium text-[#48A7A7] mb-6">Strategy and Marketing Director</p>
              <p className="text-gray-700 leading-relaxed">
                Herbert leads the firm's strategic direction and brand positioning. He brings a dynamic
                blend of analytical thinking and creative execution to grow 254 Capital's market
                presence and forge high-value partnerships aligned with long-term business goals.
              </p>
            </div>
            
            {/* Image Column */}
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/herbert.JPG" 
                alt="Herbert Wattanga" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Team Member 2 - George (Image on Left, Content on Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            {/* Image Column */}
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/george.jpeg" 
                alt="George Gichuhi" 
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Content Column */}
            <div>
              <h3 className="text-2xl font-bold text-[#15133F] mb-2">George Gichuhi</h3>
              <p className="text-lg font-medium text-[#48A7A7] mb-6">Director of Supply Chain Financing</p>
              <p className="text-gray-700 leading-relaxed">
                George manages our SME supply chain financing portfolio. His focus is on structuring
                tailored working capital solutions that support business resilience, cash flow stability,
                and economic empowerment across key sectors.
              </p>
            </div>
          </div>

          {/* Team Member 3 - Adan (Content on Left, Image on Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            {/* Content Column */}
            <div>
              <h3 className="text-2xl font-bold text-[#15133F] mb-2">Adan Kalla</h3>
              <p className="text-lg font-medium text-[#48A7A7] mb-6">Technology Director</p>
              <p className="text-gray-700 leading-relaxed">
                Adan oversees 254 Capital's technology strategy, with a strong background in software
                development and digital infrastructure. He leads the development of scalable platforms
                that enhance operational efficiency and deliver seamless customer experiences.
              </p>
            </div>
            
            {/* Image Column */}
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/user-placeholder.jpg" 
                alt="Adan Kalla" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Team Member 4 - Janet (Image on Left, Content on Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            {/* Image Column */}
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/Janet.jpg" 
                alt="Janet Yiamoi" 
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Content Column */}
            <div>
              <h3 className="text-2xl font-bold text-[#15133F] mb-2">Janet Yiamoi</h3>
              <p className="text-lg font-medium text-[#48A7A7] mb-6">Director of Fundraising and Investor Relations</p>
              <p className="text-gray-700 leading-relaxed">
                Janet brings over a decade of experience in development finance, stakeholder
                engagement, and natural capital investment. She leads our capital raising efforts and
                manages relationships with investors and funding partners. Janet's strategic approach
                ensures we attract aligned capital to fuel sustainable growth.
              </p>
            </div>
          </div>

          {/* Team Member 5 - Judy (Content on Left, Image on Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            {/* Content Column */}
            <div>
              <h3 className="text-2xl font-bold text-[#15133F] mb-2">Judy Wambui</h3>
              <p className="text-lg font-medium text-[#48A7A7] mb-6">Managing Director & Co-Founder</p>
              <p className="text-gray-700 leading-relaxed">
                Judy brings over 20 years of leadership in the International Development sector, with deep expertise in financial inclusion and community development. As Managing Director of 254 Capital, she drives the company's mission to unlock capital for underserved markets through scalable and impactful credit solutions.
              </p>
            </div>
            
            {/* Image Column */}
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/Judy.jpg" 
                alt="Judy Wambui" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Team Member 6 - David (Image on Left, Content on Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image Column */}
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/david-muema.jpg" 
                alt="David Muema" 
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Content Column */}
            <div>
              <h3 className="text-2xl font-bold text-[#15133F] mb-2">David Muema</h3>
              <p className="text-lg font-medium text-[#48A7A7] mb-6">Investment and Strategy Associate</p>
              <p className="text-gray-700 leading-relaxed">
                David supports the firm's investment analysis and strategic initiatives. His expertise in
                financial modeling, credit evaluation, and portfolio research strengthens 254 Capital's
                ability to make data-driven decisions and deliver measurable returns.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutUs;
