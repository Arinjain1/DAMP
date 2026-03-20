# Customers Slice Usage Guide

## Overview
The `customersSlice` now handles all customer/client-related operations with full API integration including stage management, property tracking, and CRUD operations.

## Import

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCustomers,
  createCustomer,
  updateCustomer,
  updateCustomerStageAPI,
  updateCustomerProperties,
  deleteCustomer,
  setSelectedCustomer,
  clearSelectedCustomer
} from '../store/slices/customersSlice';
```

## Usage Examples

### 1. Fetch All Customers

```javascript
const dispatch = useDispatch();

// Fetch all customers
useEffect(() => {
  dispatch(fetchCustomers());
}, []);

// Fetch with search
dispatch(fetchCustomers('John')); // Search by name or phone
```

### 2. Create New Customer

```javascript
dispatch(createCustomer({
  name: 'John Doe',
  phone: '9876543210',
  requirementType: 'Buy',
  propertyCategory: 'Residential',
  propertyType: 'Apartment',
  configuration: '2 BHK',
  furnishingStatus: 'Semi-Furnished',
  budgetMin: 5000000,
  budgetMax: 8000000,
  preferredLocation: 'Bandra, Mumbai',
  notes: 'Looking for sea-facing apartment'
}));
```

### 3. Update Customer Details

```javascript
dispatch(updateCustomer({
  id: 123,
  data: {
    name: 'John Doe Updated',
    phone: '9876543210',
    requirementType: 'Buy',
    propertyCategory: 'Residential',
    propertyType: 'Villa',
    configuration: '3 BHK',
    furnishingStatus: 'Fully-Furnished',
    budgetMin: 8000000,
    budgetMax: 12000000,
    preferredLocation: 'Juhu, Mumbai',
    notes: 'Updated requirements',
    selectedProperties: [1, 2, 3],
    interestedProperties: [4, 5],
    holdProperties: [6]
  }
}));
```

### 4. Update Customer Stage

```javascript
// Update stage (New → Contacted → Site Visit → Negotiation → Token → Settlement → Completed)
dispatch(updateCustomerStageAPI({
  id: 123,
  stage: 'Contacted'
}));

// Available stages:
// - 'New' (default when created)
// - 'Contacted'
// - 'Site Visit'
// - 'Negotiation'
// - 'Token'
// - 'Settlement'
// - 'Completed'
```

### 5. Update Customer Properties (Selected/Interested/Hold)

```javascript
dispatch(updateCustomerProperties({
  id: 123,
  data: {
    selectedProperties: [1, 2, 3],      // Properties customer selected
    interestedProperties: [4, 5, 6],    // Properties customer is interested in
    holdProperties: [7]                  // Properties on hold for customer
  }
}));
```

### 6. Delete Customer

```javascript
dispatch(deleteCustomer(123));
```

### 7. Select/Clear Customer

```javascript
// Select customer for detail view
dispatch(setSelectedCustomer(customerObject));

// Clear selection
dispatch(clearSelectedCustomer());
```

### 8. Access Customer State

```javascript
const { 
  customers, 
  selectedCustomer, 
  loading, 
  error 
} = useSelector(state => state.customers);

// Display customers
customers.map(customer => (
  <View key={customer.id}>
    <Text>{customer.name}</Text>
    <Text>{customer.phone}</Text>
    <Text>Stage: {customer.stage}</Text>
    <Text>Budget: ₹{customer.budgetMin} - ₹{customer.budgetMax}</Text>
  </View>
));
```

### 9. Complete Customer List Component Example

```javascript
import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, setSelectedCustomer } from '../store/slices/customersSlice';

function CustomerList() {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector(state => state.customers);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, []);

  const handleCustomerPress = (customer) => {
    dispatch(setSelectedCustomer(customer));
    // Navigate to customer detail screen
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={customers}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleCustomerPress(item)}>
          <View>
            <Text>{item.name}</Text>
            <Text>{item.phone}</Text>
            <Text>Stage: {item.stage}</Text>
            <Text>Budget: ₹{item.budgetMin.toLocaleString()} - ₹{item.budgetMax.toLocaleString()}</Text>
            {item.activeDealCount > 0 && (
              <Text>Active Deals: {item.activeDealCount}</Text>
            )}
            {item.nextTask && (
              <Text>Next Task: {item.nextTask.title}</Text>
            )}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
```

### 10. Create Customer Form Example

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { createCustomer } from '../store/slices/customersSlice';

function CreateCustomerForm() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    requirementType: 'Buy',
    propertyCategory: 'Residential',
    propertyType: 'Apartment',
    configuration: '2 BHK',
    furnishingStatus: 'Semi-Furnished',
    budgetMin: 0,
    budgetMax: 0,
    preferredLocation: '',
    notes: ''
  });

  const handleSubmit = async () => {
    try {
      await dispatch(createCustomer(formData)).unwrap();
      // Success - navigate back or show success message
      alert('Customer created successfully!');
    } catch (error) {
      // Error handling
      alert('Failed to create customer: ' + error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
      <TextInput
        placeholder="Phone"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
      />
      {/* Add more fields */}
      <Button title="Create Customer" onPress={handleSubmit} />
    </View>
  );
}
```

## Customer Stage Flow

```
New → Contacted → Site Visit → Negotiation → Token → Settlement → Completed
```

### Stage Descriptions:
- **New**: Freshly added lead
- **Contacted**: Initial contact made
- **Site Visit**: Property visit scheduled/completed
- **Negotiation**: Price negotiation in progress
- **Token**: Token amount paid
- **Settlement**: Payment settlement in progress
- **Completed**: Deal completed successfully

## Backend Integration

### API Endpoints Used:
- `GET /api/clients` - Fetch all customers
- `POST /api/clients` - Create customer
- `PUT /api/clients/:id` - Update customer
- `PUT /api/clients/:id/stage` - Update customer stage
- `PUT /api/clients/:id/properties` - Update customer properties
- `DELETE /api/clients/:id` - Delete customer

### Backend Response Format:
```javascript
{
  success: true,
  data: {
    id: 123,
    name: 'John Doe',
    phone: '9876543210',
    status: 'New',  // Maps to 'stage' in frontend
    requirement_type: 'Buy',
    property_category: 'Residential',
    // ... other fields
    active_deal_count: 2,
    next_task: {
      title: 'Follow up call',
      due_date: '2026-03-15'
    }
  }
}
```

## State Structure

```javascript
{
  customers: {
    customers: [
      {
        id: 123,
        name: 'John Doe',
        phone: '9876543210',
        stage: 'Contacted',
        requirementType: 'Buy',
        propertyCategory: 'Residential',
        propertyType: 'Apartment',
        configuration: '2 BHK',
        furnishingStatus: 'Semi-Furnished',
        budgetMin: 5000000,
        budgetMax: 8000000,
        preferredLocation: 'Bandra, Mumbai',
        notes: 'Looking for sea-facing',
        selectedProperties: [1, 2],
        interestedProperties: [3, 4],
        holdProperties: [5],
        activeDealCount: 1,
        nextTask: { title: 'Follow up', due_date: '2026-03-15' },
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-09T15:30:00Z'
      }
    ],
    selectedCustomer: null,
    loading: false,
    error: null
  }
}
```

## Benefits

1. **Full API Integration**: All operations sync with backend
2. **Stage Management**: Track customer journey from lead to completion
3. **Property Tracking**: Manage selected, interested, and hold properties
4. **Search Support**: Search customers by name or phone
5. **Active Deal Count**: See how many active deals each customer has
6. **Next Task Preview**: Quick view of upcoming tasks
7. **Error Handling**: Proper error messages from API
8. **Loading States**: UI can show loading indicators

## Migration from Old Code

### Before (Direct API):
```javascript
const response = await customersAPI.create(data);
if (response.data.success) {
  // Manual state update
}
```

### After (Redux Slice):
```javascript
await dispatch(createCustomer(data)).unwrap();
// State automatically updated
```

## Testing Checklist

- [ ] Fetch all customers
- [ ] Create new customer
- [ ] Update customer details
- [ ] Update customer stage
- [ ] Update customer properties
- [ ] Delete customer
- [ ] Search customers
- [ ] Select/clear customer
- [ ] Check loading states
- [ ] Verify error handling
- [ ] Test stage transitions
