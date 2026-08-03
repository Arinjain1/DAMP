import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

const AnalyticsTab = () => {
  const pieData = [
    { name: 'Indore', value: 34, color: '#7c6ce0' },
    { name: 'Bhopal', value: 26, color: '#BFB7FD' },
    { name: 'Pune', value: 21, color: '#a59cee' },
    { name: 'Jaipur', value: 18, color: '#e0dbff' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Analytics</h2>
        <p className="text-slate-500 font-medium mt-1">User acquisition, activation, subscription, and adoption metrics.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'New Users', value: '1,284', sub: '+14%' },
          { label: 'Activation', value: '72.4%', sub: '+3.1' },
          { label: 'Paid Conversion', value: '32.8%', sub: '+1.6' },
          { label: 'Collab Adoption', value: '20.6%', sub: '+2.9' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#BFB7FD]/30 shadow-sm hover:-translate-y-1 transition-transform cursor-pointer">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{s.label}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">{s.value}</h3>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#BFB7FD]/30 shadow-sm">
           <h3 className="text-lg font-black text-slate-800 dark:text-white mb-8">User Funnel</h3>
           <div className="space-y-6">
              {[
                { label: 'Registered', val: '12,840', pct: '100%' },
                { label: 'Active 30D', val: '8,416', pct: '65%' },
                { label: 'Paid', val: '4,208', pct: '32%' },
                { label: 'Collaborated', val: '1,736', pct: '13%' },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-slate-700 dark:text-gray-300">{step.label}</span>
                    <span className="font-black text-slate-500">{step.val}</span>
                  </div>
                  <div className="w-full bg-[#f4f2ff] dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#BFB7FD] to-[#7c6ce0] h-full rounded-full transition-all duration-1000" style={{ width: step.pct }}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#BFB7FD]/30 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">Collaboration by City</h3>
          <div className="h-72 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} 
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
               <span className="text-3xl font-black text-slate-800">1.7K</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collabs</span>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 shadow-sm" style={{ backgroundColor: d.color }}></div>
                <span className="font-bold text-slate-600 dark:text-gray-400">{d.name} <span className="opacity-60">({d.value}%)</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsTab;