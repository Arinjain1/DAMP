import React from 'react';
import StatusBadge from './StatusBadge';

const GenericTable = ({ title, description, columns, data, setToast }) => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
      {description && <p className="text-slate-500 font-medium mt-1">{description}</p>}
    </div>
    <div className="bg-white dark:bg-slate-900 border border-[#BFB7FD]/30 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#f8f7ff] dark:bg-slate-800/50 text-slate-500 dark:text-gray-400 border-b border-[#BFB7FD]/30">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-5 font-bold uppercase tracking-wider text-xs">{col.label}</th>
              ))}
              <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[#f8f7ff] dark:hover:bg-slate-800/50 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4">
                    {col.isStatus ? <StatusBadge status={row[col.key]} /> : <span className="font-semibold text-slate-700 dark:text-gray-200">{row[col.key]}</span>}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                   <button 
                    onClick={() => setToast({ message: `Action taken on ${row.id}`, type: 'info' })}
                    className="text-sm font-bold text-[#7c6ce0] hover:text-[#5e4ac9] transition-colors"
                   >
                     Manage
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default GenericTable;