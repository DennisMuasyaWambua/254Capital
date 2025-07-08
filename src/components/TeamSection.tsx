import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const TeamSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  const teamMembers = [
    {
      name: 'David Omondi',
      position: 'CEO & Founder',
      image: 'https://randomuser.me/api/portraits/men/77.jpg'
    },
    {
      name: 'Sarah Njeri',
      position: 'Chief Financial Officer',
      image: 'https://randomuser.me/api/portraits/women/79.jpg'
    },
    {
      name: 'Michael Kamau',
      position: 'Head of Operations',
      image: 'https://randomuser.me/api/portraits/men/23.jpg'
    },
    {
      name: 'Grace Wanjiku',
      position: 'Client Relations Manager',
      image: 'https://randomuser.me/api/portraits/women/40.jpg'
    }
  ];

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-16 bg-gray-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <p className="text-[#48A7A7] font-medium mb-2">Our Leadership</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Our experienced team of finance professionals is dedicated to helping businesses grow through innovative supply chain financing solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover-lift ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} 
              style={{transitionDelay: `${index * 0.1 + 0.2}s`}}
            >
              <div className="relative pb-[100%]"> {/* 1:1 aspect ratio */}
                <img 
                  src={member.image} 
                  alt={`${member.name} - ${member.position}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="p-6 bg-[#15133F] text-white transition-all duration-300 hover:bg-[#15133F]/90">
                <h3 className="text-xl font-semibold transition-colors duration-300 hover:text-[#48A7A7]">{member.name}</h3>
                <p className="text-[#48A7A7] mt-1">{member.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
