import React from 'react';
import { X, CheckCircle2, ShieldCheck, LifeBuoy, ShieldAlert } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { MOCK_DATA } from '../Mockdata/mockdata';

const BrokerProfileView = ({ broker, onClose, setToast }) => {
  if (!broker) return null;

  const activities = MOCK_DATA.userActivity[broker.id] || [
    { time: 'Today', action: 'User active', type: 'system' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg h-full shadow-2xl border-l border-[#BFB7FD]/30 dark:border-slate-800 overflow-y-auto animate-slide-in-right flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b border-[#BFB7FD]/20 dark:border-slate-800 flex justify-between items-start sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-10">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-gradient-to-br from-[#BFB7FD] to-[#7c6ce0] text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-[#BFB7FD]/50">
              {broker.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{broker.name}</h2>
              <p className="text-sm font-medium text-[#7c6ce0] dark:text-[#BFB7FD] mt-1">{broker.id} • Indore</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-[#eeecff] dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="p-8 space-y-8 flex-1">
          {/* Status Section */}
          <div className="flex gap-4">
             <div className="bg-[#f8f7ff] dark:bg-slate-800/50 p-4 rounded-2xl border border-[#BFB7FD]/20 flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">KYC Status</p>
                <StatusBadge status={broker.kyc} />
             </div>
             <div className="bg-[#f8f7ff] dark:bg-slate-800/50 p-4 rounded-2xl border border-[#BFB7FD]/20 flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Account State</p>
                <StatusBadge status={broker.status} />
             </div>
          </div>

          {/* Subscription Details Card (Enhanced) */}
          <div className="space-y-4">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
               Subscription Plan
             </h3>
             <div className="bg-gradient-to-br from-[#BFB7FD] to-[#7c6ce0] rounded-3xl p-6 shadow-xl shadow-[#BFB7FD]/40 text-white relative overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                  <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="#FFFFFF" d="M45.7,-76.4C58.9,-69.3,69.1,-55.3,77.5,-40.8C85.9,-26.3,92.5,-11.3,91.3,3.3C90.1,17.9,81.1,32.1,70.9,43.6C60.7,55.1,49.3,63.9,36.5,71.2C23.7,78.5,9.5,84.3,-5.1,87.3C-19.7,90.3,-34.7,90.5,-47.9,84.2C-61.1,77.9,-72.5,65.1,-80.7,50.4C-88.9,35.7,-93.9,19.1,-93.4,2.9C-92.9,-13.3,-86.9,-29,-77.7,-41.8C-68.5,-54.6,-56.1,-64.5,-42.6,-71.4C-29.1,-78.3,-14.6,-82.2,0.9,-83.7C16.4,-85.2,32.5,-83.5,45.7,-76.4Z" transform="translate(100 100)" /></svg>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <p className="text-xs text-white/80 font-bold uppercase tracking-wider mb-1">Current Tier</p>
                          <h4 className="text-2xl font-black flex items-center drop-shadow-md">
                            {broker.planName || (broker.plan === 'Paid' || broker.plan === 'Grace' ? 'Pro Monthly (INR 99)' : 'Free Tier')}
                            {broker.plan === 'Paid' && <CheckCircle2 size={20} className="ml-2 text-white" />}
                          </h4>
                      </div>
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                        {broker.plan}
                      </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm pt-5 border-t border-white/20">
                    <div>
                      <p className="text-white/70 text-xs font-bold uppercase mb-1">Activated On</p>
                      <p className="font-semibold text-lg">{broker.planStart || '12 Jul 2026'}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-bold uppercase mb-1">Valid Till</p>
                      <p className="font-semibold text-lg">{broker.planEnd || '12 Aug 2026'}</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-6 bg-[#f8f7ff] dark:bg-slate-800/30 p-6 rounded-3xl border border-[#BFB7FD]/20">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Mobile</p>
              <p className="font-semibold text-slate-800 dark:text-white">+91 XXXXX 2194</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Registered</p>
              <p className="font-semibold text-slate-800 dark:text-white">12 Jul 2026</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Last Active</p>
              <p className="font-semibold text-slate-800 dark:text-white">Today, 11:42 AM</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">City</p>
              <p className="font-semibold text-slate-800 dark:text-white">Indore</p>
            </div>
          </div>

          {/* Platform Activity */}
          <div className="space-y-4">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
               Platform Usage
               <ShieldCheck size={16} className="text-[#7c6ce0]" title="Privacy preserved view" />
             </h3>
             <div className="bg-white dark:bg-slate-800 border border-[#BFB7FD]/30 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm font-semibold text-slate-600 dark:text-gray-300">Properties Added</span>
                  <span className="font-black text-lg text-slate-800 dark:text-white">{broker.props}</span>
                </div>
                <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm font-semibold text-slate-600 dark:text-gray-300">Clients Added</span>
                  <span className="font-black text-lg text-slate-800 dark:text-white">{broker.clients}</span>
                </div>
                <div className="p-4 flex justify-between items-center bg-[#f4f2ff] dark:bg-[#7c6ce0]/10">
                  <span className="text-[#7c6ce0] dark:text-[#BFB7FD] font-bold text-sm">Accepted Collaborations</span>
                  <span className="font-black text-lg text-[#7c6ce0] dark:text-[#BFB7FD]">{broker.collabs}</span>
                </div>
             </div>
             <p className="text-[11px] text-slate-400 font-medium">Admin observes activity totals. Broker owns specific CRM records.</p>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-5">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
               Recent Activity
             </h3>
             <div className="relative pl-5 border-l-2 border-[#eeecff] dark:border-slate-700 space-y-6">
                {activities.map((act, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#BFB7FD] ring-4 ring-white dark:ring-slate-900 shadow-sm"></div>
                    <p className="text-xs font-bold text-slate-400 mb-1">{act.time}</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-gray-200">{act.action}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="p-6 border-t border-[#BFB7FD]/20 bg-[#f8f7ff] dark:bg-slate-900/50 grid grid-cols-2 gap-3 mt-auto">
           <button 
             onClick={() => setToast({ message: 'Opening Support History...', type: 'info' })}
             className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-[#BFB7FD]/40 rounded-xl text-sm font-bold text-[#7c6ce0] hover:bg-[#eeecff] transition-all flex items-center justify-center shadow-sm"
           >
             <LifeBuoy size={18} className="mr-2" /> Support
           </button>
           <button 
             onClick={() => setToast({ message: 'Initiating Trust Case...', type: 'error' })}
             className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center shadow-sm"
           >
             <ShieldAlert size={18} className="mr-2" /> Trust Flag
           </button>
           <button 
             onClick={() => setToast({ message: `Account settings opened for ${broker.name}`, type: 'info' })}
             className="col-span-2 w-full py-3 px-4 bg-[#7c6ce0] hover:bg-[#6a5cd4] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[#7c6ce0]/30"
           >
             Manage Account Settings
           </button>
        </div>
      </div>
    </div>
  );
};
export default BrokerProfileView;