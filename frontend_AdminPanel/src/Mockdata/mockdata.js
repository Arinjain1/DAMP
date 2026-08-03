export const MOCK_DATA = {
  dashboard: {
    stats: [
      { title: "Registered Brokers", value: "12,840", change: "+8.2%", type: 'positive' },
      { title: "Active 30D", value: "8,416", change: "65.5%", type: 'neutral', subtitle: "of registered" },
      { title: "Paid Users", value: "4,208", change: "32.8%", type: 'neutral', subtitle: "of registered" },
      { title: "Collaborated", value: "1,736", change: "20.6%", type: 'neutral', subtitle: "of active" }
    ],
    chartData: [
      { name: 'Jan', active: 4000, paid: 2400 },
      { name: 'Feb', active: 5000, paid: 2800 },
      { name: 'Mar', active: 6200, paid: 3100 },
      { name: 'Apr', active: 6800, paid: 3500 },
      { name: 'May', active: 7500, paid: 3900 },
      { name: 'Jun', active: 8416, paid: 4208 },
    ],
    attention: [
      { label: "Failed renewals", value: 19, color: "text-red-500" },
      { label: "Open disputes", value: 11, color: "text-red-500" },
      { label: "Security alerts", value: 3, color: "text-amber-500" }
    ],
    liveFeed: [
      { time: 'Just now', event: 'Deepika Mall upgraded to Paid Plan' },
      { time: '2m ago', event: 'New dispute raised: DSP-442' },
      { time: '15m ago', event: 'Rahul Sharma completed a collaboration' },
      { time: '1h ago', event: 'Mass notification sent successfully' }
    ]
  },
  network: [
    { id: 'BRK-10241', name: 'Rahul Sharma', status: 'Active', plan: 'Paid', planName: 'Pro Monthly (INR 99)', planStart: '05 Jul 2026', planEnd: '05 Aug 2026', props: 12, clients: 7, collabs: 4 },
    { id: 'BRK-10242', name: 'Deepika Mall', status: 'Active', plan: 'Paid', planName: 'Pro Monthly (INR 99)', planStart: '12 Jul 2026', planEnd: '12 Aug 2026', props: 26, clients: 13, collabs: 8 },
    { id: 'BRK-10243', name: 'Amit Verma', status: 'Inactive', plan: 'Free', planName: 'Free Tier', planStart: '01 Aug 2026', planEnd: 'N/A', props: 3, clients: 2, collabs: 0 },
    { id: 'BRK-10244', name: 'Sonal Jain', status: 'Active', plan: 'Grace', planName: 'Pro Monthly (INR 99)', planStart: '22 Jun 2026', planEnd: '22 Jul 2026', props: 18, clients: 9, collabs: 5 },
    { id: 'BRK-10245', name: 'M. Khan', status: 'Blocked', plan: 'Paid', planName: 'Pro Monthly (INR 99)', planStart: '15 Jul 2026', planEnd: '15 Aug 2026', props: 31, clients: 17, collabs: 11 },
  ],
  userActivity: {
    'BRK-10241': [
      { time: 'Today, 11:42 AM', action: 'Logged in via Mobile App', type: 'system' },
      { time: 'Yesterday, 04:15 PM', action: 'Accepted collaboration request from Rahul Sharma', type: 'collab' },
      { time: '02 Aug 2026', action: 'Added new commercial property', type: 'crm' },
      { time: '28 Jul 2026', action: 'Plan renewed successfully', type: 'billing' }
    ],
    'BRK-10242': [
      { time: '2 hours ago', action: 'Sent collaboration request to Deepika Mall', type: 'collab' },
      { time: 'Today, 09:00 AM', action: 'Logged in via Web', type: 'system' },
      { time: '01 Aug 2026', action: 'Added 3 new client requirements', type: 'crm' }
    ]
  },
  collaborations: {
    stats: [
      { title: "Requests", value: "4,920", change: "+11%" },
      { title: "Accepted", value: "1,736", change: "35.3%" },
      { title: "Active", value: "1,122", change: "64.6%" },
      { title: "Completed", value: "482", change: "27.8%" },
    ],
    list: [
      { id: 'COL-9021', brokerA: 'Deepika Mall', brokerB: 'Rahul Sharma', state: 'Accepted', context: 'Property + Client', updated: '2h ago' },
      { id: 'COL-9017', brokerA: 'Sonal Jain', brokerB: 'Amit Verma', state: 'Active', context: 'Visit Planned', updated: '5h ago' },
      { id: 'COL-8994', brokerA: 'M. Khan', brokerB: 'R. Dubey', state: 'Disputed', context: 'Data misuse', updated: 'Yesterday' },
      { id: 'COL-8940', brokerA: 'Nisha Shah', brokerB: 'P. Tiwari', state: 'Completed', context: 'Successful', updated: '2 days ago' },
    ]
  },
  trust: [
    { id: 'DSP-441', category: 'Client poaching', priority: 'High', user: 'M. Khan', state: 'Evidence requested', age: '4h' },
    { id: 'DSP-438', category: 'Fake property', priority: 'Medium', user: 'Amit Verma', state: 'Under review', age: '8h' },
    { id: 'DSP-433', category: 'Data misuse', priority: 'High', user: 'R. Dubey', state: 'Decision due', age: '1d' },
    { id: 'DSP-427', category: 'Harassment', priority: 'Low', user: 'S. Jain', state: 'Resolved', age: '2d' },
  ],
  support: [
    { id: 'SUP-1812', category: 'Login / OTP', priority: 'High', user: 'Deepika Mall', state: 'In Progress', age: '18m' },
    { id: 'SUP-1808', category: 'Plan activation', priority: 'Medium', user: 'Rahul Sharma', state: 'Waiting User', age: '2h' },
    { id: 'SUP-1799', category: 'Profile update', priority: 'High', user: 'Amit Verma', state: 'New', age: '3h' },
    { id: 'SUP-1782', category: 'Notification', priority: 'Low', user: 'Sonal Jain', state: 'Resolved', age: '1d' },
  ],
  audit: [
    { id: 'AUD-8821', action: 'admin.verify_broker', actor: 'Admin A', object: 'BRK-10241', result: 'Success', time: '10:42' },
    { id: 'AUD-8818', action: 'session.revoke', actor: 'Security', object: 'USR-321', result: 'Success', time: '10:19' },
    { id: 'AUD-8810', action: 'config.update', actor: 'Super Admin', object: 'Plan policy', result: 'Success', time: '09:54' },
    { id: 'AUD-8802', action: 'dispute.view_sensitive', actor: 'Reviewer B', object: 'DSP-441', result: 'Allowed', time: '09:21' },
  ]
};
