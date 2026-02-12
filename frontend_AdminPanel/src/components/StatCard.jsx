export const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {change} vs last month
      </span>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}>
      <Icon size={24} />
    </div>
  </div>
);