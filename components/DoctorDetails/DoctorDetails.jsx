import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BACKEND_PORT } from "@env";
import styles from "./styles/doctorDetails";
import Icon from "../../constants/icons";
import { BlurView } from "expo-blur";
import { COLORS } from "../../constants";

const DoctorDetails = ({ sendDataToParent, routeParams }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params || routeParams;
  const { routeParam, category, doctor } = params;

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

  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
  const [availableHours, setAvailableHours] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const weekDays = getWeekDays();
    setCalendarDays(weekDays);

    const today = new Date();
    const todayDay = today.getDate();
    const todayName = today.toLocaleDateString("en-US", { weekday: "long" });

    setSelectedDate(todayDay);
    setSelectedDay(todayName);
    setCurrentMonth(today.toLocaleDateString("en-US", { month: "long" }));

    updateAvailableHours(todayName);
  }, []);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_PORT}/api/medic/${doctor?._id}`);
      console.log("response", response.data);
      setDoctorData(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load doctor details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDetails();
  }, []);

  const handleDateSelect = (item) => {
    setSelectedDate(item.day);
    console.log("g", item.dayShort);
    setSelectedDay(getFullDayName(item?.dayShort));
  };

  const updateAvailableHours = (dayName) => {
    console.log("updated", dayName);
    if (!dayName) return;

    const availableHours = doctorData?.availability;
    console.log("Available hours object:", availableHours);

    const match = availableHours?.find((d) => d.day?.toLowerCase() === dayName.toLowerCase());

    // console.log("Matched availability:", match);
    setAvailableHours(match?.timeSlots || []);
  };

  useEffect(() => {
    updateAvailableHours(selectedDay);
  }, [doctorData, selectedDay]);

  const handleBookAppointment = () => {
    // Handle booking logic here
    console.log("Booking appointment for", selectedDate, currentMonth);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.themey} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.buttonWrap}>
          <Icon size={26} name="backbutton" />
        </TouchableOpacity>
        <Text style={styles.heading}>Doctor Details</Text>
        <View style={styles.lovebuy}>
          <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.buttonWrap1}>
            <Icon size={26} name="bellfilled" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Doctor Profile Card */}
        <View style={styles.wholeCardView}>
          <View style={styles.profileCard}>
            <Image
              source={{
                uri: doctorData?.profilePicture?.trim()
                  ? doctorData.profilePicture
                  : "https://i.postimg.cc/wjJrRMfz/doctor1.png",
              }}
              style={styles.doctorImage}
            />

            <View style={styles.actionButtons}>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{`Dr. ${doctorData?.fullName}` || "Dr. Susan Lal"}</Text>
                <Text style={styles.doctorSpecialty}>{doctorData?.specialization?.name || "Bone Expert"}</Text>
              </View>
              <View style={styles.flexEnd}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbox" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <BlurView intensity={50} style={styles.blurView} />
            </View>
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <TouchableOpacity style={styles.statsb}>
                <Ionicons name="people-outline" size={20} color={COLORS.themeb} />
              </TouchableOpacity>

              <View style={styles.numberHolder}>
                <Text style={styles.statNumber}>{doctorData?.visits || "8.7K"}</Text>
                <Text style={styles.statLabel}>Visits</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <TouchableOpacity style={styles.statsb}>
                <Ionicons name="star-outline" size={20} color={COLORS.themeb} />
              </TouchableOpacity>
              <View style={styles.numberHolder}>
                <Text style={styles.statNumber}>{doctorData?.rating || "5.0"}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <TouchableOpacity style={styles.statsb}>
                <Ionicons name="time-outline" size={20} color={COLORS.themeb} />
              </TouchableOpacity>
              <View style={styles.numberHolder}>
                <Text style={styles.statNumber}>{doctorData?.experience || "6 Yr+"}</Text>
                <Text style={styles.statLabel}>Exp</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Availability Calendar */}
        <View style={styles.availabilitySection}>
          <View style={styles.availabilityHeader}>
            <Text style={styles.sectionTitle}>Availability</Text>

            <View style={styles.monthSelector}>
              <TouchableOpacity>
                <Ionicons name="chevron-back" size={16} color={COLORS.themeb} />
              </TouchableOpacity>
              <Text style={styles.monthText}>{currentMonth}</Text>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={16} color={COLORS.themeb} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.calendar}>
            {calendarDays.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.calendarDay, selectedDate === item.day && styles.selectedDay]}
                onPress={() => handleDateSelect(item)}
              >
                <Text style={[styles.dayNumber, selectedDate === item.day && styles.selectedDayText]}>{item.day}</Text>
                <Text style={[styles.dayName, selectedDate === item.day && styles.selectedDayText]}>
                  {item.dayName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.slotsHolder}>
            {availableHours.map((slot, index) => (
              <TouchableOpacity style={styles.timeslots}>
                <Text key={index} style={styles.timeslot}>
                  {slot.from} - {slot.to}
                </Text>
              </TouchableOpacity>
            ))}

            {availableHours.length < 1 && <Text style={styles.timeslot}>No allocated hours</Text>}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {doctorData?.bio ||
              "Unites experienced, compassionate doctors across specialties, offering personalized care, advanced treatments. See more........."}
          </Text>
        </View>
      </ScrollView>

      {/* Book Appointment Button */}
      <View style={styles.bookingContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DoctorDetails;
