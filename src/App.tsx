// This import MUST be at the very top of your entry file
import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync(Ionicons.font);
      } catch (e) {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

export default App;