import { TrendingUp } from "lucide-react";

export default function SubscriptionsView({ transactions }) {
  return (
   <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
         <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
            <p className="text-indigo-200 text-sm font-bold uppercase mb-2">Total Revenue (This Month)</p>
            <h2 className="text-4xl font-black">₹4,25,000</h2>
            <div className="mt-4 flex gap-2">
               <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold">+18% growth</span>
            </div>
         </div>
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Active Pro Users</p>
            <h3 className="text-3xl font-black text-gray-900">840</h3>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
               <div className="bg-green-500 h-full w-[65%]"></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">65% of monthly goal</p>
         </div>
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Churn Rate</p>
            <h3 className="text-3xl font-black text-gray-900">2.4%</h3>
            <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1"><TrendingUp size={12}/> Down by 0.5%</p>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
         <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900">Recent Transactions</h3>
         </div>
         <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
               <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {transactions.map(txn => (
                  <tr key={txn.id}>
                     <td className="px-6 py-4 text-xs font-bold text-gray-500">{txn.id}</td>
                     <td className="px-6 py-4 text-sm font-bold text-gray-900">{txn.user}</td>
                     <td className="px-6 py-4 text-sm text-gray-600">{txn.plan}</td>
                     <td className="px-6 py-4 text-sm font-black text-gray-900">₹{txn.amount}</td>
                     <td className="px-6 py-4 text-sm text-gray-500">{txn.date}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${txn.status === 'Success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                           {txn.status}
                        </span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   </div>
   );
}
