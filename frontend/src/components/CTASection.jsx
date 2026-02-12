import React from 'react';
import bgPattern from '../assets/Background pattern.png';

const CTASection = () => {
  return (
    <section className="relative bg-white py-12 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-12 lg:px-12">
        
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl py-20 md:py-28 text-center overflow-hidden">
          
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: `url(${bgPattern})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 px-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 font-inter">
              Download Our App Free and<br className="hidden md:block" />
              Enjoy Exclusive Features!
            </h2>
            
            <p className="text-gray-300 text-xs md:text-sm max-w-2xl mx-auto mb-8 font-inter leading-relaxed">
              Enjoy seamless navigation, exclusive content, and personalized experiences right
              at your fingertips. Don't miss out on this opportunity to enhance your daily routine
              with our user-friendly, free mobile app.
            </p>

            {/* Store Buttons - Side by Side on Mobile & Desktop */}
            {/* Changed flex-col to flex-row and adjusted gap/padding for mobile fit */}
            <div className="flex flex-row items-center justify-center gap-3 md:gap-4 flex-wrap">
              <a 
                href="#" 
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-4 py-2.5 md:px-6 md:py-3 rounded-xl transition-colors flex items-center gap-2 md:gap-3 min-w-[140px] justify-center"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[9px] md:text-[10px] uppercase tracking-wide">GET IT ON</div>
                  <div className="text-xs md:text-sm font-bold leading-none">Google Play</div>
                </div>
              </a>
              
              <a 
                href="#" 
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-4 py-2.5 md:px-6 md:py-3 rounded-xl transition-colors flex items-center gap-2 md:gap-3 min-w-[140px] justify-center"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[9px] md:text-[10px] uppercase tracking-wide">Download on</div>
                  <div className="text-xs md:text-sm font-bold leading-none">App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CTASection;