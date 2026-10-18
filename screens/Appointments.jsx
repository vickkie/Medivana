import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants";
import { useNavigation } from "@react-navigation/native";
import AppointmentPage from "./AppointmentList";
import { CalendarDays, Search, SlidersHorizontal, ChevronLeft } from "lucide-react-native";

const Appointments = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showWeek, setShowWeek] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.circleButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.title}>APPOINTMENTS</Text>

        <TouchableOpacity
          onPress={() => setShowWeek((v) => !v)}
          style={[styles.circleButton, showWeek && { borderColor: COLORS.themey, borderWidth: 1.5 }]}
          accessibilityRole="button"
          accessibilityLabel="Toggle week view"
          accessibilityState={{ selected: showWeek }}
        >
          <CalendarDays size={20} color={showWeek ? COLORS.themey : "#64748B"} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by doctor or specialty…"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <SlidersHorizontal size={18} color="#94A3B8" />
      </View>

      <View style={styles.listWrapper}>
        <AppointmentPage searchQuery1={searchQuery} showWeek={showWeek} />
      </View>
    </SafeAreaView>
  );
};

export default Appointments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.themew,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#213145",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  title: {
    fontSize: SIZES.large,
    fontFamily: "semibold",
    color: "#0F172A",
    letterSpacing: 1.2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themew,
    borderRadius: 999,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "regular",
    color: "#0F172A",
    padding: 0,
  },
  listWrapper: {
    flex: 1,
  },
});
