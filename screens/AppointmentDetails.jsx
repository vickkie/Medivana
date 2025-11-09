"use client";

import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../constants/icons";
import { SIZES, COLORS } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../components/auth/AuthContext";
import axios from "axios";
import { BACKEND_PORT } from "@env";
import {
  Calendar,
  CalendarCogIcon,
  CircleUser,
  Clock2Icon,
  Hospital,
  Mail,
  MailX,
  PhoneCall,
  UserCheckIcon,
} from "lucide-react-native";
import LottieView from "lottie-react-native";

const AppointmentDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  if (!route?.params?.id) {
    console.warn("No appointment ID passed to this screen");
    return null;
  }
  const appointmentId = route.params.id;
  const { userData, userLogin } = useContext(AuthContext);

  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      navigation.navigate("Login");
      return;
    }
    fetchAppointmentDetails();
  }, [appointmentId, userLogin]);

  const fetchAppointmentDetails = async () => {
    try {
      setIsLoading(true);
      setErrorState(false);

      const response = await axios.get(`${BACKEND_PORT}/api/v1/appointment/by/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${userData?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        // console.log(appointmentId);
        setAppointment(response.data.appointment);
      } else {
        setErrorState(true);
        setErrorMessage("Failed to fetch appointment details");
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      setErrorState(true);
      setErrorMessage(error.response?.data?.message || "Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getAppointmentStatus = () => {
    if (!appointment) return { text: "Unknown", color: COLORS.gray, bgColor: "#f0f0f0" };

    if (appointment.isCancelled) {
      return { text: "Cancelled", color: "#B65454", bgColor: "#F3D0CE" };
    }
    if (appointment.isFinished) {
      return { text: "Completed", color: "#26A532", bgColor: "#CBFCCD" };
    }
    if (appointment.isConfirmed) {
      return { text: "Confirmed", color: "#337DE7", bgColor: "#C0DAFF" };
    }
    return { text: "Pending", color: "#D4641B", bgColor: "#ffedd2" };
  };

  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleCallPress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleCancelAppointment = () => {
    Alert.alert("Cancel Appointment", "Are you sure you want to cancel this appointment?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: cancelAppointment },
    ]);
  };

  const cancelAppointment = async () => {
    try {
      setIsLoading(true);
      const response = await axios.patch(
        `${BACKEND_PORT}/api/v1/appointment/${appointmentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userData?.Token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setAppointment((prev) => ({ ...prev, isCancelled: true }));
        Alert.alert("Success", "Appointment cancelled successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to cancel appointment");
    } finally {
      setIsLoading(false);
    }
  };
  // console.log(appointment?.doctorSnapshot);

  const DoctorInfoComponent = ({ doctor }) => (
    <View style={styles.doctorInfoContainer}>
      <View style={styles.doctorHeader}>
        <TouchableOpacity onPress={() => navigation.navigate("DoctorDetails", { doctor: doctor })}>
          <Image
            source={{ uri: doctor?.profilePicture || appointment?.doctorSnapshot?.profilePicture }}
            style={styles.doctorImage}
          />
        </TouchableOpacity>

        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>Dr. {doctor?.fullName || appointment?.doctorSnapshot?.fullName}</Text>
          <Text style={styles.doctorSpecialization}>{doctor?.specialization?.name || "General Practice"}</Text>
          <Text style={styles.doctorLocation}>{doctor?.location || appointment?.doctorSnapshot?.email}</Text>
          {doctor?.isVerified && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 3,
              }}
            >
              <Image
                source={require("../assets/images/verified.png")}
                style={{ width: 23, height: 23, marginRight: 1 }}
                resizeMode="contain"
              />
              <Text style={{ color: COLORS.success, fontSize: 13, fontWeight: "600" }}>Verified </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.consultationFee}>
        <Text style={styles.feeTitle}>Consultation Fee</Text>
        <Text style={styles.feeAmount}>
          {new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
          }).format(doctor?.consultationFee)}
        </Text>
      </View>
    </View>
  );

  const AppointmentInfoComponent = ({ appointment }) => (
    <View style={styles.appointmentInfoContainer}>
      <View style={styles.inputWrapper}>
        <CalendarCogIcon name="calendar" size={26} style={styles.iconStyle} color={COLORS.themey} />
        <Text style={styles.appointmentText}>{formatDate(appointment.appointmentDate)}</Text>
      </View>

      <View style={styles.inputWrapper}>
        <Clock2Icon name="clock" size={26} style={styles.iconStyle} color={COLORS.themey} />
        <Text style={styles.appointmentText}>{appointment?.appointmentTime}</Text>
      </View>

      <View style={styles.inputWrapper}>
        <Hospital name="Hospital" size={26} style={styles.iconStyle} color={COLORS.themey} />
        <Text style={styles.appointmentText}>
          {{
            labtest: "Lab Test",
            office: "In-person Visit",
            remote: "Virtual Consultation",
            follow: "Follow-up",
            general: "General Consultation",
          }[appointment?.consultationType] || "Other"}
        </Text>
      </View>

      <View style={styles.inputWrapper}>
        <Mail name="email" size={26} style={styles.iconStyle} color={COLORS.themey} />
        <Text style={styles.appointmentText}>{appointment.user.email}</Text>
      </View>

      {appointment.userNotes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Patient Notes</Text>
          <Text style={styles.notesText}>{appointment.userNotes}</Text>
        </View>
      )}
      {appointment?.doctorNotes && (
        <View
          style={[
            styles.notesContainer,
            {
              backgroundColor: "",
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: COLORS.themey,
            },
          ]}
        >
          <Text style={styles.notesTitle}>Doctor Notes</Text>
          <Text style={styles.notesText}>{appointment?.doctorNotes}</Text>
        </View>
      )}

      {/* {console.log(appointment)} */}
      {appointment?.rejectionReason && (
        <View
          style={[
            styles.notesContainer,
            {
              backgroundColor: "#fbf4f4",
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: "#991b1b",
              borderColor: "#991b1b",
            },
          ]}
        >
          <Text style={styles.notesTitle}>Cancellation Details</Text>
          <Text style={styles.notesText}>{appointment?.rejectionReason}</Text>
        </View>
      )}

      {Array.isArray(appointment.doctorReportPdf) && appointment.doctorReportPdf.length > 0 && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Doctor PDF Reports</Text>
          {appointment.doctorReportPdf.map((pdfUrl, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.pdfLinkContainer}
              onPress={() => {
                if (pdfUrl) {
                  Linking.openURL(pdfUrl);
                }
              }}
            >
              <Text style={styles.pdfLinkText}>Download Report {idx + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.containLottie}>
            <View style={styles.animationWrapper}>
              <LottieView source={require("../assets/data/loading.json")} autoPlay loop style={styles.animation} />
            </View>
            <View style={{ marginTop: -20, paddingBottom: 10 }}>
              <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium, textAlign: "center" }}>
                Loading your appointment
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (errorState) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={50} color={COLORS.red} />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAppointmentDetails}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Appointment not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = getAppointmentStatus();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.upperRow}>
            <View style={styles.upperButtons}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
                <Icon name="backbutton" size={26} />
              </TouchableOpacity>

              <Text style={styles.topheading}>Appointment Details</Text>

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ReceiptScreen", {
                    appointment: appointment,
                  });
                }}
                style={styles.outWrap}
              >
                <Icon name="receipt" size={28} />
              </TouchableOpacity>
            </View>

            <Text style={styles.bookingId}>Booking ID: {appointment.bookingId}</Text>

            <TouchableOpacity style={[styles.statusContainer, { backgroundColor: status.bgColor }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContainer}>
            <View style={styles.lowerRow}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Medic Information</Text>
                <DoctorInfoComponent doctor={appointment.doctor} />
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Appointment Information</Text>
                <AppointmentInfoComponent appointment={appointment} />
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Contact Doctor</Text>
                <View style={styles.contactContainer}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleEmailPress(appointment?.doctor?.email || appointment?.doctorSnapshot?.email)}
                  >
                    <Mail name="email" size={20} color={COLORS.white} />
                    <Text style={styles.contactButtonText}>Email Doctor</Text>
                  </TouchableOpacity>

                  {appointment && (
                    <TouchableOpacity
                      style={styles.contactButton}
                      onPress={() =>
                        handleCallPress(appointment?.doctor?.phoneNumber || appointment?.doctorSnapshot?.phoneNumber)
                      }
                    >
                      <PhoneCall name="call" size={20} color={COLORS.white} />
                      <Text style={styles.contactButtonText}>Call Doctor</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {!appointment.isCancelled && !appointment.isFinished && (
                <View style={styles.actionContainer}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancelAppointment}>
                    <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.bottomSpacing} />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AppointmentDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    flexDirection: "column",
  },
  upperRow: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 999,
    minHeight: 150,
    paddingBottom: 10,
  },
  topheading: {
    fontFamily: "bold",
    fontSize: SIZES.large,
  },
  upperButtons: {
    width: SIZES.width - 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SIZES.xSmall,
    top: SIZES.xxSmall,
    height: SIZES.xxLarge * 1.4,
  },
  backBtn: {
    left: 10,
    position: "absolute",
    top: 3,
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
  },
  outWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 10,
  },
  bookingId: {
    fontFamily: "medium",
    color: COLORS.themeb,
    fontSize: SIZES.medium,
    marginBottom: 5,
    zIndex: 4,
  },
  statusContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.medium,
    marginVertical: 5,
  },
  statusText: {
    fontWeight: "600",
    fontSize: SIZES.medium,
  },
  stepsheader: {
    paddingVertical: 10,
    textAlign: "left",
    justifyContent: "flex-start",
  },
  stepstext: {
    fontFamily: "lufgaLight",
    color: COLORS.gray2,
    fontSize: SIZES.small + 4,
  },
  scrollContainer: {
    marginTop: 160,
  },
  lowerRow: {
    // backgroundColor: COLORS.themew,
    width: SIZES.width - 20,
    marginStart: 0,
    borderRadius: SIZES.medium,
    paddingHorizontal: 3,
  },
  sectionContainer: {
    backgroundColor: COLORS.themew,
    width: SIZES.width - 20,
    marginStart: 5,
    borderRadius: SIZES.medium,
    paddingHorizontal: 3,
    marginTop: 10,
    paddingVertical: 10,
  },
  sectionHeader: {
    fontFamily: "bold",
    fontSize: SIZES.medium + 4,
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: COLORS.gray,
  },
  doctorInfoContainer: {
    paddingHorizontal: 15,
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    objectFit: "contain",
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontFamily: "bold",
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: 5,
  },
  doctorSpecialization: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginBottom: 3,
  },
  doctorLocation: {
    fontFamily: "regular",
    fontSize: SIZES.small + 5,
    color: COLORS.gray2,
    marginBottom: 3,
  },
  doctorExperience: {
    fontFamily: "regular",
    fontSize: SIZES.small + 5,
    color: COLORS.gray2,
  },
  doctorBio: {
    marginBottom: 15,
  },
  bioTitle: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    marginBottom: 5,
    color: COLORS.gray,
  },
  bioText: {
    fontFamily: "regular",
    fontSize: SIZES.medium - 2,
    color: COLORS.gray,
    lineHeight: 20,
  },
  doctorQualifications: {
    marginBottom: 15,
  },
  qualificationTitle: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    marginBottom: 5,
    color: COLORS.gray,
  },
  qualificationList: {
    paddingLeft: 10,
  },
  qualificationItem: {
    fontFamily: "regular",
    fontSize: SIZES.medium - 2,
    color: COLORS.gray,
    marginBottom: 2,
  },
  doctorLanguages: {
    marginBottom: 15,
  },
  languageTitle: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    marginBottom: 8,
    color: COLORS.gray,
  },
  languageList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageTag: {
    backgroundColor: COLORS.themeg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  languageText: {
    fontFamily: "regular",
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  consultationFee: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.themeg,
  },
  feeTitle: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  feeAmount: {
    fontFamily: "bold",
    fontSize: SIZES.large,
    color: COLORS.primary,
  },
  appointmentInfoContainer: {
    paddingHorizontal: 15,
  },
  inputWrapper: {
    backgroundColor: COLORS.lightWhite,
    borderWidth: 1,
    height: 55,
    borderRadius: 12,
    flexDirection: "row",
    paddingHorizontal: 15,
    alignItems: "center",
    borderColor: "#CCC",
    width: SIZES.width - 50,
    alignSelf: "center",
    marginVertical: 5,
  },
  iconStyle: {
    marginRight: 15,
  },
  appointmentText: {
    fontFamily: "regular",
    fontSize: SIZES.medium,
    color: COLORS.gray,
    flex: 1,
  },
  notesContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: COLORS.themew,
    borderWidth: 1,
    borderColor: COLORS.themey,
    borderRadius: 10,
  },
  notesTitle: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    marginBottom: 8,
    color: COLORS.gray,
  },
  notesText: {
    fontFamily: "regular",
    fontSize: SIZES.medium - 2,
    color: COLORS.gray,
    lineHeight: 18,
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    gap: 10,
  },
  contactButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: COLORS.white,
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  actionContainer: {
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  cancelButton: {
    backgroundColor: "#B65454",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.white,
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "regular",
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    color: COLORS.warning,
    textAlign: "center",
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  bottomSpacing: {
    height: 50,
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
  pdfLinkText: {
    fontSize: SIZES.medium,
    color: COLORS.link,
    textDecorationLine: "underline",
    fontFamily: "medium",
    marginVertical: 4,
  },
});
