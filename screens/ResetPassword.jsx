import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import BackBtn from "../components/BackBtn";
import CustomButton from "../components/Button";
import { COLORS, SIZES } from "../constants";

const resetSchema = Yup.object().shape({
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Required"),
  confirm: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Required"),
});

const ResetPassword = ({ navigation }) => {
  const [loader, setLoader] = useState(false);
  const [secure, setSecure] = useState(true);

  const handleReset = async (values) => {
    setLoader(true);
    try {
      console.log("Resetting password to:", values.password);
      // call API to reset password here
      Alert.alert("Success", "Password has been reset!");
      navigation.replace("Login");
    } catch {
      Alert.alert("Error", "Failed to reset. Try again.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <ScrollView>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={styles.container}>
        <BackBtn onPress={() => navigation.goBack()} />
        <Image source={require("../assets/images/codeview.png")} style={styles.cover} />
        <Text style={styles.subtitle2}>Set your new password below</Text>

        <Formik initialValues={{ password: "", confirm: "" }} validationSchema={resetSchema} onSubmit={handleReset}>
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View>
              {touched.password && errors.password && <Text style={styles.errorMessage}>{errors.password}</Text>}
              <View style={styles.inputBoxWrapper}>
                <TextInput
                  placeholder="New Password"
                  secureTextEntry={secure}
                  autoCapitalize="none"
                  style={styles.inputBox}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecure(!secure)}>
                  <MaterialCommunityIcons size={18} name={secure ? "eye-outline" : "eye-off-outline"} />
                </TouchableOpacity>
              </View>

              {touched.confirm && errors.confirm && <Text style={styles.errorMessage}>{errors.confirm}</Text>}
              <View style={styles.inputBoxWrapper}>
                <TextInput
                  placeholder="Confirm Password"
                  secureTextEntry={secure}
                  autoCapitalize="none"
                  style={styles.inputBox}
                  value={values.confirm}
                  onChangeText={handleChange("confirm")}
                  onBlur={handleBlur("confirm")}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecure(!secure)}>
                  {/* <Text>{secure ? "Show" : "Hide"}</Text> */}
                  <MaterialCommunityIcons size={18} name={secure ? "eye-outline" : "eye-off-outline"} />
                </TouchableOpacity>
              </View>

              <CustomButton
                loader={loader}
                title="Reset Password"
                onPress={handleSubmit}
                isValid={values.password && values.confirm && !errors.confirm}
              />

              <View style={styles.registration}>
                <Text style={styles.registrationText}>Remembered your password?</Text>
                <TouchableOpacity onPress={() => navigation.replace("Login")}>
                  <Text style={styles.registrationText2}> Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </SafeAreaView>
    </ScrollView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 21,
    backgroundColor: COLORS.white,
    height: SIZES.height,
  },
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
  inputBoxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 36,
    height: 55,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: COLORS.lightWhite,
  },
  inputBox: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
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
