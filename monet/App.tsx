import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";

import { auth } from "./src/config/firebase";
import { ensureProfile, errorMessage } from "./src/services/financeService";
import { colors, shared } from "./src/styles/theme";
import LoginScreen from "./src/screens/LoginScreen";
import type { LoginData } from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";

type RootStack = {
  Login: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStack>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [working, setWorking] = useState(false);
  const workingRef = useRef(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
  }, []);

  async function authenticate(data: LoginData) {
    if (workingRef.current) return;

    workingRef.current = true;
    setWorking(true);

    try {
      if (data.register) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        await updateProfile(credential.user, {
          displayName: data.name,
        });

        await ensureProfile(credential.user, data.name);
      } else {
        const credential = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        await ensureProfile(credential.user);
      }
    } catch (error) {
      Alert.alert("Monet", errorMessage(error));
    } finally {
      workingRef.current = false;
      setWorking(false);
    }
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      {initializing ? (
        <View style={shared.center}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      ) : (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user && !working ? (
              <Stack.Screen
                name="Dashboard"
                navigationKey={user.uid}
              >
                {() => <DashboardScreen user={user} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="Login">
                {() => (
                  <LoginScreen
                    busy={working}
                    onSubmit={authenticate}
                  />
                )}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}