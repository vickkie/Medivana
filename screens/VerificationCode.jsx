import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";

import BackBtn from "../components/BackBtn";
import CustomButton from "../components/Button";
import { COLORS, SIZES } from "../constants";

const validationSchema = Yup.object().shape({
  code: Yup.string().length(5, "Code must be 5 digits").required("Required"),
});

const VerificationCode = ({ navigation }) => {
  const [loader, setLoader] = useState(false);
  const inputs = useRef([]);

  const focusNext = (index, text) => {
    if (text && index < 4) inputs.current[index + 1]?.focus();
  };
  const focusPrev = (index) => {
    if (index > 0) inputs.current[index - 1]?.focus();
  };

  const handleVerify = async (values) => {
    setLoader(true);
    try {
      console.log("Code submitted:", values.code);
      Alert.alert("Success", "Code verified!");
    } catch {
      Alert.alert("Verification Failed", "Please try again.");
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
        <Image source={require("../assets/images/codeview.png")} style={styles.cover} />
        <Text style={styles.subtitle2}>Verification code has been sent to your email</Text>

        <Formik initialValues={{ code: "" }} validationSchema={validationSchema} onSubmit={handleVerify}>
          {({ handleSubmit, setFieldValue, values, errors, touched }) => (
            <View>
              {touched.code && errors.code && <Text style={styles.errorMessage}>{errors.code}</Text>}

              <View style={styles.codeInputContainer}>
                {[0, 1, 2, 3, 4].map((_, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => (inputs.current[index] = el)}
                    keyboardType="numeric"
                    maxLength={1}
                    style={styles.codeInputBox}
                    value={values.code[index] || ""}
                    onChangeText={(text) => {
                      if (/^[0-9]?$/.test(text)) {
                        const chars = values.code.split("").slice(0, 5);
                        while (chars.length < 5) chars.push("");
                        chars[index] = text;
                        setFieldValue("code", chars.join(""));
                        focusNext(index, text);
                      }
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === "Backspace" && !values.code[index]) {
                        focusPrev(index);
                        const chars = values.code.split("").slice(0, 5);
                        while (chars.length < 5) chars.push("");
                        chars[index - 1] = "";
                        setFieldValue("code", chars.join(""));
                      }
                    }}
                    autoFocus={index === 0}
                  />
                ))}
              </View>

              <CustomButton
                loader={loader}
                title="Verify"
                titleStyle={{ fontFamily: "lufgaMedium" }}
                onPress={handleSubmit}
                isValid={values.code.length === 5}
              />

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>OR</Text>
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
  errorMessage: {
    color: COLORS.red,
    fontSize: SIZES.xSmall,
    textAlign: "center",
    marginVertical: 5,
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  codeInputBox: {
    width: 50,
    height: 55,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: COLORS.primary,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: COLORS.lightWhite,
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
