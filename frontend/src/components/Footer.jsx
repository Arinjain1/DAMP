import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import logo from '../assets/Group 25.png';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-24 py-12">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Broker 99" className="w-6 h-6" />
              <span className="text-gray-900 font-bold text-lg">Broker 99</span>
            </div>
            
            <h3 className="text-gray-900 font-bold mb-2 font-inter">Subscribe</h3>
            <p className="text-gray-600 text-sm mb-4 font-inter">
              Join our newsletter to stay up to date on features and releases.
            </p>
            
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>
              <button className="bg-gray-900 hover:bg-black text-white font-semibold px-6 py-2 rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
            
            <p className="text-xs text-gray-500 font-inter">
              By subscribing you agree to our <a href="#" className="underline">Privacy Policy</a>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 font-inter">Quick Links</h3>
            <ul className="space-y-2 text-sm font-inter">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Home</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Services</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact</a></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 font-inter">Products</h3>
            <ul className="space-y-2 text-sm font-inter">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">AI Assistant</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Mobile App</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Account</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Credit Card</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 font-inter">Company</h3>
            <ul className="space-y-2 text-sm font-inter">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Support</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 font-inter">
            Copyright © 2025 Investo. All Rights Reserved
          </p>
          
          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              <Youtube size={20} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
