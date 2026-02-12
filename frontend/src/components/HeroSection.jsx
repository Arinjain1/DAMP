import React from "react";
import { Shield } from "lucide-react";
import heroImage from "../assets/Group 1597884453copy.png";
import bgLines from "../assets/BG Line Objects (1).png";

const HeroSection = () => {
  return (
    <section className="relative bg-[#F5F5F7] overflow-hidden pt-0">
      
      {/* Background Line Objects */}
      <div
        className="absolute inset-0 w-full h-[120%] opacity-90 pointer-events-none -top-20 z-0"
        style={{
          backgroundImage: `url("${bgLines}")`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Top Section */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-28 pb-0 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 md:gap-3 bg-gray-200 pl-2 pr-4 md:pr-5 py-1 rounded-full shadow-sm mb-4 border border-gray-100">
          <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-white rounded-full">
            <Shield className="w-3 h-3 md:w-4 md:h-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-xs md:text-sm text-gray-700 font-medium">
            The Smart App Built Only for Real Estate Brokers
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-manrope font-semibold text-gray-900 mb-3 leading-tight md:leading-relaxed px-2">
          <span className="block mb-1 md:mb-2">Manage properties, clients, and</span>
          <span className="block">deals — all in one place.</span>
        </h1>

        {/* Subheading */}
        <p className="text-xs md:text-sm font-poppins text-gray-600 mb-6 px-4">
          No confusion. No spreadsheets. Just faster closures.
        </p>

        {/* --- CTA Buttons (Updated) --- */}
        {/* Change 1: 'flex-col' hata diya, ab ye hamesha 'row' mein rahenge */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-10 px-4">
          
          {/* Change 2: 'w-full' hata diya taaki button text jitna hi bada ho */}
          <button className="bg-[#BFB7FD] hover:bg-purple-400 text-gray-900 font-semibold px-6 md:px-8 py-2.5 rounded-full transition-colors whitespace-nowrap">
            Play Store
          </button>
          
          <button className="bg-gray-900 hover:bg-black text-white font-semibold px-6 md:px-8 py-2.5 rounded-full transition-colors whitespace-nowrap">
            App Store
          </button>
        </div>

        {/* Hero Image */}
        <div className="relative w-full max-w-sm md:max-w-2xl mx-auto z-0 px-4">
          <img
            src={heroImage}
            alt="Broker App with Stats"
            className="w-full h-auto mx-auto block"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;