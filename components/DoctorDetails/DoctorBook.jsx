import React, { useState, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { BACKEND_PORT } from "@env";
import styles from "./styles/doctorBook";
import Icon from "../../constants/icons";
import { COLORS } from "../../constants";
import DoctorCard from "../home/DoctorCard";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Yup from "yup";
import Toast from "react-native-toast-message";

const DoctorBook = ({ sendDataToParent, routeParams }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params || routeParams;
  const { doctor, selectedDate: passedDate, selectedDay: passedDay, selectedDateObj } = params;

  const genders = [
    { id: 1, name: "Male" },
    { id: 2, name: "Female" },
    { id: 3, name: "Others" },
  ];

  const [doctorData, setDoctorData] = useState(doctor || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(passedDate || null);
  const [selectedDay, setSelectedDay] = useState(passedDay || "");
  const [currentMonth, setCurrentMonth] = useState("");
  const [availableHours, setAvailableHours] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState(selectedDateObj || new Date());

  const [show, setShow] = useState(false);
  const [mode, setMode] = useState("date");
  const [uploading, setUploading] = useState(false);
  const [hourlySlots, setHourlySlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const isPastDate = age && new Date(age).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
  const isDayUnavailable = hourlySlots.length === 0;
  const isBookDisabled = isPastDate || isDayUnavailable;

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

  const onChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) setAge(selectedDate);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const handleContinueBook = () => {
    // if (!firstName || !lastName || !age || !gender) {
    //   // alert("Please fill all the fields.");
    //   Toast.show({
    //     text1: "Please fill all the fields.",
    //     type: "error",
    //   });
    //   return;
    // }
    const doctorData = doctor?._id;

    let bookingData = {
      firstName,
      lastName,
      age,
      gender,

      selectedTime,
      selectedDate,
      doctorData,
    };

    const estimatedAmount = doctor?.consultationFee;

    // You can send data or navigate here
    console.log("Booking data: ", { bookingData });

    navigation.navigate("Checkout", { bookingData, estimatedAmount });
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
            <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.buttonWrap1}>
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

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Gender</Text>
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

              <View style={{ marginTop: 20 }}>
                <Text style={styles.label}>Date of birth</Text>
                <TouchableOpacity style={[styles.dateBox, styles.input]} onPress={showDatepicker}>
                  <Text>{age.toDateString()}</Text>
                  <Icon name="calendar" size={15} />
                </TouchableOpacity>
                {show && (
                  <DateTimePicker testID="dateTimePicker" value={age} mode={mode} is24Hour={true} onChange={onChange} />
                )}
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
                  <Text style={styles.timeslotH}>No allocated hours</Text>
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
