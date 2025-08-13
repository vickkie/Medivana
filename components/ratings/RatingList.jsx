"use client";

import { useState, useEffect, useContext, useCallback, useRef } from "react";
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
import { Calendar1, Clock, Star, RefreshCcw } from "lucide-react-native";
import { COLORS, SIZES } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../auth/AuthContext";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import RatingBottomSheet from "../bottomsheets/RatingSheet";
import axiosRetry from "axios-retry";
import axios from "axios";
import { BACKEND_PORT } from "@env";
import LottieView from "lottie-react-native";

export default function RatingsList({ filterList, searchQuery1 = "", isSearching }) {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const { userData, userLogin } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();
  const ratingBottomSheetRef = useRef(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

      const { data } = await axios.get(`${BACKEND_PORT}/api/v1/appointment/completed/all`, {
        headers: {
          Authorization: `Bearer ${userData?.TOKEN}`,
        },
      });

      // Ensure doctor object is always there
      const formatted = data.map((appt) => ({
        ...appt,
        doctor: appt.doctor || {},
      }));

      setAppointments(formatted);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
  }, [userId]);

  useEffect(() => {
    if (refreshing && userData?._id) {
      fetchAppointments();
    }
  }, [refreshing, userData?._id]);

  const getRatingStatus = (appt) => {
    if (!appt.isFinished) return "Not Completed";
    if (appt.rated) return "Rated";
    return "Pending Rating";
  };

  const canRate = (appt) => {
    return appt.isFinished && !appt.rated;
  };

  useEffect(() => {
    const search = searchQuery1.toLowerCase();

    const newFiltered = appointments.filter((appt) => {
      const status = getRatingStatus(appt);
      const matchesStatus = selectedStatus === "All" || status === selectedStatus;

      const matchesSearch =
        appt?.doctor?.fullName?.toLowerCase().includes(search) ||
        appt?.bookingId?.toLowerCase().includes(search) ||
        new Date(appt.appointmentDate).toDateString().toLowerCase().includes(search);

      return matchesSearch && matchesStatus;
    });

    setFiltered(newFiltered);
  }, [appointments, searchQuery1, selectedStatus]);

  const handleRatePress = (appointment) => {
    setSelectedAppointment(appointment);
    ratingBottomSheetRef.current?.present();
  };

  const renderStars = (rating) => {
    const stars = [];
    const score = rating?.score || 0;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} size={16} color={i <= score ? "#FFD700" : "#DDD"} fill={i <= score ? "#FFD700" : "transparent"} />
      );
    }
    return stars;
  };

  const renderItem = useCallback(
    ({ item }) => {
      const status = getRatingStatus(item);
      const ratingEnabled = canRate(item);

      const badgeStyle = {
        "Not Completed": styles.badgeNotCompleted,
        Rated: styles.badgeRated,
        "Pending Rating": styles.badgePendingRating,
      }[status];

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            if (ratingEnabled) {
              handleRatePress(item);
            }
          }}
          disabled={!ratingEnabled}
        >
          <Image source={{ uri: item.doctor?.profilePicture }} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.name}>
              {item?.doctor?.title} {item?.doctor?.firstname}
              {item?.doctor?.lastname}
            </Text>
            <View style={styles.row}>
              <Calendar1 size={14} color={COLORS.themey} />
              <Text style={styles.time}>{new Date(item?.appointmentDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.row}>
              <Clock size={14} color={COLORS.themey} />
              <Text style={styles.time}>{item?.appointmentTime}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.type}>ID: {item?.bookingId}</Text>
            </View>
            {item.rated && item.rating && (
              <View style={styles.ratingRow}>
                <View style={styles.starsContainer}>{renderStars(item.rating)}</View>
                <Text style={styles.ratingComment} numberOfLines={1}>
                  {item.rating.comment}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.rightSection}>
            <View style={[styles.badge, badgeStyle]}>
              <Text style={styles.badgeText}>{status}</Text>
            </View>
            {ratingEnabled && (
              <TouchableOpacity style={styles.rateButton} onPress={() => handleRatePress(item)}>
                <Star size={16} color={COLORS.themew} />
                <Text style={styles.rateButtonText}>Rate Now</Text>
              </TouchableOpacity>
            )}
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
        {isSearching && (
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
            {["All", "Rated", "Pending Rating", "Not Completed"].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setSelectedStatus(status)}
                style={{
                  padding: 8,
                  backgroundColor: selectedStatus === status ? COLORS.themey : "#ddd",
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{ color: selectedStatus === status ? "#fff" : COLORS.themeb, fontSize: 12, fontWeight: 700 }}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <SafeAreaView>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : filtered.length === 0 ? (
            <View style={styles.containerx}>
              <View style={styles.containLottie}>
                <View style={styles.animationWrapper}>
                  <LottieView
                    source={require("../../assets/data/doc-why.json")}
                    autoPlay
                    loop={false}
                    style={styles.animation}
                  />
                </View>
                {error && !loading ? (
                  <Text style={styles.errorText}>Error: {error}</Text>
                ) : (
                  <View style={{ marginTop: 0, paddingBottom: 10 }}>
                    <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium }}>"Oops, No appointments here</Text>
                  </View>
                )}
              </View>
            </View>
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

      <RatingBottomSheet
        ref={ratingBottomSheetRef}
        appointment={selectedAppointment}
        onRatingSubmitted={() => {
          setRefreshing(true);
          ratingBottomSheetRef.current?.dismiss();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.themew },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: COLORS.red },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.xSmall - 3,
    marginBottom: 12,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
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
  name: { fontSize: 16, fontWeight: "600", marginBottom: 4, fontFamily: "semibold" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  time: { marginLeft: 4, fontSize: 14, color: "#555" },
  type: { marginLeft: 4, fontSize: 14, color: COLORS.gray },
  ratingRow: {
    flexDirection: "column",
    marginTop: 4,
    gap: 2,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingComment: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 8,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#FFF" },
  badgeRated: { backgroundColor: "#4CAF50" },
  badgePendingRating: { backgroundColor: "#FF9800" },
  badgeNotCompleted: { backgroundColor: "#9E9E9E" },
  rateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themey,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  rateButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: { textAlign: "center", color: "#AAA", marginTop: 50 },
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
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    flex: 1,
  },
  animationWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  containerx: {
    flex: 1,
    paddingTop: 26,
  },
});
