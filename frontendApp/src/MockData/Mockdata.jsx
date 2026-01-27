// Property-type specific amenities
export const AMENITIES_BY_TYPE = {
  // === RESIDENTIAL ===
  'Apartment/Flats': [
    { id: 'parking', name: 'Parking', icon: '🚗' },
    { id: 'elevator', name: 'Lift', icon: '🛗' },
    { id: 'power_backup', name: 'Power Backup', icon: '🔋' },
    { id: 'water_supply', name: '24/7 Water Supply', icon: '💧' },
    { id: 'security', name: '24/7 Security/CCTV', icon: '📹' },
    { id: 'gym', name: 'Gymnasium', icon: '🏋️' },
    { id: 'swimming_pool', name: 'Swimming Pool', icon: '🏊' },
    { id: 'club_house', name: 'Club House', icon: '🎉' },
    { id: 'gas_pipeline', name: 'Gas Pipeline', icon: '🔥' },
    { id: 'garden', name: 'Park/Garden', icon: '🌳' },
  ],

  'Villa': [
    { id: 'private_parking', name: 'Private Parking', icon: '🚗' },
    { id: 'gated_security', name: 'Gated Security', icon: '🛡️' },
    { id: 'private_garden', name: 'Private Garden', icon: '🌳' },
    { id: 'power_backup', name: 'Power Backup', icon: '🔋' },
    { id: 'water_supply', name: '24/7 Water Supply', icon: '💧' },
    { id: 'terrace', name: 'Private Terrace', icon: '🏡' },
    { id: 'servant_room', name: 'Servant Room', icon: '🏠' },
    { id: 'modular_kitchen', name: 'Modular Kitchen', icon: '🍳' },
    { id: 'vastu', name: 'Vastu Compliant', icon: '✨' },
  ],

  'Plot': [
    { id: 'boundary_wall', name: 'Boundary Wall', icon: '🧱' },
    { id: 'electricity', name: 'Electricity', icon: '⚡' },
    { id: 'water_connection', name: 'Water Connection', icon: '💧' },
    { id: 'sewage', name: 'Sewage Connection', icon: '🚿' },
    { id: 'road_access', name: 'Wide Road Access', icon: '🛣️' },
    { id: 'gated_society', name: 'Gated Society', icon: '⛩️' },
    { id: 'corner_plot', name: 'Corner Plot', icon: '📍' },
    { id: 'park_facing', name: 'Park Facing', icon: '🌳' },
    { id: 'clear_title', name: 'Clear Title/Registry', icon: '📋' },
  ],

  'Duplex': [
    { id: 'parking', name: 'Covered Parking', icon: '🚗' },
    { id: 'private_entrance', name: 'Private Entrance', icon: '🚪' },
    { id: 'internal_staircase', name: 'Internal Staircase', icon: '🪜' },
    { id: 'terrace', name: 'Private Terrace', icon: '🏠' },
    { id: 'balcony', name: 'Balconies', icon: '🏡' },
    { id: 'power_backup', name: 'Power Backup', icon: '🔋' },
    { id: 'water_supply', name: '24/7 Water', icon: '💧' },
    { id: 'security', name: 'Security', icon: '🔒' },
  ],

  // === COMMERCIAL ===
  'Office Space': [
    { id: 'parking', name: 'Ample Parking', icon: '🚗' },
    { id: 'central_ac', name: 'Central AC', icon: '❄️' },
    { id: 'power_backup', name: '100% Power Backup', icon: '🔋' },
    { id: 'elevator', name: 'High Speed Lifts', icon: '🛗' },
    { id: 'fire_safety', name: 'Fire Safety', icon: '🚨' },
    { id: 'wifi', name: 'Internet/Wifi Ready', icon: '📶' },
    { id: 'reception', name: 'Reception Area', icon: '💁' },
    { id: 'cafeteria', name: 'Pantry/Cafeteria', icon: '☕' },
    { id: 'conference', name: 'Conference Room', icon: '📊' },
  ],

  'Shop': [
    { id: 'main_road', name: 'Main Road Facing', icon: '🛣️' },
    { id: 'ground_floor', name: 'Ground Floor', icon: '⬇️' },
    { id: 'parking', name: 'Customer Parking', icon: '🅿️' },
    { id: 'power_backup', name: 'Power Backup', icon: '🔋' },
    { id: 'shutter', name: 'Rolling Shutter', icon: '🚪' },
    { id: 'water_supply', name: 'Water Connection', icon: '💧' },
    { id: 'washroom', name: 'Private Washroom', icon: '🚻' },
    { id: 'signage', name: 'Signage Space', icon: '🪧' },
  ],

  'Showroom': [
    { id: 'main_road', name: 'Main Road Facing', icon: '🛣️' },
    { id: 'display_glass', name: 'Full Glass Front', icon: '🪟' },
    { id: 'parking', name: 'Valet/Ample Parking', icon: '🚗' },
    { id: 'ac', name: 'Central AC', icon: '❄️' },
    { id: 'corner_property', name: 'Corner Property', icon: '📍' },
    { id: 'fire_safety', name: 'Fire Safety', icon: '🚨' },
    { id: 'loading', name: 'Loading/Unloading Area', icon: '🚚' },
  ],

  'Warehouse': [
    { id: 'loading_dock', name: 'Loading Dock', icon: '🚚' },
    { id: 'high_ceiling', name: 'High Ceiling', icon: '📏' },
    { id: 'highway_access', name: 'Highway Connectivity', icon: '🛣️' },
    { id: 'heavy_vehicle', name: 'Heavy Vehicle Access', icon: '🚛' },
    { id: 'fire_safety', name: 'Fire Safety System', icon: '🚨' },
    { id: 'electricity', name: 'Industrial Power Load', icon: '⚡' },
    { id: 'security', name: 'Gated Security', icon: '🔒' },
    { id: 'staff_quarters', name: 'Staff/Guard Room', icon: '🏠' },
  ],

  // === AGRICULTURE ===
  'Farm Land': [
    { id: 'water_source', name: 'Tube Well/Water Source', icon: '💧' },
    { id: 'electricity', name: 'Electricity Connection', icon: '⚡' },
    { id: 'road_access', name: 'Tar Road Access', icon: '🛣️' },
    { id: 'soil', name: 'Fertile Soil', icon: '🌱' },
    { id: 'fencing', name: 'Wire Fencing', icon: '🚧' },
    { id: 'storage', name: 'Storage Room', icon: '🏠' },
    { id: 'plantation', name: 'Existing Plantation', icon: '🌳' },
  ],

  'Farm House': [
    { id: 'electricity', name: '24/7 Electricity', icon: '⚡' },
    { id: 'water_supply', name: 'Water Supply', icon: '💧' },
    { id: 'swimming_pool', name: 'Swimming Pool', icon: '🏊' },
    { id: 'lawn', name: 'Big Lawn/Garden', icon: '🌳' },
    { id: 'fencing', name: 'Boundary Wall', icon: '🧱' },
    { id: 'parking', name: 'Ample Parking', icon: '🚗' },
    { id: 'security', name: 'Caretaker Room', icon: '🏠' },
    { id: 'generator', name: 'Generator Backup', icon: '🔋' },
  ],
};
// Helper function to get amenities for a specific property type
export const getAmenitiesForType = (propertyType) => {
  return AMENITIES_BY_TYPE[propertyType] || {};
};

export const INITIAL_PROPERTIES = [
  {
    id: "p1",
    title: "Luxury 3BHK Apartment",
    category: "Residential",
    type: "Apartment/Flats",
    status: "Available",
    price: 12500000,
    location: "Indiranagar, Bangalore",
    size: 1850,
    bhk: "3 BHK",
    furnishing: "Semi",
    owner: "Rajesh Kumar",
    ownerPhone: "9876543210",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    listingType: "Sell",
    amenities: ['parking', 'elevator', 'security', 'gym', 'swimming_pool', 'garden', 'wifi', 'power_backup'],
  },
  {
    id: "p2",
    title: "Tech Park Office Space",
    category: "Commercial",
    type: "Office Space", // Fixed to match PROPERTY_STRUCTURE
    status: "Available",
    price: 45000000,
    location: "Whitefield, Bangalore",
    size: 3200,
    bhk: "",
    furnishing: "Furnished",
    owner: "Amit Singh",
    ownerPhone: "9898989898",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    listingType: "Sell",
    amenities: ['parking', 'elevator', 'security', 'power_backup', 'wifi', 'maintenance', 'medical'],
  },
  {
    id: "p3",
    title: "Prime Corner Plot",
    category: "Residential", // Changed to Residential to match Plot type
    type: "Plot", // Fixed to match PROPERTY_STRUCTURE
    status: "Sold",
    price: 8500000,
    location: "Sarjapur, Bangalore",
    size: 1200,
    bhk: "",
    furnishing: "",
    owner: "Sneha Reddy",
    ownerPhone: "9123456789",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    listingType: "Sell",
    amenities: ['water_supply', 'transport', 'school'],
  },
  {
    id: "p4",
    title: "Affordable 2BHK",
    category: "Residential",
    type: "Apartment/Flats",
    status: "Available",
    price: 25000,
    location: "Electronic City, Bangalore",
    size: 950,
    bhk: "2 BHK",
    furnishing: "Unfurnished",
    owner: "Vinay",
    ownerPhone: "9999999999",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    listingType: "Rent",
    amenities: ['parking', 'security', 'water_supply', 'transport'],
  },
];

export const INITIAL_CUSTOMERS = [
  {
    id: "c1",
    name: "Vikram Malhotra",
    phone: "9988776655",
    budget: 13000000,
    type: "Apartment/Flats",
    status: "Active",
    notes: "Looking for ready to move in, prefers higher floors.",
    preferredLocation: "Indiranagar",
  },
  {
    id: "c2",
    name: "Anjali Gupta",
    phone: "8877665544",
    budget: 50000000,
    type: "Office",
    status: "Active",
    notes: "Needs 10 car parking slots.",
    preferredLocation: "Whitefield",
  },
  {
    id: "c3",
    name: "Rahul Verma",
    phone: "7766554433",
    budget: 5000000,
    type: "Apartment/Flats",
    status: "New Lead",
    notes: "Investment purpose only.",
    preferredLocation: "Electronic City",
  },
];

export const INITIAL_FOLLOWUPS = [
  {
    id: "f1",
    customerId: "c1",
    propertyId: "p1",
    date: new Date().toISOString(),
    note: "Schedule site visit",
    status: "Pending",
    type: "Visit",
  },
  {
    id: "f2",
    customerId: "c2",
    propertyId: "p2",
    date: new Date(Date.now() + 86400000).toISOString(),
    note: "Discuss final price",
    status: "Pending",
    type: "Call",
  },
  {
    id: "f3",
    customerId: "c3",
    propertyId: "p4",
    date: new Date(Date.now() + 172800000).toISOString(),
    note: "Follow up on rental agreement",
    status: "Pending",
    type: "Meeting",
  },
];

export const INITIAL_DEALS = [
  {
    id: "d1",
    customerId: "c1",
    propertyId: "p1",
    stage: "Negotiation",
    startedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    meetings: [
      {
        id: "m1",
        date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        notes: "Customer liked the property, discussing price",
        type: "Site Visit"
      }
    ],
    visits: [],
    expectedCloseDate: new Date(Date.now() + 604800000).toISOString(), // 1 week from now
    dealValue: 12500000,
    commission: 125000,
  },
  {
    id: "d2",
    customerId: "c2",
    propertyId: "p2",
    stage: "Meeting",
    startedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    meetings: [
      {
        id: "m2",
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        notes: "Initial meeting completed, customer interested",
        type: "Office Meeting"
      }
    ],
    visits: [],
    expectedCloseDate: new Date(Date.now() + 1209600000).toISOString(), // 2 weeks from now
    dealValue: 45000000,
    commission: 450000,
  },
  {
    id: "d3",
    customerId: "c3",
    propertyId: "p4",
    stage: "Documentation",
    startedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    meetings: [],
    visits: [
      {
        id: "v1",
        date: new Date().toISOString(),
        feedback: "Customer ready to proceed with rental",
        sentiment: "interested"
      }
    ],
    expectedCloseDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    dealValue: 25000,
    commission: 2500,
  },
];

export const INITIAL_BROKERS = [
  {
    id: "b1",
    name: "Suresh Real Estate",
    location: "Koramangala",
    deals: 45,
    rating: 4.8,
  },
  {
    id: "b2",
    name: "Metro Homes",
    location: "Indiranagar",
    deals: 32,
    rating: 4.5,
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    type: "lead",
    title: "New Lead: Rahul Verma",
    message: "Looking for 2BHK in Electronic City",
    time: "2m ago",
    read: false,
  },
  {
    id: "n2",
    type: "task",
    title: "Follow-up Reminder",
    message: "Call Vikram Malhotra regarding site visit",
    time: "1h ago",
    read: false,
  },
];

export const INITIAL_PROFILE = {
  id: "u1",
  name: "Rajesh Sharma",
  designation: "Senior Property Consultant",
  brokerId: "BROK-8821",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  phone: "+91 98765 43210",
  email: "rajesh.sharma@realestate.com",
  experience: "8+ Years",
  location: "Bangalore, Karnataka",
  stats: {
    deals: 45,
    clients: 128,
    rating: 4.9,
    totalSales: "₹12.5 Cr",
    activeListings: 23
  },
  badges: [
    { type: "top_rated", label: "TOP RATED", color: "#d97706", bgColor: "#fef3c7" },
    { type: "verified", label: "VERIFIED", color: "#059669", bgColor: "#d1fae5" }
  ],
  achievements: [
    "Best Performer 2023",
    "Customer Choice Award",
    "Top Sales Agent"
  ]
};

export const formatCurrency = (value) => {
  if (!value) return "0";
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};
