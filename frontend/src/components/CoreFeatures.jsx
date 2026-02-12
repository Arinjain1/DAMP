import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import bodyImage from '../assets/Body.png'; 

const CoreFeatures = () => {
  return (
    <section className="relative bg-white py-8 md:py-5">
      <div className="max-w-7xl mx-auto px-8 md:px-24">
        
        {/* Section Header (Compact) */}
        <div className="mb-12 md:mb-16 text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 font-sans tracking-tight">
            CORE FEATURES
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl leading-relaxed mx-auto md:mx-0">
            Powerful, self-serve product and growth analytics to help you convert, engage,
            and retain more users. Trusted by over 4,000 startups.
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Feature 1 - Property Management */}
          <div className="bg-[#F6F5FF] rounded-[2rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Image Side */}
            <div className="flex items-end justify-center order-last lg:order-first h-[280px] lg:h-auto pt-8">
                <img 
                  src={bodyImage} 
                  alt="Property Management" 
                  className="w-[85%] md:w-[95%] lg:w-[90%] h-auto object-contain translate-y-0"
                />
            </div>
            {/* Text Side */}
            <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12 order-first lg:order-last">
              <h3 className="text-xl md:text-3xl font-inter font-bold text-gray-900 mb-3">
                Property Management
              </h3>
              <ul className="space-y-0 mb-6 text-gray-600 font-medium text-sm md:text-base">
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 text-2xl">•</span>
                  <span>Add unlimited properties</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 text-2xl">•</span>
                  <span>Residential, commercial, plots, rental</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 text-2xl">•</span>
                  <span>Status: Available / Visited / Closed</span>
                </li>
              </ul>
              <button className="flex items-center gap-2 text-gray-900 font-bold text-sm md:text-base hover:gap-3 transition-all group">
                Install
                <ArrowUpRight size={18} className="group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Feature 2 - Client Management */}
          <div className="bg-[#F6F5FF] rounded-[2rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Text Side */}
            <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
              <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-3">
                Client Management
              </h3>
              <ul className="space-y-2 mb-6 text-gray-600 font-medium text-sm md:text-base">
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 text-2xl">•</span>
                  <span>Buyers & tenants in one place</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 text-2xl">•</span>
                  <span>Requirements & budget tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 text-2xl">•</span>
                  <span>Auto match with properties</span>
                </li>
              </ul>
              <button className="flex items-center gap-2 text-gray-900 font-bold text-sm md:text-base hover:gap-3 transition-all group">
                Install
                <ArrowUpRight size={18} className="group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
            {/* Image Side */}
            <div className="flex items-end justify-center h-[280px] lg:h-auto pt-8">
                <img 
                  src={bodyImage} 
                  alt="Client Management" 
                  className="w-[85%] md:w-[95%] lg:w-[90%] h-auto object-contain translate-y-0"
                />
            </div>
          </div>

          {/* Feature 3 - Follow-ups & Reminders (UPDATED) */}
          <div className="bg-[#F6F5FF] rounded-[2rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Image Side - Order matched to Feature 1 */}
            <div className="flex items-end justify-center order-last lg:order-first h-[280px] lg:h-auto pt-8">
                <img 
                  src={bodyImage} 
                  alt="Follow-ups & Reminders" 
                  className="w-[85%] md:w-[95%] lg:w-[90%] h-auto object-contain translate-y-0"
                />
            </div>
            {/* Text Side */}
            <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12 order-first lg:order-last">
              <h3 className="text-xl md:text-3xl font-inter font-bold text-gray-900 mb-3">
                Follow-ups & Reminders
              </h3>
              <ul className="space-y-0 mb-6 text-gray-600 font-medium text-sm md:text-base">
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 text-2xl">•</span>
                  <span>Never forget a call again</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 text-2xl">•</span>
                  <span>Set visit & follow-up reminders</span>
                </li>
              </ul>
              <button className="flex items-center gap-2 text-gray-900 font-bold text-sm md:text-base hover:gap-3 transition-all group">
                Install
                <ArrowUpRight size={18} className="group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Feature 4 - Deal & Commission Tracking (UPDATED) */}
          <div className="bg-[#F6F5FF] rounded-[2rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Text Side - Order matched to Feature 2 */}
            <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
              <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-3">
                Deal & Commission Tracking
              </h3>
              <ul className="space-y-2 mb-6 text-gray-600 font-medium text-sm md:text-base">
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 text-2xl">•</span>
                  <span>Track active & closed deals</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 text-2xl">•</span>
                  <span>Commission calculation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 text-2xl">•</span>
                  <span>Payment status</span>
                </li>
              </ul>
              <button className="flex items-center gap-2 text-gray-900 font-bold text-sm md:text-base hover:gap-3 transition-all group">
                Install
                <ArrowUpRight size={18} className="group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
            {/* Image Side */}
            <div className="flex items-end justify-center h-[280px] lg:h-auto pt-8">
                <img 
                  src={bodyImage} 
                  alt="Deal & Commission Tracking" 
                  className="w-[85%] md:w-[95%] lg:w-[90%] h-auto object-contain translate-y-0"
                />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;