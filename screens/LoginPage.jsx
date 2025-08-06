import React, { useState, useContext } from "react";

import { Buffer } from "buffer";

global.atob = (input) => Buffer.from(input, "base64").toString("utf-8");
global.btoa = (input) => Buffer.from(input, "utf-8").toString("base64");

import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";

import axios from "axios";
import { AuthContext } from "../components/auth/AuthContext";
import BackBtn from "../components/BackBtn";
import CustomButton from "../components/Button";

import { COLORS, SIZES } from "../constants";
import { BACKEND_PORT } from "@env";
import Icon from "../constants/icons";
import { StatusBar } from "react-native";
import { APP_NAME } from "@env";
import { Eye, EyeOff, Lock, LockKeyholeIcon, MailIcon } from "lucide-react-native";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be at least 8 characters")
    .transform((value) => (value ? value.trim() : value))
    .required("Required"),
  email: Yup.string().email("Provide a valid email address").required("Required"),
});

const LoginPage = ({ navigation }) => {
  const { login, getRole, hasRole } = useContext(AuthContext);
  const [loader, setLoader] = useState(false);
  const [userType, setUserType] = useState("customer");
  const [rememberMe, setRememberMe] = useState(true);
  const [obsecureText, setObsecureText] = useState(false);

  React.useEffect(() => {
    // console.log("Navigated to LoginPage");
  }, []);

  const inValidForm = () => {
    Alert.alert("Invalid Form", "Please provide required fields", [
      {
        text: "Cancel",
        onPress: () => {},
      },
      {
        text: "Retry",
        onPress: () => {},
      },
      { defaultIndex: 1 },
    ]);
  };

  const handleLogin = async (values) => {
    setLoader(true);
    try {
      const endpoint = `${BACKEND_PORT}/auth/login`;
      const data = { ...values, userType };

      console.log(endpoint);

      const response = await axios.post(endpoint, data);

      // console.log(response);
      // Check response status and token first
      if (response.status !== 200 || !response.data || !response.data.TOKEN) {
        Alert.alert("Error Logging", "Unexpected response. Please try again.");
        return;
      }

      // Store login data
      await login(response.data);
      console.log(response.data);

      //!TEMPORARY FIX
      navigation.reset({
        index: 0,
        routes: [{ name: "Bottom Navigation", params: { screen: "Home" } }],
      });
    } catch (error) {
      // Pull the error message from the response
      const errorMsg = error.response?.data?.message || "Oops! Error logging in. Please try again.";
      Alert.alert("Login Failure", errorMsg);
    } finally {
      setLoader(false);
    }
  };

  return (
    <ScrollView>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.themew} />

      <SafeAreaView
        style={{ marginHorizontal: 0, paddingHorizontal: 21, backgroundColor: COLORS.white, height: SIZES.height }}
      >
        <View>
          <BackBtn
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Bottom Navigation", params: { screen: "Home" } }],
                });
              }
            }}
          />

          <Image source={require("../assets/icons/medivana-splash-light.png")} style={styles.cover} />
          <Text style={styles.title}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              handleReset,
              values,
              errors,
              isValid,
              setFieldTouched,
              touched,
              setFieldValue,
            }) => (
              <View>
                {touched.email && errors.email && <Text style={styles.errorMessage}>{errors.email}</Text>}
                <View style={styles.wrapper}>
                  <View style={styles.inputWrapper(touched.email ? COLORS.secondary : COLORS.offwhite)}>
                    <MailIcon name="email-outline" size={20} style={styles.iconStyle} color={COLORS.gray} />

                    <TextInput
                      placeholder="Enter your email"
                      onFocus={() => setFieldTouched("email")}
                      onBlur={() => setFieldTouched("email", "")}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{ flex: 1 }}
                      value={values.email}
                      onChangeText={(text) => setFieldValue("email", text.trim())}
                    />
                  </View>
                </View>
                {touched.password && errors.password && <Text style={styles.errorMessage}>{errors.password}</Text>}

                <View style={styles.wrapper}>
                  <View style={styles.inputWrapper(touched.password ? COLORS.secondary : COLORS.offwhite)}>
                    <LockKeyholeIcon name="lock-outline" size={20} style={styles.iconStyle} color={COLORS.gray} />

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
                      keyboardType={!obsecureText ? "visible-password" : "name-phone-pad"}
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
                </View>
                <View style={styles.rememberMe}>
                  <TouchableOpacity style={styles.rememberMeItem} onPress={() => setRememberMe(!rememberMe)}>
                    <TouchableOpacity
                      style={styles.rememberMeBox}
                      onPress={() => {
                        setRememberMe(!rememberMe);
                      }}
                    >
                      <Icon name={rememberMe ? "check" : "checkempty"} size={18} />
                    </TouchableOpacity>
                    <Text style={styles.rememberMeText}>Remember Me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ResetPassword")}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <CustomButton
                  loader={loader}
                  title={"Login"}
                  titleStyle={{ fontFamily: "lufgaMedium" }}
                  onPress={isValid ? handleSubmit : inValidForm}
                  isValid={isValid}
                />

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />

                  <View style={styles.or}>
                    <Text style={styles.orText}>OR</Text>
                  </View>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialLogin}>
                  <TouchableOpacity style={styles.socialLoginItem}>
                    <Icon name="google" size={20} color={COLORS.gray} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.socialLoginItem}>
                    <Icon name="apple" size={20} color={COLORS.gray} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialLoginItem}>
                    <Icon name="facebook" size={20} color={COLORS.gray} />
                  </TouchableOpacity>
                </View>

                <View style={styles.registration}>
                  <Text style={styles.registrationText}>Don't have an account?</Text>
                  <TouchableOpacity style={styles.registrationText} onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.registrationText2}> Create an Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  cover: {
    height: SIZES.height / 3.8,
    width: SIZES.width - 60,
    resizeMode: "contain",
    marginBottom: SIZES.medium,
    marginTop: -35,
  },

  title: {
    fontFamily: "medium",
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
    alignItems: "center",
    textAlign: "center",
    marginBottom: SIZES.xLarge,
    marginTop: -13,
  },
  subtitle: {
    fontFamily: "regular",
    fontSize: SIZES.large,
    color: COLORS.primary,
    alignItems: "center",
    textAlign: "center",
    marginBottom: SIZES.xLarge,
    marginTop: -13,
  },

  wrapper: {
    marginBottom: 15,
  },

  label: {
    fontFamily: "regular",
    fontSize: SIZES.xSmall,
    marginBottom: 5,
    textAlign: "right",
  },

  inputWrapper: (borderColor) => ({
    borderColor: borderColor,
    backgroundColor: COLORS.lightWhite,
    borderWidth: 1,
    height: 55,
    borderRadius: 36,
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
    fontSize: SIZES.small + 2,
    marginLeft: 15,
    marginBottom: 5,
    marginTop: 5,
  },

  registration: {
    marginTop: 10,
    textAlign: "center",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chooseWrapper: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.xLarge,
  },
  rememberMe: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: -10,
    gap: SIZES.xLarge,
  },
  rememberMeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: SIZES.xLarge,
  },

  forgotPassword: {
    justifyContent: "flex-end",
    marginTop: -10,
  },
  rememberMeBox: {
    width: 20,
    height: 20,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  choiceText: {
    color: COLORS.black,
    fontFamily: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: -10,
    gap: 10,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray,
    marginVertical: 10,
    width: "40%",
  },
  or: {
    alignItems: "center",
  },
  orText: {
    fontFamily: "regular",
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  socialLogin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
    gap: 10,
  },
  socialLoginItem: {
    borderWidth: 4,
    borderColor: COLORS.gray,
    borderRadius: 100,
    padding: 4,
  },
  registrationText2: {
    fontFamily: "bold",
    fontSize: SIZES.regular,
    color: COLORS.primary,
  },
});
