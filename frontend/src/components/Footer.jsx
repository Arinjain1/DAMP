import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import logo from '../assets/Group 25.png';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        
        {/* Top Section */}
        {/* Added 'text-center md:text-left' to handle alignment for all children */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12 text-center md:text-left">
          
          {/* Brand & Newsletter (Spans 2 columns on Laptop) */}
          <div className="lg:col-span-2">
            {/* Logo: Centered on mobile (justify-center), Left on Desktop (justify-start) */}
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <img src={logo} alt="Broker 99" className="w-8 h-8" />
              <span className="text-gray-900 font-bold text-xl">Broker 99</span>
            </div>
            
            <h3 className="text-gray-900 font-bold mb-2 font-inter text-lg">Subscribe</h3>
            <p className="text-gray-600 text-sm mb-6 font-inter max-w-sm mx-auto md:mx-0">
              Join our newsletter to stay up to date on features and releases.
            </p>
            
            {/* Subscription Form */}
            {/* 'mx-auto md:mx-0' keeps it centered on mobile, left on desktop */}
            <div className="flex gap-2 mb-4 max-w-sm mx-auto md:mx-0">
              <div className="flex-1 relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>
              <button className="bg-gray-900 hover:bg-black text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm">
                Subscribe
              </button>
            </div>
            
            <p className="text-xs text-gray-500 font-inter">
              By subscribing you agree to our <a href="#" className="underline hover:text-gray-900">Privacy Policy</a>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 font-inter text-base">Quick Links</h3>
            <ul className="space-y-3 text-sm font-inter text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Services</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 font-inter text-base">Products</h3>
            <ul className="space-y-3 text-sm font-inter text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">AI Assistant</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Mobile App</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Account</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Credit Card</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 font-inter text-base">Company</h3>
            <ul className="space-y-3 text-sm font-inter text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        {/* Flex-col centers everything on mobile, md:flex-row spreads them out */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-600 font-inter text-center md:text-left">
            Copyright © 2025 Investo. All Rights Reserved
          </p>
          
          {/* Social Icons */}
          <div className="flex items-center gap-5">
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors transform hover:scale-110">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors transform hover:scale-110">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors transform hover:scale-110">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors transform hover:scale-110">
              <Youtube size={20} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;