import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import { RefreshCcw } from "lucide-react-native";
import { COLORS, SIZES } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import api from "../utils/api";
import AppointmentCard, { getAppointmentStatus } from "../components/appointments/AppointmentCard";

const STATUS_FILTERS = ["All", "Upcoming", "Pending Approval", "Completed", "Cancelled"];

export default function AppointmentPage({ filterList, searchQuery1 = "", isSearching }) {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const { userData, userLogin } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (!userLogin) navigation.navigate("Login");
  }, [userLogin]);

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
      setError(err.response?.data?.message || err.message || "Something went wrong");
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
    const next = appointments.filter((appt) => {
      const status = getAppointmentStatus(appt);
      const matchesStatus = selectedStatus === "All" || status === selectedStatus;
      const matchesSearch =
        appt?.doctor?.fullName?.toLowerCase().includes(search) ||
        `${appt?.doctor?.firstname || ""} ${appt?.doctor?.lastname || ""}`.toLowerCase().includes(search) ||
        appt?.doctor?.specialization?.name?.toLowerCase().includes(search) ||
        appt?.bookingId?.toLowerCase().includes(search) ||
        new Date(appt.appointmentDate).toDateString().toLowerCase().includes(search);
      return matchesSearch && matchesStatus;
    });
    setFiltered(next);
  }, [appointments, searchQuery1, selectedStatus]);

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

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
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
        <Text style={styles.emptyText}>No appointments {searchQuery1 ? "found" : "yet"}</Text>
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
