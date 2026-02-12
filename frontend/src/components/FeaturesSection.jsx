import React from 'react';
import { ArrowRight } from 'lucide-react';
import heroImage from '../assets/Background.png'; 

const FeaturesSection = () => {
  return (
    // CHANGE: 'min-h-screen' hataya taaki neeche extra space na bache. 
    // py-8 md:py-12 (padding kam ki)
    <section className="bg-white py-8 md:py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-20">
        
        {/* CHANGE: gap-8 (Gap kam kiya), items-center (Vertically center kiya taaki balanced lage) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-20 items-center">
          
          {/* === LEFT COLUMN === */}
          <div className="flex flex-col">
            
            {/* Heading: Tablet pr text-3xl (chota kiya) */}
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-poppins font-semibold text-[#022c22] mb-6 md:mb-8 leading-tight tracking-tight">
              Your All-in-One Broker<br className="hidden md:block" /> Command Center
            </h2>

            <div className="relative">
              
              {/* Tagline */}
              <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wider pl-1">
                Creative Freedom
              </p>

              {/* Title with Badge */}
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <span className="bg-[#c4b5fd] text-[#022c22] px-2 py-1 rounded-md font-bold text-base md:text-xl shadow-sm">
                  Why This
                </span>
                <span className="text-[#022c22] font-bold text-xl md:text-2xl">
                  App
                </span>
              </div>

              <p className="text-gray-600 mb-4 text-sm md:text-base font-medium">
                Real Estate Brokers Face Daily Chaos
              </p>

              {/* List Items (Compact padding & Text) */}
              <div className="space-y-3 max-w-lg">
                {[
                  "Properties scattered on WhatsApp & Excel",
                  "Clients not tracked properly",
                  "Follow-ups missed",
                  "Deals status unclear"
                ].map((item, index) => (
                  // p-2.5 (Padding kam ki), text-sm (Font chota kiya)
                  <div key={index} className="bg-white border border-gray-100 p-2.5 md:p-3 rounded-lg flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></div>
                    <p className="text-gray-700 font-manrope font-medium text-xs md:text-sm">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* === RIGHT COLUMN === */}
          {/* CHANGE: mt-0 (Upar se margin hataya taaki space waste na ho) */}
          <div className="flex flex-col h-full mt-6 md:mt-0">
            
            {/* 1. Description Text */}
            <div className="mb-6 md:pl-4 lg:pl-10">
              <p className="text-gray-600 text-sm md:text-sm lg:text-base leading-relaxed mb-4 max-w-sm">
                This app is designed only for brokers, not buyers or owners.
              </p>
              
              <button className="group flex items-center gap-2 text-[#022c22] font-bold text-sm md:text-base hover:text-teal-800 transition-colors">
                Learn More 
                <div className="bg-[#022c22] text-white rounded-full p-1 group-hover:bg-teal-800 transition-all">
                  <ArrowRight size={12} />
                </div>
              </button>
            </div>

            {/* 2. Hero Image */}
            <div className="relative w-full md:pl-4 lg:pl-10">
              {/* Background Glow (Opacity kam ki) */}
              <div className="absolute top-10 right-0 w-32 h-32 bg-lime-200 rounded-full blur-3xl opacity-30 -z-10"></div>
              
              <img 
                src={heroImage} 
                alt="Broker using app" 
                className="w-full h-auto object-contain z-10 relative rounded-lg"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;