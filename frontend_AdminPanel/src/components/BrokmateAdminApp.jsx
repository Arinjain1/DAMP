import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GitMerge, 
  ShieldAlert, 
  LifeBuoy, 
  BarChart3 as ChartIcon, 
  CreditCard, 
  Settings, 
  Bell, 
  ShieldCheck,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import DashboardTab from './DashboardTab';
import NetworkTab from './NetworkTab';
import AnalyticsTab from './AnalyticsTab';
import ConfigurationTab from './ConfigurationTab';
import NotificationsTab from './NotificationsTab';
import GenericTable from './GenericTable';
import StatCard from './StatCard';
import Toast from './Toast';
import SidebarItem from './SidebarItem';
import { MOCK_DATA } from '../Mockdata/mockdata';

function BrokmateAdminApp({ user, onLogout }) {
  const getInitials = (fullName) => {
    if (!fullName) return 'SA';
    return fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const initials = getInitials(user?.full_name);
  const adminName = user?.full_name || 'Super Admin';
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light'); // Set to light theme by default
  const [toast, setToast] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const navItems = [
    { id: 'Dashboard', icon: LayoutDashboard },
    { id: 'Network', icon: Users },
    { id: 'Collaborations', icon: GitMerge },
    { id: 'Trust & Disputes', icon: ShieldAlert },
    { id: 'Support', icon: LifeBuoy },
    { id: 'Analytics', icon: ChartIcon },
    { id: 'Plans & Billing', icon: CreditCard },
    { id: 'Configuration', icon: Settings },
    { id: 'Notifications', icon: Bell },
    { id: 'Audit & Security', icon: ShieldCheck },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <DashboardTab setToast={setToast} />;
      case 'Network': return <NetworkTab setToast={setToast} />;
      case 'Collaborations': return (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {MOCK_DATA.collaborations.stats.map((s, i) => <StatCard key={i} {...s} />)}
          </div>
          <GenericTable 
            title="Collaborations" 
            description="Read-only monitor: volume, participants, status and risk signals."
            columns={[{label:'ID', key:'id'}, {label:'Broker A', key:'brokerA'}, {label:'Broker B', key:'brokerB'}, {label:'State', key:'state', isStatus: true}, {label:'Context', key:'context'}, {label:'Updated', key:'updated'}]}
            data={MOCK_DATA.collaborations.list}
            setToast={setToast}
          />
        </div>
      );
      case 'Trust & Disputes': return (
        <GenericTable 
          title="Trust & Disputes" 
          description="Reports, investigations, evidence, decisions and network enforcement."
          columns={[{label:'Case', key:'id'}, {label:'Category', key:'category'}, {label:'Priority', key:'priority', isStatus:true}, {label:'User', key:'user'}, {label:'State', key:'state', isStatus:true}, {label:'Age', key:'age'}]}
          data={MOCK_DATA.trust}
          setToast={setToast}
        />
      );
      case 'Support': return (
        <GenericTable 
          title="Support Center" 
          description="User tickets, SLA queues, communication and resolution."
          columns={[{label:'Ticket', key:'id'}, {label:'Category', key:'category'}, {label:'Priority', key:'priority', isStatus:true}, {label:'User', key:'user'}, {label:'State', key:'state', isStatus:true}, {label:'Age', key:'age'}]}
          data={MOCK_DATA.support}
          setToast={setToast}
        />
      );
      case 'Analytics': return <AnalyticsTab />;
      case 'Plans & Billing': return (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
             <StatCard title="Total Paid Users" value="4,208" />
             <StatCard title="Monthly Recurring Revenue" value="INR 4.16L" />
             <StatCard title="Failed Renewals" value="61" />
          </div>
          <GenericTable 
            title="Plans & Billing" 
            description="Subscription status, payments, invoices and entitlements (INR 99/user/month)."
            columns={[{label:'Subscription', key:'id'}, {label:'User', key:'user'}, {label:'State', key:'state', isStatus:true}, {label:'Amount', key:'amount'}, {label:'Renewal', key:'renewal'}, {label:'Payment', key:'payment'}]}
            data={[
              {id: 'SUB-2102', user: 'Deepika Mall', state: 'Paid', amount: 'INR 99', renewal: '12 Aug', payment: 'Success'},
              {id: 'SUB-2097', user: 'Rahul Sharma', state: 'Grace', amount: 'INR 99', renewal: '05 Aug', payment: 'Retry due'},
              {id: 'SUB-2083', user: 'Amit Verma', state: 'Free', amount: 'INR 0', renewal: '-', payment: 'No plan'},
            ]}
            setToast={setToast}
          />
        </div>
      );
      case 'Configuration': return <ConfigurationTab setToast={setToast} />;
      case 'Notifications': return <NotificationsTab setToast={setToast} />;
      case 'Audit & Security': return (
        <GenericTable 
          title="Audit & Security" 
          description="Searchable audit trail, account sessions, security alerts and sensitive-action review."
          columns={[{label:'Event', key:'id'}, {label:'Action', key:'action'}, {label:'Actor', key:'actor'}, {label:'Object', key:'object'}, {label:'Result', key:'result', isStatus:true}, {label:'Time', key:'time'}]}
          data={MOCK_DATA.audit}
          setToast={setToast}
        />
      );
      default: return <DashboardTab setToast={setToast} />;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 ${theme}`}>
      {/* Background ambient gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-[#f8f7ff] dark:from-slate-950 dark:to-slate-900 z-0 pointer-events-none"></div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Global Command Palette */}
      {searchOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex justify-center items-start pt-[15vh] animate-fade-in" onClick={() => setSearchOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(191,183,253,0.5)] border border-[#BFB7FD]/40 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[#BFB7FD]/20 flex items-center">
              <Search className="text-[#7c6ce0] mr-4" size={24} strokeWidth={2.5} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search users, configurations, or IDs..." 
                className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white text-xl font-bold placeholder-slate-400"
              />
              <span className="text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md uppercase tracking-wider">ESC</span>
            </div>
            <div className="p-3 bg-[#f8f7ff] dark:bg-slate-900/50">
              <div className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</div>
              <div className="p-4 hover:bg-white dark:hover:bg-slate-800 rounded-2xl cursor-pointer text-slate-700 dark:text-gray-300 text-sm font-bold flex items-center transition-colors"><Users size={18} className="mr-3 text-[#7c6ce0]" /> Go to Network Directory</div>
              <div className="p-4 hover:bg-white dark:hover:bg-slate-800 rounded-2xl cursor-pointer text-slate-700 dark:text-gray-300 text-sm font-bold flex items-center transition-colors"><ShieldAlert size={18} className="mr-3 text-rose-500" /> Review Open Trust Cases</div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-[#BFB7FD]/30 flex items-center justify-between p-4 sticky top-0 z-30 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#BFB7FD] to-[#7c6ce0] rounded-xl flex items-center justify-center shadow-md shadow-[#BFB7FD]/40">
            <span className="text-white font-black text-xl">B</span>
          </div>
          <span className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Brokmate</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-[#7c6ce0] bg-[#f8f7ff] p-2 rounded-xl">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex h-[calc(100vh-73px)] lg:h-screen overflow-hidden relative z-10">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-72 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-[#BFB7FD]/30 z-40 transition-transform duration-300 ease-in-out flex flex-col pt-4 lg:pt-0`}>
          <div className="hidden lg:flex items-center space-x-4 p-7 border-b border-[#BFB7FD]/20">
            <div className="w-10 h-10 bg-gradient-to-br from-[#BFB7FD] to-[#7c6ce0] rounded-xl flex items-center justify-center shadow-lg shadow-[#BFB7FD]/50 transform -rotate-3">
              <span className="text-white font-black text-xl">B</span>
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white text-xl tracking-tight block">Brokmate</span>
              <span className="text-[10px] text-[#7c6ce0] font-black uppercase tracking-widest">Control Center</span>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-5 space-y-1.5 custom-scrollbar">
            {navItems.map(item => (
              <SidebarItem 
                key={item.id}
                icon={item.icon}
                label={item.id}
                isActive={activeTab === item.id}
                onClick={() => { setActiveTab(item.id); if(window.innerWidth < 1024) setSidebarOpen(false); }}
              />
            ))}
          </nav>
          
          <div className="p-5 border-t border-[#BFB7FD]/20">
            <div className="bg-[#f8f7ff] dark:bg-slate-800/80 rounded-2xl p-4 flex items-center justify-between border border-[#BFB7FD]/20 shadow-sm">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-[#BFB7FD] to-[#7c6ce0] text-white rounded-full flex items-center justify-center font-black shadow-md flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{adminName}</p>
                  <p className="text-[11px] font-bold text-[#7c6ce0] uppercase tracking-wider truncate">Global Access</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="hidden lg:flex h-[76px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-[#BFB7FD]/20 items-center justify-between px-8 sticky top-0 z-20">
            <div className="flex items-center text-sm font-bold text-slate-400 uppercase tracking-widest">
               Operations / <span className="text-[#7c6ce0] ml-2">{activeTab}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSearchOpen(true)}
                className="flex items-center space-x-3 text-sm font-bold text-slate-500 bg-white dark:bg-slate-800 border border-[#BFB7FD]/40 px-4 py-2.5 rounded-xl hover:shadow-md hover:border-[#7c6ce0] transition-all shadow-sm"
              >
                <Search size={18} className="text-[#7c6ce0]" />
                <span>Search anywhere...</span>
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-md px-1.5 py-0.5 ml-4 text-[10px]">CMD K</span>
              </button>
              
              <button onClick={toggleTheme} className="p-2.5 text-[#7c6ce0] bg-white dark:bg-slate-800 border border-[#BFB7FD]/40 hover:bg-[#f8f7ff] rounded-xl transition-all shadow-sm">
                {theme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
              </button>
              <button className="relative p-2.5 text-[#7c6ce0] bg-white dark:bg-slate-800 border border-[#BFB7FD]/40 hover:bg-[#f8f7ff] rounded-xl transition-all shadow-sm">
                <Bell size={20} strokeWidth={2.5} />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
      
      {/* Global CSS Enhancements */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #BFB7FD; border-radius: 20px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #7c6ce0; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(191, 183, 253, 0.3); }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        
        .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}

export default BrokmateAdminApp;