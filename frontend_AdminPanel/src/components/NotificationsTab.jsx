import React from 'react';

const NotificationsTab = ({ setToast }) => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Custom Notifications</h2>
      <p className="text-slate-500 font-medium mt-1">Create targeted in-app and push campaigns.</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#BFB7FD]/30 shadow-sm space-y-6">
        <h3 className="font-black text-xl text-slate-800 dark:text-white border-b border-[#BFB7FD]/20 pb-4">Campaign Builder</h3>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Target Audience</label>
            <select className="w-full bg-[#f8f7ff] dark:bg-slate-800 border border-[#BFB7FD]/40 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7c6ce0]/50">
              <option>Active paid users in Indore</option>
              <option>Suspended accounts</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Notification Title</label>
            <input type="text" defaultValue="New collaboration opportunities available" className="w-full bg-[#f8f7ff] dark:bg-slate-800 border border-[#BFB7FD]/40 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7c6ce0]/50" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Message Body</label>
            <textarea rows={4} defaultValue="Open Brokmate and review fresh network activity." className="w-full bg-[#f8f7ff] dark:bg-slate-800 border border-[#BFB7FD]/40 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7c6ce0]/50 resize-none"></textarea>
          </div>
          <div className="pt-4">
             <button 
                onClick={() => setToast({ message: 'Campaign scheduled for sending', type: 'success' })}
                className="w-full bg-[#7c6ce0] hover:bg-[#6a5cd4] text-white px-4 py-3.5 rounded-xl text-base font-black transition-all shadow-lg shadow-[#7c6ce0]/30 transform hover:-translate-y-1"
              >
                Schedule Campaign
             </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#BFB7FD]/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#BFB7FD]/10 rounded-full blur-2xl"></div>
          <h3 className="font-black text-xl text-slate-800 dark:text-white mb-6">Device Preview</h3>
          <div className="bg-[#f8f7ff] dark:bg-slate-800 p-5 rounded-2xl border border-[#BFB7FD]/40 max-w-sm mx-auto shadow-sm relative z-10">
            <div className="flex items-center mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-[#BFB7FD] to-[#7c6ce0] rounded-lg flex items-center justify-center text-white text-xs font-black mr-3 shadow-sm">B</div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Brokmate • Now</span>
            </div>
            <h4 className="font-black text-slate-900 dark:text-white text-[15px]">New collaboration opportunities available</h4>
            <p className="text-slate-600 dark:text-gray-400 text-sm mt-1.5 font-medium leading-relaxed">Open Brokmate and review fresh network activity.</p>
          </div>
        </div>
        
        <div className="bg-[#f4f2ff] p-5 rounded-2xl border border-[#BFB7FD]/40 text-sm text-slate-700 shadow-sm">
          <strong className="text-[#7c6ce0] font-black block mb-1 uppercase tracking-wide text-xs">Compliance Check</strong>
          <span className="font-medium">Raw client/property data must never appear in campaigns. Personalization is limited to safe broker/account fields.</span>
        </div>
      </div>
    </div>
  </div>
);
export default NotificationsTab;