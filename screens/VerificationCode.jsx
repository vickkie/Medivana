import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import BackBtn from "../components/BackBtn";
import CustomButton from "../components/Button";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(4, "Code must be at least 4 characters") // adjusted for code entry
    .required("Required"),
});

const VerificationCode = ({ navigation }) => {
  const [loader, setLoader] = useState(false);
  const [obsecureText, setObsecureText] = useState(false);

  const inValidForm = () => {
    Alert.alert("Invalid", "Enter the code sent to your email", [{ text: "Retry", onPress: () => {} }]);
  };

  const handleVerify = async (values) => {
    setLoader(true);
    try {
      // Your verification endpoint logic here
      console.log("Code submitted:", values.password);
      // Simulate success
      Alert.alert("Success", "Code verified!");
    } catch (error) {
      Alert.alert("Verification Failed", "Please try again.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <ScrollView>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={{ paddingHorizontal: 21, backgroundColor: COLORS.white, height: SIZES.height }}>
        <View>
          <BackBtn
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
              }
            }}
          />

          <Image source={require("../assets/images/codeview.png")} style={styles.cover} />

          <Text style={styles.subtitle2}>Verification code has been sent to your email</Text>

          <Formik initialValues={{ password: "" }} validationSchema={validationSchema} onSubmit={handleVerify}>
            {({ handleChange, handleSubmit, touched, errors, setFieldTouched, values, isValid }) => (
              <View>
                {touched.password && errors.password && <Text style={styles.errorMessage}>{errors.password}</Text>}

                <View style={styles.wrapper}>
                  <View style={styles.inputWrapper(touched.password ? COLORS.secondary : COLORS.offwhite)}>
                    <Icon name="pincode" size={20} style={styles.iconStyle} color={COLORS.gray} />
                    <TextInput
                      secureTextEntry={obsecureText}
                      placeholder="Enter sent code"
                      onFocus={() => setFieldTouched("password")}
                      onBlur={() => setFieldTouched("password", "")}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{ flex: 1 }}
                      value={values.password}
                      onChangeText={handleChange("password")}
                      keyboardType={!obsecureText ? "visible-password" : "name-phone-pad"}
                    />
                    <TouchableOpacity onPress={() => setObsecureText(!obsecureText)}>
                      <MaterialCommunityIcons size={18} name={obsecureText ? "eye-outline" : "eye-off-outline"} />
                    </TouchableOpacity>
                  </View>
                </View>

                <CustomButton
                  loader={loader}
                  title={"Verify"}
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

                <View style={styles.registration}>
                  <Text style={styles.registrationText}>Try again?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.registrationText2}> Resend Code</Text>
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

export default VerificationCode;

const styles = StyleSheet.create({
  cover: {
    height: SIZES.height / 3.8,
    width: SIZES.width - 60,
    resizeMode: "contain",
    marginBottom: SIZES.medium,
    marginTop: -35,
  },
  subtitle2: {
    fontFamily: "regular",
    fontSize: SIZES.medium,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SIZES.xLarge,
  },
  wrapper: {
    marginBottom: 15,
  },
  inputWrapper: (borderColor) => ({
    borderColor,
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
    fontSize: SIZES.xSmall,
    marginLeft: 5,
    marginTop: 5,
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
  registration: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registrationText: {
    fontFamily: "regular",
    fontSize: SIZES.regular,
  },
  registrationText2: {
    fontFamily: "bold",
    fontSize: SIZES.regular,
    color: COLORS.primary,
  },
});
