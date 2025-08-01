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

const Checkout = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { estimatedAmount = 200, bookingData, totals, additionalFees } = route.params;
  const { userData, userLogin } = useContext(AuthContext);
  const { clearCart } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //user loggin chexks
  // useEffect(() => {
  //   if (!userLogin) {
  //     setUserId(1);
  //     navigation.navigate("Login");
  //     return;
  //   } else if (userData && userData?._id) {
  //     setUserId(userData?._id);
  //   }
  // }, [userLogin, userData]);

  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [finalPhoneNumber, setfinalPhoneNumber] = useState("");
  const [email, setEmail] = useState(userData ? userData?.email : "");
  const [allcountries, setallCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState(allcountries);

  const [moreDescription, setmoreDescription] = useState("");

  const [userId, setUserId] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  //phone number check on checkout

  const checkoutSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9]+$/, "Phone number must contain only digits"),
  });

  useEffect(() => {
    if (phoneNumber) {
      checkoutSchema
        .validate({ phoneNumber })
        .then(() => setPhoneError(""))
        .catch((err) => setPhoneError("Please fill phone Number field"));
    }
  }, [phoneNumber]);

  //fetch stock availability

  const handleNext = () => {
    switch (step) {
      case 3:
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
    if (step > 3) {
      setStep(step);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitOrder = async (paymentInfo) => {
    const orderData = {
      userId,
      bookingData,
      paymentInfo,
      totalAmount: estimatedAmount,
      additionalFees: 0,
      subtotal: estimatedAmount + additionalFees,
    };

    console.log("orderDATA", orderData);

    handleNext(); // This moves to the next step in the UI

    console.log(orderData);
    // return;

    try {
      setIsLoading(true);
      setErrorState(false);

      const response = await axios.post(`${BACKEND_PORT}/api/bookings`, orderData);

      setBookingId(response.data.booking.bookingId);
      setSuccess(true);

      // Only proceed with next steps if the order creation was successful
      if (response.data.success) {
        clearCart();

        navigation.navigate("OrderSuccess", { orderId: response.data.booking.orderId });
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
    const filtered = allcountries.filter((country) => {
      return country?.en?.toLowerCase().includes(query?.toLowerCase());
    });
    setFilteredCountries(filtered);
    // console.log(filtered);
  };

  const onChangeText = ({ dialCode, unmaskedPhoneNumber, phoneNumber, isVerified }) => {
    setPhoneNumber(unmaskedPhoneNumber);

    if (unmaskedPhoneNumber.length < 6) {
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
              <TextInput style={styles.searchInput} placeholder="Search Country" onChangeText={handleSearch} />
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
            </View>
            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>Just a couple of steps and you good to go</Text>
            </View>
          </View>

          <View style={styles.lowerRow}>
            <ScrollView>
              {step === 1 && (
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
                        <Text style={styles.label}>Additional Instructions</Text>
                        <TextInput
                          style={styles.descriptionInput}
                          placeholder="Additional Instructions"
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
                            Consultation Amount: Ksh {Number(estimatedAmount).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.next2wrapper}>
                      <TouchableOpacity onPress={handlePrevious} style={styles.previous} disabled={!bookingData}>
                        <Text>
                          <Icon name="backbutton" size={36} />
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleNext} style={styles.next2}>
                        <Text style={styles.buttonText}>Next step</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                </View>
              )}

              {step === 2 && (
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

              {step === 3 && !isLoading && errorState && (
                <View style={styles.containLottie}>
                  <View style={styles.animationWrapper}>
                    <LottieView
                      source={require("../assets/data/failed.json")}
                      autoPlay
                      loop={false}
                      style={styles.animation}
                    />
                    <Text style={styles.errorMessage}>{"Sorry request failed \n Please try again later"}</Text>
                    {console.log(errorMessage)}
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
              {step === 3 && !errorState && isLoading && (
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
