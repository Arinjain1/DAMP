import { Activity, Bell, ChevronRight, CreditCard, LayoutDashboard, LogOut, Settings, ShieldAlert, Users } from "lucide-react";
import { useState } from "react";
import { MOCK_PROPERTIES, MOCK_STATS, MOCK_TRANSACTIONS, MOCK_USERS } from "../Mockdata/Mockdata";
import { UserTable } from "../components/UserTable";
import { StatCard } from "../components/StatCard";
import PropertyModeration from "../components/PropertyModeration";
import SubscriptionsView from "../components/SubscriptionsView";


export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Broker Management', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions & Rev', icon: CreditCard },
    { id: 'properties', label: 'Moderation', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex text-gray-900">
      
      {/* Sidebar */}
      <aside className={`bg-gray-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-20`}>
         <div className="p-6 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center w-full'}`}>
               <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                  <LayoutDashboard size={18} className="text-white"/>
               </div>
               {isSidebarOpen && (
                  <div>
                     <h1 className="font-black text-lg tracking-tight">BrokerOne</h1>
                     <p className="text-[10px] text-gray-400 uppercase tracking-widest">Admin Panel</p>
                  </div>
               )}
            </div>
         </div>

         <nav className="flex-1 px-4 space-y-2 mt-4">
            {menuItems.map(item => (
               <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} ${!isSidebarOpen && 'justify-center'}`}
               >
                  <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  {isSidebarOpen && <span className="text-sm font-bold">{item.label}</span>}
                  {isSidebarOpen && activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-50"/>}
               </button>
            ))}
         </nav>

         <div className="p-4 border-t border-gray-800">
            <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-gray-800 transition-all ${!isSidebarOpen && 'justify-center'}`}>
               <LogOut size={20} />
               {isSidebarOpen && <span className="text-sm font-bold">Logout</span>}
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
         
         {/* Header */}
         <header className="bg-white h-20 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  <MenuIcon isOpen={isSidebarOpen}/>
               </button>
               <h2 className="text-xl font-black text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
            </div>
            <div className="flex items-center gap-6">
               <div className="relative">
                  <Bell size={20} className="text-gray-500 hover:text-gray-900 cursor-pointer"/>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
               </div>
               <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                  <div className="text-right hidden md:block">
                     <p className="text-sm font-bold text-gray-900">Admin Team</p>
                     <p className="text-xs text-gray-500">Super Admin</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                     <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" className="w-full h-full"/>
                  </div>
               </div>
            </div>
         </header>

         {/* Content Area */}
         <div className="p-8 max-w-7xl mx-auto">
            
            {activeTab === 'dashboard' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-4 gap-6">
                     {MOCK_STATS.map((stat, i) => (
                        <StatCard key={i} {...stat} />
                     ))}
                  </div>

                  <div className="grid grid-cols-3 gap-8">
                     <div className="col-span-2">
                        <UserTable users={MOCK_USERS} />
                     </div>
                     <div className="col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                           <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                           <div className="space-y-4">
                              {[1,2,3,4].map((_, i) => (
                                 <div key={i} className="flex gap-3 items-start pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                                       <Activity size={14}/>
                                    </div>
                                    <div>
                                       <p className="text-sm text-gray-800 font-medium">New pro subscription purchased by <span className="font-bold">Metro Realtors</span></p>
                                       <p className="text-xs text-gray-400 mt-1">2 mins ago</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'users' && <div className="animate-fade-in"><UserTable users={MOCK_USERS} /></div>}
            
            {activeTab === 'subscriptions' && <div className="animate-fade-in"><SubscriptionsView transactions={MOCK_TRANSACTIONS} /></div>}
            
            {activeTab === 'properties' && <div className="animate-fade-in"><PropertyModeration properties={MOCK_PROPERTIES} /></div>}

            {activeTab === 'settings' && (
               <div className="animate-fade-in bg-white p-8 rounded-2xl border border-gray-100 text-center py-20">
                  <Settings size={48} className="mx-auto text-gray-300 mb-4"/>
                  <h3 className="text-xl font-bold text-gray-900">Settings Panel</h3>
                  <p className="text-gray-500 mt-2">Configure app settings, roles, and permissions here.</p>
               </div>
            )}

         </div>
      </main>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}

const MenuIcon = ({ isOpen }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {isOpen ? <path d="M4 12h16M4 6h16M4 18h16"/> : <path d="M4 12h16M4 6h16M4 18h16"/>}
   </svg>
);