import React, { useContext, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, StyleSheet } from "react-native";
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
import { ProfileCompletionContext } from "../auth/ProfileCompletionContext";
import { Pencil } from "lucide-react-native";

// Global axios-retry
axiosRetry(axios, { retries: 3 });

const ProfileDetails = () => {
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

  const inValidForm = () => {
    Alert.alert("Invalid Form", "Please provide required fields", [
      { text: "Cancel", onPress: () => {} },
      { text: "Continue", onPress: () => {} },
    ]);
  };

  const successUpdate = () => {
    showToast("success", "Updated Successful", "profile updated");
  };

  const updateUserProfile = async (values) => {
    setLoader(true);
    try {
      // Properly structured data for backend
      const userUpdateData = {
        firstname: values.firstname,
        lastname: values.lastname,
        gender: values.gender,
        phoneNumber: values.phoneNumber,
        location: values.location,
        username: values.username,
        userId: userData?._id,
      };

      const endpoint = `${BACKEND_PORT}/api/user/updateDetails/${userData?._id}`;
      const response = await axios.put(endpoint, userUpdateData, {
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
          screen: "ProfileDetails",
        });
      }
    } catch (err) {
      console.log(err);
    }
    setLoader(false);
  };

  // Dynamic validation schema
  const getValidationSchema = () => {
    return Yup.object().shape({
      email: Yup.string().email("Enter a valid email address").required("Email is required"),
      location: Yup.string().min(3, "Location must be at least 3 characters").required("Location is required"),
      username: Yup.string().min(3, "Username must be at least 3 characters").required("Username is required"),
      firstname: Yup.string().min(2, "First name must be at least 2 characters").required("First name is required"),
      lastname: Yup.string().min(2, "Last name must be at least 2 characters").required("Last name is required"),
      gender: Yup.string().oneOf(["male", "female", "other"], "Select a valid gender").required("Gender is required"),
      phoneNumber: Yup.string().min(8, "Phone number atleast 8 digits"),
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

  // Gender selection component
  const GenderSelector = ({ selectedGender, onGenderSelect, disabled }) => {
    const genders = [
      { key: "male", label: "Male" },
      { key: "female", label: "Female" },
      { key: "other", label: "Other" },
    ];

    return (
      <View style={styles.genderContainer}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderButtonsContainer}>
          {genders.map((gender) => (
            <TouchableOpacity
              key={gender.key}
              style={[
                styles.genderButton,
                selectedGender === gender.key && styles.genderButtonSelected,
                disabled && styles.genderButtonDisabled,
              ]}
              onPress={() => !disabled && onGenderSelect(gender.key)}
              disabled={disabled}
            >
              <Text style={[styles.genderButtonText, selectedGender === gender.key && styles.genderButtonTextSelected]}>
                {gender.label}
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
            <Text style={[styles.heading, { alignSelf: "center" }]}>User Details</Text>
            <Text style={[styles.statement, { alignItems: "center", textAlign: "center" }]}>
              {editing ? "Edit your profile details" : "You can edit your profile from here"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView>
        <View style={styles.detailsWrapper}>
          {userData !== null ? (
            <Formik
              initialValues={{
                email: userData.email || "",
                location: userData.location || "",
                username: userData.username || "",
                firstname: userData?.personalDetails?.firstname || "",
                lastname: userData?.personalDetails?.lastname || "",
                phoneNumber: userData?.phoneNumber || "",
                gender: userData?.personalDetails?.gender || "",
              }}
              validationSchema={getValidationSchema}
              onSubmit={(values) => updateUserProfile(values)}
            >
              {({
                handleChange,

                handleSubmit,
                values,
                errors,
                isValid,
                setFieldTouched,
                touched,
                setFieldValue,
              }) => (
                <View style={styles.profileData}>
                  {/* Name Fields - Same styling, toggled by editing */}
                  <View style={styles.wrapper}>
                    <View style={styles.rowNames}>
                      <View style={styles.halfInput}>
                        <Text style={styles.label}>First Name</Text>
                        <TextInput
                          style={[styles.inputH, !editing && styles.inputDisabled]}
                          placeholder="First name"
                          value={values.firstname}
                          onChangeText={handleChange("firstname")}
                          editable={editing}
                        />
                        {touched.firstname && errors.firstname && (
                          <Text style={styles.errorMessage}>{errors.firstname}</Text>
                        )}
                      </View>

                      <View style={styles.halfInput}>
                        <Text style={styles.label}>Last Name</Text>
                        <TextInput
                          style={[styles.inputH, !editing && styles.inputDisabled]}
                          placeholder="Last name"
                          value={values.lastname}
                          onChangeText={handleChange("lastname")}
                          editable={editing}
                        />
                        {touched.lastname && errors.lastname && (
                          <Text style={styles.errorMessage}>{errors.lastname}</Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.wrapper}>
                    <Text style={styles.label}>UserName</Text>
                    <View style={[styles.inputWrapper, touched.username && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="Username"
                        onFocus={() => setFieldTouched("username")}
                        onBlur={() => setFieldTouched("username", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.username}
                        onChangeText={handleChange("username")}
                        editable={editing}
                      />
                    </View>
                    {touched.username && errors.username && <Text style={styles.errorMessage}>{errors.username}</Text>}
                  </View>

                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Email</Text>
                    <View style={[styles.inputWrapper, touched.email && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="Enter email"
                        onFocus={() => setFieldTouched("email")}
                        onBlur={() => setFieldTouched("email", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.email}
                        editable={false}
                      />
                    </View>
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={[styles.inputWrapper, touched.phoneNumber && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="Enter phoneNumber"
                        onFocus={() => setFieldTouched("phoneNumber")}
                        onBlur={() => setFieldTouched("phoneNumber", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.phoneNumber}
                        onChangeText={handleChange("phoneNumber")}
                        editable={editing}
                        keyboardType="number-pad"
                      />
                    </View>
                    {touched.phoneNumber && errors.phoneNumber && (
                      <Text style={styles.errorMessage}>{errors.phoneNumber}</Text>
                    )}
                  </View>

                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Location</Text>
                    <View style={[styles.inputWrapper, touched.location && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="Enter location"
                        onFocus={() => setFieldTouched("location")}
                        onBlur={() => setFieldTouched("location", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.location}
                        onChangeText={handleChange("location")}
                        editable={editing}
                      />
                    </View>
                    {touched.location && errors.location && <Text style={styles.errorMessage}>{errors.location}</Text>}
                  </View>

                  {/* Gender Selector - Button style */}
                  <GenderSelector
                    selectedGender={values.gender}
                    onGenderSelect={(gender) => setFieldValue("gender", gender)}
                    disabled={!editing}
                  />
                  {touched.gender && errors.gender && <Text style={styles.errorMessage}>{errors.gender}</Text>}

                  {editing && (
                    <ButtonMain
                      title={"Update Profile"}
                      onPress={isValid ? handleSubmit : inValidForm}
                      isValid={isValid}
                      loader={loader}
                    />
                  )}
                </View>
              )}
            </Formik>
          ) : (
            <Text style={styles.pleaseLogin}>Please login to edit your profile.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileDetails;

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
  upperButtons: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SIZES.xSmall,
    top: SIZES.medium,
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
  topprofileheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
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
  location: {
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themew,
    width: SIZES.width - 40,
  },
  toggleLocation: {
    right: 10,
    padding: 7,
    backgroundColor: COLORS.white,
    borderRadius: 100,
  },
  homeheading: {
    fontFamily: "regular",
    textTransform: "capitalize",
    fontSize: SIZES.medium,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 10,
  },
  rightLocation: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationName: {
    paddingLeft: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  rotateMe: {
    transform: [{ rotate: "180deg" }],
  },
  numbers: {
    padding: 3,
    width: 20,
    height: 20,
    backgroundColor: COLORS.themey,
    color: COLORS.themew,
    borderRadius: 100,
    position: "absolute",
    top: "-10%",
    left: "-10%",
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    color: COLORS.white,
  },
  detailsWrapper: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    marginTop: SIZES.xSmall,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    minHeight: SIZES.height - 200,
  },
  profileImage: {
    position: "relative",
    height: 120,
    width: 120,
    borderRadius: 200,
  },
  imageWrapper: {
    width: SIZES.width - 20,
    justifyContent: "center",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.medium,
  },
  editpencil: {
    position: "absolute",
    height: 50,
    width: 50,
    bottom: "10%",
    right: "30%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.white,
    borderRadius: 100,
    backgroundColor: COLORS.themey,
  },
  pencilWrapper: {
    borderWidth: 4,
    borderColor: COLORS.black,
  },
  profileData: {
    padding: SIZES.medium,
  },

  // Enhanced styles for name fields
  rowNames: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.small,
  },
  halfInput: {
    flex: 0.48,
  },
  inputH: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: SIZES.medium,
    marginBottom: 5,
    fontSize: SIZES.small + 3,
    fontFamily: "regular",
  },
  inputDisabled: {
    backgroundColor: COLORS.gray2 + "20",
    color: COLORS.gray,
  },

  label: {
    fontSize: SIZES.small + 3,
    fontFamily: "lufgaMedium",
    marginBottom: SIZES.xSmall,
    color: COLORS.gray,
    // marginStart: SIZES.large,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 40,
  },
  errorMessage: {
    color: COLORS.red,
    fontSize: 12,
    marginBottom: 10,
    marginStart: SIZES.large,
  },

  // Gender selector styles
  genderContainer: {
    marginBottom: SIZES.medium,
  },
  genderButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: SIZES.large,
  },
  genderButton: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: SIZES.medium,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  genderButtonSelected: {
    backgroundColor: COLORS.themey,
    borderColor: COLORS.themey,
  },
  genderButtonDisabled: {
    backgroundColor: COLORS.gray2 + "20",
    opacity: 0.6,
  },
  genderButtonText: {
    fontSize: SIZES.small + 4,
    fontFamily: "medium",
    color: COLORS.gray,
  },
  genderButtonTextSelected: {
    color: COLORS.themeb,
    fontFamily: "bold",
  },

  loginBtn: {
    backgroundColor: COLORS.themey,
    padding: 4,
    borderWidth: 0.4,
    borderColor: COLORS.primary,
    borderRadius: SIZES.xxLarge,
    margin: 30,
    width: SIZES.large * 3,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  changePasswordButton: {
    alignSelf: "center",
    paddingVertical: SIZES.xxSmall,
  },
  submitBtn: {
    backgroundColor: COLORS.themey,
  },
  changePasswordButtonText: {
    fontFamily: "medium",
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
