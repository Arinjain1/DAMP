import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';
import BrokerProfileView from './BrokerProfileView';
import { MOCK_DATA } from '../Mockdata/mockdata';
import api from '../utils/api';

const NetworkTab = ({ setToast }) => {
  const [brokers, setBrokers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBrokers = async (searchVal = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/brokers?q=${searchVal}`);
      if (response.data && response.data.success) {
        // Map backend broker fields to match UI expectations
        const mappedBrokers = response.data.data.map(b => {
          const mockInfo = MOCK_DATA.network.find(m => m.name === b.name) || {};
          return {
            ...b,
            plan: b.plan ? (b.plan.toLowerCase().includes('pro') ? 'Paid' : 'Trial') : 'Free',
            planName: b.plan || 'Free Tier',
            planStart: b.plan_start ? new Date(b.plan_start).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
            planEnd: b.plan_end ? new Date(b.plan_end).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
            props: parseInt(b.props, 10) || 0,
            clients: parseInt(b.clients, 10) || 0,
            collabs: mockInfo.collabs || 12, // Revert collabs to mock data
          };
        });
        setBrokers(mappedBrokers);
      }
    } catch (err) {
      console.error('Error fetching brokers:', err);
      setToast({ message: 'Failed to load live broker network directory', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBrokers(search);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Callback to handle blocking/unblocking state locally
  const handleStatusUpdate = (brokerId, newStatus) => {
    setBrokers(prev => prev.map(b => b.id === brokerId ? { ...b, status: newStatus } : b));
    if (selectedBroker && selectedBroker.id === brokerId) {
      setSelectedBroker(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Network</h2>
          <p className="text-slate-500 font-medium mt-1">Manage brokers, account state, and network activity.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search broker, ID or mobile..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-[#BFB7FD]/40 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#7c6ce0] focus:ring-4 focus:ring-[#BFB7FD]/20 transition-all shadow-sm"
            />
          </div>
          <button className="bg-white dark:bg-slate-900 border border-[#BFB7FD]/40 p-2.5 rounded-xl hover:bg-[#f8f7ff] text-slate-700 dark:text-gray-300 transition-colors shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {['Status: All', 'Plan: All', 'City: All'].map(f => (
          <span key={f} className="px-4 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-gray-300 font-semibold rounded-full border border-[#BFB7FD]/30 shadow-sm flex items-center cursor-pointer hover:border-[#7c6ce0] transition-colors">
            {f} <ChevronRight size={14} className="ml-1 opacity-50" />
          </span>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[#BFB7FD]/30 rounded-3xl shadow-[0_8px_30px_-4px_rgba(191,183,253,0.2)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f7ff] dark:bg-slate-800/50 text-slate-500 dark:text-gray-400 border-b border-[#BFB7FD]/30">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Broker</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Account</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Plan</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-right">Properties</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-right">Clients</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-right">Collabs</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-400 font-bold">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-[#7c6ce0] border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading brokers from network...</span>
                    </div>
                  </td>
                </tr>
              ) : brokers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-400 font-bold">
                    No brokers found matching your criteria.
                  </td>
                </tr>
              ) : (
                brokers.map((row, i) => (
                  <tr key={i} className="hover:bg-[#f8f7ff] dark:hover:bg-slate-800/80 transition-colors cursor-pointer group" onClick={() => setSelectedBroker(row)}>
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-800 dark:text-white flex items-center text-base">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#BFB7FD] to-[#7c6ce0] text-white flex items-center justify-center mr-3 font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
                          {row.name ? row.name.charAt(0) : 'B'}
                        </div>
                        {row.name || 'Unknown Broker'}
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                    <td className="px-6 py-4"><StatusBadge status={row.plan} /></td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-gray-300 font-bold">{row.props}</td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-gray-300 font-bold">{row.clients}</td>
                    <td className="px-6 py-4 text-right text-[#7c6ce0] font-black">{row.collabs}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedBroker(row); }}
                        className="px-4 py-2 text-xs font-bold text-[#7c6ce0] bg-[#f4f2ff] hover:bg-[#BFB7FD] hover:text-slate-900 rounded-lg transition-colors shadow-sm"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-[#f4f2ff] border border-[#BFB7FD]/40 rounded-2xl p-5 flex items-start shadow-sm">
        <ShieldCheck className="text-[#7c6ce0] mt-0.5 mr-3 flex-shrink-0" size={24} />
        <p className="text-sm font-medium text-slate-700 leading-relaxed">
          <strong className="text-[#7c6ce0] font-black">Privacy Rule Active:</strong> Activity totals are visible. Broker-owned CRM detail (inventory details, client phones) is not exposed from this view. Any access to sensitive data requires opening a Trust or Support case.
        </p>
      </div>

      {selectedBroker && (
        <BrokerProfileView 
          broker={selectedBroker} 
          onClose={() => setSelectedBroker(null)} 
          setToast={setToast}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default NetworkTab;