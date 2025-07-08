
import React from 'react';
import Layout from '@/components/Layout';
import HeroSection from '@/components/HeroSection';
import ServiceHighlights from '@/components/ServiceHighlights';
import SupplyChainFinancing from '@/components/SupplyChainFinancing';
import WhyChooseUs from '@/components/WhyChooseUs';
import QualifyingBusinesses from '@/components/QualifyingBusinesses';
import PerformanceMetrics from '@/components/PerformanceMetrics';

const Index = () => {
  return (
    <Layout>
      <div className="relative">
        <HeroSection />
        <ServiceHighlights />
      </div>
      <SupplyChainFinancing />
      <WhyChooseUs />
      <QualifyingBusinesses />
      <PerformanceMetrics />
    </Layout>
  );
};

export default Index;
