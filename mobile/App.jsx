import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Appearance,
  Image,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './src/Screens/Login';
import RegisterScreen from './src/Screens/Register';
import NavBar from './src/Screens/NavBar';
import NewAutomation from './src/Screens/NewAutomation';

import { SettingsProvider, useSettings } from './src/Contexts/Settings';

import Help from './src/Help';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { WorkingToken } from './src/Core/ServerCalls';
import ModifyAccount from './src/Screens/ModifyAccount';

function Main() {
  const { settings, setSettings, t } = useSettings();
  const [initialRouteName, setInitialRouteName] = React.useState(null);
  const Stack = createStackNavigator();

  const Light = { "colors": { "background": "rgb(242, 242, 242)", "border": "rgb(216, 216, 216)", "card": "rgb(255, 255, 255)", "notification": "rgb(255, 59, 48)", "primary": "rgb(0, 122, 255)", "text": "rgb(28, 28, 30)" }, "dark": false }
  const Dark = { "colors": { "background": "rgb(1, 1, 1)", "border": "rgb(39, 39, 41)", "card": "rgb(22, 22, 22)", "notification": "rgb(255, 69, 58)", "primary": "rgb(10, 132, 255)", "text": "rgb(229, 229, 231)" }, "dark": true }

  const getColorTheme = () => {
    const theme = settings.colorTheme || "light";
    if (theme === 'adaptive')
      return Appearance.getColorScheme();
    else
      return theme;
  }

  React.useEffect(() => {
    const CheckConnected = async () => {
      try {
        if (await WorkingToken(settings.apiBaseUrl) == true) {
          setInitialRouteName("NavBar");
        } else {
          setInitialRouteName("LoginScreen");
        }
      } catch (error) {
        console.error(error);
        setInitialRouteName("LoginScreen");
      }
    }

    CheckConnected();
  }, []);

  if (initialRouteName === null) {
    return;
  }

  return (
    <NavigationContainer theme={getColorTheme() === "dark" ? Dark : Light}>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Help" component={Help} options={{ headerShown: false }} />
        <Stack.Screen name="ModifyAccount" component={ModifyAccount} options={{ title: t("Modify account"), headerShown: true }} />
        <Stack.Screen name="NavBar" component={NavBar} options={{ headerShown: false }} />
        <Stack.Screen name="NewAutomation" component={NewAutomation} options={{ title: t("New automation"), headerShown: true }} />
      </Stack.Navigator>
      <StatusBar style={getColorTheme() === "dark" ? "light" : "dark"} />
    </NavigationContainer>
  );
}

function App() {
  return (
    <SettingsProvider>
      <Main />
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
});

export default App;
