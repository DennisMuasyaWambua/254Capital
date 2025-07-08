
import React from 'react';

const FeaturedLogos = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12">
        <p className="text-darkgray/70">As featured on:</p>
        <div className="flex items-center space-x-8 md:space-x-12">
          <div className="text-softgreen font-medium text-xl">ipShot</div>
          <div className="text-mintgreen font-medium text-xl">Unsplash</div>
          <div className="text-softgreen font-medium text-xl">pingdom</div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedLogos;
