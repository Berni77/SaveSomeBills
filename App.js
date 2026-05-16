import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

// Einstiegspunkt der App – bindet Navigation und StatusBar ein
export default function App() {
  return (
    <NavigationContainer>
      {/* Helle Statusbar auf dunklem Hintergrund */}
      <StatusBar style="light" backgroundColor="#0a0a0f" />
      <AppNavigator />
    </NavigationContainer>
  );
}
