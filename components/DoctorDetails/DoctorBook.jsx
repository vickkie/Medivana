import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
// import { BACKEND_PORT } from "@env";
import styles from "./styles/doctorBook";
import Icon from "../../constants/icons";
import { COLORS } from "../../constants";
import DoctorCard from "../home/DoctorCard";
import Toast from "react-native-toast-message";
import { AuthContext } from "../auth/AuthContext";
import { ChevronLeft, ChevronRightIcon } from "lucide-react-native";

const DoctorBook = ({ sendDataToParent, routeParams }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params || routeParams;
  const { doctor } = params;

  const genders = [
    { id: 1, name: "Male" },
    { id: 2, name: "Female" },
    { id: 3, name: "Others" },
  ];

  const { userData } = useContext(AuthContext);

  const [doctorData, setDoctorData] = useState(doctor || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // console.log(userData);

  const [isUpdating, setIsUpdating] = useState(false);
  const [firstName, setFirstName] = useState(userData?.personalDetails?.firstname || "");
  const [lastName, setLastName] = useState(userData?.personalDetails?.lastname || "");
  const [gender, setGender] = useState(
    userData?.personalDetails?.gender
      ? userData.personalDetails.gender.charAt(0).toUpperCase() + userData.personalDetails.gender.slice(1)
      : ""
  );

  const [age, setAge] = useState(18);

  const [show, setShow] = useState(false);
  const [mode, setMode] = useState("date");
  const [uploading, setUploading] = useState(false);
  const [hourlySlots, setHourlySlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isPastDate, setPastDate] = useState(false);

  const isDayUnavailable = hourlySlots.length === 0;
  const isBookDisabled = isDayUnavailable;

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

  //test dates pickup
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

  const updateAvailableHours = (dayName) => {
    if (!dayName) return;

    const available = doctorData?.availability?.find((d) => d.day?.toLowerCase() === dayName.toLowerCase());

    const slots = available?.timeSlots || [];
    setAvailableHours(slots);

    // Extract hourly slots from time ranges
    const hours = [];

    slots.forEach((slot) => {
      const [fromHour, fromMinute] = slot.from.split(":").map(Number);
      const [toHour, toMinute] = slot.to.split(":").map(Number);

      for (let hour = fromHour; hour < toHour; hour++) {
        const formatted = `${hour.toString().padStart(2, "0")}:00`;
        hours.push(formatted);
      }
    });

    setHourlySlots(hours);
  };

  useEffect(() => {
    updateAvailableHours(selectedDay);
  }, [doctorData, selectedDay]);

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

  const handleContinueBook = () => {
    if (!firstName || !lastName || !age || !gender) {
      // alert("Please fill all the fields.");
      Toast.show({
        text1: "Please fill all the fields.",
        type: "error",
      });
      return;
    }
    const doctorData = doctor?._id;

    // Check if any required field is empty, null, or not selected
    if (
      !firstName ||
      !lastName ||
      !age ||
      !gender ||
      !selectedTime ||
      !selectedDate ||
      !selectedDateObj ||
      !doctorData
    ) {
      Toast.show({
        text1: "Please fill all the fields and select a timeslot.",
        type: "error",
      });
      return;
    }
    let bookingData = {
      firstName,
      lastName,
      userAge: age,
      gender,
      selectedTime,
      selectedDate,
      selectedDateObj,
      doctorData,
    };

    const estimatedAmount = doctor?.consultationFee;

    navigation.navigate("Checkout", { bookingData, estimatedAmount });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.themey} />
      <SafeAreaView style={styles.container}>
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
            <TouchableOpacity onPress={() => {}} style={styles.buttonWrap1}>
              <Icon size={26} name="bellfilled" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <DoctorCard doctor={doctorData} showBook={false} />

          <View style={styles.bookForm}>
            <View style={styles.form}>
              <Text style={[styles.label, { color: COLORS.themey }]}>Patient details</Text>
              <View>
                <View style={styles.rowNames}>
                  <TextInput
                    style={styles.inputH}
                    placeholder="First name"
                    value={firstName}
                    onChangeText={setFirstName}
                  />

                  <TextInput
                    style={styles.inputH}
                    placeholder="Last name"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
              <View style={styles.rowNames}>
                <View style={[styles.pickerWrapper, { width: "53%" }]}>
                  <Text style={styles.pickerLabel}>Patient Gender</Text>
                  <View style={styles.pickerwrapp}>
                    <Picker
                      selectedValue={gender}
                      onValueChange={(itemValue) => setGender(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select gender" value={""} />
                      {genders.map((g) => (
                        <Picker.Item key={g.id} label={g.name} value={g.name} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View style={{ marginTop: 0, width: "40%" }}>
                  <Text style={styles.label}>Patient Age</Text>
                  <View style={{ flexDirection: "column", alignItems: "center" }}>
                    <TextInput
                      style={[styles.inputH, { width: "100%", textAlign: "center" }]}
                      value={String(age)}
                      onChangeText={(value) => {
                        // Only allow numbers
                        let num = value.replace(/[^0-9]/g, "");
                        // Convert to number and clamp between 1 and 100
                        let number = parseInt(num);
                        if (isNaN(number)) number = 1;
                        if (number < 1) number = 1;
                        if (number > 100) number = 100;
                        setAge(number);
                      }}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                </View>
              </View>

              <View style={[styles.pickerWrapper, { marginTop: 10 }]}>
                <Text style={styles.pickerLabel}>Appointment date</Text>
                <TextInput
                  editable={false}
                  style={[styles.inputH, { color: COLORS.themeb }]}
                  placeholder="Selected Date"
                  value={formatDate(selectedDateObj)} // use the formatter here
                />
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
                        updateMonthName(updatedDays);
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
                    <Text style={[styles.timeslot, { fontFamily: "bold", color: COLORS.themey }]}>
                      No allocated hours
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.slotsHolderH}>
                <Text style={styles.pickerLabel}>Select Time</Text>
                {hourlySlots.length > 0 ? (
                  <FlatList
                    data={hourlySlots}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.timeslotsH, selectedTime === item && { backgroundColor: COLORS.primary }]}
                        onPress={() => setSelectedTime(item)}
                      >
                        <Text
                          style={[styles.timeslotH, selectedTime === item && { color: "#fff", fontWeight: "bold" }]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <View style={{ background: COLORS.themeg, paddingVertical: 10 }}>
                    <Text style={styles.timeslotH2}>No allocation hours</Text>
                    <Text style={styles.timeslotH2}>Pick available day/month</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.bookingContainer}>
          <TouchableOpacity
            style={[styles.bookButton, isBookDisabled && { backgroundColor: COLORS.themeg }]}
            onPress={handleContinueBook}
            disabled={isBookDisabled}
          >
            {uploading ? (
              <ActivityIndicator size={30} color={COLORS.themew} />
            ) : (
              <Text style={[styles.submitText, isBookDisabled && { color: COLORS.warning }]}>
                {isBookDisabled ? "Booking Unavailable" : "Book now"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

export default DoctorBook;
