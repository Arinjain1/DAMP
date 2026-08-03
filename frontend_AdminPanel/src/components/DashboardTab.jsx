import React from 'react';
import { Download, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line, Tooltip as RechartsTooltip } from 'recharts';
import StatCard from './StatCard';
import { MOCK_DATA } from '../Mockdata/mockdata';

const DashboardTab = ({ setToast }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h2>
        <p className="text-slate-500 font-medium mt-1">Executive network snapshot and platform health.</p>
      </div>
      <div className="flex gap-3">
        <select className="bg-white dark:bg-slate-900 border border-[#BFB7FD]/40 text-sm font-bold rounded-xl px-4 py-2 text-slate-700 dark:text-gray-300 shadow-sm outline-none focus:border-[#7c6ce0] transition-colors cursor-pointer">
          <option>Global | All Cities</option>
          <option>Indore</option>
          <option>Bhopal</option>
        </select>
        <button 
          onClick={() => setToast({ message: 'Report export initiated successfully', type: 'success' })}
          className="bg-[#BFB7FD] hover:bg-[#a59cee] text-slate-900 p-2.5 rounded-xl transition-all shadow-md shadow-[#BFB7FD]/40 flex items-center justify-center"
        >
          <Download size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {MOCK_DATA.dashboard.stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#BFB7FD]/30 shadow-sm relative overflow-hidden">
        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">Broker activation and paid-plan trend</h3>
        <div className="h-80 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_DATA.dashboard.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eeecff" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} fontWeight={600} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} fontWeight={600} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc', fontWeight: 600, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="active" stroke="#7c6ce0" strokeWidth={4} dot={{ r: 5, fill: '#7c6ce0', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} name="Active Users" />
              <Line type="monotone" dataKey="paid" stroke="#BFB7FD" strokeWidth={4} dot={{ r: 5, fill: '#BFB7FD', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} name="Paid Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-[#BFB7FD]/30 shadow-sm hover:shadow-lg transition-shadow">
          <h3 className="text-base font-black text-slate-800 dark:text-white mb-5 uppercase tracking-wide">Needs Attention</h3>
          <div className="space-y-4">
            {MOCK_DATA.dashboard.attention.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="flex items-center text-sm font-semibold text-slate-600 dark:text-gray-300">
                  <span className={`w-2.5 h-2.5 rounded-full mr-3 bg-current ${item.color}`}></span>
                  {item.label}
                </span>
                <span className="font-black text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 bg-[#f4f2ff] hover:bg-[#eeecff] text-[#7c6ce0] rounded-xl text-sm font-bold transition-colors">
            View Action Items
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#BFB7FD] to-[#7c6ce0] p-6 rounded-3xl shadow-lg shadow-[#BFB7FD]/30 text-white relative overflow-hidden">
           <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <h3 className="text-base font-black mb-5 flex items-center tracking-wide">
            <Activity size={20} className="mr-2" /> Live Platform Feed
          </h3>
          <div className="space-y-4 relative z-10">
            {MOCK_DATA.dashboard.liveFeed.map((feed, i) => (
              <div key={i} className="flex flex-col border-l-2 border-white/30 pl-3">
                <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">{feed.time}</span>
                <span className="text-sm font-medium mt-0.5">{feed.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardTab;