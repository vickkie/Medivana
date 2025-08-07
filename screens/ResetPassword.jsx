import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";
import Toast from "react-native-toast-message";
import { BACKEND_PORT } from "@env";
import axios from "axios";

import BackBtn from "../components/BackBtn";
import CustomButton from "../components/Button";
import { COLORS, SIZES } from "../constants";
import { Eye, EyeOff } from "lucide-react-native";
import { useRoute } from "@react-navigation/native";

const resetSchema = Yup.object().shape({
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Required"),
  confirm: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Required"),
});

const ResetPassword = ({ navigation }) => {
  const [loader, setLoader] = useState(false);
  const [secure, setSecure] = useState(true);

  const { email = "", code = "" } = useRoute().params || {};

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
      visibilityTime: 3000,
    });
  };

  const successUpdate = () => {
    showToast("success", "Pssword has been reset successfully.", "");
  };

  useEffect(() => {
    if (!email || !code) {
      showToast("error", "Invalid Access", "Missing verification info.");
      // navigation.navigate("Login");
    }
  }, [email, code]);

  const handleReset = async (values) => {
    setLoader(true);
    try {
      console.log("Requesting code for:", values.password);

      const newPassword = values.password;

      const endpoint = `${BACKEND_PORT}/auth/reset-password`;

      const response = await axios.put(
        endpoint,
        { email, code, newPassword },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("response", response.data);

      if (response.status === 200) {
        navigation.navigate("Login", { email });
        successUpdate();
      }
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
                  {!secure ? <Eye size={18} color={COLORS.themey} /> : <EyeOff size={18} color={COLORS.themey} />}
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
                  {!secure ? <Eye size={18} color={COLORS.themey} /> : <EyeOff size={18} color={COLORS.themey} />}
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
