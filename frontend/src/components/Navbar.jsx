import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/Group 25.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    // Change 1: 'mt-6' ko 'mt-4' kiya taaki upar se gap kam ho
    <nav className="w-[95vw] md:w-[85vw] mx-auto mt-4 relative z-50">
      
      {/* Desktop Navbar Container */}
      {/* Change 2: Padding kam ki (pl-6 -> pl-4, py-2 -> py-1.5) */}
      <div className="bg-gray-900 rounded-full pl-4 md:pl-6 pr-2 py-1.5">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Logo image size thoda adjust kiya */}
            <img src={logo} alt="Broker 99" className="w-5 h-5 md:w-5 md:h-5" />
            
            {/* Change 3: Text size 'text-lg' se 'text-sm md:text-base' kiya */}
            <span className="text-white font-semibold text-sm md:text-base">
              Broker 99
            </span>
          </div>

          {/* Desktop Navigation Links */}
          {/* Change 4: Gap '8' se '6' kiya aur text size 'text-sm' kar diya */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">
              About
            </a>
            <a href="#services" className="text-gray-300 hover:text-white transition-colors">
              Services
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
              Contact
            </a>
          </div>

          {/* Desktop Download Button */}
          <div className="flex items-center gap-2">
             {/* Change 5: Button ka text size 'text-xs' ya 'text-sm' aur padding kam ki */}
            <button className="hidden md:block bg-purple-300 hover:bg-purple-400 text-gray-900 text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full transition-colors">
              Download App
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-1.5" // Padding reduced for mobile trigger too
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Isme jyada change nahi kiya, bas alignment fix ki) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-800">
          <div className="flex flex-col gap-3 text-sm">
            <a 
              href="#about" 
              className="text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a 
              href="#services" 
              className="text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </a>
            <a 
              href="#pricing" 
              className="text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="#contact" 
              className="text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            <button className="bg-purple-300 hover:bg-purple-400 text-gray-900 font-medium px-4 py-2 rounded-full transition-colors mt-2">
              Download App
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;