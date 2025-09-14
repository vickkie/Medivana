import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackBtn from "../components/BackBtn";
import { Image } from "react-native";
import Button from "../components/Button";
import { Formik, validateYupSchema } from "formik";
import * as Yup from "yup";

import { COLORS, SIZES } from "../constants";
import axios from "axios";
import { BACKEND_PORT } from "@env";
import Toast from "react-native-toast-message";
import usePost2 from "../hook/usePost2";
import IntlPhoneInput from "react-native-intl-phone-input";
import { Modal } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import CustomButton from "../components/Button";
import { Eye, EyeOff, LockKeyhole, MailOpen, ScanFace } from "lucide-react-native";

const validationSchema = Yup.object().shape({
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
  email: Yup.string().email("Provide a valid email address").required("Required"),
  username: Yup.string().min(3, "Provide a valid username").required("Required"),
  phoneNumber: Yup.string()
    .min(4)
    .required("Phone number is required")
    .matches(/^\+?[0-9]+$/, "Phone number must contain only digits"),
});

const Register = ({ navigation }) => {
  const [loader, setLoader] = useState(false);
  const [obsecureText, setObsecureText] = useState(true);

  const [finalPhoneNumber, setfinalPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [allcountries, setallCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState(allcountries);
  const { responseData, setUpdateStatus, updateStatus, isLoading, error, errorMessage, postData } =
    usePost2("auth/register");

  const inValidForm = () => {
    Alert.alert("Invalid Form", "Please provide required fields", [
      {
        text: "Cancel",
        onPress: () => {},
      },
      {
        text: "Continue",
        onPress: () => {},
      },
      { defaultIndex: 1 },
    ]);
  };

  const successRegister = () => {
    Alert.alert(
      "Registration Successful",
      "You have successfully registered!",
      [
        {
          text: "OK",
          onPress: () => {
            // console.log("OK Pressed")
          },
        },
      ],
      { cancelable: false }
    );
  };

  const registerUser = async (value) => {
    setLoader(true);

    try {
      const { email, password, username, phoneNumber } = value;
      const newdata = { email, password, username, phoneNumber };

      const response = await axios.post(`${BACKEND_PORT}/auth/register`, newdata);

      if (response.status === 201) {
        // console.log(response);
        successRegister();
        navigation.navigate("Login");
      } else {
        throw new Error("Registration failed");
      }
    } catch (err) {
      Alert.alert(
        "Sorry. An error occurred",
        err.response?.data?.message || "Try again later",
        [
          {
            text: "OK",
            onPress: () => {
              setUpdateStatus(null);
            },
          },
        ],
        { cancelable: false }
      );
    } finally {
      setLoader(false);
    }
  };

  const handleSearch = (query) => {
    const filtered = allcountries.filter((country) => {
      return country?.en?.toLowerCase().includes(query?.toLowerCase());
    });
    setFilteredCountries(filtered);
  };

  const renderCustomModal = (modalVisible, countries, onCountryChange) => {
    // console.log(countries);
    setallCountries(countries);

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

  useEffect(() => {
    if (finalPhoneNumber) {
      validationSchema
        .validate({ finalPhoneNumber })
        .then(() => setPhoneError(""))
        .catch((err) => setPhoneError(err.errors[0]));
    }
  }, [finalPhoneNumber]);

  return (
    <ScrollView style={{ backgroundColor: COLORS.themew }}>
      <SafeAreaView style={{ marginHorizontal: 20 }}>
        <View>
          <BackBtn onPress={() => navigation.goBack()} />
          <Image source={require("../assets/icons/medivana-splash-light.png")} style={styles.cover} />

          <Text style={styles.title}>
            Sign up and <Text style={styles.title2}>Improve your health today</Text>
          </Text>

          <Formik
            initialValues={{
              email: "",
              password: "",
              confirmPassword: "",
              username: "",
              phoneNumber: "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => registerUser(values)}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              isLoading,
              isValid,
              setFieldTouched,
              touched,
              setFieldValue,
            }) => (
              <View>
                <View style={styles.wrapper}>
                  <View style={styles.inputWrapper(touched.username ? COLORS.secondary : COLORS.offwhite)}>
                    <ScanFace name="face-man-profile" size={20} style={styles.iconStyle} color={COLORS.gray} />
                    <TextInput
                      placeholder="Enter your username"
                      onFocus={() => setFieldTouched("username")}
                      onBlur={() => setFieldTouched("username", "")}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{ flex: 1 }}
                      value={values.username}
                      onChangeText={handleChange("username")}
                    />
                  </View>

                  {touched.username && errors.username && <Text style={styles.errorMessage}>{errors.username}</Text>}
                </View>

                <View style={styles.wrapper}>
                  <View style={styles.inputWrapper(touched.email ? COLORS.secondary : COLORS.offwhite)}>
                    <MailOpen name="email-outline" size={20} style={styles.iconStyle} color={COLORS.gray} />
                    <TextInput
                      placeholder="Enter your email"
                      onFocus={() => setFieldTouched("email")}
                      onBlur={() => setFieldTouched("email", "")}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{ flex: 1 }}
                      value={values.email}
                      onChangeText={handleChange("email")}
                    />
                  </View>

                  {touched.email && errors.email && <Text style={styles.errorMessage}>{errors.email}</Text>}
                </View>

                <View style={styles.wrapper2}>
                  <View style={[styles.input2, phoneError ? styles.errorb : styles.successb]}>
                    <IntlPhoneInput
                      ref={(ref) => (phoneInput = ref)}
                      customModal={renderCustomModal}
                      defaultCountry="KE"
                      lang="EN"
                      onChangeText={({ dialCode, unmaskedPhoneNumber }) => {
                        setFieldValue("phoneNumber", `${dialCode}${unmaskedPhoneNumber}`);
                        setfinalPhoneNumber(unmaskedPhoneNumber);
                      }}
                      flagStyle={styles.flagWidth}
                      containerStyle={styles.input22}
                    />
                  </View>
                </View>

                <View style={styles.wrapper}>
                  <View style={styles.inputWrapper(touched.password ? COLORS.secondary : COLORS.offwhite)}>
                    <LockKeyhole name="lock-outline" size={20} style={styles.iconStyle} color={COLORS.gray} />
                    <TextInput
                      secureTextEntry={obsecureText}
                      placeholder="Enter your password"
                      onFocus={() => setFieldTouched("password")}
                      onBlur={() => setFieldTouched("password", "")}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{ flex: 1 }}
                      value={values.password}
                      onChangeText={handleChange("password")}
                    />

                    <TouchableOpacity
                      onPress={() => {
                        setObsecureText(!obsecureText);
                      }}
                    >
                      {obsecureText ? (
                        <Eye size={18} color={COLORS.themey} />
                      ) : (
                        <EyeOff size={18} color={COLORS.themey} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {touched.password && errors.password && <Text style={styles.errorMessage}>{errors.password}</Text>}
                </View>

                <View style={styles.wrapper}>
                  <View style={styles.inputWrapper(touched.confirmPassword ? COLORS.secondary : COLORS.offwhite)}>
                    <LockKeyhole name="lock-outline" size={20} style={styles.iconStyle} color={COLORS.gray} />
                    <TextInput
                      secureTextEntry={obsecureText}
                      placeholder="Confirm your password"
                      onFocus={() => setFieldTouched("confirmPassword")}
                      onBlur={() => setFieldTouched("confirmPassword", "")}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{ flex: 1 }}
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                    />

                    <TouchableOpacity
                      onPress={() => {
                        setObsecureText(!obsecureText);
                      }}
                    >
                      {obsecureText ? (
                        <Eye size={18} color={COLORS.themey} />
                      ) : (
                        <EyeOff size={18} color={COLORS.themey} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorMessage}>{errors.confirmPassword}</Text>
                  )}
                </View>

                <CustomButton
                  title={"Sign up"}
                  onPress={isValid ? handleSubmit : inValidForm}
                  titleStyle={{ fontFamily: "lufgaMedium" }}
                  isValid={isValid}
                  loader={loader}
                />
              </View>
            )}
          </Formik>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Register;

const styles = StyleSheet.create({
  cover: {
    height: SIZES.height / 4.8,
    width: SIZES.width - 60,
    resizeMode: "contain",
    marginBottom: SIZES.medium,
  },

  title: {
    fontFamily: "medium",
    fontSize: SIZES.large,
    color: COLORS.primary,
    alignItems: "center",
    textAlign: "center",
    marginBottom: SIZES.xLarge,
  },
  title2: {
    fontFamily: "bold",
    fontSize: SIZES.large,
    color: COLORS.primary,
    alignItems: "center",
    textAlign: "center",
  },

  wrapper: {
    marginBottom: 10,
  },

  label: {
    fontFamily: "regular",
    fontSize: SIZES.xSmall,
    marginBottom: 5,
    textAlign: "right",
  },

  wrapper2: {
    backgroundColor: COLORS.red,
    padding: 2,
    borderColor: COLORS.lightWhite,
    backgroundColor: COLORS.lightWhite,
    borderWidth: 0.5,
    marginBottom: 7,
    borderRadius: 100,
    overflow: "hidden",
  },

  inputWrapper: (borderColor) => ({
    borderColor: borderColor,
    backgroundColor: COLORS.lightWhite,
    borderWidth: 1,
    marginBottom: 7,
    height: 55,
    borderRadius: 100,
    flexDirection: "row",
    paddingHorizontal: 15,
    alignItems: "center",
  }),

  iconStyle: {
    marginRight: 10,
  },

  errorMessage: {
    color: COLORS.red,
    fontFamily: "regular",
    fontSize: SIZES.xSmall,
    marginLeft: 5,
    marginTop: 5,
  },

  registration: {
    marginTop: 2,
    textAlign: "center",
    marginBottom: 20,
  },
  registration2: {
    marginTop: 2,
    textAlign: "center",
    marginBottom: 20,
    textDecorationColor: COLORS.themeb,
    textDecorationStyle: "solid",
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  flag: {
    fontSize: 24,
    marginRight: 10,
  },
  // flagWidth: {
  //   height: 40,
  //   width: 50,
  // },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  countryCode: {
    fontSize: 16,
    color: "#888",
  },

  closeButton: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  input22: {
    backgroundColor: COLORS.lightWhite,
    borderRadius: 100,
    overflow: "hidden",
  },
});
