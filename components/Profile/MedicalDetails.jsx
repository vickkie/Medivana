import React, { useContext, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../../constants";
import Icon from "../../constants/icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../auth/AuthContext";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import axiosRetry from "axios-retry";
import { BACKEND_PORT } from "@env";
import ButtonMain from "../ButtonMain";
import Toast from "react-native-toast-message";
import { Pencil } from "lucide-react-native";

// Global axios-retry
axiosRetry(axios, { retries: 3 });

const formatDateInput = (text) => {
  // Remove all non-numeric characters
  const cleaned = text.replace(/\D/g, "");

  // Apply formatting based on length
  if (cleaned.length <= 4) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  } else {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
  }
};

const MedicalDetails = () => {
  const navigation = useNavigation();
  const [loader, setLoader] = useState(false);
  const [userId, setUserId] = useState(null);
  const { userData, userLogin, updateUserData, userLogout } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
      navigation.navigate("Login");
      return;
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const handleDateChange = (text, setFieldValue) => {
    const formattedDate = formatDateInput(text);
    setFieldValue("dateOfBirth", formattedDate);
  };

  const inValidForm = () => {
    Alert.alert("Invalid Form", "Please provide required fields", [
      { text: "Cancel", onPress: () => {} },
      { text: "Continue", onPress: () => {} },
    ]);
  };

  const successUpdate = () => {
    showToast("success", "Updated Successful", "Medical details updated");
  };

  const updateMedicalDetails = async (values) => {
    setLoader(true);
    try {
      // Properly structured data for backend
      const medicalUpdateData = {
        dateOfBirth: values.dateOfBirth,
        bloodType: values.bloodType,
        allergies: values.allergies,
        medications: values.medications,
        medicalConditions: values.medicalConditions,
        userId: userData?._id,
      };

      const endpoint = `${BACKEND_PORT}/api/user/updateMedical/${userData?._id}`;
      const response = await axios.put(endpoint, medicalUpdateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const updatedUserData = {
          ...userData,
          ...response.data,
          TOKEN: userData.TOKEN,
        };
        await updateUserData(updatedUserData);
        successUpdate();
        setEditing(false);
        navigation.navigate("Bottom Navigation", {
          screen: "MedicalDetails",
        });
      }
    } catch (err) {
      console.log(err);
      showToast("error", "Update Failed", "Please try again");
    }
    setLoader(false);
  };

  // Medical validation schema
  const getMedicalValidationSchema = () => {
    return Yup.object().shape({
      dateOfBirth: Yup.date()
        .max(new Date(), "Date of birth cannot be in the future")
        .required("Date of birth is required"),
      bloodType: Yup.string()
        .oneOf(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "Select a valid blood type")
        .required("Blood type is required"),
      allergies: Yup.string().max(500, "Allergies description too long"),
      medications: Yup.string().max(500, "Medications description too long"),
      medicalConditions: Yup.string().max(500, "Medical conditions description too long"),
    });
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
      visibilityTime: 3000,
    });
  };

  // Blood type selection component
  const BloodTypeSelector = ({ selectedBloodType, onBloodTypeSelect, disabled }) => {
    const bloodTypes = [
      { key: "A+", label: "A+" },
      { key: "A-", label: "A-" },
      { key: "B+", label: "B+" },
      { key: "B-", label: "B-" },
      { key: "AB+", label: "AB+" },
      { key: "AB-", label: "AB-" },
      { key: "O+", label: "O+" },
      { key: "O-", label: "O-" },
    ];

    return (
      <View style={styles.bloodTypeContainer}>
        <Text style={styles.label}>Blood Type</Text>
        <View style={styles.bloodTypeButtonsContainer}>
          {bloodTypes.map((bloodType) => (
            <TouchableOpacity
              key={bloodType.key}
              style={[
                styles.bloodTypeButton,
                selectedBloodType === bloodType.key && styles.bloodTypeButtonSelected,
                disabled && styles.bloodTypeButtonDisabled,
              ]}
              onPress={() => !disabled && onBloodTypeSelect(bloodType.key)}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.bloodTypeButtonText,
                  selectedBloodType === bloodType.key && styles.bloodTypeButtonTextSelected,
                ]}
              >
                {bloodType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={[styles.backBtn, styles.buttonWrap]}
        >
          <Icon name="backbutton" size={26} />
        </TouchableOpacity>

        <View style={styles.upperRow}>
          {userLogin ? (
            <TouchableOpacity
              onPress={() => {
                setEditing(!editing);
              }}
              style={styles.outWrap}
            >
              <Pencil size={23} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Login");
              }}
              style={[styles.outWrap, styles.rotateMe]}
            >
              <Icon name="logout" size={26} />
            </TouchableOpacity>
          )}
          <View style={styles.lowerheader}>
            <Text style={[styles.heading, { alignSelf: "center" }]}>Medical Details</Text>
            <Text style={[styles.statement, { alignItems: "center", textAlign: "center" }]}>
              {editing ? "Edit your medical information" : "Manage your medical information securely"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView>
        <View style={styles.detailsWrapper}>
          {userData !== null ? (
            <Formik
              initialValues={{
                dateOfBirth: userData?.medicalDetails?.dateOfBirth || "",
                bloodType: userData?.medicalDetails?.bloodType || "",
                allergies: userData?.medicalDetails?.allergies || "",
                medications: userData?.medicalDetails?.medications || "",
                medicalConditions: userData?.medicalDetails?.medicalConditions || "",
              }}
              validationSchema={getMedicalValidationSchema}
              onSubmit={(values) => updateMedicalDetails(values)}
            >
              {({ handleChange, handleSubmit, values, errors, isValid, setFieldTouched, touched, setFieldValue }) => (
                <View style={styles.profileData}>
                  {/* Date of Birth */}
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <View style={[styles.inputWrapper, touched.dateOfBirth && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="YYYY-MM-DD"
                        onFocus={() => setFieldTouched("dateOfBirth")}
                        onBlur={() => setFieldTouched("dateOfBirth", "")}
                        style={{ flex: 1 }}
                        value={values.dateOfBirth}
                        onChangeText={(text) => handleDateChange(text, setFieldValue)}
                        editable={editing}
                      />
                    </View>
                    {touched.dateOfBirth && errors.dateOfBirth && (
                      <Text style={styles.errorMessage}>{errors.dateOfBirth}</Text>
                    )}
                  </View>

                  {/* Blood Type Selector - Button style */}
                  <BloodTypeSelector
                    selectedBloodType={values.bloodType}
                    onBloodTypeSelect={(bloodType) => setFieldValue("bloodType", bloodType)}
                    disabled={!editing}
                  />
                  {touched.bloodType && errors.bloodType && <Text style={styles.errorMessage}>{errors.bloodType}</Text>}

                  {/* Allergies */}
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Allergies</Text>
                    <View style={[styles.textAreaWrapper, touched.allergies && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="List any allergies (food, medication, environmental, etc.)"
                        onFocus={() => setFieldTouched("allergies")}
                        onBlur={() => setFieldTouched("allergies", "")}
                        style={styles.textArea}
                        value={values.allergies}
                        onChangeText={handleChange("allergies")}
                        editable={editing}
                        multiline={true}
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                    {touched.allergies && errors.allergies && (
                      <Text style={styles.errorMessage}>{errors.allergies}</Text>
                    )}
                  </View>

                  {/* Current Medications */}
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Current Medications</Text>
                    <View style={[styles.textAreaWrapper, touched.medications && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="List current medications, dosages, and frequency"
                        onFocus={() => setFieldTouched("medications")}
                        onBlur={() => setFieldTouched("medications", "")}
                        style={styles.textArea}
                        value={values.medications}
                        onChangeText={handleChange("medications")}
                        editable={editing}
                        multiline={true}
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                    {touched.medications && errors.medications && (
                      <Text style={styles.errorMessage}>{errors.medications}</Text>
                    )}
                  </View>

                  {/* Medical Conditions */}
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Medical Conditions</Text>
                    <View
                      style={[styles.textAreaWrapper, touched.medicalConditions && { borderColor: COLORS.secondary }]}
                    >
                      <TextInput
                        placeholder="List any chronic conditions, past surgeries, or ongoing health issues"
                        onFocus={() => setFieldTouched("medicalConditions")}
                        onBlur={() => setFieldTouched("medicalConditions", "")}
                        style={styles.textArea}
                        value={values.medicalConditions}
                        onChangeText={handleChange("medicalConditions")}
                        editable={editing}
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>
                    {touched.medicalConditions && errors.medicalConditions && (
                      <Text style={styles.errorMessage}>{errors.medicalConditions}</Text>
                    )}
                  </View>

                  {editing && (
                    <ButtonMain
                      title={"Update Medical Details"}
                      onPress={isValid ? handleSubmit : inValidForm}
                      isValid={isValid}
                      loader={loader}
                    />
                  )}
                </View>
              )}
            </Formik>
          ) : (
            <Text style={styles.pleaseLogin}>Please login to manage your medical details.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MedicalDetails;

const styles = StyleSheet.create({
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "capitalize",
    fontSize: SIZES.xLarge + 3,
    textAlign: "left",
    color: COLORS.themey,
    marginStart: 20,
  },
  topheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.themeg,
  },
  wrapper: {
    flexDirection: "column",
  },
  upperRow: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 2,
    minHeight: 90,
  },
  backBtn: {
    left: 10,
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
    position: "absolute",
    zIndex: 9,
    top: 10,
    left: 10,
  },
  lowerheader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: SIZES.width - 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  statement: {
    fontFamily: "regular",
    paddingLeft: 20,
    paddingVertical: 5,
    color: COLORS.gray2,
  },
  rotateMe: {
    transform: [{ rotate: "180deg" }],
  },
  detailsWrapper: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    marginTop: SIZES.xSmall,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    minHeight: SIZES.height - 200,
  },
  profileData: {
    padding: SIZES.medium,
  },
  label: {
    fontSize: SIZES.small + 3,
    fontFamily: "lufgaMedium",
    marginBottom: SIZES.xSmall,
    color: COLORS.themey,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray2 + "20",
    padding: 12,
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 40,
  },
  textAreaWrapper: {
    backgroundColor: COLORS.gray2 + "20",
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 40,
    minHeight: 80,
  },
  textArea: {
    flex: 1,
    padding: 12,
    fontSize: SIZES.small + 3,
    fontFamily: "regular",
    minHeight: 80,
  },
  errorMessage: {
    color: COLORS.red,
    fontSize: 12,
    marginBottom: 10,
    marginStart: SIZES.large,
  },

  // Blood type selector styles
  bloodTypeContainer: {
    marginBottom: SIZES.medium,
  },
  bloodTypeButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bloodTypeButton: {
    backgroundColor: COLORS.themeg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: SIZES.medium,
    margin: 4,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "20%",
  },
  bloodTypeButtonSelected: {
    backgroundColor: COLORS.themey,
    borderColor: COLORS.themey,
  },
  bloodTypeButtonDisabled: {
    backgroundColor: COLORS.gray2 + "20",
    opacity: 0.6,
  },
  bloodTypeButtonText: {
    fontSize: SIZES.small + 2,
    fontFamily: "medium",
    color: COLORS.gray,
  },
  bloodTypeButtonTextSelected: {
    color: COLORS.themeb,
    fontFamily: "bold",
  },

  pleaseLogin: {
    fontFamily: "regular",
    textAlign: "center",
    marginVertical: SIZES.xxLarge,
    fontSize: SIZES.medium,
  },
  outWrap: {
    backgroundColor: COLORS.themey,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 10,
    right: 10,
  },
});
