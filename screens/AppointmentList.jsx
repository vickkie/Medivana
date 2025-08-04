import React, { useState, useEffect } from "react";
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
import { ChevronLeft, ChevronRightIcon, Clock, MessageCircle, Video } from "lucide-react-native";
import { COLORS, SIZES } from "../constants";

const API_URL = "http://192.168.100.80:3000/api/v1/appointment/user/688dd620ebd1bcf030beab58";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const today = new Date();
const datesThisWeek = weekDays.map((_, idx) => {
  const d = new Date();
  d.setDate(today.getDate() - today.getDay() + idx); // Start from Sunday
  return d;
});

export default function AppointmentPage() {
  const [selectedIndex, setSelectedIndex] = useState(new Date().getDay());
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState([]);
  const [isMonth, setIsMonth] = useState("");

  const generateWeekDates = (offset = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - startOfWeek.getDay() + offset * 7); // Sunday start

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  useEffect(() => {
    setWeekDates(generateWeekDates(weekOffset));
  }, [weekOffset]);

  // fetch all appointments once
  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => {
        if (res.data.success) {
          console.log("2", res.data.appointments);
          setAppointments(res.data.appointments);
        } else {
          throw new Error("API returned success: false");
        }
      })
      .catch((err) => {
        console.warn(err.message);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // filter on day change or data change
  useEffect(() => {
    const selectedDate = weekDates[selectedIndex];
    if (!selectedDate) return;

    setFiltered(
      appointments.filter((appt) => {
        const apptDate = new Date(appt.appointmentDate);
        return (
          apptDate.getDate() === selectedDate.getDate() &&
          apptDate.getMonth() === selectedDate.getMonth() &&
          apptDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    );
  }, [appointments, selectedIndex, weekDates]);
  useEffect(() => {
    if (weekDates.length > 0) {
      const middleDay = weekDates[3]; // pick mid-week to avoid month jumps on edge days
      const month = middleDay.toLocaleDateString("en-US", { month: "long" });
      setIsMonth(month);
    }
  }, [weekDates]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  const renderDay = (date, idx) => {
    const dayShort = date.toLocaleDateString("en-US", { weekday: "short" });
    const monthShort = date.toLocaleDateString("en-US", { month: "long" });

    return (
      <>
        <TouchableOpacity
          key={idx}
          style={[styles.dayButton, idx === selectedIndex && styles.dayButtonActive]}
          onPress={() => setSelectedIndex(idx)}
        >
          <Text style={[styles.dayText, idx === selectedIndex && styles.dayTextActive]}>{dayShort}</Text>
          <Text style={[styles.dateText, idx === selectedIndex && styles.dayTextActive]}>{date.getDate()}</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderItem = ({ item }) => {
    const status = item.isCancelled
      ? { label: "Cancelled", style: styles.badgeCancelled }
      : item.isConfirmed
      ? { label: "Completed", style: styles.badgeCompleted }
      : { label: "Upcoming", style: styles.badgeUpcoming };

    const isVideo = item.userNotes.toLowerCase().includes("video");

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.doctor?.profilePicture }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>Dr. {item?.doctor.fullName}</Text>
          <View style={styles.row}>
            <Clock size={14} />
            <Text style={styles.time}>{item?.appointmentTime}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.type}>{item?.bookingId}</Text>
          </View>
        </View>
        <View style={[styles.badge, status.style]}>
          <Text style={styles.badgeText}>{status.label}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
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

      <FlatList
        data={filtered}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No appointments</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
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
  monthHeader: { fontSize: SIZES.large, textAlign: "center", fontFamily: "lufgaBold", marginTop: -10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
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
  name: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  time: { marginLeft: 4, fontSize: 14, color: "#555" },
  type: { marginLeft: 4, fontSize: 14, color: "#555" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#FFF" },
  badgeCompleted: { backgroundColor: "#4CAF50" },
  badgeUpcoming: { backgroundColor: "#2196F3" },
  badgeCancelled: { backgroundColor: "#F44336" },

  emptyText: { textAlign: "center", color: "#AAA", marginTop: 50 },
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
