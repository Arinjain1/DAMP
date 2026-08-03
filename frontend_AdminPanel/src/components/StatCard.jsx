import React from 'react';
import PropTypes from 'prop-types';
const StatCard = ({ title, value, change, subtitle, icon: Icon, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#BFB7FD]/30 dark:border-slate-800 shadow-sm hover:shadow-[0_8px_30px_-4px_rgba(191,183,253,0.4)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
  >
    {/* Decorative background blob */}
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#BFB7FD]/10 rounded-full blur-2xl group-hover:bg-[#BFB7FD]/20 transition-all"></div>
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2 group-hover:text-[#7c6ce0] dark:group-hover:text-[#BFB7FD] transition-colors">{value}</h3>
      </div>
      {Icon && (
        <div className="p-3 bg-[#f4f2ff] dark:bg-[#7c6ce0]/20 text-[#7c6ce0] dark:text-[#BFB7FD] rounded-2xl shadow-sm border border-[#BFB7FD]/20">
          <Icon size={24} strokeWidth={2.5} />
        </div>
      )}
    </div>
    <div className="mt-5 flex items-center text-sm relative z-10">
      {change && (
        <span className={`font-bold px-2 py-0.5 rounded-md ${change.startsWith('+') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
          {change}
        </span>
      )}
      {subtitle && <span className="text-slate-500 dark:text-slate-400 ml-3 font-medium">{subtitle}</span>}
    </div>
  </div>
);

export default StatCard;