import React from 'react';

const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
      isActive 
        ? 'bg-[#BFB7FD] text-slate-900 font-black shadow-md shadow-[#BFB7FD]/40 translate-x-1' 
        : 'text-slate-500 font-bold hover:bg-[#f8f7ff] dark:hover:bg-slate-800 hover:text-[#7c6ce0] dark:hover:text-[#BFB7FD]'
    }`}
  >
    <Icon size={20} className={isActive ? 'text-slate-900' : ''} strokeWidth={isActive ? 2.5 : 2} />
    <span className="tracking-wide">{label}</span>
  </button>
);
export default SidebarItem;