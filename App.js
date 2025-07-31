import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useContext } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Toast from "react-native-toast-message";
import toastConfig from "./utils/toastConfig";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import ErrorBoundary2 from "./screens_options/ErrorBoundary";

import { AuthProvider } from "./components/auth/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProfileCompletionProvider } from "./components/auth/ProfileCompletionContext";
import { WishProvider } from "./contexts/WishContext";
import { chatScreenOptions, systemScreenOptions } from "./screens_options/AppHeaderOptions";

// import { navigationRef } from "./Helpers/NavigationService";

// Screens from ./screens
import {
  Cart,
  OrderDetails,
  ProductDetails,
  Products,
  OrderSuccess,
  LoginPage,
  Favourites,
  Orders,
  Register,
  Categories,
  Checkout,
  UserDetails,
  MessageCenter,
  Help,
  About,
  AboutUs,
  Faqs,
  Home,
  SystemMessages,
  ChatListScreen,
  ChatScreen,
  HelpListScreen,
  HelpAgentChatScreen,
  Onboarding,
  VerificationCode,
  RequestCode,
} from "./screens";

import BottomTabNavigation from "./navigation/BottomTabNavigation";

import UpdateCheck from "./components/UpdateCheck";

import PushNotification from "./components/auth/pushNotification";
// import { RouteProvider } from "./components/auth/RouteContext";

enableScreens();

const Stack = createNativeStackNavigator();

// Array of screen definitions
const screens = [
  { name: "Onboarding", component: Onboarding, options: { headerShown: false } },
  { name: "Bottom Navigation", component: BottomTabNavigation, options: { headerShown: false } },
  { name: "Home", component: Home, options: { headerShown: false } },
  { name: "Login", component: LoginPage, options: { headerShown: false } },
  { name: "ProductDetails", component: ProductDetails, options: { headerShown: false } },
  { name: "ProductList", component: Products, options: { headerShown: false } },
  { name: "Favourites", component: Favourites, options: { headerShown: false } },
  { name: "Categories", component: Categories, options: { headerShown: true } },
  { name: "Cart", component: Cart, options: { headerShown: false } },
  { name: "Checkout", component: Checkout, options: { headerShown: false } },
  { name: "Orders", component: Orders, options: { headerShown: false } },
  { name: "Register", component: Register, options: { headerShown: false } },
  { name: "UserDetails", component: UserDetails, options: { headerShown: false } },
  { name: "Message", component: MessageCenter, options: { headerShown: false } },
  { name: "Help", component: Help, options: chatScreenOptions },
  { name: "About", component: About, options: { headerShown: false } },
  { name: "AboutUs", component: AboutUs, options: { headerShown: false } },
  { name: "Faqs", component: Faqs, options: { headerShown: false } },
  { name: "SystemMessages", component: SystemMessages, options: systemScreenOptions },
  { name: "OrderSuccess", component: OrderSuccess, options: { headerShown: false } },
  { name: "OrderDetails", component: OrderDetails, options: { headerShown: false } },
  { name: "ChatListScreen", component: ChatListScreen, options: { headerShown: false } },
  { name: "ChatScreen", component: ChatScreen, options: { headerShown: false } },
  { name: "VerificationCode", component: VerificationCode, options: { headerShown: false } },
  { name: "RequestCode", component: RequestCode, options: { headerShown: false } },
  { name: "HelpListScreen", component: HelpListScreen, options: { headerShown: false } },
  { name: "HelpAgentChatScreen", component: HelpAgentChatScreen, options: { headerShown: false } },
];

export default function App() {
  const [fontsLoaded] = useFonts({
    bold: require("./assets/fonts/Urbanist/static/Urbanist-Bold.ttf"),
    extrabold: require("./assets/fonts/Urbanist/static/Urbanist-ExtraBold.ttf"),
    light: require("./assets/fonts/Urbanist/static/Urbanist-Light.ttf"),
    lightItalic: require("./assets/fonts/Urbanist/static/Urbanist-LightItalic.ttf"),
    medium: require("./assets/fonts/Urbanist/static/Urbanist-Medium.ttf"),
    semibold: require("./assets/fonts/Urbanist/static/Urbanist-SemiBold.ttf"),
    regular: require("./assets/fonts/Urbanist/static/Urbanist-Regular.ttf"),
    thin: require("./assets/fonts/Urbanist/static/Urbanist-Thin.ttf"),
    thinItalic: require("./assets/fonts/Urbanist/static/Urbanist-ThinItalic.ttf"),
    italic: require("./assets/fonts/Urbanist/static/Urbanist-Italic.ttf"),
    GtAlpine: require("./assets/fonts/GT-Alpina-Light-Italic.ttf"),
    lufga: require("./assets/fonts/lufga/LufgaRegular.ttf"),
    lufgaBold: require("./assets/fonts/lufga/LufgaBold.ttf"),
    lufgaMedium: require("./assets/fonts/lufga/LufgaMedium.ttf"),
    lufgaSemiBold: require("./assets/fonts/lufga/LufgaSemiBold.ttf"),
    lufgaLight: require("./assets/fonts/lufga/LufgaLight.ttf"),
  });

  useEffect(() => {
    const prepare = async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    };
    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary2>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UpdateCheck />

        <BottomSheetModalProvider>
          <AuthProvider>
            <ProfileCompletionProvider>
              <CartProvider>
                <WishProvider>
                  <NavigationContainer>
                    <PushNotification />
                    <Stack.Navigator initialRouteName="Onboarding">
                      {screens.map((screen, index) => (
                        <Stack.Screen
                          key={index}
                          name={screen.name}
                          component={screen.component}
                          options={screen.options}
                        />
                      ))}
                    </Stack.Navigator>
                    <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
                    {/* <RouteProvider /> */}
                  </NavigationContainer>
                </WishProvider>
              </CartProvider>
            </ProfileCompletionProvider>
          </AuthProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary2>
  );
}
