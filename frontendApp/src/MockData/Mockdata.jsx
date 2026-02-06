// Property-type specific amenities
export const AMENITIES_BY_TYPE = {
  // === RESIDENTIAL ===
  'Apartment/Flats': [
    { id: 'lift', name: 'Lift', icon: 'ArrowUpDown' },
    { id: 'power_backup', name: 'Power Backup', icon: 'Zap' },
    { id: 'covered_parking', name: 'Covered Parking', icon: 'Car' },
    { id: 'water_supply_24x7', name: '24x7 Water Supply', icon: 'Droplets' },
    { id: 'security_cctv', name: 'Security / CCTV', icon: 'Shield' },
    { id: 'balcony', name: 'Balcony', icon: 'Home' },
    { id: 'gated_society', name: 'Gated Society', icon: 'Gate' },
  ],

  'Builder Floor': [
    { id: 'stilt_parking', name: 'Stilt Parking', icon: 'Car' },
    { id: 'lift', name: 'Lift', icon: 'ArrowUpDown' },
    { id: 'power_backup', name: 'Power Backup', icon: 'Zap' },
    { id: 'separate_entry', name: 'Separate Entry', icon: 'DoorOpen' },
    { id: 'balcony', name: 'Balcony', icon: 'Home' },
  ],

  'House/Villa': [
    { id: 'private_garden', name: 'Private Garden', icon: 'Trees' },
    { id: 'covered_parking', name: 'Covered Parking', icon: 'Car' },
    { id: 'security', name: 'Security', icon: 'Shield' },
    { id: 'power_backup', name: 'Power Backup', icon: 'Zap' },
    { id: 'clubhouse_access', name: 'Clubhouse Access', icon: 'Building2' },
    { id: 'swimming_pool_optional', name: 'Swimming Pool (Optional)', icon: 'Waves' },
  ],

  'Plot/Land': [
    { id: 'approved_layout', name: 'Approved Layout', icon: 'FileCheck' },
    { id: 'road_access', name: 'Road Access', icon: 'Route' },
    { id: 'electricity', name: 'Electricity', icon: 'Zap' },
    { id: 'water_line', name: 'Water Line', icon: 'Droplets' },
    { id: 'drainage', name: 'Drainage', icon: 'Waves' },
  ],

  'Farmhouse': [
    { id: 'private_parking', name: 'Private Parking', icon: 'Car' },
    { id: 'water_storage', name: 'Water Storage', icon: 'Droplets' },
    { id: 'power_backup', name: 'Power Backup', icon: 'Zap' },
    { id: 'garden_open_space', name: 'Garden / Open Space', icon: 'Trees' },
    { id: 'boundary_wall', name: 'Boundary Wall', icon: 'Fence' },
    { id: 'pet_friendly', name: 'Pet Friendly', icon: 'Heart' },
  ],

  'Other': [
    { id: 'furnished', name: 'Furnished', icon: 'Sofa' },
    { id: 'lift', name: 'Lift', icon: 'ArrowUpDown' },
    { id: 'power_backup', name: 'Power Backup', icon: 'Zap' },
    { id: 'security', name: 'Security', icon: 'Shield' },
    { id: 'modular_kitchen', name: 'Modular Kitchen', icon: 'ChefHat' },
    { id: 'private_terrace', name: 'Private Terrace', icon: 'Home' },
    { id: 'premium_view', name: 'Premium View', icon: 'Eye' },
    { id: 'furnished_rooms', name: 'Furnished Rooms', icon: 'Bed' },
    { id: 'common_kitchen', name: 'Common Kitchen', icon: 'ChefHat' },
    { id: 'housekeeping', name: 'Housekeeping', icon: 'Sparkles' },
    { id: 'wifi', name: 'Wi-Fi', icon: 'Wifi' },
  ],

  // === COMMERCIAL ===
  'Office': [
    { id: 'lift', name: 'Lift', icon: 'ArrowUpDown' },
    { id: 'power_backup', name: 'Power Backup', icon: 'Zap' },
    { id: 'central_ac', name: 'Central AC', icon: 'Snowflake' },
    { id: 'parking', name: 'Parking', icon: 'Car' },
    { id: 'washrooms', name: 'Washrooms', icon: 'Bath' },
    { id: 'high_speed_internet', name: 'High-Speed Internet', icon: 'Wifi' },
    { id: 'security', name: 'Security', icon: 'Shield' },
  ],

  'Office Space': [
    { id: 'lift', name: 'Lift', icon: 'ArrowUpDown' },
    { id: 'power_backup', name: 'Power Backup', icon: 'Zap' },
    { id: 'central_ac', name: 'Central AC', icon: 'Snowflake' },
    { id: 'parking', name: 'Parking', icon: 'Car' },
    { id: 'washrooms', name: 'Washrooms', icon: 'Bath' },
    { id: 'high_speed_internet', name: 'High-Speed Internet', icon: 'Wifi' },
    { id: 'security', name: 'Security', icon: 'Shield' },
    { id: 'furnished_seating', name: 'Furnished Seating', icon: 'Sofa' },
    { id: 'meeting_rooms', name: 'Meeting Rooms', icon: 'Users' },
    { id: 'pantry', name: 'Pantry', icon: 'Coffee' },
    { id: 'reception', name: 'Reception', icon: 'UserCheck' },
  ],

  'Shop/Showroom': [
    { id: 'road_facing', name: 'Road Facing', icon: 'Route' },
    { id: 'signage_space', name: 'Signage Space', icon: 'SignPost' },
    { id: 'parking', name: 'Parking', icon: 'Car' },
    { id: 'power_supply', name: 'Power Supply', icon: 'Zap' },
    { id: 'washroom', name: 'Washroom', icon: 'Bath' },
  ],

  'Storage': [
    { id: 'loading_dock', name: 'Loading Dock', icon: 'Truck' },
    { id: 'power_supply', name: 'Power Supply', icon: 'Zap' },
    { id: 'high_ceiling', name: 'High Ceiling', icon: 'ArrowUp' },
    { id: 'truck_access', name: 'Truck Access', icon: 'Truck' },
    { id: 'security', name: 'Security', icon: 'Shield' },
  ],

  'Industry': [
    { id: 'heavy_power_load', name: 'Heavy Power Load', icon: 'Zap' },
    { id: 'wide_entry_gate', name: 'Wide Entry Gate', icon: 'DoorOpen' },
    { id: 'ventilation', name: 'Ventilation', icon: 'Wind' },
    { id: 'fire_safety', name: 'Fire Safety', icon: 'Flame' },
    { id: 'truck_movement_area', name: 'Truck Movement Area', icon: 'Truck' },
  ],

  'Hospitality': [
    { id: 'furnished_seating', name: 'Furnished Seating', icon: 'Sofa' },
    { id: 'wifi', name: 'Wi-Fi', icon: 'Wifi' },
    { id: 'meeting_rooms', name: 'Meeting Rooms', icon: 'Users' },
    { id: 'power_backup', name: 'Power Backup', icon: 'Zap' },
    { id: 'pantry', name: 'Pantry', icon: 'Coffee' },
    { id: 'reception', name: 'Reception', icon: 'UserCheck' },
  ],

  // === AGRICULTURE ===
  'Farm Land': [
    { id: 'borewell_water_source', name: 'Borewell / Water Source', icon: 'Droplets' },
    { id: 'electricity', name: 'Electricity', icon: 'Zap' },
    { id: 'road_access', name: 'Road Access', icon: 'Route' },
    { id: 'fertile_soil', name: 'Fertile Soil', icon: 'Sprout' },
    { id: 'boundary_marked', name: 'Boundary Marked', icon: 'MapPin' },
    { id: 'irrigation_facility', name: 'Irrigation Facility', icon: 'Droplets' },
    { id: 'fencing', name: 'Fencing', icon: 'Fence' },
    { id: 'storage_shed', name: 'Storage Shed', icon: 'Warehouse' },
    { id: 'tractor_access', name: 'Tractor Access', icon: 'Truck' },
    { id: 'drip_irrigation', name: 'Drip Irrigation', icon: 'Droplets' },
    { id: 'water_storage', name: 'Water Storage', icon: 'Droplets' },
    { id: 'farm_access_road', name: 'Farm Access Road', icon: 'Route' },
    { id: 'shed_structure', name: 'Shed Structure', icon: 'Warehouse' },
    { id: 'waste_management', name: 'Waste Management', icon: 'Trash2' },
    { id: 'road_connectivity', name: 'Road Connectivity', icon: 'Route' },
    { id: 'pond', name: 'Pond', icon: 'Waves' },
    { id: 'water_circulation', name: 'Water Circulation', icon: 'RotateCcw' },
    { id: 'boundary_fencing', name: 'Boundary Fencing', icon: 'Fence' },
  ],

  'Farm House': [
    { id: 'electricity', name: 'Electricity', icon: 'Zap' },
    { id: 'water_supply', name: 'Water Supply', icon: 'Droplets' },
    { id: 'shed_structure', name: 'Shed Structure', icon: 'Warehouse' },
    { id: 'waste_management', name: 'Waste Management', icon: 'Trash2' },
    { id: 'road_connectivity', name: 'Road Connectivity', icon: 'Route' },
    { id: 'pond', name: 'Pond', icon: 'Waves' },
    { id: 'water_circulation', name: 'Water Circulation', icon: 'RotateCcw' },
    { id: 'boundary_fencing', name: 'Boundary Fencing', icon: 'Fence' },
  ],
};
// Helper function to get amenities for a specific property type
export const getAmenitiesForType = (propertyType) => {
  return AMENITIES_BY_TYPE[propertyType] || [];
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
    amenities: ['lift', 'power_backup', 'covered_parking', 'water_supply', 'security_cctv', 'balcony', 'gated_society'],
  },
  {
    id: "p2",
    title: "Tech Park Office Space",
    category: "Commercial",
    type: "Office Space",
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
    amenities: ['lift', 'power_backup', 'central_ac', 'parking', 'washrooms', 'high_speed_internet', 'security'],
  },
  {
    id: "p3",
    title: "Prime Corner Plot",
    category: "Residential",
    type: "Plot/Land",
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
    amenities: ['approved_layout', 'road_access', 'electricity', 'water_line', 'drainage'],
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
    amenities: ['covered_parking', 'security_cctv', 'water_supply', 'gated_society'],
  },
  {
    id: "p5",
    title: "Spacious 4BHK Penthouse",
    category: "Residential",
    type: "Apartment/Flats",
    status: "Available",
    price: 28500000,
    location: "Koramangala, Bangalore",
    size: 2800,
    bhk: "4 BHK",
    furnishing: "Furnished",
    owner: "Deepak Sharma",
    ownerPhone: "9876501234",
    image:
      "https://images.unsplash.com/photo-1502672260066-6bc35f0a1f80?auto=format&fit=crop&w=800&q=80",
    listingType: "Sell",
    amenities: ['lift', 'power_backup', 'covered_parking', 'water_supply', 'security_cctv', 'balcony', 'gated_society'],
  },
  {
    id: "p6",
    title: "Modern Builder Floor",
    category: "Residential",
    type: "Builder Floor",
    status: "Available",
    price: 15000000,
    location: "HSR Layout, Bangalore",
    size: 2100,
    bhk: "3 BHK",
    furnishing: "Semi",
    owner: "Kavita Rao",
    ownerPhone: "9845123456",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    listingType: "Sell",
    amenities: ['stilt_parking', 'lift', 'power_backup', 'separate_entry', 'balcony'],
  },
  {
    id: "p7",
    title: "Premium Villa with Garden",
    category: "Residential",
    type: "House/Villa",
    status: "Available",
    price: 45000000,
    location: "Hennur Road, Bangalore",
    size: 3500,
    bhk: "5 BHK",
    furnishing: "Furnished",
    owner: "Suresh Patel",
    ownerPhone: "9900112233",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    listingType: "Sell",
    amenities: ['private_garden', 'covered_parking', 'security', 'power_backup', 'clubhouse_access', 'swimming_pool_optional'],
  },
  {
    id: "p8",
    title: "Commercial Shop in Mall",
    category: "Commercial",
    type: "Shop/Showroom",
    status: "Available",
    price: 18000000,
    location: "MG Road, Bangalore",
    size: 850,
    bhk: "",
    furnishing: "Unfurnished",
    owner: "Ramesh Gupta",
    ownerPhone: "9876512345",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    listingType: "Sell",
    amenities: ['road_facing', 'signage_space', 'parking', 'power_supply', 'washroom'],
  },
  {
    id: "p9",
    title: "Cozy 1BHK Studio",
    category: "Residential",
    type: "Apartment/Flats",
    status: "Available",
    price: 18000,
    location: "BTM Layout, Bangalore",
    size: 650,
    bhk: "1 BHK",
    furnishing: "Furnished",
    owner: "Priya Nair",
    ownerPhone: "9988776655",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    listingType: "Rent",
    amenities: ['lift', 'power_backup', 'water_supply', 'security_cctv'],
  },
  {
    id: "p10",
    title: "Warehouse Space",
    category: "Commercial",
    type: "Storage",
    status: "Available",
    price: 35000000,
    location: "Bommasandra, Bangalore",
    size: 5000,
    bhk: "",
    furnishing: "",
    owner: "Anil Kumar",
    ownerPhone: "9123498765",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    listingType: "Sell",
    amenities: ['loading_dock', 'power_supply', 'high_ceiling', 'truck_access', 'security'],
  },
  {
    id: "p11",
    title: "Farmhouse with Pool",
    category: "Residential",
    type: "Farmhouse",
    status: "Available",
    price: 55000000,
    location: "Kanakapura Road, Bangalore",
    size: 8000,
    bhk: "6 BHK",
    furnishing: "Furnished",
    owner: "Vikram Reddy",
    ownerPhone: "9845678901",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    listingType: "Sell",
    amenities: ['private_parking', 'water_storage', 'power_backup', 'garden_open_space', 'boundary_wall', 'pet_friendly'],
  },
  {
    id: "p12",
    title: "Compact 2BHK Flat",
    category: "Residential",
    type: "Apartment/Flats",
    status: "Available",
    price: 7500000,
    location: "Marathahalli, Bangalore",
    size: 1100,
    bhk: "2 BHK",
    furnishing: "Semi",
    owner: "Lakshmi Iyer",
    ownerPhone: "9876123450",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    listingType: "Sell",
    amenities: ['lift', 'covered_parking', 'water_supply', 'gated_society'],
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
    stage: "Interested",
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
    stage: "Token",
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
    stage: "New",
    notes: "Investment purpose only.",
    preferredLocation: "Electronic City",
  },
  {
    id: "c4",
    name: "Priya Sharma",
    phone: "9876543210",
    budget: 8500000,
    type: "Apartment/Flats",
    status: "Hot",
    stage: "Completed",
    notes: "Deal closed successfully. Property purchased.",
    preferredLocation: "Koramangala",
  },
];

export const INITIAL_FOLLOWUPS = [
  // Today's Pending Tasks
  {
    id: "f1",
    customerId: "c1",
    propertyId: "p1",
    date: new Date().toISOString(),
    note: "Schedule site visit for luxury apartment",
    status: "Pending",
    type: "Site Visit",
  },
  {
    id: "f2",
    customerId: "c2",
    propertyId: "p2",
    date: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(), // Today 2:30 PM
    note: "Discuss final price and parking requirements",
    status: "Pending",
    type: "Meeting",
  },
  {
    id: "f4",
    customerId: "c1",
    propertyId: "p3",
    date: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(), // Today 5:30 PM
    note: "Show plot location and discuss investment potential",
    status: "Pending",
    type: "Site Visit",
  },
  {
    id: "f5",
    customerId: "c2",
    propertyId: "p1",
    date: new Date(new Date().setHours(18, 45, 0, 0)).toISOString(), // Today 6:45 PM
    note: "Present alternative office space options",
    status: "Pending",
    type: "Presentation",
  },

  // Today's Completed Tasks
  {
    id: "f6",
    customerId: "c1",
    propertyId: "p1",
    date: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), // Today 9:00 AM
    note: "Initial property inquiry call completed",
    status: "Done",
    type: "Call",
  },
  {
    id: "f8",
    customerId: "c2",
    propertyId: "p2",
    date: new Date(new Date().setHours(11, 15, 0, 0)).toISOString(), // Today 11:15 AM
    note: "Completed virtual tour of office space",
    status: "Done",
    type: "Virtual Tour",
  },
  {
    id: "f9",
    customerId: "c1",
    propertyId: "p3",
    date: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), // Today 12:00 PM
    note: "Verified plot documents and legal clearance",
    status: "Done",
    type: "Documentation",
  },

  // Tomorrow's Tasks
  {
    id: "f10",
    customerId: "c2",
    propertyId: "p2",
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    note: "Final negotiation meeting with property owner",
    status: "Pending",
    type: "Negotiation",
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
  name: "Manas Gangrade",
  designation: "Senior Property Consultant",
  brokerId: "BROK-8821",
  avatar: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80",
  phone: "+91 98765 43210",
  email: "manasgangrade@gmail.com",
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

export const INITIAL_COLLABORATORS = [
  {
    id: "col1",
    name: "Rahul Sharma",
    designation: "Property Consultant",
    location: "Indore, MP",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98765 12345",
    email: "rahul.sharma@realty.com",
    properties: 12,
    deals: 8,
    rating: 4.6,
    connected: true,
    collaboratedDeals: 3,
    totalCommission: "₹2.8L",
    specialization: "Residential",
    experience: "5+ Years"
  },
  {
    id: "col2",
    name: "Priya Verma",
    designation: "Senior Broker",
    location: "Bhopal, MP",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80",
    phone: "+91 87654 32109",
    email: "priya.verma@homes.com",
    properties: 18,
    deals: 15,
    rating: 4.8,
    connected: true,
    collaboratedDeals: 7,
    totalCommission: "₹5.2L",
    specialization: "Commercial",
    experience: "7+ Years"
  },
  {
    id: "col3",
    name: "Amit Singh",
    designation: "Property Advisor",
    location: "Dewas, MP",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    phone: "+91 76543 21098",
    email: "amit.singh@properties.com",
    properties: 15,
    deals: 12,
    rating: 4.7,
    connected: true,
    collaboratedDeals: 5,
    totalCommission: "₹3.9L",
    specialization: "Luxury Homes",
    experience: "6+ Years"
  },
  {
    id: "col4",
    name: "Sneha Gupta",
    designation: "Real Estate Agent",
    location: "Ujjain, MP",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    phone: "+91 65432 10987",
    email: "sneha.gupta@realestate.com",
    properties: 10,
    deals: 6,
    rating: 4.5,
    connected: true,
    collaboratedDeals: 2,
    totalCommission: "₹1.8L",
    specialization: "Affordable Housing",
    experience: "4+ Years"
  },
  {
    id: "col5",
    name: "Vikram Patel",
    designation: "Property Consultant",
    location: "Indore, MP",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    phone: "+91 54321 09876",
    email: "vikram.patel@consultant.com",
    properties: 20,
    deals: 18,
    rating: 4.9,
    connected: true,
    collaboratedDeals: 9,
    totalCommission: "₹7.1L",
    specialization: "Premium Properties",
    experience: "9+ Years"
  },
  {
    id: "col6",
    name: "Anjali Mehta",
    designation: "Property Specialist",
    location: "Bhopal, MP",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    phone: "+91 43210 98765",
    email: "anjali.mehta@specialist.com",
    properties: 8,
    deals: 5,
    rating: 4.4,
    connected: true,
    collaboratedDeals: 1,
    totalCommission: "₹1.2L",
    specialization: "Rental Properties",
    experience: "3+ Years"
  }
];

export const PENDING_REQUESTS = [
  {
    id: "req1",
    name: "Rohit Kumar",
    designation: "Property Consultant",
    location: "Indore, MP",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    brokerId: "BROK-5678",
    phone: "+91 98765 54321",
    requestDate: "2024-02-01",
    status: "pending"
  },
  {
    id: "req2",
    name: "Kavya Sharma",
    designation: "Real Estate Agent",
    location: "Bhopal, MP",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80",
    brokerId: "BROK-9012",
    phone: "+91 87654 32198",
    requestDate: "2024-02-02",
    status: "pending"
  },
  {
    id: "req3",
    name: "Arjun Patel",
    designation: "Senior Broker",
    location: "Ujjain, MP",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    brokerId: "BROK-3456",
    phone: "+91 76543 21087",
    requestDate: "2024-02-03",
    status: "pending"
  }
];

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
