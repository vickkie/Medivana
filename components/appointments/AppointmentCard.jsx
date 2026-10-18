import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar1, Clock, ChevronRight } from "lucide-react-native";
import { COLORS } from "../../constants";

export const STATUS_STYLES = {
  Upcoming: { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46" },
  "Pending Approval": { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  Completed: { bg: "#F1F5F9", border: "#E2E8F0", text: "#475569" },
  Cancelled: { bg: "#FFF1F2", border: "#FECDD3", text: "#9F1239" },
};

export const getAppointmentStatus = (appt) => {
  if (appt.isCancelled) return "Cancelled";
  if (appt.isFinished) return "Completed";
  if (appt.isConfirmed) return "Upcoming";
  return "Pending Approval";
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const formatTime = (timeString) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

export default function AppointmentCard({ appointment, onPress }) {
  const status = getAppointmentStatus(appointment);
  const statusStyle = STATUS_STYLES[status];
  const doctor = appointment?.doctor;
  const specialty =
    doctor?.specialization?.name || doctor?.specialization || appointment?.userNotes || "Consultation";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={
          doctor?.profilePicture
            ? { uri: doctor.profilePicture }
            : require("../../assets/images/userDefault.webp")
        }
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          Dr. {doctor?.fullName || `${doctor?.firstname || ""} ${doctor?.lastname || ""}`.trim() || "Doctor"}
        </Text>
        <Text style={styles.specialty} numberOfLines={1}>
          {specialty}
        </Text>

        <View style={[styles.statusPill, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{status}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar1 size={15} color={COLORS.themey} />
            <Text style={styles.metaText}>{formatDate(appointment?.appointmentDate)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={15} color={COLORS.themey} />
            <Text style={styles.metaText}>{formatTime(appointment?.appointmentTime)}</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.refText}>
            REF : <Text style={styles.refValue}>BOOKING_{appointment?.bookingId}</Text>
          </Text>
          <View style={styles.detailsLink}>
            <Text style={styles.detailsText}>{status === "Completed" ? "Summary" : "Details"}</Text>
            <ChevronRight size={16} color={COLORS.themey} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.themew,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 2,
    elevation: 2,
    shadowColor: "#213145",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  avatar: {
    width: 104,
    height: "100%",
    minHeight: 130,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    resizeMode: "cover",
  },
  info: { flex: 1, marginLeft: 14 },
  name: {
    fontSize: 17,
    fontFamily: "semibold",
    color: "#0F172A",
  },
  specialty: {
    fontSize: 13,
    fontFamily: "regular",
    color: "#64748B",
    marginTop: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "semibold",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: {
    fontSize: 13,
    fontFamily: "medium",
    color: "#334155",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  refText: {
    fontSize: 11,
    fontFamily: "semibold",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },
  refValue: {
    color: "#475569",
    fontFamily: "medium",
  },
  detailsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailsText: {
    fontSize: 14,
    fontFamily: "semibold",
    color: COLORS.themey,
  },
});
