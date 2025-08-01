// screens/Onboarding.js
import React from "react";
import { View, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { COLORS, SIZES } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SCREEN_WIDTH = SIZES.width;
const ROW_WIDTH = SCREEN_WIDTH * 1.5;

const slides = [
  {
    key: "one",
    titleTop: "How are you",
    titleBottom: "Feeling today?",
    image: require("../assets/images/doctor7.png"),
    bgColorTop: COLORS.themek,
    showContinue: false,
  },
  {
    key: "two",
    titleTop: "Quickly Find Nearby",
    titleBottom: "Medical Specialists!",
    image: require("../assets/images/multi-doctor.png"),
    bgColorTop: COLORS.themek,
    showContinue: false,
  },
  {
    key: "three",
    titleTop: "Get Medical Attention To ",
    titleBottom: "Heal Yourself ",
    image: require("../assets/images/doctor6.png"),
    bgColorTop: COLORS.themek,
    showContinue: true,
  },
];

const Onboarding = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    if (item.key === "three") {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: "#000",
            alignItems: "center",
            paddingHorizontal: 30,
            paddingTop: 60,
            paddingVertical: 20,
            elevation: 0,
            gap: 40,
            overflow: "hidden",
          }}
        >
          {/* Header Text */}
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "600", color: "#fff", textAlign: "center" }}>{item.titleTop}</Text>
            <Text
              style={{ fontSize: 24, fontWeight: "600", color: COLORS.themek, textAlign: "center", marginBottom: 30 }}
            >
              {item.titleBottom}
            </Text>
          </View>

          {/* Tilted 3-card row */}
          <View
            style={{
              transform: [{ rotate: "-5deg" }],
              flexDirection: "row",
              width: ROW_WIDTH,
              justifyContent: "center",
              alignItems: "center",
              overflow: "visible",
              marginBottom: 30,
            }}
          >
            {/* Left off‑screen panel */}
            <View
              style={{
                width: SCREEN_WIDTH * 0.75,
                height: 260,
                backgroundColor: "#24252B",
                borderRadius: 8,
                elevation: 2,
              }}
            />

            {/* Center yellow card with image */}
            <View
              style={{
                width: 260,
                height: 260,
                backgroundColor: COLORS.themek,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: 20,
                elevation: 6,
                shadowColor: "#000",
                shadowOpacity: 0.3,
                shadowOffset: { width: 2, height: 2 },
                shadowRadius: 6,
              }}
            >
              <Image source={item.image} style={{ width: 260, height: 260, resizeMode: "contain" }} />
            </View>

            {/* Right off‑screen panel */}
            <View
              style={{
                width: SCREEN_WIDTH * 0.75,
                height: 260,
                backgroundColor: "#24252B",
                borderRadius: 8,
              }}
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={() => navigation.replace("Bottom Navigation")}
            style={{
              backgroundColor: COLORS.themek,
              paddingVertical: 14,
              borderRadius: 50,
              width: "90%",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, color: "#FFF", fontWeight: "600", marginRight: 8 }}>Continue</Text>
            <Text style={{ fontSize: 18, color: "#FFF", fontWeight: "600" }}>»</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Default layout for slides 1 & 2
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <View
          style={{
            height: SCREEN_HEIGHT * 0.55,
            backgroundColor: item.bgColorTop,
            borderBottomLeftRadius: 100,
            borderBottomRightRadius: 100,
            justifyContent: "center",
            alignItems: "center",
            elevation: 3,
          }}
        >
          <Image source={item.image} style={{ height: "100%", width: "80%", resizeMode: "contain" }} />
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 30,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "600", color: "#fff", textAlign: "center" }}>{item.titleTop}</Text>
          <Text
            style={{ fontSize: 24, fontWeight: "600", color: COLORS.themek, textAlign: "center", marginBottom: 20 }}
          >
            {item.titleBottom}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      showNextButton={true}
      showDoneButton={false}
      renderNextButton={() => (
        <View
          style={{
            width: 48,
            height: 48,
            backgroundColor: COLORS.themek,
            borderRadius: 24,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
          }}
        >
          <Ionicons name="arrow-forward" size={24} color="#000" />
        </View>
      )}
      dotStyle={{
        backgroundColor: "rgba(255,255,255,0.3)",
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 6,
      }}
      activeDotStyle={{
        backgroundColor: COLORS.themek,
        width: 24,
        height: 11,
        borderRadius: 5,
        marginHorizontal: 6,
      }}
    />
  );
};

export default Onboarding;
