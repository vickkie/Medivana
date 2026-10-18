import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import { ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react-native";
import { COLORS, SIZES } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import api from "../utils/api";
import AppointmentCard, { getAppointmentStatus } from "../components/appointments/AppointmentCard";

const STATUS_FILTERS = ["All", "Upcoming", "Pending Approval", "Completed", "Cancelled"];

const generateWeekDates = (offset = 0) => {
  const baseDate = new Date();
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() - baseDate.getDay() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
};

const isSameDay = (a, b) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

export default function AppointmentPage({ searchQuery1 = "", showWeek = false }) {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Week picker state — selects which day the list is scoped to when visible
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState(generateWeekDates(0));
  const [selectedIndex, setSelectedIndex] = useState(new Date().getDay());

  const { userData, userLogin } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (!userLogin) navigation.navigate("Login");
  }, [userLogin]);

  useEffect(() => {
    setWeekDates(generateWeekDates(weekOffset));
  }, [weekOffset]);

  const fetchAppointments = useCallback(async () => {
    if (!userData?._id) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/api/v1/appointment/user/${userData._id}`);
      if (!res?.data?.success) throw new Error("API returned success: false");
      setAppointments(res.data.appointments || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData?._id]);

  useEffect(() => {
    setLoading(true);
    fetchAppointments();
  }, [fetchAppointments, refreshing]);

  useEffect(() => {
    const search = searchQuery1.toLowerCase();
    const selectedDate = weekDates[selectedIndex];
    const next = appointments.filter((appt) => {
      const status = getAppointmentStatus(appt);
      const matchesStatus = selectedStatus === "All" || status === selectedStatus;
      const matchesDate = !showWeek || !selectedDate || isSameDay(new Date(appt.appointmentDate), selectedDate);
      const matchesSearch =
        appt?.doctor?.fullName?.toLowerCase().includes(search) ||
        `${appt?.doctor?.firstname || ""} ${appt?.doctor?.lastname || ""}`.toLowerCase().includes(search) ||
        appt?.doctor?.specialization?.name?.toLowerCase().includes(search) ||
        appt?.bookingId?.toLowerCase().includes(search) ||
        new Date(appt.appointmentDate).toDateString().toLowerCase().includes(search);
      return matchesSearch && matchesStatus && matchesDate;
    });
    setFiltered(next);
  }, [appointments, searchQuery1, selectedStatus, showWeek, selectedIndex, weekDates]);

  const renderItem = useCallback(
    ({ item }) => (
      <AppointmentCard
        appointment={item}
        onPress={() => {
          if (typeof item?._id === "string") navigation.navigate("AppointmentDetails", { id: item._id });
        }}
      />
    ),
    [navigation],
  );

  const selectedMonth = weekDates[3]?.toLocaleDateString("en-US", { month: "long" });

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {showWeek && (
        <View>
          <Text style={styles.monthHeader}>{selectedMonth}</Text>
          <View style={styles.weekHeader}>
            <TouchableOpacity
              onPress={() => setWeekOffset((p) => p - 1)}
              accessibilityRole="button"
              accessibilityLabel="Previous week"
            >
              <ChevronLeft size={20} color="#334155" />
            </TouchableOpacity>

            <View style={styles.weekContainer}>
              {weekDates.map((date, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dayButton, idx === selectedIndex && styles.dayButtonActive]}
                  onPress={() => setSelectedIndex(idx)}
                  accessibilityRole="button"
                  accessibilityLabel={date.toDateString()}
                >
                  <Text style={[styles.dayText, idx === selectedIndex && styles.dayTextActive]}>
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </Text>
                  <Text style={[styles.dateText, idx === selectedIndex && styles.dayTextActive]}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setWeekOffset((p) => p + 1)}
              accessibilityRole="button"
              accessibilityLabel="Next week"
            >
              <ChevronRight size={20} color="#334155" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {STATUS_FILTERS.map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setSelectedStatus(status)}
              style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, selectedStatus === status && styles.filterChipTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity onPress={() => setRefreshing(true)} style={styles.retryButton}>
            <RefreshCcw size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>
          No appointments {searchQuery1 ? "found" : showWeek ? "on this day" : "yet"}
        </Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={COLORS.themey} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 90,
  },
  monthHeader: {
    fontSize: SIZES.medium,
    textAlign: "center",
    fontFamily: "semibold",
    color: "#0F172A",
    marginTop: 4,
  },
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  dayButtonActive: {
    backgroundColor: COLORS.themey,
  },
  dayText: { fontSize: 11, color: "#64748B", fontFamily: "medium" },
  dateText: { fontSize: 15, color: "#0F172A", fontFamily: "semibold", marginTop: 2 },
  dayTextActive: { color: COLORS.themew },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.themew,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: COLORS.themey,
    borderColor: COLORS.themey,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: "medium",
    color: "#475569",
  },
  filterChipTextActive: {
    color: COLORS.themew,
    fontFamily: "semibold",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: "#9F1239", fontFamily: "medium" },
  retryButton: {
    backgroundColor: COLORS.themey,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 50,
    fontFamily: "regular",
    fontSize: SIZES.medium,
  },
});
