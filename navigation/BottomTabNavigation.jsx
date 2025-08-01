import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";
import { Home, Search, Profile, Categories, Products } from "../screens";
import { COLORS } from "../constants/index";
import Icon from "../constants/icons";
import { BlurView } from "expo-blur";
const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarShowLabel: true,
  tabBarHideOnKeyboard: true,
  headerShown: false,
  tabBarStyle: {
    position: "absolute",
    bottom: 15,
    right: 30,
    left: 30,
    elevation: 0,
    backgroundColor: "transparent",
    height: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.themey,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "medium",
  },
  tabBarActiveTintColor: COLORS.themeb,
  tabBarInactiveTintColor: COLORS.gray2,
  tabBarBackground: () => <BlurView intensity={100} tint="light" style={styles.blurView} />,
};

const BottomTabNavigation = () => {
  return (
    // <View>
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon name={focused ? "homefilled" : "home"} size={24} color={focused ? COLORS.primary : COLORS.gray2} />
          ),
          tabBarLabel: "Home",
        }}
      />

      <Tab.Screen
        name="Categories"
        component={Categories}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon name={focused ? "menu2filled" : "menu2"} size={24} color={focused ? COLORS.primary : COLORS.gray2} />
          ),
          tabBarLabel: "Categories",
        }}
      />
      <Tab.Screen
        name="Products"
        component={Products}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon name={focused ? "calendar" : "calendar"} size={24} color={focused ? COLORS.primary : COLORS.gray2} />
          ),
          tabBarLabel: "Appointments",
        }}
      />
      {/* <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? "searchcirclefilled" : "searchcircle"}
              size={24}
              color={focused ? COLORS.primary : COLORS.gray2}
            />
          ),
          tabBarLabel: "Search",
        }}
      /> */}

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? "usercirclefilled" : "usercircle"}
              size={24}
              color={focused ? COLORS.primary : COLORS.gray2}
            />
          ),
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
    // </View>
  );
};

export default BottomTabNavigation;
const styles = StyleSheet.create({
  blurView: {
    backgroundColor: "rgba(11, 171, 125, 0.1)",
    flex: 1,
    borderRadius: 30,
    overflow: "hidden",
  },
});
