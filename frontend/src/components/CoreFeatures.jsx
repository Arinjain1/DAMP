import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import bodyImage from '../assets/Body.png'; 

const CoreFeatures = () => {
  return (
    <section className="relative bg-white pt-8 md:pt-8">
      <div className="max-w-7xl mx-auto px-4 md:px-12 lg:px-24">
        
        {/* Section Header */}
        <div className="mb-8 md:mb-20 text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3 font-sans tracking-tight">
            CORE FEATURES
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl leading-relaxed mx-auto md:mx-0">
            Powerful, self-serve product and growth analytics to help you convert, engage,
            and retain more users. Trusted by over 4,000 startups.
          </p>
        </div>

        <div className="space-y-6 md:space-y-12">
          
          {/* Feature 1 - Property Management */}
          <div className="bg-[#F6F5FF] rounded-[2rem] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[450px]">
            
            {/* Text Side */}
            {/* Padding Reduced: p-4 pb-0 */}
            <div className="flex flex-col justify-center items-center md:items-start p-4 pb-0 md:p-10 order-first md:order-last text-center md:text-left">
              
              {/* Heading Margin Reduced: mb-1 */}
              <h3 className="text-xl md:text-3xl font-inter font-bold text-gray-900 mb-1 md:mb-4">
                Property Management
              </h3>
              
              {/* List Spacing & Margin Reduced: space-y-1, mb-3 */}
              <ul className="w-fit mx-auto md:mx-0 space-y-1 md:space-y-2 mb-3 md:mb-8 text-gray-600 font-medium text-sm md:text-base text-left">
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="text-gray-400 text-xl md:text-2xl">•</span>
                  <span>Add unlimited properties</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="text-gray-400 text-xl md:text-2xl">•</span>
                  <span>Residential, commercial, plots</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="text-gray-400 text-xl md:text-2xl">•</span>
                  <span>Status: Available / Visited / Closed</span>
                </li>
              </ul>
              
              <button className="flex items-center gap-2 text-gray-900 font-bold text-sm md:text-base hover:gap-3 transition-all group">
                Install
                <ArrowUpRight size={18} className="group-hover:text-purple-600 transition-colors" />
              </button>
            </div>

            {/* Image Side */}
            <div className="flex items-end justify-center order-last md:order-first h-[220px] md:h-full pt-0">
                <img 
                  src={bodyImage} 
                  alt="Property Management" 
                  className="w-[85%] md:w-[160%] lg:w-[90%] md:max-w-none h-auto object-contain translate-y-0"
                />
            </div>
          </div>


          {/* Feature 2 - Client Management */}
          <div className="bg-[#F6F5FF] rounded-[2rem] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[450px]">
            
            {/* Text Side */}
            <div className="flex flex-col justify-center items-center md:items-start p-4 pb-0 md:p-10 text-center md:text-left">
              <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-4">
                Client Management
              </h3>
              
              <ul className="w-fit mx-auto md:mx-0 space-y-1 md:space-y-2 mb-3 md:mb-8 text-gray-600 font-medium text-sm md:text-base text-left">
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="text-gray-400 text-xl md:text-2xl">•</span>
                  <span>Buyers & tenants in one place</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="text-gray-400 text-xl md:text-2xl">•</span>
                  <span>Requirements & budget tracking</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="text-gray-400 text-xl md:text-2xl">•</span>
                  <span>Auto match with properties</span>
                </li>
              </ul>
              
              <button className="flex items-center gap-2 text-gray-900 font-bold text-sm md:text-base hover:gap-3 transition-all group">
                Install
                <ArrowUpRight size={18} className="group-hover:text-purple-600 transition-colors" />
              </button>
            </div>

            {/* Image Side */}
            <div className="flex items-end justify-center h-[220px] md:h-full pt-0">
                <img 
                  src={bodyImage} 
                  alt="Client Management" 
                  className="w-[85%] md:w-[160%] lg:w-[90%] md:max-w-none h-auto object-contain translate-y-0"
                />
            </div>
          </div>


          {/* Feature 3 - Follow-ups & Reminders */}
          <div className="bg-[#F6F5FF] rounded-[2rem] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[450px]">
            
            {/* Text Side */}
            <div className="flex flex-col justify-center items-center md:items-start p-4 pb-0 md:p-10 order-first md:order-last text-center md:text-left">
              <h3 className="text-xl md:text-3xl font-inter font-bold text-gray-900 mb-1 md:mb-4">
                Follow-ups & Reminders
              </h3>
              
              <ul className="w-fit mx-auto md:mx-0 space-y-1 md:space-y-2 mb-3 md:mb-8 text-gray-600 font-medium text-sm md:text-base text-left">
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="text-gray-400 text-xl md:text-2xl">•</span>
                  <span>Never forget a call again</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="text-gray-400 text-xl md:text-2xl">•</span>
                  <span>Set visit & follow-up reminders</span>
                </li>
              </ul>
              
              <button className="flex items-center gap-2 text-gray-900 font-bold text-sm md:text-base hover:gap-3 transition-all group">
                Install
                <ArrowUpRight size={18} className="group-hover:text-purple-600 transition-colors" />
              </button>
            </div>

             {/* Image Side */}
            <div className="flex items-end justify-center order-last md:order-first h-[220px] md:h-full pt-0">
                <img 
                  src={bodyImage} 
                  alt="Follow-ups & Reminders" 
                  className="w-[85%] md:w-[160%] lg:w-[90%] md:max-w-none h-auto object-contain translate-y-0"
                />
            </div>
          </div>


          {/* Feature 4 - Deal & Commission Tracking */}
          <div className="bg-[#F6F5FF] rounded-[2rem] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[450px]">
            
            {/* Text Side */}
            <div className="flex flex-col justify-center items-center md:items-start p-4 pb-0 md:p-10 text-center md:text-left">
              <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-4">
                Deal & Commission Tracking
              </h3>
              
              <ul className="w-fit mx-auto md:mx-0 space-y-1 md:space-y-2 mb-3 md:mb-8 text-gray-600 font-medium text-sm md:text-base text-left">
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="text-gray-400 text-xl md:text-2xl">•</span>
                  <span>Track active & closed deals</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="text-gray-400 text-xl md:text-2xl">•</span>
                  <span>Commission calculation</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="text-gray-400 text-xl md:text-2xl">•</span>
                  <span>Payment status</span>
                </li>
              </ul>
              
              <button className="flex items-center gap-2 text-gray-900 font-bold text-sm md:text-base hover:gap-3 transition-all group">
                Install
                <ArrowUpRight size={18} className="group-hover:text-purple-600 transition-colors" />
              </button>
            </div>

            {/* Image Side */}
            <div className="flex items-end justify-center h-[220px] md:h-full pt-0">
                <img 
                  src={bodyImage} 
                  alt="Deal & Commission Tracking" 
                  className="w-[85%] md:w-[160%] lg:w-[90%] md:max-w-none h-auto object-contain translate-y-0"
                />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;