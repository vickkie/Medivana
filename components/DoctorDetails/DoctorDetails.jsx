import React, { useState, useEffect, useContext } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BACKEND_PORT } from "@env";
import styles from "./styles/doctorDetails";
import Icon from "../../constants/icons";
import { BlurView } from "expo-blur";
import { COLORS, SIZES } from "../../constants";
import {
  ChevronLeft,
  ChevronRightIcon,
  Clock10Icon,
  Heart,
  HeartOff,
  HeartPlus,
  MessageCircleMore,
  Star,
  UsersIcon,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { AuthContext } from "../auth/AuthContext";
import { useWish } from "../../contexts/WishContext";

const DoctorDetails = ({ sendDataToParent, routeParams }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params || routeParams;
  const { routeParam, category, doctor } = params;
  const { userLogin, userData } = useContext(AuthContext);
  const { toggleWishlistItem, isItemInWishlist } = useWish();

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
  const [selectedDateObj, setSelectedDateObj] = useState(null);
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
    setSelectedDateObj(today);
    setCurrentMonth(today.toLocaleDateString("en-US", { month: "long" }));

    updateAvailableHours(todayName);
  }, []);

  const [isUpdating, setIsUpdating] = useState(true);

  const fetchDoctorDetails = async () => {
    try {
      setIsUpdating(true);
      const response = await axios.get(`${BACKEND_PORT}/api/medic/${doctor?._id}`);
      const fetchedDoctor = response.data;

      const isDifferent = JSON.stringify(fetchedDoctor) !== JSON.stringify(doctor);

      if (isDifferent && response.status === 200) {
        setDoctorData(fetchedDoctor);
      } else {
        setError("Failed to load doctor details");
      }

      setError(null);
    } catch (err) {
      setError("Failed to load doctor details");
    } finally {
      setIsUpdating(false);
      setError(null);
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
    setSelectedDateObj(item?.dateObj);
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

  function handleShowLogin() {
    Toast.show({
      type: "error",
      text1: "Please login to book an appointment",
      position: "top",
      visibilityTime: 2000,
    });
  }

  const handleBookAppointment = () => {
    userLogin
      ? navigation.navigate("DoctorBook", {
          doctor: doctorData,
          selectedDate,
          selectedDay,
          selectedDateObj: selectedDateObj,
        })
      : handleShowLogin();
  };

  const isFavorited = isItemInWishlist(doctorData);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.upperRow}>
          {isUpdating && (
            <View style={styles.backgroundLoader}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.buttonWrap}>
            <Icon size={26} name="backbutton" />
          </TouchableOpacity>
          <Text style={styles.heading}>Medic Details</Text>
          <View style={styles.lovebuy}>
            <TouchableOpacity style={styles.buttonWrap1}>
              <Heart color={COLORS.themeg} />
            </TouchableOpacity>
          </View>
        </View>

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
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.themey} />
      <SafeAreaView style={styles.containerb}>
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
          <Text style={styles.heading}>Medic Details</Text>
          <View style={styles.lovebuy}>
            <TouchableOpacity
              onPress={() => {
                toggleWishlistItem(doctorData);
              }}
              style={styles.buttonWrap1}
            >
              {isFavorited ? <HeartPlus color={COLORS.themey} /> : <HeartOff color={COLORS.gray} />}
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
                {doctorData ? (
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>
                      {`${doctorData?.firstname} ${doctorData?.lastname}` || "Dr. Susan Lal"}
                    </Text>
                    <Text style={styles.doctorSpecialty}>{doctorData?.specialization?.name || "Bone Expert"}</Text>
                  </View>
                ) : (
                  <Text>Loading ...</Text>
                )}
                <View style={styles.flexEnd}>
                  <TouchableOpacity style={styles.actionButton}>
                    <MessageCircleMore name="chatbox" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                </View>

                <BlurView intensity={50} style={styles.blurView} />
              </View>
            </View>

            {/* Statistics */}
            <View style={styles.statsContainer}>
              {!isUpdating ? (
                <>
                  <View style={styles.statItem}>
                    <TouchableOpacity style={styles.statsb}>
                      <UsersIcon name="people-outline" size={20} color={COLORS.themeb} />
                    </TouchableOpacity>

                    <View style={styles.numberHolder}>
                      <Text style={styles.statNumber}>{doctor?.visitCount || "0"}</Text>
                      <Text style={styles.statLabel}>Visits</Text>
                    </View>
                  </View>
                  <View style={styles.statItem}>
                    <TouchableOpacity style={styles.statsb}>
                      <Star name="star-outline" size={20} color={COLORS.themeb} />
                    </TouchableOpacity>
                    <View style={styles.numberHolder}>
                      <Text style={styles.statNumber}>{doctorData ? `${doctorData?.averageRating}.0` : "0.0"}</Text>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>
                  </View>
                  <View style={styles.statItem}>
                    <TouchableOpacity style={styles.statsb}>
                      <Clock10Icon name="time-outline" size={20} color={COLORS.themeb} />
                    </TouchableOpacity>
                    <View style={styles.numberHolder}>
                      <Text style={styles.statNumber}>{`${doctorData?.yearsOfExperience} Yr+` || "6 Yr+"}</Text>
                      <Text style={styles.statLabel}>Exp</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.flexCenter}>
                  <ActivityIndicator color={COLORS.themey} size={22} />
                </View>
              )}
            </View>
          </View>

          {/* Availability Calendar */}
          <View style={styles.availabilitySection}>
            <View style={styles.availabilityHeader}>
              <Text style={styles.sectionTitle}>Availability</Text>

              <View style={styles.monthSelector}>
                <TouchableOpacity
                  onPress={() => {
                    const newOffset = weekOffset - 1;
                    setWeekOffset(newOffset);
                    const updatedDays = getWeekDays(newOffset);
                    setCalendarDays(updatedDays);
                    updateMonthName(updatedDays);
                  }}
                >
                  <ChevronLeft name="chevron-back" size={16} color={COLORS.themeb} />
                </TouchableOpacity>

                <Text style={styles.monthText}>{currentMonth}</Text>

                <TouchableOpacity
                  onPress={() => {
                    const newOffset = weekOffset + 1;
                    setWeekOffset(newOffset);
                    const updatedDays = getWeekDays(newOffset);
                    setCalendarDays(updatedDays);
                  }}
                >
                  <ChevronRightIcon name="chevron-forward" size={16} color={COLORS.themeb} />
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
                  <Text style={[styles.dayNumber, selectedDate === item.day && styles.selectedDayText]}>
                    {item.day}
                  </Text>
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

              {availableHours.length < 1 && (
                <Text style={[styles.timeslot, { fontFamily: "bold", color: COLORS.themey }]}>No allocated hours</Text>
              )}
            </View>
          </View>

          {/* About Section */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About Doctor</Text>
            <View style={styles.doctorBio}>
              <Text style={styles.bioText}>{doctorData?.bio}</Text>
            </View>

            <View style={styles.doctorQualifications}>
              <Text style={styles.sectionTitle}>Qualifications</Text>
              <View style={styles.qualificationList}>
                {doctorData?.qualifications.map((qual, index) => (
                  <Text key={index} style={styles.qualificationItem}>
                    • {qual}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.doctorLanguages}>
              <Text style={styles.languageTitle}>Languages Spoken</Text>
              <View style={styles.languageList}>
                {doctorData?.languagesSpoken.map((lang, index) => (
                  <View key={index} style={styles.languageTag}>
                    <Text style={styles.languageText}>{lang}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Book Appointment Button */}
        <View style={styles.bookingContainer}>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
            <Text style={styles.bookButtonText}>Book Appointment </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

export default DoctorDetails;
