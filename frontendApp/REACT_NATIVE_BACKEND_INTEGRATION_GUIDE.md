# React Native Frontend-Backend Integration Guide

## 🎯 Overview

This guide shows how to write React Native code that seamlessly integrates with backend APIs while maintaining full functionality during development when the backend is unavailable.

## 📁 Architecture Overview

```
src/
├── services/           # API service layer
│   ├── apiClient.js    # Axios configuration with mock fallback
│   ├── authService.js  # Authentication APIs
│   ├── dashboardService.js
│   ├── propertyService.js
│   └── gatePassService.js
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Authentication hook with Redux
│   ├── useDashboard.js # Dashboard data management
│   └── useGatePass.js  # Gate pass operations
├── redux/
│   └── slices/         # Redux state management
└── Views/              # React Native components
```

## 🔧 Core Principles

### 1. Service Layer Pattern
- **Single Responsibility**: Each service handles one domain (auth, dashboard, etc.)
- **Error Handling**: Consistent error handling with user-friendly messages
- **Mock Fallback**: Automatic fallback to demo data when backend unavailable
- **Future-Ready**: Minimal changes needed when backend is ready

### 2. Custom Hooks Integration
- **Redux Integration**: Hooks manage both API calls and Redux state
- **Loading States**: Built-in loading and error state management
- **Automatic Retry**: Smart retry logic for network failures

### 3. Development Mode Support
- **Offline Development**: Full app functionality without backend
- **Mock Data**: Realistic demo data for all features
- **Visual Indicators**: Clear indication when using demo data

## 🚀 Quick Start

### Step 1: Use Services in Components

```jsx
// ❌ DON'T: Direct API calls in components
const TenantDashboard = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/dashboard')  // Direct API call
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <View>{/* render */}</View>;
};

// ✅ DO: Use custom hooks
const TenantDashboard = () => {
  const { dashboardData, loading, error, usingMockData } = useDashboard();
  
  if (loading) return <LoadingSpinner />;
  if (error && !usingMockData) return <ErrorMessage error={error} />;
  
  return (
    <View>
      {usingMockData && <DemoModeNotice />}
      {/* render dashboard */}
    </View>
  );
};
```

### Step 2: Authentication Integration

```jsx
// Login Component Example
import { useAuth } from '../hooks/useAuth';

const LoginScreen = () => {
  const { loginTenant, loading, error } = useAuth();
  const [credentials, setCredentials] = useState({ tenantId: '', password: '' });
  
  const handleLogin = async () => {
    try {
      await loginTenant(credentials);
      // Navigation handled automatically by auth state change
    } catch (err) {
      // Error already handled by hook and stored in Redux
      Alert.alert('Login Failed', err.message);
    }
  };
  
  return (
    <View>
      <TextInput 
        value={credentials.tenantId}
        onChangeText={(text) => setCredentials(prev => ({ ...prev, tenantId: text }))}
        placeholder="Tenant ID"
      />
      <TextInput 
        value={credentials.password}
        onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
        placeholder="Password"
        secureTextEntry
      />
      <TouchableOpacity onPress={handleLogin} disabled={loading}>
        <Text>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
};
```

### Step 3: Data Management with Redux

```jsx
// Gate Pass Management Example
import { useGatePass } from '../hooks/useGatePass';

const GatePassView = () => {
  const { 
    gatePasses, 
    loading, 
    createGatePass, 
    pendingCount,
    usingMockData 
  } = useGatePass();
  
  const handleCreateGatePass = async (gatePassData) => {
    try {
      await createGatePass(gatePassData);
      Alert.alert('Success', 'Gate pass created successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    <View>
      {usingMockData && (
        <View style={{ backgroundColor: '#FFF3CD', padding: 10 }}>
          <Text>📱 Demo Mode: Using sample data</Text>
        </View>
      )}
      
      <Text>Pending Gate Passes: {pendingCount}</Text>
      
      <FlatList
        data={gatePasses}
        renderItem={({ item }) => <GatePassCard gatePass={item} />}
        refreshing={loading}
        onRefresh={() => fetchGatePasses()}
      />
    </View>
  );
};
```

## 🔌 Backend Integration Points

### Authentication Endpoints
```javascript
// When backend is ready, these endpoints should be available:
POST /api/auth/login          // Tenant login
POST /api/auth/register       // Tenant registration  
POST /api/auth/warden/login   // Warden login
POST /api/auth/logout         // Logout
GET  /api/auth/verify         // Token verification
PUT  /api/auth/change-password // Change password
```

### Dashboard Endpoints
```javascript
GET /api/dashboard                    // General dashboard
GET /api/dashboard/tenant/:tenantId   // Tenant dashboard
GET /api/dashboard/warden            // Warden dashboard
GET /api/dashboard/property/:id/analytics // Property analytics
```

### Gate Pass Endpoints
```javascript
GET  /api/gate-passes/tenant/:tenantId    // Tenant's gate passes
GET  /api/gate-passes/warden/pending      // Pending approvals
POST /api/gate-passes                     // Create gate pass
PUT  /api/gate-passes/:id/approve         // Approve gate pass
PUT  /api/gate-passes/:id/reject          // Reject gate pass
```

## 🛠 Environment Configuration

### Development vs Production

```javascript
// apiClient.js configuration
const apiClient = axios.create({
  baseURL: __DEV__ 
    ? 'http://localhost:3000'           // Development
    : 'https://your-production-api.com', // Production
  timeout: 10000,
});
```

### Environment Variables (Optional)
```javascript
// If using react-native-config
import Config from 'react-native-config';

const apiClient = axios.create({
  baseURL: Config.API_URL || 'http://localhost:3000',
  timeout: parseInt(Config.API_TIMEOUT) || 10000,
});
```

## 🔄 Migration Strategy

### Phase 1: Development (Current)
- ✅ All services implemented with mock fallback
- ✅ Full app functionality without backend
- ✅ Redux state management ready
- ✅ Custom hooks for all major features

### Phase 2: Backend Integration (When Ready)
**Minimal changes required:**

1. **Update API Base URL** (1 line change)
```javascript
// In apiClient.js
baseURL: 'https://your-production-api.com'
```

2. **Remove Mock Data Fallback** (Optional)
```javascript
// In service files, remove mock data sections if desired
// Or keep them for offline functionality
```

3. **Test Real API Responses**
```javascript
// Verify response formats match expectations
// Most likely no changes needed due to service layer abstraction
```

### Phase 3: Production Optimization
- Remove development-only mock data
- Add production error tracking
- Implement offline data caching
- Add API response caching

## 📱 Component Integration Examples

### Profile Management
```jsx
const TenantProfileView = () => {
  const { currentUser, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState(currentUser);
  
  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    <ScrollView>
      <Image source={{ uri: currentUser?.avatar }} />
      <Text>{currentUser?.name}</Text>
      <Text>{currentUser?.email}</Text>
      
      {editing ? (
        <View>
          <TextInput 
            value={profileData.name}
            onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
          />
          <Button title="Save" onPress={handleSaveProfile} />
        </View>
      ) : (
        <Button title="Edit Profile" onPress={() => setEditing(true)} />
      )}
    </ScrollView>
  );
};
```

### Real-time Data Updates
```jsx
const DashboardView = () => {
  const { dashboardData, refetch, usingMockData } = useDashboard();
  
  // Auto-refresh every 30 seconds in production
  useEffect(() => {
    if (!usingMockData) {
      const interval = setInterval(refetch, 30000);
      return () => clearInterval(interval);
    }
  }, [usingMockData, refetch]);
  
  return (
    <View>
      <PullToRefreshScrollView onRefresh={refetch}>
        <StatsCards data={dashboardData?.globalStats} />
        <PropertyList properties={dashboardData?.properties} />
        <RecentActivities activities={dashboardData?.recentActivities} />
      </PullToRefreshScrollView>
    </View>
  );
};
```

## 🚨 Error Handling Best Practices

### User-Friendly Error Messages
```javascript
// In service files
static handleAuthError(error) {
  if (error.response) {
    switch (error.response.status) {
      case 400: return new Error('Invalid credentials provided');
      case 401: return new Error('Invalid credentials. Please check your login details.');
      case 403: return new Error('Access denied. Please contact support.');
      case 500: return new Error('Server error. Please try again later.');
      default: return new Error('Authentication failed');
    }
  }
  
  // Network error - triggers mock data in development
  return new Error('Connection failed. Using demo mode.');
}
```

### Component Error Boundaries
```jsx
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Something went wrong. Please restart the app.</Text>
        <Button title="Retry" onPress={() => setHasError(false)} />
      </View>
    );
  }
  
  return children;
};
```

## 📊 Data Flow Diagram

```
User Action → Custom Hook → Service Layer → API Client → Backend
     ↓              ↓            ↓            ↓           ↓
Redux Store ← Hook Updates ← Transform Data ← Response ← API
     ↓
Component Re-render
```

## 🎯 Benefits of This Architecture

1. **Zero Backend Dependency**: Full development without backend
2. **Minimal Migration**: 1-2 line changes when backend ready  
3. **Consistent UX**: Same user experience in dev and production
4. **Error Resilience**: Graceful handling of network issues
5. **Team Productivity**: Frontend and backend teams work independently
6. **Future-Proof**: Easy to add new features and endpoints

## 🔧 Troubleshooting

### Common Issues and Solutions

**Issue**: "Network Error" in development
**Solution**: This is expected - app automatically uses mock data

**Issue**: Redux state not updating
**Solution**: Ensure hooks are called at component top level

**Issue**: Authentication not persisting
**Solution**: Check AsyncStorage permissions and initialization

**Issue**: Mock data not realistic enough
**Solution**: Update mock data in service files to match your needs

## 📝 Next Steps

1. **Test Current Implementation**: Verify all features work with mock data
2. **Backend Coordination**: Share API endpoint specifications with backend team
3. **Data Validation**: Ensure mock data matches expected backend response formats
4. **Production Setup**: Configure production API URLs and error tracking
5. **Performance Optimization**: Add caching and offline support as needed

---

**🎉 Result**: Your React Native app is now backend-ready with minimal future changes required!