import React from 'react';
import { ArrowRight } from 'lucide-react';
import heroImage from '../assets/Background.png'; 


const FeaturesSection = () => {
  return (
    <section className="bg-white min-h-screen py-12 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-20 lg:px-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          
          {/* === LEFT COLUMN === */}
          <div className="flex flex-col h-full pt-4">
            
            {/* 1. Main Heading (Sizes Reduced & Responsive) */}
            {/* Mobile: 3xl, Tablet: 4xl, Laptop: 5xl (Pehle 6xl/7xl tha) */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-poppins font-semibold text-[#022c22] mb-10 leading-tight tracking-tight">
              Your All-in-One Broker<br className="hidden md:block" /> Command Center
            </h2>

            {/* 2. "Why This App" Section */}
            <div className="relative">
              

              {/* Tagline */}
              <p className="text-xs md:text-sm text-gray-500 font-semibold mb-2 uppercase tracking-wide pl-1">
                Creative Freedom
              </p>

              {/* Title with Badge */}
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-[#c4b5fd] text-[#022c22] px-3 py-1 rounded-md font-bold text-xl md:text-2xl">
                  Why This
                </span>
                <span className="text-[#022c22] font-bold text-2xl md:text-3xl">
                  App
                </span>
              </div>

              <p className="text-gray-600 mb-4 text-base md:text-base font-medium">
                Real Estate Brokers Face Daily Chaos
              </p>

              {/* List Items (Thoda compact kiya hai) */}
              <div className="space-y-3 max-w-md">
                {[
                  "Properties scattered on WhatsApp & Excel",
                  "Clients not tracked properly",
                  "Follow-ups missed",
                  "Deals status unclear"
                ].map((item, index) => (
                  <div key={index} className="bg-white border border-gray-100  p-3 rounded-lg flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></div>
                    <p className="text-gray-700 font-manrope font-semibold text-sm md:text-base">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* === RIGHT COLUMN === */}
          <div className="flex flex-col h-full py-4 mt-0 lg:mt-2">
            
            {/* 1. Description Text (Placed ABOVE the photo) */}
            <div className="mb-8 lg:pl-8">
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 max-w-sm">
                This app is designed only for brokers, not buyers or owners.
              </p>
              
              <button className="group flex items-center gap-2 text-[#022c22] font-bold text-base md:text-lg hover:text-teal-700 transition-colors">
                Learn More 
                <div className="bg-[#022c22] text-white rounded-full p-1 group-hover:bg-teal-700 transition-colors">
                  <ArrowRight size={14} />
                </div>
              </button>
            </div>

            {/* 2. Hero Image */}
            <div className="relative w-full lg:pl-8">
              {/* Background Blob */}
              <div className="absolute top-10 right-0 w-40 h-40 bg-lime-100 rounded-full blur-3xl opacity-60 -z-10"></div>
              
              <img 
                src={heroImage} 
                alt="Broker using app" 
                className="w-full h-auto object-contain z-10 relative rounded-xl"
              />

              
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;