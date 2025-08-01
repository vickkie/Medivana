import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BACKEND_PORT } from "@env";
import styles from "./styles/doctorBook";
import Icon from "../../constants/icons";
import { BlurView } from "expo-blur";
import { COLORS } from "../../constants";
import DoctorCard from "../home/DoctorCard";

const DoctorBook = ({ sendDataToParent, routeParams }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params || routeParams;
  const { routeParam, category, doctor, selectedDate: passedDate, selectedDay: passedDay } = params;

  console.log(passedDate, passedDay);

  const getWeekDays = (offset = 0) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);

    const calendarDays = [];
    const options = { weekday: "short" };

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      calendarDays.push({
        day: date.getDate(),
        dateObj: date,
        dayShort: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayName: date.toLocaleDateString("en-US", options).charAt(0),
      });
    }

    return calendarDays;
  };

  const getFullDayName = (short) => {
    const map = {
      Sun: "Sunday",
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
    };
    return map[short] || short;
  };

  const [doctorData, setDoctorData] = useState(doctor || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
  const [availableHours, setAvailableHours] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);

  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDoctorDetails = async () => {
    try {
      setIsUpdating(true);
      const response = await axios.get(`${BACKEND_PORT}/api/medic/${doctor?._id}`);
      const fetchedDoctor = response.data;

      const isDifferent = JSON.stringify(fetchedDoctor) !== JSON.stringify(doctor);

      if (isDifferent) {
        setDoctorData(fetchedDoctor);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load doctor details");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (doctor?._id) {
      fetchDoctorDetails();
    }
  }, []);

  const updateMonthName = (days) => {
    const middleDay = days[3]?.dateObj || new Date();
    const month = middleDay.toLocaleDateString("en-US", { month: "long" });
    setCurrentMonth(month);
  };

  const handleDateSelect = (item) => {
    setSelectedDate(item.day);
    // console.log("g", item.dayShort);
    setSelectedDay(getFullDayName(item?.dayShort));
  };

  const updateAvailableHours = (dayName) => {
    // console.log("updated", dayName);
    if (!dayName) return;

    const availableHours = doctorData?.availability;
    // console.log("Available hours object:", availableHours);

    const match = availableHours?.find((d) => d.day?.toLowerCase() === dayName.toLowerCase());

    // console.log("Matched availability:", match);
    setAvailableHours(match?.timeSlots || []);
  };

  useEffect(() => {
    updateAvailableHours(selectedDay);
  }, [doctorData, selectedDay]);

  const handleBookAppointment = () => {};

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchDoctorDetails} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.themey} />

      {/* Header */}
      <View style={styles.upperRow}>
        {isUpdating && (
          <View style={styles.backgroundLoader}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.buttonWrap}>
          <Icon size={26} name="backbutton" />
        </TouchableOpacity>
        <Text style={styles.heading}>Dr Schedule</Text>
        <View style={styles.lovebuy}>
          <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.buttonWrap1}>
            <Icon size={26} name="bellfilled" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <DoctorCard doctor={doctor} showBook={false} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorBook;
