import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";

import BackBtn from "../components/BackBtn";
import CustomButton from "../components/Button";
import { COLORS, SIZES } from "../constants";

const emailSchema = Yup.object().shape({
  email: Yup.string().email("Enter a valid email").required("Required"),
});

const RequestCode = ({ navigation }) => {
  const [loader, setLoader] = useState(false);

  const handleRequest = async (values) => {
    setLoader(true);
    try {
      console.log("Requesting code for:", values.email);
      // call your API to send code here
      Alert.alert("Success", "Verification code sent!");
      navigation.navigate("VerificationCode");
    } catch (error) {
      Alert.alert("Error", "Failed to send code. Try again.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <ScrollView>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={{ paddingHorizontal: 21, backgroundColor: COLORS.white, height: SIZES.height }}>
        <BackBtn
          onPress={() =>
            navigation.canGoBack() ? navigation.goBack() : navigation.reset({ index: 0, routes: [{ name: "Login" }] })
          }
        />
        <Image source={require("../assets/images/lockview.png")} style={styles.cover} />
        <Text style={styles.subtitle2}>Enter your email to receive a verification code</Text>

        <Formik initialValues={{ email: "" }} validationSchema={emailSchema} onSubmit={handleRequest}>
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View>
              {touched.email && errors.email && <Text style={styles.errorMessage}>{errors.email}</Text>}

              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Email Address"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.inputBox}
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                />
              </View>

              <CustomButton
                loader={loader}
                title="Send Code"
                titleStyle={{ fontFamily: "lufgaMedium" }}
                onPress={handleSubmit}
                isValid={!errors.email && values.email}
              />

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.registration}>
                <Text style={styles.registrationText}>Have a code already?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("VerificationCode")}>
                  <Text style={styles.registrationText2}> Enter Code</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </SafeAreaView>
    </ScrollView>
  );
};

export default RequestCode;

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
  errorMessage: {
    color: COLORS.red,
    fontSize: SIZES.xSmall,
    textAlign: "center",
    marginVertical: 5,
  },
  inputContainer: {
    marginBottom: 10,
    paddingHorizontal: 0,
  },
  inputBox: {
    height: 50,
    borderWidth: 1,
    borderRadius: 36,
    borderColor: COLORS.primary,
    paddingHorizontal: 15,
    backgroundColor: COLORS.lightWhite,
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray,
    marginHorizontal: 10,
  },
  orText: {
    fontFamily: "regular",
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  registration: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
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
