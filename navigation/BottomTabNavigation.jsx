import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { Home, Search, Profile, Categories, Products, Orders } from "../screens";
import { COLORS } from "../constants";
import { LucideHome as HomeIcon, List, User, Circle, CalendarDays } from "lucide-react-native";

const Tab = createBottomTabNavigator();
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Map route names to Lucide icon components
const iconMap = {
  Home: HomeIcon,
  Categories: List,
  Orders: CalendarDays,
  Profile: User,
  Default: Circle,
};

// Memoized tab item with animated icon and label
const TabItem = React.memo(({ routeName, label, isFocused, onPress }) => {
  const Icon = iconMap[routeName] || iconMap.Default;

  return (
    <AnimatedTouchable
      onPress={onPress}
      layout={Layout.springify().mass(0.8)}
      style={[styles.tabItem, isFocused && styles.tabItemFocused]}
    >
      <Icon
        size={24}
        color={isFocused ? COLORS.themey : COLORS.themew}
        stroke={isFocused ? COLORS.themey : COLORS.themew}
      />
      {isFocused && (
        <Animated.Text entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.label}>
          {label}
        </Animated.Text>
      )}
    </AnimatedTouchable>
  );
});

// Custom tab bar navigation
const BottomTabNavigation = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={({ state, descriptors, navigation }) => (
      <BlurView intensity={100} tint="light" style={styles.blurContainer}>
        <View style={styles.container}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <TabItem key={route.key} routeName={route.name} label={label} isFocused={isFocused} onPress={onPress} />
            );
          })}
        </View>
      </BlurView>
    )}
  >
    <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: "Home" }} />
    <Tab.Screen name="Categories" component={Categories} options={{ tabBarLabel: "Categories" }} />
    <Tab.Screen name="Orders" component={Orders} options={{ tabBarLabel: "Appointments" }} />
    <Tab.Screen name="Profile" component={Profile} options={{ tabBarLabel: "Profile" }} />
  </Tab.Navigator>
);

export default BottomTabNavigation;

const styles = StyleSheet.create({
  blurContainer: {
    position: "absolute",
    bottom: 15,
    left: 30,
    right: 30,
    borderRadius: 30,
    overflow: "hidden",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#0BAB7B",
    paddingVertical: 10,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
  },
  tabItemFocused: {
    backgroundColor: COLORS.themew,
  },
  label: {
    marginLeft: 8,
    fontWeight: "500",
    fontFamily: "lufgaBold",
    color: COLORS.themey,
  },
});
