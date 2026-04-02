import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { LayoutDashboard, History, Settings, TrendingUp, Landmark } from 'lucide-react-native';
import { View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';

import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import LockScreen from './src/screens/LockScreen';

import { initializeDb } from './src/db/client';
import { useSecurityStore } from './src/store/useSecurityStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac4',
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Overview') return <LayoutDashboard color={color} size={size} />;
          if (route.name === 'History') return <History color={color} size={size} />;
          if (route.name === 'Budget') return <Landmark color={color} size={size} />;
          if (route.name === 'Analytics') return <TrendingUp color={color} size={size} />;
          if (route.name === 'Settings') return <Settings color={color} size={size} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Overview" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = React.useState(false);
  const { isLocked, checkSecurityStatus, lock } = useSecurityStore();
  const [appState, setAppState] = React.useState(AppState.currentState);

  React.useEffect(() => {
    console.log('[kisara] App starting...');

    const startup = async () => {
      try {
        await initializeDb();
        await checkSecurityStatus();
        console.log('[kisara] App ready');
      } catch (err) {
        console.error('[kisara] App startup crash:', err);
      } finally {
        setReady(true);
      }
    };

    startup();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.match(/active/) && nextAppState.match(/inactive|background/)) {
        lock();
      }
      setAppState(nextAppState);
    });

    return () => subscription.remove();
  }, [appState]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        {isLocked ? (
          <LockScreen />
        ) : (
          <Stack.Navigator>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{
                title: 'New Transaction',
                presentation: 'modal',
                headerShown: true
              }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}
