import React from 'react';

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
  if (['Approved', 'Active', 'Paid', 'Success', 'Resolved', 'Accepted', 'Completed', 'Allowed'].includes(status)) {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
  } else if (['Pending', 'Grace', 'In Progress', 'Waiting User', 'Evidence requested', 'Under review', 'Active'].includes(status)) {
    color = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400';
  } else if (['Suspended', 'Blocked', 'Failed', 'Disputed', 'High', 'Decision due', 'New'].includes(status)) {
    color = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border ${color}`}>
      {status}
    </span>
  );
};

export default StatusBadge;