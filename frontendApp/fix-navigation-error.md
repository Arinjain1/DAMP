# Fix Navigation Context Error

## Problem
Getting "Couldn't find a navigation context" error when clicking Sell/Rent buttons in inventory page.

## Root Cause
Version conflict between React Navigation packages installed as dependencies and those required by expo-router.

## Solution Steps

### 1. Clean Install Dependencies
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

### 2. Update Expo Router (if needed)
```bash
npx expo install expo-router@latest
```

### 3. Check for Conflicting Navigation Imports
Make sure you're not importing from `@react-navigation` directly anywhere in your code. Use only `expo-router` hooks:
- Use `useRouter()` instead of `useNavigation()`
- Use `router.push()` instead of `navigation.navigate()`

### 4. Restart Development Server
```bash
# Stop current server
# Then restart
npx expo start --clear
```

## Alternative Quick Fix

If the above doesn't work, try wrapping your app with NavigationContainer manually in _layout.tsx:

```tsx
import { NavigationContainer } from '@react-navigation/native';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <View className="flex-1 bg-white">
            <TabsLayout />
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
```

But this should NOT be needed with expo-router and might cause other issues.