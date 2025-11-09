import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import ErrorBoundary2 from "./screens_options/ErrorBoundary";
import { AuthProvider } from "./components/auth/AuthContext";
import { useAuthLoader } from "./components/auth/useAuthLoader";
import { CartProvider } from "./contexts/CartContext";
import { ProfileCompletionProvider } from "./components/auth/ProfileCompletionContext";
import { WishProvider } from "./contexts/WishContext";
import { StripeProvider } from "@stripe/stripe-react-native";

import BottomTabNavigation from "./navigation/BottomTabNavigation";
import UpdateCheck from "./components/UpdateCheck";
import PushNotification from "./components/auth/pushNotification";

import * as Screens from "./screens";

enableScreens();
const Stack = createNativeStackNavigator();
const MyTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: "#fff" } };

const SCREEN_LIST = [
  { name: "Onboarding", component: Screens.Onboarding, options: { headerShown: false } },
  { name: "Bottom Navigation", component: BottomTabNavigation, options: { headerShown: false } },
  { name: "Home", component: Screens.Home, options: { headerShown: false } },
  { name: "Login", component: Screens.LoginPage, options: { headerShown: false } },
  { name: "Favourites", component: Screens.Favourites, options: { headerShown: false } },
  { name: "Categories", component: Screens.Categories, options: { headerShown: true } },
  { name: "Checkout", component: Screens.Checkout, options: { headerShown: false } },
  { name: "Orders", component: Screens.Orders, options: { headerShown: false } },
  { name: "Register", component: Screens.Register, options: { headerShown: false } },
  { name: "UserDetails", component: Screens.UserDetails, options: { headerShown: false } },
  { name: "Message", component: Screens.MessageCenter, options: { headerShown: false } },
  { name: "Help", component: Screens.Help, options: { headerShown: false } },
  { name: "About", component: Screens.About, options: { headerShown: false } },
  { name: "AboutUs", component: Screens.AboutUs, options: { headerShown: false } },
  { name: "Faqs", component: Screens.Faqs, options: { headerShown: false } },
  { name: "SystemMessages", component: Screens.SystemMessages, options: { headerShown: false } },
  { name: "OrderSuccess", component: Screens.OrderSuccess, options: { headerShown: false } },
  { name: "OrderDetails", component: Screens.OrderDetails, options: { headerShown: false } },
  { name: "ChatListScreen", component: Screens.ChatListScreen, options: { headerShown: false } },
  { name: "ChatScreen", component: Screens.ChatScreen, options: { headerShown: false } },
  { name: "VerificationCode", component: Screens.VerificationCode, options: { headerShown: false } },
  { name: "RequestCode", component: Screens.RequestCode, options: { headerShown: false } },
  { name: "ResetPassword", component: Screens.ResetPassword, options: { headerShown: false } },
  { name: "HelpListScreen", component: Screens.HelpListScreen, options: { headerShown: false } },
  { name: "HelpAgentChatScreen", component: Screens.HelpAgentChatScreen, options: { headerShown: false } },
  { name: "DoctorDetails", component: Screens.DoctorDetails, options: { headerShown: false } },
  { name: "DoctorBook", component: Screens.DoctorBook, options: { headerShown: false } },
  { name: "AppointmentDetails", component: Screens.AppointmentDetails, options: { headerShown: false } },
  { name: "Appointments", component: Screens.Appointments, options: { headerShown: false } },
  { name: "ProfileDetails", component: Screens.ProfileDetails, options: { headerShown: false } },
  { name: "SecurityDetails", component: Screens.SecurityDetails, options: { headerShown: false } },
  { name: "MedicalDetails", component: Screens.MedicalDetails, options: { headerShown: false } },
  { name: "NotificationSettings", component: Screens.NotificationSettings, options: { headerShown: false } },
  { name: "PrivacyPolicy", component: Screens.PrivacyPolicy, options: { headerShown: false } },
  { name: "Ratings", component: Screens.Ratings, options: { headerShown: false } },
  { name: "ReceiptScreen", component: Screens.ReceiptScreen, options: { headerShown: false } },
];

const STRIPE_CACHE_KEY = "ACTIVE_STRIPE_KEY";

async function fetchStripeKeyWithRetry(url, retries = 3, delayMs = 2000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { data } = await axios.get(url, { timeout: 5000 });
      if (data?.success && data.data?.publishableKey) return data.data.publishableKey;
      throw new Error("No publishableKey in response");
    } catch (err) {
      if (attempt < retries - 1) await new Promise((r) => setTimeout(r, delayMs));
      else throw err;
    }
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    bold: require("./assets/fonts/Urbanist/static/Urbanist-Bold.ttf"),
    extrabold: require("./assets/fonts/Urbanist/static/Urbanist-ExtraBold.ttf"),
    light: require("./assets/fonts/Urbanist/static/Urbanist-Light.ttf"),
    medium: require("./assets/fonts/Urbanist/static/Urbanist-Medium.ttf"),
    semibold: require("./assets/fonts/Urbanist/static/Urbanist-SemiBold.ttf"),
    regular: require("./assets/fonts/Urbanist/static/Urbanist-Regular.ttf"),
    thin: require("./assets/fonts/Urbanist/static/Urbanist-Thin.ttf"),
    italic: require("./assets/fonts/Urbanist/static/Urbanist-Italic.ttf"),
  });

  const { userData, authLoading } = useAuthLoader();
  const [stripeKey, setStripeKey] = useState(null);

  useEffect(() => {
    const cachedKeyLoader = async () => {
      const cached = await AsyncStorage.getItem(STRIPE_CACHE_KEY);
      if (cached) setStripeKey(cached);
    };
    cachedKeyLoader();
  }, []);

  useEffect(() => {
    const fetchAndCacheStripeKey = async () => {
      const url = `${process.env.BACKEND_PORT}/api/v9/stripe/active`;
      try {
        const key = await fetchStripeKeyWithRetry(url, 3);
        if (key && key !== stripeKey) {
          await AsyncStorage.setItem(STRIPE_CACHE_KEY, key);
          setStripeKey(key);
        }
      } catch (err) {
        console.warn("Stripe key fetch failed:", err.message);
      }
    };

    fetchAndCacheStripeKey();
    const interval = setInterval(fetchAndCacheStripeKey, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [stripeKey]);

  useEffect(() => {
    if (fontsLoaded && !authLoading) SplashScreen.hideAsync();
  }, [fontsLoaded, authLoading]);

  if (!fontsLoaded || authLoading) return null;

  const initialRoute = userData ? "Bottom Navigation" : "Onboarding";

  return (
    <ErrorBoundary2>
      <StripeProvider publishableKey={stripeKey || "pk_test_no_key_found"} urlScheme="medivana">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <UpdateCheck />
          <BottomSheetModalProvider>
            <AuthProvider>
              <ProfileCompletionProvider>
                <CartProvider>
                  <WishProvider>
                    <NavigationContainer theme={MyTheme}>
                      <PushNotification />
                      <Stack.Navigator initialRouteName={initialRoute}>
                        {SCREEN_LIST.map((screen, i) => (
                          <Stack.Screen
                            key={i}
                            name={screen.name}
                            component={screen.component}
                            options={screen.options}
                          />
                        ))}
                      </Stack.Navigator>
                      <Toast />
                    </NavigationContainer>
                  </WishProvider>
                </CartProvider>
              </ProfileCompletionProvider>
            </AuthProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </StripeProvider>
    </ErrorBoundary2>
  );
}
