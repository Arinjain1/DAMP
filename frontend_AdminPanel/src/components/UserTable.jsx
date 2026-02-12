import { Download, MoreHorizontal, Search } from "lucide-react";

export const UserTable = ({ users }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
      <h3 className="font-bold text-lg text-gray-900">Broker Management</h3>
      <div className="flex gap-2">
         <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400"/>
            <input placeholder="Search brokers..." className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-indigo-100 w-64"/>
         </div>
         <button className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black"><Download size={16}/> Export</button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
          <tr>
            <th className="px-6 py-4">Broker Name</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Plan</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Joined</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-gray-400 text-xs">{user.phone}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{user.location}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.plan.includes('Pro') ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {user.plan}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`flex items-center gap-1.5 text-xs font-bold ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{user.joined}</td>
              <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-gray-900 p-2"><MoreHorizontal size={18}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
