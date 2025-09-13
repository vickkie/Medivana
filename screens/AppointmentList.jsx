import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import {
  Calendar,
  Calendar1,
  ChevronLeft,
  ChevronRightIcon,
  Clock,
  MessageCircle,
  RefreshCcw,
  Video,
} from "lucide-react-native";
import { COLORS, SIZES } from "../constants";
import { BACKEND_PORT } from "@env";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const today = new Date();
const datesThisWeek = weekDays.map((_, idx) => {
  const d = new Date();
  d.setDate(today.getDate() - today.getDay() + idx); // Start from Sunday
  return d;
});

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

export default function AppointmentPage({ filterList, searchQuery1 = "", isSearching }) {
  const [selectedIndex, setSelectedIndex] = useState(new Date().getDay());
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState([]);
  const [isMonth, setIsMonth] = useState("");

  const { userData, userLogin } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
      navigation.navigate("Login");
      return;
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const [selectedStatus, setSelectedStatus] = useState("All");
  // console.log(searchQuery1, "s");

  useEffect(() => {
    setWeekDates(generateWeekDates(weekOffset));
  }, [weekOffset]);

  // fetch all appointments once
  const API_URL = useMemo(() => `${BACKEND_PORT}/api/v1/appointment/user/${userData?._id}`, [userData]);

  // console.log(API_URL);

  useEffect(() => {
    // console.log("fetching");
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL);
        // console.log(res.data.success);

        if (!res?.data?.success) {
          throw new Error("API returned success: false");
        }

        setAppointments(res.data.appointments || []);
        setError(null);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    if (userData || userLogin) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [refreshing]);
  const getAppointmentStatus = (appt) => {
    if (appt.isCancelled) return "Cancelled";
    if (appt.isFinished) return "Completed";
    if (appt.isConfirmed) return "Upcoming";
    return "Pending Approval";
  };

  useEffect(() => {
    const selectedDate = weekDates[selectedIndex];
    if (!selectedDate) return;

    const search = searchQuery1.toLowerCase();

    const newFiltered = appointments.filter((appt) => {
      const apptDate = new Date(appt.appointmentDate);

      const status = getAppointmentStatus(appt);
      const matchesStatus = selectedStatus === "All" || status === selectedStatus;

      const search = searchQuery1.toLowerCase();
      const matchesSearch =
        appt?.doctor?.fullName?.toLowerCase().includes(search) ||
        appt?.bookingId?.toLowerCase().includes(search) ||
        apptDate.toDateString().toLowerCase().includes(search);

      const isSameDate =
        apptDate.getDate() === selectedDate.getDate() &&
        apptDate.getMonth() === selectedDate.getMonth() &&
        apptDate.getFullYear() === selectedDate.getFullYear();

      if (isSearching) {
        // In search mode, ignore date
        return matchesSearch && matchesStatus;
      }

      // Normal mode: date + optional search + status
      return isSameDate && matchesSearch && matchesStatus;
    });

    setFiltered(newFiltered);
  }, [appointments, selectedIndex, weekDates, searchQuery1, selectedStatus]);

  useEffect(() => {
    if (weekDates.length > 0) {
      const middleDay = weekDates[3];
      const month = middleDay.toLocaleDateString("en-US", { month: "long" });
      setIsMonth(month);
    }
  }, [weekDates]);

  const renderDay = (date, idx) => {
    const dayShort = date.toLocaleDateString("en-US", { weekday: "short" });

    return (
      <TouchableOpacity
        key={idx}
        style={[styles.dayButton, idx === selectedIndex && styles.dayButtonActive]}
        onPress={() => setSelectedIndex(idx)}
      >
        <Text style={[styles.dayText, idx === selectedIndex && styles.dayTextActive]}>{dayShort}</Text>
        <Text style={[styles.dateText, idx === selectedIndex && styles.dayTextActive]}>{date.getDate()}</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = useCallback(
    ({ item }) => {
      const status = getAppointmentStatus(item);
      const badgeStyle = {
        Cancelled: styles.badgeCancelled,
        Completed: styles.badgeCompleted,
        Upcoming: styles.badgeUpcoming,
        "Pending Approval": styles.badgePending,
      }[status];

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            if (typeof item?._id === "string") {
              navigation.navigate("AppointmentDetails", { id: item._id });
              console.log("Navigating to:", item._id);
            } else {
              console.warn("Invalid ID, not navigating", item?._id);
            }
          }}
        >
          <Image source={{ uri: item.doctor?.profilePicture }} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.name}>Dr. {item?.doctor.fullName}</Text>
            {/* {isSearching && ( */}
            <View style={styles.row}>
              <Calendar1 size={14} color={COLORS.themey} />
              <Text style={styles.time}>{new Date(item?.appointmentDate).toLocaleDateString()}</Text>
            </View>
            {/* )} */}
            <View style={styles.row}>
              <Clock size={14} color={COLORS.themey} />
              <Text style={styles.time}>{item?.appointmentTime}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.type}>ID: {item?.bookingId}</Text>
            </View>
          </View>
          <View style={[styles.badge, badgeStyle]}>
            <Text style={styles.badgeText}>{status}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [appointments]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor="#000" />
        }
      >
        {!isSearching ? (
          <>
            <View style={{ marginTop: 10 }}>
              <Text style={styles.monthHeader}>{isMonth}</Text>
            </View>
            <View style={styles.weekHeader}>
              <TouchableOpacity onPress={() => setWeekOffset((prev) => prev - 1)}>
                <ChevronLeft size={20} color="#333" />
              </TouchableOpacity>

              <View style={styles.weekContainer}>{weekDates.map(renderDay)}</View>

              <TouchableOpacity onPress={() => setWeekOffset((prev) => prev + 1)}>
                <ChevronRightIcon size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
            {["All", "Completed", "Upcoming", "Cancelled", "Pending Approval"].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setSelectedStatus(status)}
                style={{
                  padding: 8,
                  backgroundColor: selectedStatus === status ? COLORS.themey : "#ddd",
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: selectedStatus === status ? "#fff" : "#333" }}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <SafeAreaView>
          {error && !loading ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity
                onPress={() => {
                  setRefreshing(true);
                }}
                style={styles.retryButton}
              >
                <RefreshCcw size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : loading ? (
            <ActivityIndicator size="large" />
          ) : filtered.length === 0 ? (
            <Text style={styles.emptyText}>No appointments {isSearching ? "Found" : "today"}</Text>
          ) : (
            <FlatList
              data={filtered}
              scrollEnabled={false}
              keyExtractor={(i) => i._id}
              renderItem={renderItem}
              contentContainerStyle={{
                padding: 3,
                backgroundColor: COLORS.themew,
                borderRadius: SIZES.medium,
                gap: 2,
              }}
            />
          )}
        </SafeAreaView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red" },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  dayButton: { padding: 8, borderRadius: 20 },
  dayButtonActive: { backgroundColor: "#E0F7FA" },
  dayText: { fontSize: 14, color: "#888" },
  dayTextActive: { color: "#00796B", fontWeight: "bold" },
  monthHeader: { fontSize: SIZES.large, textAlign: "center", fontFamily: "", color: COLORS.themey, marginTop: -10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.xSmall - 3,
    marginBottom: 12,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
    // width: SIZES.width - 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 7,
    backgroundColor: COLORS.themew,
    resizeMode: "contain",
  },
  info: { flex: 1 },
  dateText: { textAlign: "center" },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 4, fontFamily: "semibold" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  time: { marginLeft: 4, fontSize: 14, color: "#555" },
  type: { marginLeft: 4, fontSize: 14, color: "#555" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#FFF" },
  badgeCompleted: { backgroundColor: "#4CAF50" },
  badgePending: { backgroundColor: "#FFC107" },
  badgeUpcoming: { backgroundColor: "#03A9F4" },
  badgeCancelled: { backgroundColor: "#F44336" },
  emptyText: { textAlign: "center", color: "#AAA", marginTop: 50 },
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
  },
  errorMessage: {
    fontFamily: "bold",
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    textAlign: "center",
  },
});
