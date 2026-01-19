import {Building2, Home, Sprout} from "lucide-react-native"
export const PROPERTY_STRUCTURE = {
  Residential: {
    icon: Home,
    types: ['Apartment/Flats', 'Builder Floor', 'House/Villa', 'Studio Apartment', 'Farmhouse']
  },
  Commercial: {
    icon: Building2,
    types: ['Shop/Showroom', 'Plot/Land', 'Office', 'Industry', 'Hospitality', 'Other']
  },
  Agriculture: {
    icon: Sprout,
    types: ['Farm Land', 'Agri Land', 'Farmhouse']
  }
};

export const SUBSCRIPTION_PLANS = [
  { id: 'monthly', name: 'Monthly Starter', price: 99, duration: '1 Month', label: 'Basic' },
  { id: 'quarterly', name: 'Quarterly Saver', price: 249, duration: '3 Months', label: 'Popular' },
  { id: 'halfyearly', name: 'Pro Half-Yearly', price: 499, duration: '6 Months', label: 'Best Value' }
];

export const generateId = () => Math.random().toString(36).substr(2, 9);
