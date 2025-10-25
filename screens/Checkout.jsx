import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  FlatList,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../constants/icons";
import { SIZES, COLORS } from "../constants";
import { useCart } from "../contexts/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../components/auth/AuthContext";
import * as Yup from "yup";
import IntlPhoneInput from "react-native-intl-phone-input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import styles from "../components/styles/checkout";

import CheckoutStep3 from "./Payments";
import LottieView from "lottie-react-native";
import { BACKEND_PORT } from "@env";
import axios from "axios";
import Toast from "react-native-toast-message";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { ArrowBigLeftIcon, ArrowLeftIcon, ChevronLeft, ChevronRightIcon } from "lucide-react-native";

const Checkout = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { estimatedAmount = 0, bookingData, additionalFees } = route.params;
  const { userData, userLogin } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [consultationType, setConsultationType] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // user loggin chexks
  useEffect(() => {
    if (!userLogin || !userData) {
      setUserId(1);
      navigation.navigate("Login");
      return;
    } else if (userData && userData?._id) {
      setUserId(userData?._id);
    }
  }, [userLogin, userData]);

  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [finalPhoneNumber, setfinalPhoneNumber] = useState("");
  const [email, setEmail] = useState(userData ? userData?.email : "");
  const [allcountries, setallCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState(allcountries);
  const [moreDescription, setmoreDescription] = useState("");
  const [userId, setUserId] = useState(null);
  const [phoneError, setPhoneError] = useState(true);

  const showToast = (type, text1, text2 = "") => {
    Toast.show({
      type,
      text1,
      text2,
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
  };

  //phone number check on checkout

  const checkoutSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .min(8, "Phone number must be more than 9 digits")
      .matches(/^[0-9]+$/, "Phone number must contain only digits"),
  });

  useEffect(() => {
    if (phoneNumber) {
      checkoutSchema
        .validate({ phoneNumber })
        .then(() => setPhoneError(false))
        .catch((err) => setPhoneError("Please fill phone Number field"));
    }
  }, [phoneNumber]);

  const handleNext = () => {
    // console.log(phoneError, finalPhoneNumber);
    switch (step) {
      case 2:
        // Example usage in handleNext
        if (phoneError) {
          showToast("error", "Please fill phone number", "");
          return;
        }

        setStep(step + 1);

        break;
      case 4:
        setStep(step);
        break;
      default:
        if (bookingData) {
          setStep(step + 1);
        } else {
          setStep(step);
        }
    }
  };

  const getPhoneMeta = (number, defaultDialCode = "+254") => {
    if (!number) {
      return {
        dialCode: `+254`,
        country: "KE",
        nationalNumber: "",
        isValid: true,
      };
    }

    // If number doesn't start with +, clean + inject dial code
    const formattedNumber = number.startsWith("+") ? number : `${defaultDialCode}${number.replace(/^0/, "")}`;

    const parsed = parsePhoneNumberFromString(formattedNumber);

    if (!parsed) return null;

    return {
      dialCode: `+${parsed.countryCallingCode}`,
      country: parsed.country,
      nationalNumber: parsed.nationalNumber,
      isValid: parsed.isValid(),
    };
  };

  const handlePrevious = () => {
    if (step > 4) {
      setStep(step);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitOrder = async (paymentInfo) => {
    const orderData = {
      // For Appointment
      user: userData?._id,
      doctor: bookingData.doctorData,
      consultationType: consultationType,
      appointmentDate: `${bookingData.selectedDateObj}`,
      appointmentTime: `${bookingData?.selectedTime}`,
      userNotes: `${bookingData.firstName} ${bookingData.lastName} | Gender: ${bookingData.gender} | Age: ${bookingData?.userAge}, ${moreDescription}`,

      // For Transaction
      userSnapshot: {
        username: userData?.username,
        email: userData?.email,
        phone: paymentInfo.phoneNumber,
      },
      amount: estimatedAmount,
      paymentMethod: paymentInfo.selectedPaymentMethod,
      phoneNumber: paymentInfo.phoneNumber,
      paypalEmail: paymentInfo.email,
      cardInfo: {
        cardNumber: paymentInfo.cardNumber,
        cvv: paymentInfo.cvv,
        expiry: paymentInfo.expiryDate,
        nameOnCard: paymentInfo.nameOnCard,
      },

      paymentResponse: {},
    };

    handleNext();

    try {
      setIsLoading(true);
      setErrorState(false);
      console.log(BACKEND_PORT, orderData);

      // return;

      const response = await axios.post(`${BACKEND_PORT}/api/v1/appointment`, orderData);

      setBookingId(response.data?.bookingId);
      setSuccess(true);

      // Only proceed with next steps if the order creation was successful
      if (response.data.success && response.status === 201) {
        navigation.navigate("OrderSuccess", { orderId: response.data?.bookingId });
      } else {
        setErrorMessage(response.data.message || "Unknown error occurred");

        // console.log(response);
        setErrorState(true);
      }
    } catch (error) {
      setErrorMessage(error.message || "An error occurred");
      setErrorState(true);
      // console.error("Error submitting order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateWhere = (locate) => {
    if (step > 1) {
      handlePrevious();
    } else {
      navigation.goBack();
    }
  };

  const handleSearch = (query) => {
    const test = "";
    const filtered = allcountries.filter((country) => {
      return country?.en?.toLowerCase().includes(query?.toLowerCase());
    });
    setFilteredCountries(filtered);
    // console.log(filtered);
  };

  const onChangeText = ({ dialCode, unmaskedPhoneNumber, phoneNumber, isVerified }) => {
    setPhoneNumber(unmaskedPhoneNumber);
    // console.log("changing", unmaskedPhoneNumber.length, isVerified);

    if (unmaskedPhoneNumber.length < 8) {
      setPhoneError(true);
    } else {
      setPhoneError(false);
      setfinalPhoneNumber(`${dialCode}${unmaskedPhoneNumber}`);
    }
  };

  const renderCustomModal = (modalVisible, countries, onCountryChange) => {
    // console.log(modalVisible);
    setallCountries(countries);
    countries.forEach((countr) => {
      // console.log(countr.code);
    });

    return (
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View style={styles.modalContainer}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Type to search country ..."
                onChangeText={handleSearch}
              />
              <Text style={styles.searchIcon}>🔍</Text>
            </View>

            {/* Country List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onCountryChange(item.code);

                    // console.log(item.code);
                  }}
                >
                  <View style={styles.countryItem}>
                    <Text style={styles.flag}>{item.flag}</Text>
                    <Text style={styles.countryName}>{item.en}</Text>
                    <Text style={styles.countryCode}>{item.dialCode}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                this.phoneInput.hideModal();
                setFilteredCountries(countries);
              }}
            >
              <Text style={styles.closeButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.upperRow}>
            <View style={styles.upperButtons}>
              <TouchableOpacity onPress={navigateWhere} style={[styles.backBtn, styles.buttonWrap]}>
                <Icon name="backbutton" size={26} />
              </TouchableOpacity>
              <Text style={styles.topheading}>Checkout</Text>
            </View>
            <View style={styles.paginationContainer}>
              <View style={styles.dot(step === 1 ? COLORS.themey : COLORS.themeg)} />
              <View style={styles.dot(step === 2 ? COLORS.themey : COLORS.themeg)} />
              <View style={styles.dot(step === 3 ? COLORS.themey : COLORS.themeg)} />
            </View>
            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>Just a couple of steps and you good to go</Text>
            </View>
          </View>

          <View style={styles.lowerRow}>
            <ScrollView>
              {step === 1 && (
                <View style={styles.stepContainer}>
                  <View style={styles.deliveryMethod}>
                    <Text style={styles.deliveryHead}>Choose Consultation Type</Text>

                    {/* Consultation Options */}
                    <View style={styles.deliveryOptions}>
                      <TouchableOpacity
                        style={[
                          styles.optionCard,
                          consultationType === "office" && { borderColor: "#FF6A6B", backgroundColor: COLORS.themeg },
                        ]}
                        onPress={() => setConsultationType("office")}
                      >
                        <View style={styles.flexme}>
                          <Icon name="isometric" size={21} />
                          <Text style={[styles.optionTitle, consultationType === "office" && styles.selectedText]}>
                            Office Visit
                          </Text>
                        </View>
                        <Text style={[styles.optionDescription, consultationType === "office" && styles.selectedText]}>
                          Meet a doctor in person at our facility for a face-to-face consultation.
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.optionCard,
                          consultationType === "remote" && { borderColor: "#30B2FE", backgroundColor: COLORS.themeg },
                        ]}
                        onPress={() => setConsultationType("remote")}
                      >
                        <View style={styles.flexme}>
                          <Icon name="isometric3" size={21} />
                          <Text style={[styles.optionTitle, consultationType === "remote" && styles.selectedText]}>
                            Remote Call
                          </Text>
                        </View>
                        <Text style={[styles.optionDescription, consultationType === "remote" && styles.selectedText]}>
                          Have a remote voice or video consultation with a doctor from anywhere.
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.optionCard,
                          consultationType === "labtest" && { borderColor: "#78D966", backgroundColor: COLORS.themeg },
                        ]}
                        onPress={() => setConsultationType("labtest")}
                      >
                        <View style={styles.flexme}>
                          <Icon name="isometric2" size={21} />
                          <Text style={[styles.optionTitle, consultationType === "labtest" && styles.selectedText]}>
                            Laboratory Test
                          </Text>
                        </View>
                        <Text style={[styles.optionDescription, consultationType === "labtest" && styles.selectedText]}>
                          Book laboratory tests or diagnostics at our partner facilities.
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.optionCard,
                          consultationType === "follow" && { borderColor: "#f900ff", backgroundColor: COLORS.themeg },
                        ]}
                        onPress={() => setConsultationType("follow")}
                      >
                        <View style={styles.flexme}>
                          <Icon name="isometric4" size={21} />
                          <Text style={[styles.optionTitle, consultationType === "follow" && styles.selectedText]}>
                            Follow up
                          </Text>
                        </View>
                        <Text style={[styles.optionDescription, consultationType === "follow" && styles.selectedText]}>
                          Request for a follow up for a previous consultation booking.
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Navigation Buttons */}
                    <View style={styles.next2wrapper}>
                      <TouchableOpacity onPress={handlePrevious} style={styles.previous}>
                        <ChevronLeft name="backbutton" size={30} color={COLORS.themew} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleNext} style={styles.next2} disabled={!consultationType}>
                        <Text style={styles.buttonText}>Next step</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              {step === 2 && (
                <View style={styles.stepContainer}>
                  {phoneError && <Text style={styles.error}>{phoneError}</Text>}

                  <>
                    <View style={styles.shippingContainer}>
                      <Text style={styles.label}>Phone Number</Text>
                      <View style={[styles.input2, phoneError ? styles.errorb : styles.successb]}>
                        <IntlPhoneInput
                          placeholder={getPhoneMeta(finalPhoneNumber)?.nationalNumber || ""}
                          ref={(ref) => (phoneInput = ref)}
                          customModal={renderCustomModal}
                          defaultCountry={getPhoneMeta(finalPhoneNumber)?.country || ""}
                          lang="EN"
                          onChangeText={onChangeText}
                          flagStyle={styles.flagWidth}
                          containerStyle={styles.input22}
                        />
                      </View>

                      <View style={styles.instructions}>
                        <Text style={styles.label}>Patient's Medical Note (issue)</Text>
                        <TextInput
                          style={styles.descriptionInput}
                          placeholder="Appointment note"
                          value={moreDescription}
                          onChangeText={(text) => setmoreDescription(text)}
                          multiline
                        />
                      </View>
                      <View style={styles.stepContainer}>
                        <View style={styles.stepContainerInner}>
                          <Icon name="stethoscope" size={26} />
                        </View>

                        <View style={{ width: SIZES.width - 27 }}></View>

                        <View>
                          <Text style={styles.amount}>
                            Payment Amount: Ksh {Number(estimatedAmount).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.next2wrapper}>
                      <TouchableOpacity onPress={handleNext} style={styles.next2}>
                        <Text style={styles.buttonText}>Next step</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleNext} style={styles.previous} disabled={!bookingData}>
                        <ChevronRightIcon size={30} color={COLORS.themew} />
                      </TouchableOpacity>
                    </View>
                  </>
                </View>
              )}

              {step === 3 && (
                <>
                  <View style={styles.stepContainer}>
                    <CheckoutStep3
                      onPrevious={handlePrevious}
                      onNext={handleNext}
                      phoneNumber={finalPhoneNumber}
                      totalAmount={estimatedAmount}
                      handleSubmitOrder={handleSubmitOrder}
                      email={email}
                    />
                  </View>
                </>
              )}

              {step === 4 && !isLoading && errorState && (
                <View style={styles.containLottie}>
                  <View style={styles.animationWrapper}>
                    <LottieView
                      source={require("../assets/data/failed.json")}
                      autoPlay
                      loop={false}
                      style={styles.animation}
                    />
                    <Text style={styles.errorMessage}>{"Sorry request failed \n Please try again later"}</Text>
                    {/* {console.log(errorMessage)} */}
                  </View>
                  <TouchableOpacity
                    style={styles.buttonHome}
                    onPress={() =>
                      navigation.navigate("Bottom Navigation", {
                        screen: "Home",
                        params: { refreshList: true },
                      })
                    }
                  >
                    <Text style={styles.buttonText}>Back to home</Text>
                  </TouchableOpacity>
                </View>
              )}
              {step === 4 && !errorState && isLoading && (
                <View style={styles.containLottie}>
                  <View style={styles.animationWrapper}>
                    <LottieView
                      source={require("../assets/data/loading.json")}
                      autoPlay
                      loop={true}
                      style={styles.animation}
                    />
                    <Text style={styles.errorMessage}>{"Submitting order"}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Checkout;
