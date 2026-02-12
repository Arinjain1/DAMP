import { CreditCard, DollarSign, Home, Users } from "lucide-react";

export const MOCK_STATS = [
  { title: 'Total Brokers', value: '2,450', change: '+12%', icon: Users, color: 'bg-blue-500' },
  { title: 'Active Pro Plans', value: '840', change: '+5%', icon: CreditCard, color: 'bg-indigo-500' },
  { title: 'Monthly Revenue', value: '₹4.2L', change: '+18%', icon: DollarSign, color: 'bg-emerald-500' },
  { title: 'Pending Properties', value: '45', change: '-2%', icon: Home, color: 'bg-amber-500' },
];

export const MOCK_USERS = [
  { id: 1, name: 'Rajesh Sharma', phone: '+91 98765 43210', location: 'Indiranagar, BLR', plan: 'Pro Quarterly', status: 'Active', joined: '12 Jan 2024' },
  { id: 2, name: 'Suresh Verma', phone: '+91 99887 76655', location: 'Koramangala, BLR', plan: 'Free', status: 'Active', joined: '10 Jan 2024' },
  { id: 3, name: 'Amit Properties', phone: '+91 88776 65544', location: 'Whitefield, BLR', plan: 'Pro Monthly', status: 'Blocked', joined: '05 Dec 2023' },
  { id: 4, name: 'Metro Realtors', phone: '+91 77665 54433', location: 'HSR Layout, BLR', plan: 'Pro Yearly', status: 'Active', joined: '15 Jan 2024' },
  { id: 5, name: 'City Estates', phone: '+91 66554 43322', location: 'JP Nagar, BLR', plan: 'Free', status: 'Active', joined: '20 Jan 2024' },
];

export const MOCK_TRANSACTIONS = [
  { id: 'TXN-8821', user: 'Rajesh Sharma', plan: 'Pro Quarterly', amount: 249, date: 'Today, 10:30 AM', status: 'Success' },
  { id: 'TXN-8822', user: 'Metro Realtors', plan: 'Pro Yearly', amount: 999, date: 'Yesterday, 4:15 PM', status: 'Success' },
  { id: 'TXN-8823', user: 'Amit Properties', plan: 'Pro Monthly', amount: 99, date: '22 Jan, 11:00 AM', status: 'Failed' },
];

export const MOCK_PROPERTIES = [
  { id: 'P-101', title: 'Luxury 4BHK Villa', broker: 'Rajesh Sharma', location: 'E-City', price: '₹2.5 Cr', image: 'https://images.unsplash.com/photo-1600596542815-6ad4c1277855?auto=format&fit=crop&w=400&q=80', status: 'Pending' },
  { id: 'P-102', title: 'Commercial Office Space', broker: 'Suresh Verma', location: 'MG Road', price: '₹5.0 Cr', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80', status: 'Pending' },
];
