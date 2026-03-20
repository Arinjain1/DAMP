# Properties Slice Usage Guide

## Overview
The `propertiesSlice` now handles all property-related operations with full API integration including CRUD operations, filtering, and status management.

## Import

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProperties,
  createProperty,
  updatePropertyAPI,
  deleteProperty,
  setSelectedProperty,
  clearSelectedProperty
} from '../store/slices/propertiesSlice';
```

## Usage Examples

### 1. Fetch All Properties

```javascript
const dispatch = useDispatch();

// Fetch all properties
useEffect(() => {
  dispatch(fetchProperties());
}, []);

// Fetch with filters
dispatch(fetchProperties({
  search: 'Bandra',
  category: 'Residential',
  listing_type: 'Rent',
  property_type: 'Apartment',
  min_price: 5000000,
  max_price: 10000000
}));
```

### 2. Create New Property

```javascript
dispatch(createProperty({
  listingType: 'Rent',
  category: 'Residential',
  propertyCategory: 'Residential',
  type: 'Apartment',
  configuration: '2 BHK',
  furnishingStatus: 'Semi-Furnished',
  state: 'Maharashtra',
  city: 'Mumbai',
  locality: 'Bandra West',
  projectName: 'Sea View Apartments',
  address: '123 Hill Road, Bandra West',
  price: 50000,
  size: 1200,
  sizeUnit: 'Sq. Ft.',
  lengthFt: 40,
  widthFt: 30,
  ownerName: 'John Doe',
  ownerPhone: '9876543210',
  amenities: ['Parking', 'Gym', 'Swimming Pool'],
  bond: 100000,
  image: 'https://example.com/image.jpg'
}));
```

### 3. Update Property

```javascript
dispatch(updatePropertyAPI({
  id: 123,
  data: {
    listingType: 'Rent',
    category: 'Residential',
    propertyCategory: 'Residential',
    type: 'Apartment',
    configuration: '3 BHK',
    furnishingStatus: 'Fully-Furnished',
    state: 'Maharashtra',
    city: 'Mumbai',
    locality: 'Bandra West',
    projectName: 'Sea View Apartments',
    address: '123 Hill Road, Bandra West',
    price: 75000,
    size: 1500,
    sizeUnit: 'Sq. Ft.',
    lengthFt: 50,
    widthFt: 30,
    ownerName: 'John Doe',
    ownerPhone: '9876543210',
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security'],
    bond: 150000,
    image: 'https://example.com/updated-image.jpg'
  }
}));
```

### 4. Delete Property

```javascript
dispatch(deleteProperty(123));
```

### 5. Select/Clear Property

```javascript
// Select property for detail view
dispatch(setSelectedProperty(propertyObject));

// Clear selection
dispatch(clearSelectedProperty());
```

### 6. Access Property State

```javascript
const { 
  properties, 
  selectedProperty, 
  loading, 
  error 
} = useSelector(state => state.properties);

// Display properties
properties.map(property => (
  <View key={property.id}>
    <Text>{property.title}</Text>
    <Text>{property.location}</Text>
    <Text>₹{property.price.toLocaleString()}</Text>
    <Text>{property.configuration}</Text>
    <Text>Status: {property.status}</Text>
  </View>
));
```

### 7. Complete Property List Component Example

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties, setSelectedProperty } from '../store/slices/propertiesSlice';

function PropertyList() {
  const dispatch = useDispatch();
  const { properties, loading, error } = useSelector(state => state.properties);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    dispatch(fetchProperties(filters));
  }, [filters]);

  const handlePropertyPress = (property) => {
    dispatch(setSelectedProperty(property));
    // Navigate to property detail screen
  };

  const handleFilter = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View>
      {/* Filter UI */}
      <View>
        <TouchableOpacity onPress={() => handleFilter({ category: 'Residential' })}>
          <Text>Residential</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilter({ category: 'Commercial' })}>
          <Text>Commercial</Text>
        </TouchableOpacity>
      </View>

      {/* Property List */}
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePropertyPress(item)}>
            <View>
              <Image source={{ uri: item.image }} />
              <Text>{item.title}</Text>
              <Text>{item.location}</Text>
              <Text>₹{item.price.toLocaleString()}</Text>
              <Text>{item.configuration}</Text>
              <Text>Status: {item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

### 8. Create Property Form Example

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { createProperty } from '../store/slices/propertiesSlice';

function CreatePropertyForm() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    listingType: 'Rent',
    category: 'Residential',
    type: 'Apartment',
    configuration: '2 BHK',
    city: 'Mumbai',
    price: 0,
    // ... other fields
  });

  const handleSubmit = async () => {
    try {
      await dispatch(createProperty(formData)).unwrap();
      alert('Property created successfully!');
    } catch (error) {
      alert('Failed to create property: ' + error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="City"
        value={formData.city}
        onChangeText={(text) => setFormData({ ...formData, city: text })}
      />
      <TextInput
        placeholder="Price"
        value={formData.price.toString()}
        onChangeText={(text) => setFormData({ ...formData, price: parseFloat(text) })}
        keyboardType="numeric"
      />
      {/* Add more fields */}
      <Button title="Create Property" onPress={handleSubmit} />
    </View>
  );
}
```

## Property Fields

### Required Fields:
- `listingType` - 'Rent' or 'Buy'
- `category` - 'Residential' or 'Commercial'
- `city` - City name
- `price` - Property price

### Optional Fields:
- `propertyCategory` - Property category
- `type` - Property type (Apartment, Villa, etc.)
- `configuration` - 1 BHK, 2 BHK, etc.
- `furnishingStatus` - Furnished, Semi-Furnished, Unfurnished
- `state` - State name
- `locality` - Locality/Area
- `projectName` - Project name
- `address` - Full address
- `size` - Size in sq ft
- `sizeUnit` - Unit (Sq. Ft., Sq. Yd., etc.)
- `lengthFt` - Length in feet
- `widthFt` - Width in feet
- `ownerName` - Owner name
- `ownerPhone` - Owner phone
- `amenities` - Array of amenities
- `bond` - Bond amount (for rent)
- `image` - Cover image URL

## Filter Options

```javascript
{
  search: 'keyword',           // Search in city, project, locality, owner, title
  category: 'Residential',     // Residential or Commercial
  listing_type: 'Rent',        // Rent or Buy
  property_type: 'Apartment',  // Apartment, Villa, etc.
  min_price: 5000000,          // Minimum price
  max_price: 10000000          // Maximum price
}
```

## Backend Integration

### API Endpoints Used:
- `GET /api/properties` - Fetch all properties (with filters)
- `GET /api/properties/:id` - Fetch property details
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Backend Response Format:
```javascript
{
  success: true,
  data: {
    id: 123,
    title: '2 BHK Apartment for Rent in Mumbai',
    listing_type: 'Rent',
    category: 'Residential',
    property_type: 'Apartment',
    configuration: '2 BHK',
    city: 'Mumbai',
    price: 50000,
    status: 'Available',
    // ... other fields
  }
}
```

## State Structure

```javascript
{
  properties: {
    properties: [
      {
        id: 123,
        title: '2 BHK Apartment for Rent',
        listingType: 'Rent',
        category: 'Residential',
        type: 'Apartment',
        configuration: '2 BHK',
        city: 'Mumbai',
        locality: 'Bandra West',
        location: 'Bandra West',
        price: 50000,
        size: 1200,
        ownerName: 'John Doe',
        ownerPhone: '9876543210',
        amenities: ['Parking', 'Gym'],
        status: 'Available',
        image: 'https://...',
        createdAt: '2026-03-01T10:00:00Z'
      }
    ],
    selectedProperty: null,
    loading: false,
    error: null
  }
}
```

## Property Status

- `Available` - Property is available for rent/sale
- `Sold` - Property has been sold
- `Rented` - Property has been rented out
- `Under Negotiation` - Deal in progress

## Benefits

1. **Full API Integration**: All operations sync with backend
2. **Advanced Filtering**: Search and filter by multiple criteria
3. **Auto-generated Titles**: Backend generates property titles
4. **Image Support**: Cover image URL storage
5. **Amenities Tracking**: Array of amenities
6. **Owner Details**: Store owner contact information
7. **Size Calculations**: Multiple size units supported
8. **Error Handling**: Proper error messages from API
9. **Loading States**: UI can show loading indicators

## Migration from Old Code

### Before (Direct API):
```javascript
const response = await propertiesAPI.getAll();
if (response.data.success) {
  // Manual state update
}
```

### After (Redux Slice):
```javascript
await dispatch(fetchProperties()).unwrap();
// State automatically updated
```

## Testing Checklist

- [ ] Fetch all properties
- [ ] Fetch with search filter
- [ ] Fetch with category filter
- [ ] Fetch with price range filter
- [ ] Create new property
- [ ] Update property details
- [ ] Delete property
- [ ] Select/clear property
- [ ] Check loading states
- [ ] Verify error handling
- [ ] Test with different property types
- [ ] Test with amenities array
