import React from 'react';

const ConfigurationTab = ({ setToast }) => {
  const configs = [
    { title: "Cities & Localities", desc: "Launch areas, service radius and active state", active: true },
    { title: "Property Taxonomy", desc: "Residential/commercial types and subtypes", active: false },
    { title: "Collaboration Policy", desc: "Request expiry, visibility and rate limits", active: true },
    { title: "Plan Entitlements", desc: "Limits and premium access", active: true },
    { title: "Trust Policy", desc: "Case SLA, sanctions and appeal window", active: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configuration</h2>
          <p className="text-slate-500 font-medium mt-1">Central platform settings. Changes are versioned and audited.</p>
        </div>
        <button 
          onClick={() => setToast({ message: 'Configuration saved to new version', type: 'success' })}
          className="bg-[#7c6ce0] hover:bg-[#6a5cd4] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#7c6ce0]/30 transition-all transform hover:-translate-y-0.5"
        >
          Save Changes
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {configs.map((conf, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#BFB7FD]/30 shadow-sm flex items-center justify-between hover:border-[#7c6ce0] transition-colors group">
            <div>
              <h3 className="font-black text-slate-800 dark:text-white text-lg">{conf.title}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{conf.desc}</p>
            </div>
            <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors shadow-inner ${conf.active ? 'bg-[#7c6ce0]' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${conf.active ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ConfigurationTab;