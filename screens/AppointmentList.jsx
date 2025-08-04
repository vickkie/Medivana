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
import { Clock, MessageCircle, Video } from "lucide-react-native";
import { COLORS } from "../constants";

const API_URL = "http://192.168.100.80:3000/api/v1/appointment/user/688dd620ebd1bcf030beab58";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AppointmentPage() {
  const [selectedIndex, setSelectedIndex] = useState(new Date().getDay());
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const dayName = weekDays[selectedIndex];
    setFiltered(
      appointments.filter((appt) => {
        const apptDay = new Date(appt.appointmentDate).toLocaleDateString("en-US", { weekday: "short" });
        return apptDay === dayName;
      })
    );
  }, [appointments, selectedIndex]);

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

  const renderDay = (day, idx) => (
    <TouchableOpacity
      key={day}
      style={[styles.dayButton, idx === selectedIndex && styles.dayButtonActive]}
      onPress={() => setSelectedIndex(idx)}
    >
      <Text style={[styles.dayText, idx === selectedIndex && styles.dayTextActive]}>{day}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const status = item.isCancelled
      ? { label: "Cancelled", style: styles.badgeCancelled }
      : item.isConfirmed
      ? { label: "Completed", style: styles.badgeCompleted }
      : { label: "Upcoming", style: styles.badgeUpcoming };

    const isVideo = item.userNotes.toLowerCase().includes("video");
    const IconComp = isVideo ? Video : MessageCircle;

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
            <IconComp size={14} color={COLORS.black} />
            <Text style={styles.type}>{isVideo ? "Video Call" : "Messaging"}</Text>
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
      <View style={styles.weekContainer}>{weekDays.map(renderDay)}</View>
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

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
  },
  avatar: { width: 90, height: 90, borderRadius: 12, marginRight: 7, backgroundColor: "red" },
  info: { flex: 1 },
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
});
